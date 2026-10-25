import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { createScanQuotaLoader } from "../src/hooks/scan-quota-client.ts";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const response = (data, status = 200) => new Response(JSON.stringify({ data }), { status });
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("the quota client loads without importing server-only shared DTO dependencies", () => {
  // Run fresh so imports cached by other tests cannot hide a forbidden edge.
  const child = spawnSync(process.execPath, ["-e", `
    const { readFileSync } = require("node:fs");
    const Module = require("node:module");
    const ts = require("typescript");
    const filename = ${JSON.stringify(path.join(root, "src/hooks/scan-quota-client.ts"))};
    const source = readFileSync(filename, "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const load = Module._load;
    Module._load = function (name, ...args) {
      if (/^(nestjs-zod|@nestjs\\/|express$|node:(fs|net|tls)$)/.test(name)) {
        throw new Error("Server dependency in browser quota client: " + name);
      }
      return load.call(this, name, ...args);
    };
    const client = new Module(filename);
    client.filename = filename;
    client.paths = Module._nodeModulePaths(${JSON.stringify(root)});
    client._compile(code, filename);
    if (typeof client.exports.createScanQuotaLoader !== "function") process.exit(1);
  `], { cwd: root, encoding: "utf8" });
  assert.equal(child.status, 0, child.stderr);
});

// Compile the actual JSX with the project's existing compiler. Only auth,
// translations and API hooks are substituted; UI primitives render normally.
const loadSource = (filename, overrides, cache = new Map()) => {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const resolveImport = (name) => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
      const source = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")].find(existsSync);
      if (source) return loadSource(source, overrides, cache);
    }
    return require(name);
  };
  new Function("require", "module", "exports", code)(resolveImport, module, module.exports);
  return module.exports;
};

const translations = (locale) => {
  const messages = require(`../public/locales/${locale}/translation.json`);
  return { useTranslation: () => ({ i18n: { language: locale }, t: (key, values = {}) => {
    // Same plural lookup as i18next: `key_one` / `key_other` picked by `count`.
    const lookup = (path) => path.split(".").reduce((value, part) => value?.[part], messages);
    const plural = values.count === undefined ? undefined
      : lookup(`${key}_${new Intl.PluralRules(locale).select(values.count)}`);
    const message = plural ?? lookup(key) ?? key;
    return message.replace(/{{(\w+)}}/g, (_match, name) => String(values[name]));
  } }) };
};

const renderActions = (state, locale = "en", scanLoading = false) => {
  const Actions = loadSource(path.join(root, "src/app/dashboard/components/ActionButtons.tsx"), {
    "react-i18next": translations(locale),
    "@/src/hooks/useScanQuota": { useScanQuota: () => ({ ...state, refresh: async () => {} }) },
    "@/src/hooks/useCreateReport": { useCreateReport: () => ({ loading: scanLoading, handleCreate: async () => {}, resetState: () => {} }) },
    "./UploadModal": { UploadModal: () => null },
    "./ReportModal": { ReportModal: () => null },
  }).default;
  return renderToStaticMarkup(React.createElement(Actions));
};

test("shows server free and paid quotas right under Create report", () => {
  for (const [remaining, limit] of [[2, 3], [7, 10]]) {
    const html = renderActions({ quota: { remaining, limit, nextAvailableAt: null }, loading: false, error: null });
    assert.match(html, new RegExp(`${remaining} scans? left out of ${limit}`));
    assert.match(html, /available again 30 days after it started/);
    assert.ok(html.indexOf("Create report") < html.indexOf("left out of"));
    assert.doesNotMatch(html, /disabled=""/);
    assert.doesNotMatch(html, /upgrade|pro plan/i);
  }
});

test("known exhausted quota disables launch and shows the next date in either language", () => {
  const quota = { remaining: 0, limit: 3, nextAvailableAt: "2026-11-01T12:00:00.000Z" };
  for (const locale of ["en", "fr"]) {
    const html = renderActions({ quota, loading: false, error: null }, locale);
    assert.match(html, locale === "en" ? /0 scans left out of 3/ : /0 scan restant sur 3/);
    assert.match(html, /disabled=""/);
    assert.match(html, locale === "en" ? /Next scan available/ : /Prochain scan disponible/);
    assert.match(html, /2026/);
  }
});

test("loading or failed quota stays unknown and does not block server-authorized launches", () => {
  const pending = renderActions({ quota: null, loading: true, error: null });
  assert.match(pending, /Loading scan quota/);
  assert.doesNotMatch(pending, /Retry/, "retry is offered only after a failure");
  assert.doesNotMatch(pending, /left out of|disabled=""/);
  const failed = renderActions({ quota: null, loading: false, error: "unavailable" });
  assert.match(failed, /Scan quota unavailable/);
  assert.match(failed, /Retry/);
  assert.doesNotMatch(failed, /left out of|disabled=""/);
});

