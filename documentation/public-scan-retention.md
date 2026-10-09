# What happens to an anonymous visitor's artwork

The landing page tells visitors, before they upload, that their artwork is
deleted after the scan. This is what backs that sentence up.

## What is written, and where

| | |
|---|---|
| Postgres | nothing at all — no user, no artwork, no report, no match |
| Cloudflare R2 | the uploaded image, under `public-scans/<uuid>.<ext>`, deleted when the scan ends |
| Redis | the scan's job, holding at most 3 matches, for 1 hour |

The result never reaches the database: it is the BullMQ job's return value and
expires with it (`PUBLIC_SCAN_RESULT_TTL_SECONDS`). Creating an account later
means uploading the artwork again, because there is nothing to migrate.

## The lifecycle rule you have to set by hand

`PublicScanProcessor.process` deletes the image in a `finally`, so it goes even
when the scan fails. Two paths escape that: the worker dying mid-scan, and R2
refusing the delete. This rule sweeps what they leave behind. It is not in code
because R2 lifecycle rules are bucket configuration, not application state.

**Dashboard → R2 → the bucket → Settings → Object lifecycle rules → Add rule**

| Field | Value |
|---|---|
| Rule name | `public-scans-1-day` |
| Prefix | `public-scans/` |
| Action | Delete uploaded objects |
| Age | 1 day after upload |

Nothing needs creating in the bucket first: a prefix is just the start of an
object key, and the first upload brings it into existence.

Scoping to `public-scans/` is what keeps the rule away from paying users'
artwork. Keep `public-scans` **out** of `StoragePrefixEnum` for the mirror-image
reason: adding it would widen `UploadUrlsRequestSchema` and let any logged-in
user request a presigned write URL into this prefix.
