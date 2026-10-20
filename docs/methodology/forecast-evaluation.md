# Forecast evaluation — protocol (approved, not yet run)

Status: **protocol approved for implementation, 20 Oct 2026; no results yet.**
No observation data has been downloaded. The product keeps its "not evaluated"
label until the evaluation in this document has been run, reviewed and is
reproducible. Any result validates only the pollutants, cities, stations, lead
times and period actually evaluated, and is worded that narrowly.

| Phase | Scope | Status |
|---|---|---|
| 0 | Prospective archive of the deployed forecast (§2) | Approved; GitHub Actions, dedicated branch |
| 1 | PM2.5 and PM10, 24-h means, leads 24/48/72 h | Planned; blocked on observation permissions (§3) |
| 2 | O₃, 8-h means, same leads | **Required** before any claim about the headline estimate in O₃-dominant cities |
| — | Raw-CAMS retrospective cross-check (ADS) | Deferred; if run, labelled "raw CAMS", never "UrbanBreathe forecast validation" |

## 1. What is being evaluated

UrbanBreathe's forecast is the CAMS global atmospheric-composition forecast
(0.4° ≈ 45 km, two runs per day at 00 and 12 UTC, five-day horizon) served by
Open-Meteo for each city-centre coordinate, and the CPCB NAQI method applied
to it (`server/services/forecast.js`). The claim to test is:

> For lead times of 24, 48 and 72 h, how close are UrbanBreathe's forecasts of
> 24-hour mean PM2.5 and PM10 to reference station observations, and are they
> better than persistence?

Primary targets: 24-hour mean PM2.5 and PM10 ending at the valid time (CPCB
requires one of them for an overall index). Secondary: NAQI category of the
PM sub-indices (category agreement), hourly PM2.5.

Scope limitation, stated up front: on 20 Oct 2026 the live estimates were
O₃-dominant in six of ten cities (Mumbai, Hyderabad, Pune, Ahmedabad,
Bengaluru, Chennai). A PM-only evaluation therefore does **not** validate the
overall NAQI-method estimate in those cities. O₃ (8-hour mean) is a
**required Phase 2**, not an optional extension, and needs its own design:
station siting (titration near roads) and a coarse model grid make the
comparison harder. NO₂, SO₂ and CO come after that.

## 2. The forecast archive problem (critical path)

A lead-time evaluation needs, for each valid time, the forecast **as issued**
24/48/72 h earlier. Findings:

