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
