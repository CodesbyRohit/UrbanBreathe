# UrbanBreathe forecast archive

This branch (`forecast-archive`) is written only by the **Forecast archive**
GitHub Actions workflow (`.github/workflows/forecast-archive.yml` on the
default branch). It contains no application code. It exists to support a
prospective evaluation of the deployed forecast; see
`docs/methodology/forecast-evaluation.md` on the default branch.

## What is recorded

Twice a day, at 01:30 and 13:30 UTC (after the 00 and 12 UTC CAMS runs), the
workflow requests the following from the production deployment for every
city:

- `GET /api/forecast/<city>`: the past 24 h and the next 72 h, exactly as
  served to users;
- `GET /api/air-quality/<city>`: the current estimate with its sub-indices,
  means and provenance.

Responses are stored **unmodified** inside a small envelope. Nothing is
recomputed, smoothed or filled in.

Size, measured on 20 Oct 2026: about 20 kB per forecast record and 6 kB per
air-quality record, so about 270 kB per run. That comes to roughly 0.55 MB a
day, or 30 MB over 8 weeks.

## Layout

```
README.md                      this file
vercel.json                    disables Vercel deployments of this branch
index.csv                      one line per run (append-only)
runs/YYYY/MM/DD/<UTCstart>-<runId>-<attempt>/
  manifest.json                run metadata and per-record results
  <city>.forecast.json         successful response (envelope + body)
  <city>.air-quality.json
  <city>.<resource>.error.json failed request (envelope + error + body if any)
```

## Record envelope (`archiveSchemaVersion: 1`)

| Field | Meaning |
|---|---|
| `resource`, `cityId`, `runDir` | What was requested and in which run |
| `request.url`, `request.requestedAt` | Exact URL; UTC time the request was sent |
| `response.status`, `response.receivedAt`, `response.durationMs` | HTTP status, UTC receipt time and latency |
| `response.headers` | Only these headers: `date`, `age`, `cache-control`, `x-vercel-cache`, `x-vercel-id`, `content-type`, `content-length` |
| `response.bodySha256` | SHA-256 of the raw response text |
| `error` | `null`, `http_<status>`, `invalid_json`, `timeout` or `network: …` |
| `checks.ok`, `checks.problems` | Structural checks: matching city id, valid `referenceTime`, `retrievedAt` present, a forecast horizon of at least 72 h |
| `body` | The parsed response, unmodified |

## Issue time and lead time

- **Issue time `t0`:** the body's `referenceTime`, which is the model hour the
  forecast is anchored to.
- **Lead time:** `hoursAhead` within the body, measured from `t0`.
- **Retrieval times:** `provenance.airQuality.retrievedAt` is when the API
  fetched the series from Open-Meteo; `response.receivedAt` is when the
  archiver received the response.
- **Model run:** Open-Meteo does not report which CAMS run produced the
  values (`modelRunTime: null`). This is a known limitation of the record.

## `manifest.json`

| Field | Meaning |
|---|---|
| Run identity | `runId`, `event` (`schedule` or `workflow_dispatch`), `cron`, and `scheduledFor` (the slot the run was meant for; scheduled runs can start late) |
| Run timing | `startedAt`, `finishedAt` |
| `workflow` | Repository, ref, commit SHA, run id and attempt of the workflow code that ran |
| `deployment` | Commit and environment reported by the deployment's `/api/health`, which identifies the code that produced the forecast. It is `null` for deployments that predate that field |
| `cities`, `cityListNote` | Cities archived, and any difference from the expected ten |
| `expectedRecords`, `okRecords`, `failedRecords`, `complete` | Counts for the run |
| `results[]` | Per record: file, status, error, problems, `referenceTime`, `retrievedAt`, `x-vercel-cache`, size and SHA-256 |

## Integrity rules

- **Nothing is overwritten.** Run directories and files are created
  exclusively; a second write to the same path fails instead of replacing
  data.
- **Failures are kept.** Failed requests are stored as `.error.json` records,
  and incomplete runs are committed and also fail the workflow job so they
  are visible.
- **Gaps are visible, not hidden.** GitHub does not guarantee that scheduled
  workflows run on time, or at all. Missing slots show up when `index.csv` is
  compared with the expected 01:30 and 13:30 UTC slots, and they are reported
  in any evaluation, never back-filled.
- **No secrets** are used or stored. The workflow reads public endpoints only.

## Licence and attribution

The archived bodies derive from the CAMS global atmospheric composition
forecast (Copernicus Atmosphere Monitoring Service) obtained via Open-Meteo,
both under CC BY 4.0. Reuse must credit the Copernicus Atmosphere Monitoring
Service, Open-Meteo and UrbanBreathe. The archive contains no station
observations.
