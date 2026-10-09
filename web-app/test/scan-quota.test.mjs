import assert from "node:assert/strict";
import test from "node:test";
import { createScanQuotaLoader } from "../src/hooks/scan-quota-client.ts";

const response = (data, status = 200) => new Response(JSON.stringify({ success: status === 200, data }), { status });
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

test("uses the server quota for free, paid and exhausted accounts", async () => {
  for (const quota of [
    { remaining: 3, limit: 3, nextAvailableAt: null },
    { remaining: 7, limit: 10, nextAvailableAt: null },
    { remaining: 0, limit: 3, nextAvailableAt: "2026-11-01T12:00:00.000Z" },
  ]) {
    let state;
    const loader = createScanQuotaLoader(async (url, options) => {
      assert.equal(url, "/reports/user/user-1/scan-quota");
      assert.equal(options.method, "GET");
      return response(quota);
    }, (next) => { state = next; });
    await loader.refresh("user-1");
    assert.deepEqual(state, { userId: "user-1", quota, loading: false, error: null });
    loader.cancel();
  }
});

test("malformed or failed responses leave quota unknown rather than zero or stale", async () => {
  for (const bad of [
    response({ remaining: "3", limit: 3, nextAvailableAt: null }),
    response({ remaining: 0, limit: 3, nextAvailableAt: "bad-date" }),
    response({ remaining: 3, limit: 3, nextAvailableAt: null }, 500),
  ]) {
    let state;
    let calls = 0;
    const loader = createScanQuotaLoader(async () => ++calls === 1
      ? response({ remaining: 2, limit: 3, nextAvailableAt: null }) : bad,
    (next) => { state = next; });
    await loader.refresh("user-1");
    await loader.refresh("user-1");
    assert.equal(state.quota, null);
    assert.equal(state.loading, false);
    assert.equal(typeof state.error, "string");
    loader.cancel();
  }
});

test("aborts the old user request and ignores its late response", async () => {
  const old = deferred();
  let oldSignal;
  let state;
  const loader = createScanQuotaLoader(async (url, options) => {
    if (url.includes("old-user")) {
      oldSignal = options.signal;
      return old.promise;
    }
    return response({ remaining: 7, limit: 10, nextAvailableAt: null });
  }, (next) => { state = next; });
  const first = loader.refresh("old-user");
  await loader.refresh("new-user");
  assert.equal(oldSignal.aborted, true);
  old.resolve(response({ remaining: 0, limit: 3, nextAvailableAt: "2026-11-01T12:00:00.000Z" }));
  await first;
  assert.deepEqual(state, { userId: "new-user", quota: { remaining: 7, limit: 10, nextAvailableAt: null }, loading: false, error: null });
  loader.cancel();
});

test("cancellation prevents state writes after unmount", async () => {
  const pending = deferred();
  const states = [];
  let signal;
  const loader = createScanQuotaLoader(async (_url, options) => {
    signal = options.signal;
    return pending.promise;
  }, (next) => states.push(next));
  const request = loader.refresh("user-1");
  loader.cancel();
  pending.resolve(response({ remaining: 2, limit: 3, nextAvailableAt: null }));
  await request;
  assert.equal(signal.aborted, true);
  assert.equal(states.length, 1);
});

test("a hung request times out and stops loading even when the fetcher ignores abort", async () => {
  let state;
  const loader = createScanQuotaLoader(() => new Promise(() => {}), (next) => { state = next; }, 10);
  await loader.refresh("user-1");
  assert.equal(state.loading, false);
  assert.equal(state.quota, null);
  assert.equal(typeof state.error, "string");
  loader.cancel();
});

test("logout clears a previous user's quota", async () => {
  let state;
  const loader = createScanQuotaLoader(async () => response({ remaining: 2, limit: 3, nextAvailableAt: null }), (next) => { state = next; });
  await loader.refresh("user-1");
  await loader.refresh(null);
  assert.deepEqual(state, { userId: null, quota: null, loading: false, error: null });
  loader.cancel();
});
