import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createInstance } from "i18next";

const languageUrl = new URL("../src/app/i18n/language.ts", import.meta.url);

test("normalizes supported and unknown language cookie values", async () => {
  assert.equal(existsSync(languageUrl), true);
  const { normalizeLanguage } = (await import(
    languageUrl.href
  )) as typeof import("../src/app/i18n/language");

  assert.equal(normalizeLanguage("en"), "en");
  assert.equal(normalizeLanguage("fr"), "fr");
  assert.equal(normalizeLanguage("de"), "en");
  assert.equal(normalizeLanguage(undefined), "en");
});

const createTranslator = async (language: "en" | "fr") => {
  const instance = createInstance();
  await instance.init({
    lng: language,
    initImmediate: false,
    resources: {
      en: { translation: { notification: "Profile updated successfully." } },
      fr: { translation: { notification: "Profil mis à jour avec succès." } },
    },
  });
  return instance;
};

test("initial French language also translates global API notifications", async () => {
  const { bindLanguageSync } = await import(languageUrl.href);
  const scoped = await createTranslator("fr");
  const global = await createTranslator("en");
  let refreshes = 0;
  const cleanup = bindLanguageSync(scoped, global, () => refreshes++);

  assert.equal(global.t("notification"), "Profil mis à jour avec succès.");
  assert.equal(refreshes, 0, "initial synchronization must not refresh the page");
  cleanup();
});

test("language toggles synchronize notifications and request fresh metadata", async () => {
  const { bindLanguageSync } = await import(languageUrl.href);
  const scoped = await createTranslator("en");
  const global = await createTranslator("en");
  const refreshLanguages: string[] = [];
  const cleanup = bindLanguageSync(scoped, global, (language: string) => {
    assert.equal(global.language, language);
    refreshLanguages.push(language);
  });

  await scoped.changeLanguage("fr");
  assert.equal(global.t("notification"), "Profil mis à jour avec succès.");
  await scoped.changeLanguage("en");
  assert.equal(global.t("notification"), "Profile updated successfully.");
  assert.deepEqual(refreshLanguages, ["fr", "en"]);
  cleanup();
});

test("same-language events and disposed subscriptions do not refresh metadata", async () => {
  const { bindLanguageSync } = await import(languageUrl.href);
  const scoped = await createTranslator("fr");
  const global = await createTranslator("en");
  let refreshes = 0;
  const cleanup = bindLanguageSync(scoped, global, () => refreshes++);

  await scoped.changeLanguage("fr");
  assert.equal(refreshes, 0);
  cleanup();
  await scoped.changeLanguage("en");
  assert.equal(refreshes, 0);
  assert.equal(global.language, "fr");
});