| Source | Lead-time archive? | Fidelity to the product | Licence | Notes |
|---|---|---|---|---|
| Open-Meteo Air Quality API | **No.** `past_days` (≤ 92) returns "archived forecasts" stitched into one series; no previous-run or lead-time parameters are documented for air quality ([docs](https://open-meteo.com/en/docs/air-quality-api)) | Exact (it *is* the product's source) | CC BY 4.0 | Cannot support a retrospective evaluation |
| CAMS Atmosphere Data Store, *CAMS global atmospheric composition forecasts* | **Yes.** 2015–present, 00/12 UTC runs, hourly single-level fields to 120 h ([ADS](https://ads.atmosphere.copernicus.eu/datasets/cams-global-atmospheric-composition-forecasts)) | Approximate: same model, but our own grid-cell selection replaces Open-Meteo's processing; units kg m⁻³ → ×10⁹ µg/m³ | CC-BY since 2 Jul 2025 ([ECMWF notice](https://forum.ecmwf.int/t/cc-by-licence-to-replace-licence-to-use-copernicus-products-on-02-july-2025/13464)) | Free ADS account required |
| Prospective archive of UrbanBreathe's own `/api/forecast` | Yes, from the day archiving starts | **Exact** | Derived from Open-Meteo/CAMS (CC BY 4.0): store with attribution | Needs 4–8 weeks plus observation lag before results |

**Decision (approved).** The primary evaluation uses the prospective archive,
because it tests exactly what users see. The ADS retrospective run is
deferred (see the phase table). Archiving does not depend on the
observation-licence question below.

Archive design: the implementation is a separate change on branch
`feat/forecast-archive`. It adds `.github/workflows/forecast-archive.yml`,
`scripts/archive-forecasts.mjs` and `docs/methodology/forecast-archive.md`,
which describes the record format.
- **Schedule.** A scheduled GitHub Actions workflow runs twice daily, at
  01:30 and 13:30 UTC, after each CAMS run. The workflow lives on the
  default branch.
- **Storage.** The workflow writes only to the dedicated `forecast-archive`
  branch, which contains no application code.
- **What is stored.** The complete `/api/forecast/:cityId` and
  `/api/air-quality/:cityId` responses for all 10 cities, with:
  - request and response times;
  - the response headers that matter for freshness;
  - the deployed commit reported by `/api/health`;
  - the workflow commit and run id;
  - an archive schema version.
- **Issue time.** `t0` is the response's `referenceTime`; `retrievedAt` is
  stored alongside it. The CAMS run that produced the values is unknown
  (`modelRunTime: null`), so lead times are measured from `t0`, and this
  limitation is reported.
- **Records are never overwritten.** Each run writes a new directory keyed by
  its UTC start time and run id, and the script refuses to write into an
  existing one.
- **Failures are recorded, not skipped.** A failed city fetch produces an
  error record. A run that never executed shows up as a gap in the expected
  01:30/13:30 slots when the manifest is analysed, because GitHub does not
  guarantee scheduled runs.
- **When the clock starts.** The 8-week clock starts when complete
  10-city runs begin accumulating, not when the workflow is merged.

## 3. Observation sources — comparison

| Criterion | CPCB CCR / CAAQMS (direct) | data.gov.in "Real time Air Quality Index" (CPCB) | OpenAQ API v3 |
|---|---|---|---|
| Authority | Primary: India's official continuous network | CPCB data republished on the national OGD platform | Aggregator; recovered access to the CPCB reference network in 2025 (OpenAQ 2025 Year in Data, secondary report) |
| Access | CCR portal (airquality.cpcb.gov.in) with request-size limits per query; no documented bulk API | Hourly *current* values only; the page currently states the API "does not exist" and must be requested ([listing](https://data.gov.in/resource/real-time-air-quality-index-various-locations), page returned 403 to automated fetch) | Documented API, free key required; downloading only through registered use ([terms](https://docs.openaq.org/about/terms)) |
| History | Multi-year, station-level | None (live snapshot) | CPCB sensors: an older series ended Oct 2022, a new sensor generation runs from 18 Feb 2025; the two are not joined (third-party coverage check, Chennai, Oct 2026) |
| Licence / reuse | **Unclear.** The CPCB website copyright policy (as summarised in search results; the page could not be fetched first-hand because of a TLS certificate error) allows download/print without permission and requires approval from the competent authority for other uses. The CCR portal's own terms were not found | GODL-India (as reported for data.gov.in datasets; the dataset page itself could not be fetched): worldwide, royalty-free, attribution with URL, no endorsement | Per-location licence metadata (`/licenses`: commercial use, attribution, redistribution, modification, share-alike). OpenAQ says third-party terms still apply and requires attribution to OpenAQ as well |
| Quality flags | Provider QC; known issues with maintenance and siting (CREA NCAP report) | Live values "may include errors or abnormal readings" | As-is, no warranty; inherits provider quality |
| Main risk | Permission for reuse; manual retrieval | No history: only usable for a prospective observation archive | Licence of CPCB-sourced locations not yet checked; gaps; ingestion delay |

**Unverified items, to be checked before any download:**
1. The CPCB copyright policy, read first-hand, and any CCR-portal-specific terms.
2. The licence that OpenAQ attaches to Indian CPCB locations: read `/v3/licenses`
   and the location metadata with an API key.
3. Whether the data.gov.in API is currently available, and its exact licence field.

**Decision rule.** Use CPCB data through a channel whose terms explicitly permit
computing and publishing derived statistics:
- *CPCB written clarification, or an OpenAQ licence permitting it:* proceed with
  that channel.
- *OpenAQ's licence for CPCB locations is explicit (e.g. GODL-India or CC BY)
  and CPCB's own terms do not prohibit it:* OpenAQ may be used, with
  attribution to CPCB and OpenAQ.
- *Terms are ambiguous:* ask CPCB (template in §10). OpenAQ's availability is
  not treated as permission.
- *In all cases:* raw observations are **not redistributed** in the repository
  unless the licence allows it; only manifests, retrieval scripts and derived
  metrics are published.

## 4. Station matching

For each city:
1. List reference (CAAQMS) stations measuring PM2.5 and/or PM10 inside the
   CAMS 0.4° grid cell that contains the city's coordinate in
   `server/data/cities.js`.
2. For each station, record: provider ID, name, coordinates, distance to
   the city point, grid-cell indices, pollutants, units, averaging interval,
   time zone and timestamp convention (period-start or period-end), licence,
   and first and last observation in the period.
3. **Report per station.** A multi-station aggregate may be reported in
   addition, but it is labelled "mean of N stations in cell" and never
   presented as a single station.
4. Representativeness caveat in every result: a 45 km model cell against
   point stations, which are often near roads. A model that is right about
   the regional mean can still show large station-level errors.

## 5. Alignment of definitions

- **Time.** Everything is converted to UTC. CPCB local times are IST
  (UTC+05:30). Each source's timestamp convention is verified by inspecting
  raw data, not assumed. A one-hour misalignment changes the results.
- **Hourly validity.** If observations are sub-hourly, an hour is valid when
  at least 3 of 4 quarter-hour values exist. CPCB hourly averages are used
  as delivered and their aggregation rule is recorded.
- **24-hour means.** Both forecast and observation use the window ending at
  the valid time, with at least 16 valid hours (CPCB rule, as in
  `server/domain/naqi.js`). Windows with fewer valid hours are excluded and
  counted.
- **Units.** µg/m³ for both PM fractions. ADS fields are converted from
  kg m⁻³.
- **Lead time.** For issue time `t0`, the 24-h-ahead target is the 24-h mean
  over `(t0, t0+24h]`, built entirely from forecast hours. 48 h and 72 h use
  `(t0+24h, t0+48h]` and `(t0+48h, t0+72h]`.

## 6. Baseline and leakage control

- **Persistence.** The forecast for every lead is the observed 24-h mean over
  `(t0−24h, t0]`, using only observations with timestamps ≤ `t0` that would
  have been available at `t0`. Measured provider latency is subtracted: if
  data typically arrives with delay `L`, the window ends at `t0 − L`. The
  value of `L` used is reported.
- **Retrospective runs (ADS)** simulate availability the same way. No
  observation after `t0` enters any forecast or baseline, and no parameter is
  tuned on the evaluation period.
- **Optional second baseline:** a 28-day climatology of the same hour, built
  from observations before the period.

## 7. Metrics and reporting

Per city × station (or labelled cell-mean) × pollutant × lead time:
- **Errors:** MAE, RMSE and mean bias (forecast − observation) in µg/m³.
- **Skill against persistence:** `1 − MAE_forecast / MAE_persistence`.
  Uncertainty comes from a moving-block bootstrap over days (block length
  3 days) of the paired MAE difference. Report the 95 % interval and
  n (days).
- **Category agreement:** the share of cases where the PM sub-index category
  matches, plus a confusion table.
- **Coverage:** usable pairs out of possible pairs, and the number and reason
  for every exclusion.
- **Context:** the season, the evaluation period, and the stations in each
  table.

Results are published with the code commit, the configuration and the
retrieval manifests (§8). A forecast worse than persistence is reported as
such.

## 8. Quality filters and reproducibility

These rules are pre-registered before looking at any results:
- **Excluded:** negative values; PM2.5 > 1000 µg/m³ or PM10 > 2000 µg/m³;
  6 h or more of identical consecutive values (stuck instrument).
- **Flagged but kept:** hours where PM2.5 > PM10.
- **No other exclusions** are added after seeing results. Every applied
  rule is reported with counts.
- `evaluation/config.json` records:
  - cities, stations, period and lead times;
  - filters and thresholds;
  - the latency `L`;
  - the source endpoints.
- `evaluation/manifest/` records, for each retrieval:
  - URL or endpoint, parameters, retrieval time (UTC) and HTTP status;
  - SHA-256 of the raw file;
  - the licence and attribution string.
- Raw third-party files stay outside git unless their licence allows
  redistribution.
- Secrets (OpenAQ and ADS keys) come from environment variables and are
  never committed.

## 9. Period selection and timeline

- **Period:** at least 28 days per city, preferably 8 weeks, chosen only after
  a coverage check shows at least 75 % usable pairs at every lead time for
  the selected stations.
- **Prospective timeline:** start the archive → 8 weeks of collection →
  about 1 week of observation lag and quality control → analysis → review.
- **Label change:** the "not evaluated" label changes only after the results
  have been reviewed. The new text states the period, the stations and the
  headline metrics, with a link to the full report.

## 10. Decisions and next actions

1. **Prospective archive.** Approved (GitHub Actions, dedicated branch).
   Collection starts after the workflow has been reviewed and merged, and its
   first run has been checked for complete 10-city records.
2. **Observation channel.**
   - **OpenAQ.** The owner registers the API key. It is kept only in a local
     environment variable, or in a GitHub Actions secret if automation needs
     it; never in chat, code or committed configuration. The key is used
     first to inspect CPCB station metadata, per-location licences and
     coverage. No observations are downloaded or published until reuse
     rights are established.
   - **CPCB.** The owner reviews and sends the request below. It asks for
     explicit permission for the evaluation and the publication of derived
     statistics, including attribution and any restrictions.

   Suggested request:

   > Subject: Permission to use CAAQMS data for a non-commercial forecast-evaluation study
   >
   > We maintain UrbanBreathe, a non-commercial, open-source web application that
   > shows CPCB NAQI-method estimates computed from the CAMS global model for ten
   > Indian cities. We would like to evaluate the model's 24–72 h PM2.5/PM10
   > forecasts against hourly CAAQMS observations for selected stations
   > (approximately 8 weeks), and publish only derived statistics (errors, skill
   > against persistence, data coverage) with attribution to CPCB. Raw data would
   > not be redistributed. Could you confirm whether this use is permitted,
   > whether any restrictions apply (for example on the publication of
   > station-level error statistics), the preferred channel for obtaining the
   > data, and the attribution wording you would like us to use?

3. **ADS retrospective cross-check.** Deferred. It is not a prerequisite for
   anything above.
