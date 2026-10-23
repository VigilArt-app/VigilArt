import assert from "node:assert/strict";
import test from "node:test";

test("selects public metadata using the normalized language", async () => {
  const { selectLocalizedMetadata } = (await import(
    new URL("../src/app/i18n/metadata.ts", import.meta.url).href
  )) as typeof import("../src/app/i18n/metadata");
  const metadata = {
    en: { title: "Frequently Asked Questions | VigilArt" },
    fr: { title: "Questions fréquentes | VigilArt" },
  };

  assert.equal(selectLocalizedMetadata("en", metadata).title, metadata.en.title);
  assert.equal(selectLocalizedMetadata("fr", metadata).title, metadata.fr.title);
});
