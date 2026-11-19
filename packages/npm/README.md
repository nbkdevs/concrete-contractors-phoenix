# Concrete Contractors Estimator (npm)

A zero-dependency JavaScript library and CLI that does the take-off concrete contractors do before a pour:
volume for slabs, driveways, patios, footings, round columns and steps, with a waste factor, cubic yards
to order, 80/60/40 lb bag counts, rebar or wire-mesh quantities, a rough installed cost range and
hot-weather pour advice for desert summers.

```bash
npm install concrete-contractors-estimator
npx concrete-contractors-estimator slab 24 12 4 --finish stamped
```

```
slab: 3.91 yd3 (105.6 ft3 incl. waste) - order 4 yd3
Bags: 176 x 80 lb, 235 x 60 lb or 352 x 40 lb
Suggestion: ready-mix
Rebar: 420 ft (24 x 20 ft sticks) or 7 mesh sheets
Rough installed cost: $3,456 - $5,760
```

## Library

```js
const c = require('concrete-contractors-estimator');

const cuft = c.slabVolume(20, 10, 4);         // 66.67 ft3
c.estimate(cuft);                             // { cubicYards: 2.72, orderYards: 2.75, bags80: 123, ... }
c.estimate(c.columnVolume(12, 4, 4));         // four 12 in sonotubes, 4 ft deep
c.estimate(c.stepsVolume(3, 7, 11, 4));       // 3 steps, 7 in rise, 11 in run, 4 ft wide
c.rebar(20, 10, 18);                          // #4 bar at 18 in on center
c.costRange(200, 'stamped', 5, true);         // { low: 3040, high: 5200, currency: 'USD' }
c.pourAdvice(112, 7);                         // risk 'extreme', start window, tips, monsoon note, cure schedule
```

| Function | Returns |
|---|---|
| `slabVolume(lengthFt, widthFt, thicknessIn)` | cubic feet |
| `footingVolume(lengthFt, widthIn, depthIn)` | cubic feet |
| `columnVolume(diameterIn, heightFt, count = 1)` | cubic feet |
| `stepsVolume(steps, riseIn, runIn, widthFt)` | cubic feet |
| `estimate(cubicFeet, waste = 0.10)` | `cubicFeet`, `cubicYards`, `orderYards` (next 1/4 yd), `bags80/60/40`, `suggestion` |
| `rebar(lengthFt, widthFt, spacingIn = 18)` | bars each way, linear feet, 20 ft sticks (10 % lap) |
| `meshSheets(areaSqFt)` | 5 x 10 ft welded-wire sheets |
| `costRange(areaSqFt, finish, thicknessIn, removeOld)` | rough installed USD range for broom, colored, exposed or stamped flatwork |
| `pourAdvice(forecastHighF, month)` | heat risk, start window, tips, monsoon flag, cure days |

Bag yields: 80 lb = 0.60 ft3, 60 lb = 0.45 ft3, 40 lb = 0.30 ft3. The same formulas ship in Python, Rust,
Dart, C#, Ruby and PHP; see the [shared spec](https://github.com/nbkdevs/concrete-contractors-phoenix/blob/main/SPEC.md).
Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat: [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/)
- Source and other languages: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
