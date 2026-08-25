# What happens to an anonymous visitor's artwork

The landing page tells visitors, before they upload, that their artwork is
deleted after the scan. This is what backs that sentence up.

## What is written, and where

| | |
|---|---|
| Postgres | nothing at all — no user, no artwork, no report, no match |
| Cloudflare R2 | the uploaded image, under `public-scans/<uuid>.<ext>` |
| Redis | the scan's job, holding at most 3 matches, for 1 hour |

The scan result never reaches the database. It lives only as the return value of
the BullMQ job, which expires an hour after the scan ends
(`PUBLIC_SCAN_RESULT_TTL_SECONDS`). Creating an account later therefore means
uploading the artwork again — there is nothing to migrate.

## When the image is deleted

`PublicScanProcessor.process` deletes the object in a `finally` block, so it goes
whether the search succeeded, returned nothing, or failed. `PublicScanService.start`
deletes it too when the upload landed but the job could not be queued.

Two paths those do not cover:

- the worker process dies mid-scan, between the upload and the `finally`
- R2 refuses the delete (the scan still returns its result, by design: a storage
  problem must not make a visitor pay for the scan twice)

## The lifecycle rule that covers the rest

Set once, by hand, in the Cloudflare dashboard. It is not in code because R2
lifecycle rules are bucket configuration, not application state.

**Dashboard → R2 → the bucket → Settings → Object lifecycle rules → Add rule**

| Field | Value |
|---|---|
| Rule name | `public-scans-1-day` |
| Prefix | `public-scans/` |
| Action | Delete uploaded objects |
| Age | 1 day after upload |

The prefix matters: scoped to `public-scans/`, the rule cannot touch a paying
user's artwork, which lives under the prefixes in `StoragePrefixEnum`.

`public-scans` is deliberately **absent** from `StoragePrefixEnum`. Adding it
would widen `UploadUrlsRequestSchema` and let any logged-in user ask the
authenticated upload-URL route for write access to this prefix.

## Verifying it

```bash
# after running one public scan, the object should be gone within seconds
aws s3 ls s3://$CLOUDFLARE_BUCKET_NAME/public-scans/ \
  --endpoint-url "$CLOUDFLARE_R2_ENDPOINT"
```

An empty listing is the expected result. Anything still there after a completed
scan means the `finally` block did not run, and the lifecycle rule is what
eventually clears it.
