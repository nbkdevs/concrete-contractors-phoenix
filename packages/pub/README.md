# Concrete Contractors Estimator (Dart)

A small, dependency-free Dart library and CLI (works in Flutter apps) for the take-off concrete contractors do before a pour:
volume for slabs, driveways, patios, footings, round columns and steps, a waste factor, cubic yards to
order, 80/60/40 lb bag counts, rebar or wire-mesh quantities, a rough installed cost range and
hot-weather pour advice for desert summers.

```bash
dart pub add concrete_contractors_estimator
dart pub global activate concrete_contractors_estimator
concrete_contractors_estimator slab 24 12 4 stamped
```

```dart
import 'package:concrete_contractors_estimator/concrete_contractors_estimator.dart';

final e = estimate(slabVolume(20, 10, 4));   // 2.72 yd3, order 2.75, 123 x 80 lb bags
final r = rebar(20, 10, 18);                 // 280 ft, 16 x 20 ft sticks
final c = costRange(200, finish: 'stamped', thicknessIn: 5, removeOld: true); // (low: 3040, high: 5200)
final p = pourAdvice(112, 7);                // risk extreme, monsoon tips
```

| Function | What it gives you |
|---|---|
| `slabVolume`, `footingVolume`, `columnVolume`, `stepsVolume` | cubic feet |
| `estimate(cubicFeet, [waste = 0.10])` | cubic feet/yards with waste, order yards (next 1/4 yd), bag counts, bags vs ready-mix |
| `rebar(lengthFt, widthFt, [spacingIn = 18])` | grid bars, linear feet, 20 ft sticks with 10 % lap |
| `meshSheets(areaSqFt)` | 5 x 10 ft welded-wire sheets |
| `costRange(area, finish:, thicknessIn:, removeOld:)` | rough USD range for broom, colored, exposed or stamped flatwork |
| `pourAdvice(forecastHighF, [month])` | heat risk, start window, tips, monsoon note, cure days |

The same formulas ship for JavaScript, Python, Rust, C#, Ruby and PHP (see `SPEC.md` in the repository).
Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat: [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/)
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
