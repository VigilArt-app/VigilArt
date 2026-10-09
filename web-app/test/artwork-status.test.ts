import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createInstance } from "i18next";
import type { ArtworkWithInsights } from "../src/app/artwork-gallery/components/types";

const statusModuleUrl = new URL("../src/app/artwork-gallery/components/types.ts", import.meta.url);
const { getArtworkStatus } = await import(statusModuleUrl.href) as typeof import("../src/app/artwork-gallery/components/types");
const statusModule = await import(statusModuleUrl.href);

const artwork = {
  id: "artwork-1",
  createdAt: new Date("2026-09-01T00:00:00Z"),
} as ArtworkWithInsights;

test("an upload without a recorded scan is not presented as scanning or protected", () => {
  assert.equal(getArtworkStatus(artwork), "not_scanned");
});

test("missing scan metadata does not imply protection", () => {
  assert.equal(getArtworkStatus({} as ArtworkWithInsights), "not_scanned");
});

test("a recorded scan without loaded insights does not claim there were no matches", () => {
  assert.equal(getArtworkStatus({ ...artwork, lastScanAt: new Date() }), "results_unavailable");
});

test("zero known matches without successful loading cannot imply no matches were found", () => {
  assert.equal(getArtworkStatus({
    ...artwork,
    lastScanAt: new Date(),
    reportInsights: { totalMatches: 0, matchingPages: [], mostRecentDate: null, mostRecentSource: "N/A" },
  }), "results_unavailable");
});

test("successfully loaded zero results permit the no matches found badge", () => {
  assert.equal(getArtworkStatus({
    ...artwork, lastScanAt: new Date(), reportInsightsAvailable: true,
    reportInsights: { totalMatches: 0, matchingPages: [], mostRecentDate: null, mostRecentSource: "N/A" },
  }), "no_matches");
});

test("successfully loaded empty history permits no matches found for a recorded scan", () => {
  assert.equal(getArtworkStatus({
    ...artwork, lastScanAt: new Date(), reportInsightsAvailable: true,
  }), "no_matches");
});

for (const [language, badge, details] of [
  ["fr", "Aucune correspondance trouvée", "Aucune correspondance enregistrée pour cette œuvre."],
  ["en", "No matches found", "No matches recorded for this artwork."],
]) {
  test(`${language}: the empty scan badge does not reuse the longer details message`, async () => {
    const translation = JSON.parse(readFileSync(new URL(`../public/locales/${language}/translation.json`, import.meta.url), "utf8"));
    const i18n = createInstance();
    await i18n.init({ lng: language, resources: { [language]: { translation } } });
    const status = getArtworkStatus({ ...artwork, lastScanAt: new Date(), reportInsightsAvailable: true });
    assert.equal(i18n.t(statusModule.FILTER_STATUS_TRANSLATION_KEYS[status]), badge);
    assert.equal(i18n.t("artwork_gallery_page.no_matches"), details);
  });
}

test("failed results cannot enter the no matches filter", () => {
  const items = [
    { ...artwork, id: "empty", lastScanAt: new Date(), reportInsightsAvailable: true },
    { ...artwork, id: "failed", lastScanAt: new Date(), reportInsightsAvailable: false },
  ];
  assert.deepEqual(items.filter((item) => getArtworkStatus(item) === "no_matches").map(({ id }) => id), ["empty"]);
});

test("known historical matches take precedence over missing scan metadata", () => {
  assert.equal(getArtworkStatus({
    ...artwork,
    reportInsights: { totalMatches: 2, matchingPages: [], mostRecentDate: null, mostRecentSource: "N/A" },
  }), "matches_found");
});

test("unscanned artworks remain distinct from unavailable scan results", () => {
  assert.equal(statusModule.getArtworkResultsState?.(artwork), "not_scanned");
});

test("a scan timestamp without explicit results availability cannot imply zero matches", () => {
  assert.equal(statusModule.getArtworkResultsState?.({ ...artwork, lastScanAt: new Date() }), "unavailable");
});

test("successfully loaded empty report history permits a recorded zero result", () => {
  assert.equal(statusModule.getArtworkResultsState?.({
    ...artwork, lastScanAt: new Date(), reportInsightsAvailable: true,
  }), "available");
});

test("partial report failure cannot present the history as complete", () => {
  assert.equal(statusModule.getArtworkResultsState?.({
    ...artwork, lastScanAt: new Date(), reportInsightsAvailable: false,
    reportInsights: { totalMatches: 2, matchingPages: [], mostRecentDate: null, mostRecentSource: "N/A" },
  }), "unavailable");
});