test("a focus refresh keeps an exhausted quota blocking and visible until the server answers", async () => {
  const exhausted = { remaining: 0, limit: 3, nextAvailableAt: "2026-11-01T12:00:00.000Z" };
  let reply = async () => response(exhausted);
  let quotaState;
  const loader = createScanQuotaLoader(() => reply(), (state) => { quotaState = state; });
  await loader.refresh("user-1");
  let answer;
  reply = () => new Promise((resolve) => { answer = resolve; });
  const pending = loader.refresh("user-1");
  const html = renderActions(quotaState);
  assert.match(html, /disabled=""/);
  assert.match(html, /0 scans left out of 3/);
  assert.doesNotMatch(html, /Loading scan quota/);
  answer(response(exhausted));
  await pending;
  loader.cancel();
});

test("an active scan still disables launch when quota is available", () => {
  assert.match(renderActions({ quota: { remaining: 2, limit: 3, nextAvailableAt: null }, loading: false, error: null }, "en", true), /disabled=""/);
});

const scanHarness = (fetcher, onScanQuotaChange) => {
  const values = [];
  let index = 0;
  let poll;
  const hookReact = {
    useState: (initial) => {
      const slot = index++;
      if (!(slot in values)) values[slot] = initial;
      return [values[slot], (value) => { values[slot] = value; }];
    },
    useRef: (initial) => {
      const slot = index++;
      if (!(slot in values)) values[slot] = { current: initial };
      return values[slot];
    },
    useEffect: () => {},
  };
  const { useCreateReport } = loadSource(path.join(root, "src/hooks/useCreateReport.ts"), {
    react: hookReact,
    "react-i18next": translations("en"),
    "@/src/components/contexts/authContext": { useAuth: () => ({ user: { id: "user-1" }, loading: false }) },
    "@/src/utils/auth/authenticatedFetch": { authenticatedFetch: fetcher },
  });
  const originalInterval = global.setInterval;
  const originalClear = global.clearInterval;
  global.setInterval = (callback) => { poll = callback; return 1; };
  global.clearInterval = () => { poll = null; };
  return {
    render: () => { index = 0; return useCreateReport(onScanQuotaChange); },
    tick: async () => { assert.ok(poll, "the scan must be polling"); await poll(); await settle(); },
    cleanup: () => { global.setInterval = originalInterval; global.clearInterval = originalClear; },
  };
};

test("refreshes quota after enqueue and terminal success or provider failure", async () => {
  for (const terminal of ["completed", "failed"]) {
    let quotaState;
    let remaining = 3;
    const loader = createScanQuotaLoader(async () => response({ remaining, limit: 3, nextAvailableAt: null }), (state) => { quotaState = state; });
    await loader.refresh("user-1");
    const harness = scanHarness(async (url, options) => {
      if (options.method === "POST") {
        remaining = 2;
        return response({ jobId: "job-1" });
      }
      if (url.includes("/scan/")) {
        remaining = 1;
        return response({ jobId: "job-1", state: terminal, progress: null, reportId: terminal === "completed" ? "report-1" : null, error: terminal === "failed" ? "Provider failed" : null });
      }
      return response({ id: "report-1", matchingPages: [] });
    }, () => loader.refresh("user-1"));
    try {
      await harness.render().handleCreate();
      await settle();
      assert.equal(quotaState.quota.remaining, 2, "enqueue refresh must use the server value");
      await harness.tick();
      assert.equal(quotaState.quota.remaining, 1, "terminal refresh must use the server value");
      assert.equal(harness.render().loading, false);
      if (terminal === "completed") assert.equal(harness.render().report.id, "report-1");
      else assert.equal(harness.render().error, "Provider failed");
    } finally {
      harness.cleanup();
      loader.cancel();
    }
  }
});

test("server rejection replaces a stale available quota with the latest exhaustion", async () => {
  let quotaState;
  const loader = createScanQuotaLoader(async () => response({ remaining: 0, limit: 3, nextAvailableAt: "2026-11-01T12:00:00.000Z" }), (state) => { quotaState = state; });
  const harness = scanHarness(async () => new Response(JSON.stringify({ message: "Quota exhausted" }), { status: 403 }), () => loader.refresh("user-1"));
  try {
    await harness.render().handleCreate();
    await settle();
    assert.equal(quotaState?.quota?.remaining, 0);
    assert.equal(harness.render().loading, false);
    assert.match(harness.render().error, /Quota exhausted/);
  } finally {
    harness.cleanup();
    loader.cancel();
  }
});

test("failed quota refresh does not stop an accepted scan from polling", async () => {
  const harness = scanHarness(async (url) => url.includes("/scan/")
    ? response({ state: "failed", progress: null, reportId: null, error: "Provider failed" })
    : response({ jobId: "job-1" }), async () => { throw new Error("Quota unavailable"); });
  try {
    await harness.render().handleCreate();
    await settle();
    assert.equal(harness.render().loading, true);
    await harness.tick();
    assert.equal(harness.render().error, "Provider failed");
  } finally {
    harness.cleanup();
  }
});
