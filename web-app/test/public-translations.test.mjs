import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const en = require("../public/locales/en/translation.json");
const fr = require("../public/locales/fr/translation.json");

const publicNamespaces = [
  "landing_page",
  "faq_page",
  "privacy_page",
  "terms_page",
];

const leafPaths = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return child && typeof child === "object"
      ? leafPaths(child, path)
      : [path];
  });

test("public pages expose their copy through both locale resources", () => {
  for (const namespace of publicNamespaces) {
    assert.ok(en[namespace], `missing English ${namespace}`);
    assert.ok(fr[namespace], `missing French ${namespace}`);
    assert.deepEqual(
      leafPaths(fr[namespace]).sort(),
      leafPaths(en[namespace]).sort(),
      `${namespace} locale keys differ`,
    );
  }
});

test("public information pages expose translated headings", () => {
  assert.equal(en.faq_page.title, "Frequently asked questions");
  assert.equal(fr.faq_page.title, "Questions fréquentes");
  assert.equal(en.privacy_page.title, "Privacy Policy");
  assert.equal(fr.privacy_page.title, "Politique de confidentialité");
  assert.equal(en.terms_page.title, "Terms of Service");
  assert.equal(fr.terms_page.title, "Conditions d’utilisation");
});
