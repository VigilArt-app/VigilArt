import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const en = require("../public/locales/en/translation.json");
const fr = require("../public/locales/fr/translation.json");

test("exposes the Beta badge and artwork-use statement in both locales", () => {
  assert.equal(en.landing_page.nav.beta, "Beta");
  assert.equal(fr.landing_page.nav.beta, "Bêta");
  assert.equal(
    en.landing_page.hero.artwork_use,
    "VigilArt stores your artwork privately and uses it only to find reposts online. It never publishes it or uses it to train AI models."
  );
  assert.equal(
    fr.landing_page.hero.artwork_use,
    "VigilArt stocke vos œuvres de manière privée et les utilise uniquement pour trouver leurs republications en ligne. Il ne les publie jamais et ne les utilise pas pour entraîner des modèles d’IA."
  );
});
