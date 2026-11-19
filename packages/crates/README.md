# Concrete Contractors Estimator (Rust)

A zero-dependency Rust crate and CLI for the take-off concrete contractors do before a pour: volume for
slabs, driveways, patios, footings, round columns and steps, a waste factor, cubic yards to order,
80/60/40 lb bag counts, rebar or wire-mesh quantities, a rough installed cost range and hot-weather
pour advice for desert summers.

```bash
cargo install concrete-contractors-estimator
concrete-contractors-estimator slab 24 12 4 stamped
concrete-contractors-estimator pour 108 7
```

```rust
use concrete_contractors_estimator as cce;

let e = cce::estimate(cce::slab_volume(20.0, 10.0, 4.0)?, 0.10)?;
assert_eq!((e.cubic_yards, e.order_yards, e.bags80), (2.72, 2.75, 123));

let rb = cce::rebar(20.0, 10.0, 18.0)?;                               // 280 ft, 16 sticks
let (lo, hi) = cce::cost_range(200.0, cce::Finish::Stamped, 5.0, true)?; // (3040, 5200) USD
let plan = cce::pour_advice(112.0, Some(7))?;                          // "extreme", monsoon = true
# Ok::<(), cce::InputError>(())
```

| Function | Returns |
|---|---|
| `slab_volume`, `footing_volume`, `column_volume`, `steps_volume` | cubic feet |
| `estimate(cubic_feet, waste)` | `Estimate` with cubic feet/yards, order yards, 80/60/40 lb bags, bags vs ready-mix |
| `rebar(length_ft, width_ft, spacing_in)` | `Rebar` with bars each way, linear feet, 20 ft sticks |
| `mesh_sheets(area)` | 5 x 10 ft welded-wire sheets |
| `cost_range(area, Finish, thickness_in, remove_old)` | rough USD (low, high) |
| `pour_advice(forecast_high_f, month)` | `PourAdvice` with risk, start window, tips, monsoon flag |

Same formulas as the JavaScript, Python, Dart, C#, Ruby and PHP versions (see `SPEC.md` in the repository).
Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat: [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/)
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
