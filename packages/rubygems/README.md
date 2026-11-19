# Concrete Contractors Estimator (Ruby)

`concrete_contractors_estimator` is a dependency-free Ruby library and CLI for the take-off concrete contractors do
before a pour: volume for slabs, driveways, patios, footings, round columns and steps, a waste factor, cubic
yards to order, 80/60/40 lb bag counts, rebar or wire-mesh quantities, a rough installed cost range and
hot-weather pour advice for desert summers.

```bash
gem install concrete_contractors_estimator
concrete_contractors_estimator slab 24 12 4 stamped
concrete_contractors_estimator pour 108 7
```

```ruby
require "concrete_contractors_estimator"
C = ConcreteContractorsEstimator

C.estimate(C.slab_volume(20, 10, 4))
# => {cubic_feet: 73.33, cubic_yards: 2.72, order_yards: 2.75, bags80: 123, bags60: 163, bags40: 245, suggestion: "ready-mix"}
C.rebar(20, 10, 18)                                            # 280 ft, 16 x 20 ft sticks
C.cost_range(200, finish: "stamped", thickness_in: 5, remove_old: true) # {low: 3040, high: 5200, currency: "USD"}
C.pour_advice(112, 7)[:risk]                                   # "extreme"
```

| Function | Returns |
|---|---|
| `slab_volume`, `footing_volume`, `column_volume`, `steps_volume` | cubic feet |
| `estimate(cubic_feet, waste = 0.10)` | cubic feet/yards with waste, order yards, 80/60/40 lb bags, bags vs ready-mix |
| `rebar(length_ft, width_ft, spacing_in = 18)` | bars each way, linear feet, 20 ft sticks (10 % lap) |
| `mesh_sheets(area_sq_ft)` | 5 x 10 ft welded-wire sheets |
| `cost_range(area, finish:, thickness_in:, remove_old:)` | rough USD range for broom, colored, exposed or stamped flatwork |
| `pour_advice(forecast_high_f, month = nil)` | heat risk, start window, tips, monsoon flag, cure days |

Same formulas as the JavaScript, Python, Rust, Dart, C# and PHP versions (see `SPEC.md` in the repository).
Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat: [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/)
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
