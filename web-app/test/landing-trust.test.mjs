import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
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

test("renders the Beta pin as a flat tinted surface without a border", () => {
  const header = readFileSync(
    new URL("../src/components/landing/header.tsx", import.meta.url),
    "utf8"
  );
  const labelPosition = header.lastIndexOf("{strings.nav.beta}");
  const badgeStart = header.lastIndexOf("<span", labelPosition);
  const badgeEnd = header.indexOf("</span>", labelPosition);
  const badge = header.slice(badgeStart, badgeEnd);

  assert.match(badge, /bg-primary\/10/);
  assert.doesNotMatch(badge, /\bborder(?:-[^\s"]+)?\b/);
});

test("reveals hero content in sequence without overriding reduced motion", () => {
  const hero = readFileSync(
    new URL("../src/components/landing/hero.tsx", import.meta.url),
    "utf8"
  );
  const scanPanel = readFileSync(
    new URL("../src/components/landing/scan/scan-panel.tsx", import.meta.url),
    "utf8"
  );
  const globalStyles = readFileSync(
    new URL("../src/app/globals.css", import.meta.url),
    "utf8"
  );

  assert.match(hero, /landing-reveal-headline/);
  assert.match(hero, /landing-reveal-subhead/);
  assert.match(hero, /landing-reveal-trust/);
  assert.match(hero, /landing-reveal-scan/);
  assert.match(scanPanel, /landing-context-reveal/);
  assert.match(
    globalStyles,
    /@media \(prefers-reduced-motion: no-preference\)/
  );
  assert.match(globalStyles, /@keyframes landing-fade-in/);
  assert.match(globalStyles, /translate3d\(0, 8px, 0\)/);
  assert.match(
    globalStyles,
    /landing-fade-in 680ms cubic-bezier\(0\.22, 1, 0\.36, 1\) both/
  );
  assert.match(globalStyles, /animation-delay: 80ms/);
  assert.match(globalStyles, /animation-delay: 160ms/);
  assert.match(globalStyles, /animation-delay: 240ms/);
  assert.match(globalStyles, /@keyframes landing-context-fade-in/);
  assert.match(
    globalStyles,
    /landing-context-fade-in 620ms cubic-bezier\(0\.22, 1, 0\.36, 1\) both/
  );
  assert.match(globalStyles, /\.landing-context-reveal:nth-child\(2\)/);
  assert.match(globalStyles, /\.landing-context-reveal:nth-child\(3\)/);
  assert.match(globalStyles, /animation-delay: 300ms/);
  assert.match(globalStyles, /animation-delay: 360ms/);
  assert.match(globalStyles, /animation-delay: 420ms/);
});
