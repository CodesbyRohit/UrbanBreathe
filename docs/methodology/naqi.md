# NAQI calculation — methodology and sources

UrbanBreathe computes the CPCB National Air Quality Index (NAQI) in
`server/domain/naqi.js`. This note records what was verified, where it came from,
and what remains uncertain.

## Sources reviewed (11 Oct 2026)

1. CPCB, *National Air Quality Index*, Control of Urban Pollution Series
   CUPS/82/2014-15. Retrieved from
   `https://cpcb.nic.in/displaypdf.php?id=bmF0aW9uYWwtYWlyLXF1YWxpdHktaW5kZXgvRklOQUwtUkVQT1JUX0FRSV8ucGRm`.
   Used: Table 3.11 (breakpoints for AQI scale 0–500), Table 3.12 (health
   statements), the segmented-linear sub-index formula, and the maximum-operator
   aggregation (`AQI = Max(I1, I2, …, In)`).
2. CPCB, *How is AQI calculated?*,
   `https://airquality.cpcb.gov.in/ccr_docs/How_AQI_Calculated.pdf`. Used:
   - sub-indices use the 24-hourly average (8-hourly for CO and O3);
   - overall AQI only when data are available for at least three pollutants, one
     of which is PM2.5 or PM10 — otherwise data are insufficient;
   - a minimum of 16 hours' data is needed for a sub-index;
   - the real-time system uses running averages (AQI at 06:00 covers 06:00 the
     previous day to 06:00 the current day).

## Implemented rules

| Rule | Implementation | Status |
|---|---|---|
| Breakpoints | Table 3.11 for PM10, PM2.5, NO2, O3, CO (mg/m³), SO2, NH3, Pb | Verified |
| Sub-index | `Ip = (IHI − ILO)/(BHI − BLO) × (Cp − BLO) + ILO`, with ILO reduced by one when it is greater than 50 (§3.5), rounded to an integer | Verified formula; integer rounding is our choice |
| Aggregation | Maximum sub-index; the pollutant(s) at the maximum are "dominant" | Verified |
| Minimum pollutants | ≥ 3 valid sub-indices, at least one of PM2.5/PM10, else `insufficient_data` (no value) | Verified |
| 24-hour completeness | ≥ 16 valid hourly values in the window | Verified |
| Averaging window | Running mean of the hours ending at the reference hour (inclusive); later hours ignored | Verified for 24-hour; see uncertainty 2 for 8-hour |
| Units | CO in mg/m³, all others in µg/m³; inputs converted by `server/domain/units.js` | Verified (Table 3.11 header) |

## Uncertainties and implementation choices

1. **Open-ended Severe band.** Table 3.11 lists Severe as `430+`, `250+`, etc.
   with no upper breakpoint, so the sub-index cannot be interpolated inside
   401–500. We return 401 flagged `isLowerBound: true` and display "401+".
2. **8-hour pollutants (O3, CO).** The documents say "8-hourly" and the report's
   worked examples compute running 8-hour averages, but they do not state whether
   the real-time AQI uses the latest running 8-hour mean or the maximum 8-hour
   mean within the last 24 hours. We use the latest running 8-hour mean.
3. **8-hour completeness.** No minimum is stated for 8-hour averages in the
   documents reviewed. We require all 8 hourly values rather than invent a
   tolerance. This may mark some O3/CO sub-indices insufficient that CPCB would
   compute.
4. **Values between published bands.** Breakpoints are published as integers
   (one decimal for CO and Pb), leaving gaps such as 30–31 µg/m³ for PM2.5. We
   round the averaged concentration to the table's precision before band
   lookup. CPCB's own rounding rule was not found.
5. **"Subtract one from ILO".** Section 3.5 of the report states the formula
   with "subtract one from ILO, if ILO is greater than 50", so e.g. PM2.5 of
   31 µg/m³ maps to 50 and 45 µg/m³ to 74. Some secondary sources omit this
   step (giving 51 and 75). We follow the CPCB report.
6. **Gas unit conversion.** ppb/ppm conversions use 25 °C and 1 atm
   (24.45 L/mol). The reference conditions CPCB assumes were not confirmed. No
   current data provider requires this conversion (Open-Meteo reports µg/m³).
7. **Category at a band's lower breakpoint.** Because of the "subtract one"
   rule, a concentration exactly at a band's lower breakpoint maps to the top
   index of the previous category (PM2.5 61 µg/m³ → 100). The reported
   category follows the index (Satisfactory), consistent with how the overall
   AQI is categorised; the Table 3.11 concentration row (Moderate) is kept as
   `concentrationBand`. Earlier versions labelled the sub-index by its
   concentration row, so a pollutant card could say "Moderate" next to an
   index of 100 while the overall estimate for the same value said
   "Satisfactory". Regression test: `tests/server/naqi.test.js`.

## Freshness and caching

- `referenceTime` is the latest model hour at or before the request time (UTC);
  all means end at that hour.
- `retrievedAt` is when the server fetched the series from Open-Meteo. It is
  preserved for cached responses (server cache: 10 minutes per instance), so a
  cached value is never presented as newly retrieved.
- Open-Meteo does not report which CAMS model run produced the values; the API
  returns `modelRunTime: null` rather than presenting the retrieval time as an
  issue time.

## Forecast evaluation (not yet done)

No accuracy is claimed. A defensible evaluation would need hourly CPCB CAAQMS
observations for the same cities and period (subject to their terms of use), a
time-ordered hold-out with no future information, a persistence baseline, and
errors reported per lead time (e.g. MAE of the index and category hit rate),
with station-to-grid representativeness discussed explicitly.

## Modelled data is not an official AQI

The live data source is the CAMS global atmospheric composition forecast served
by Open-Meteo: model output on a grid of roughly 45 km for India, not station
measurements. Applying the NAQI formula to it gives an **NAQI-method estimate
from modelled data**. It is labelled as such in the API (`naqi.basis`,
`naqi.officialCpcb: false`) and in the UI, and must not be presented as the
official CPCB station AQI.
