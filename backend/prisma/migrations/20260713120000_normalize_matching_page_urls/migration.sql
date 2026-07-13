-- Backfill: strip query string + fragment from existing MatchingPage URLs and
-- merge rows that become duplicates within the same artwork. Forward-side
-- normalization lives in the application (normalizeMatchUrl); this one-time
-- migration reconciles rows saved before that change.

-- Pick a canonical row per (artworkId, normalized-url) group: oldest first, id as tiebreak.
CREATE TEMP TABLE _mp_canon ON COMMIT DROP AS
SELECT
  id,
  first_value(id) OVER (
    PARTITION BY "artworkId", regexp_replace(url, '[?#].*$', '')
    ORDER BY "firstDetectedAt" ASC, id ASC
  ) AS canonical_id
FROM "MatchingPage";

-- Repoint report links from duplicates onto the canonical row (skip pairs that already exist).
INSERT INTO "_ArtworksReportToMatchingPage" ("A", "B")
SELECT DISTINCT j."A", c.canonical_id
FROM "_ArtworksReportToMatchingPage" j
JOIN _mp_canon c ON j."B" = c.id
WHERE c.id <> c.canonical_id
ON CONFLICT ("A", "B") DO NOTHING;

-- Drop the now-redundant links to the duplicate rows.
DELETE FROM "_ArtworksReportToMatchingPage" j
USING _mp_canon c
WHERE j."B" = c.id AND c.id <> c.canonical_id;

-- Delete the duplicate MatchingPage rows.
DELETE FROM "MatchingPage" m
USING _mp_canon c
WHERE m.id = c.id AND c.id <> c.canonical_id;

-- Strip query + fragment from the surviving rows.
UPDATE "MatchingPage"
SET url = regexp_replace(url, '[?#].*$', '')
WHERE url ~ '[?#]';
