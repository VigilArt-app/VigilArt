import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const en = require("../public/locales/en/translation.json");
const fr = require("../public/locales/fr/translation.json");

const parse = (path) => ts.createSourceFile(path,
  readFileSync(new URL(path, import.meta.url), "utf8"),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const nodesMatching = (node, predicate) => {
  const matches = [];
  const visit = (current) => {
    if (predicate(current)) matches.push(current);
    ts.forEachChild(current, visit);
  };
  visit(node);
  return matches;
};

const coverageCalls = (node) => nodesMatching(node, (current) =>
  ts.isCallExpression(current) && current.expression.getText() === "t" &&
  current.arguments[0]?.text === "scan_coverage.result_note");

test("both languages explain limited results and Instagram coverage in the FAQ", () => {
  assert.equal(fr.scan_coverage?.result_note,
    "Ce scan n’est pas exhaustif : certains contenus peuvent ne pas être détectés.");
  assert.equal(en.scan_coverage?.result_note,
    "This scan is not exhaustive: some content may not be detected.");
  for (const locale of [en, fr]) {
    const coverage = locale.faq_page.items.coverage;
    assert.ok(coverage?.question);
    assert.match(coverage.answer_1, /Instagram/);
    assert.match(coverage.answer_1, /tiers|third-party/);
    assert.match(coverage.answer_1, /indexés|indexed/);
  }
  const faq = parse("../src/components/faq/faq-content.tsx");
  assert.ok(nodesMatching(faq, (node) => ts.isArrayLiteralExpression(node) &&
    node.elements[0]?.text === "coverage").length,
  "the coverage answer must be included in the visible FAQ");
});

test("public scan coverage is visible before the scan button", () => {
  const source = parse("../src/components/landing/scan/scan-panel.tsx");
  const panel = nodesMatching(source, (node) => ts.isVariableDeclaration(node) &&
    node.name.getText() === "ScanPanel")[0];
  const preScanReturn = panel.initializer.body.statements.find(ts.isReturnStatement);
  const calls = coverageCalls(preScanReturn);
  const scanButtonLabel = nodesMatching(preScanReturn, (node) =>
    ts.isCallExpression(node) && node.expression.getText() === "t" &&
    node.arguments[0]?.text === "landing_page.upload.scan_button")[0];
  assert.equal(calls.length, 1, "the pre-scan panel must explain limited coverage");
  assert.ok(calls[0].pos < scanButtonLabel.pos, "the notice belongs above the scan button");
  assert.equal(coverageCalls(source).length, 1, "the landing page must show the notice once");
});

test("public scan results do not repeat the pre-scan coverage notice", () => {
  const source = parse("../src/components/landing/scan/scan-panel.tsx");
  const resultBranch = nodesMatching(source, (node) => ts.isIfStatement(node) &&
    node.expression.getText() === 'phase === "done" && result')[0];
  assert.equal(coverageCalls(resultBranch).length, 0,
    "completed scans must not repeat the notice for positive or zero results");
});

test("the main report displays its coverage note only with actual results", () => {
  const source = parse("../src/app/dashboard/components/ReportModal.tsx");
  const resultBranch = nodesMatching(source, (node) => ts.isConditionalExpression(node) &&
    node.condition.getText() === "report" && ts.isParenthesizedExpression(node.whenTrue) &&
    ts.isJsxElement(node.whenTrue.expression))[0];
  assert.equal(coverageCalls(resultBranch.whenTrue).length, 1);
  assert.equal(coverageCalls(source).length, 1);
});

test("artwork details distinguish unscanned content from recorded empty results", () => {
  const source = parse("../src/app/artwork-gallery/components/ArtworkDetails.tsx");
  const emptyBranch = nodesMatching(source, (node) => ts.isConditionalExpression(node) &&
    node.condition.getText() === 'resultsState === "not_scanned"' &&
    node.whenTrue.text === "artwork_gallery_page.not_scanned_body")[0];
  assert.ok(emptyBranch, "an unscanned artwork must not claim no matches were found");
  const noteBranch = nodesMatching(source, (node) => ts.isBinaryExpression(node) &&
    node.left.getText() === 'resultsState === "available"')[0];
  assert.equal(coverageCalls(noteBranch).length, 1);
});
