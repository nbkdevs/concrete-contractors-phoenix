# Concrete Contractors Estimator (.NET)

`PhoenixConcreteContractors.Estimator` is a dependency-free .NET library (netstandard2.0 and net8.0) for the
take-off concrete contractors do before a pour: volume for slabs, driveways, patios, footings, round
columns and steps, a waste factor, cubic yards to order, 80/60/40 lb bag counts, rebar or wire-mesh
quantities, a rough installed cost range and hot-weather pour advice for desert summers.

```bash
dotnet add package PhoenixConcreteContractors.Estimator
```

```csharp
using PhoenixConcreteContractors.Estimator;

var e = ConcreteEstimator.Estimate(ConcreteEstimator.SlabVolume(20, 10, 4));
// e.CubicYards = 2.72, e.OrderYards = 2.75, e.Bags80 = 123, e.Suggestion = "ready-mix"

var rebar = ConcreteEstimator.Rebar(20, 10, spacingIn: 18);           // 280 ft, 16 x 20 ft sticks
var cost = ConcreteEstimator.CostRange(200, "stamped", 5, removeOld: true); // (3040, 5200) USD
var plan = ConcreteEstimator.PourAdvice(112, month: 7);               // Risk "extreme", Monsoon true
```

| Method | Returns |
|---|---|
| `SlabVolume`, `FootingVolume`, `ColumnVolume`, `StepsVolume` | cubic feet |
| `Estimate(cubicFeet, waste = 0.10)` | cubic feet/yards with waste, order yards, 80/60/40 lb bags, bags vs ready-mix |
| `Rebar(lengthFt, widthFt, spacingIn = 18)` | bars each way, linear feet, 20 ft sticks (10 % lap) |
| `MeshSheets(areaSqFt)` | 5 x 10 ft welded-wire sheets |
| `CostRange(area, finish, thicknessIn, removeOld)` | rough USD range for broom, colored, exposed or stamped flatwork |
| `PourAdvice(forecastHighF, month)` | heat risk, start window, tips, monsoon flag, cure days |

Same formulas as the JavaScript, Python, Rust, Dart, Ruby and PHP versions (see `SPEC.md` in the repository).
Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat: [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/)
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
