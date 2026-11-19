# Concrete Contractors Estimator: shared spec

Every package in this repo implements the same numbers, so a result from the npm CLI matches
the PyPI, Rust, Dart, C#, Ruby and PHP versions, the Android app and the browser page.

## Volume (cubic feet)

| Shape | Inputs | Formula |
|---|---|---|
| slab / driveway / patio | length ft, width ft, thickness in | L x W x T/12 |
| footing (continuous) | length ft, width in, depth in | L x W/12 x D/12 |
| column (round) | diameter in, height ft, count | pi x (D/24)^2 x H x count |
| steps | steps n, rise in, run in, width ft | W x run/12 x rise/12 x n(n+1)/2 |

`estimate(cubicFeet, waste=0.10)` returns:

- `cubicFeet` = raw volume x (1 + waste), rounded to 2 decimals
- `cubicYards` = that / 27, rounded to 2 decimals
- `bags80` = ceil(volume with waste / 0.60), `bags60` = ceil(... / 0.45), `bags40` = ceil(... / 0.30)
  (yields are cubic feet per bag of standard premixed concrete; values are rounded to 6 decimals before ceil)
- `orderYards` = cubic yards rounded up to the next 0.25 yd (how ready-mix is ordered)
- `suggestion` = "bags" when the volume with waste is under 1 cubic yard, otherwise "ready-mix"

## Reinforcement (slabs)

- `rebar(lengthFt, widthFt, spacingIn=18)`: bars each way on a grid, 3 in edge cover ignored for simplicity.
  bars along length = floor(W x 12 / spacing) + 1, each L ft long; bars along width = floor(L x 12 / spacing) + 1, each W ft long.
  `linearFeet` = sum (2 decimals); `sticks20` = ceil(linearFeet x 1.10 / 20) (10 % lap allowance).
- `meshSheets(areaSqFt)` = ceil(area x 1.10 / 50) for 5 x 10 ft welded-wire sheets.

## Rough installed cost (flatwork, USD per sq ft, Phoenix area, 2026)

| finish | low | high |
|---|---|---|
| broom | 6 | 10 |
| colored | 8 | 13 |
| exposed | 9 | 14 |
| stamped | 12 | 20 |

`costRange(areaSqFt, finish="broom", thicknessIn=4, removeOld=false)`:
multiplier = 1 + 0.10 x (thickness - 4) when thickness > 4, else 1; removing old concrete adds 2-4 per sq ft.
low = round(area x (low x mult + demoLow)), high = round(area x (high x mult + demoHigh)). Unknown finish -> error.

## Hot-weather pour advice

`pourAdvice(forecastHighF, month)`:

| forecast high | risk | start window |
|---|---|---|
| < 90 F | low | any time; finish before the afternoon peak |
| 90-99 F | moderate | start by 7:00 am |
| 100-109 F | high | start 5:00-6:00 am, finish by 10:00 am |
| >= 110 F | extreme | reschedule if you can; otherwise start at first light and finish by 9:00 am |

Tips accumulate with risk (pre-wet subgrade, shade/windbreaks, set retarder, ice or chilled mix water,
curing compound or wet cure right after finishing). Months 6-9 add a monsoon note (watch storm cells, cover the slab,
keep runoff off fresh concrete). Every result carries the same cure schedule:
foot traffic after 2 days, vehicles after 7 days, keep moist 7 days, design strength at 28 days.
