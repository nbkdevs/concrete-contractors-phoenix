# Concrete Contractors Estimator (Python)

A small, dependency-free Python library and CLI for the take-off concrete contractors do before a pour:
volume for slabs, driveways, patios, footings, round columns and steps, a waste factor, cubic yards to
order, 80/60/40 lb bag counts, rebar or wire-mesh quantities, a rough installed cost range and
hot-weather pour advice for desert summers.

```bash
pip install concrete-contractors-estimator
concrete-contractors-estimator slab 24 12 4 --finish stamped
concrete-contractors-estimator pour 108 7
```

```python
from concrete_contractors_estimator import slab_volume, column_volume, estimate, rebar, cost_range, pour_advice

estimate(slab_volume(20, 10, 4))
# {'cubic_feet': 73.33, 'cubic_yards': 2.72, 'order_yards': 2.75, 'bags80': 123, 'bags60': 163, 'bags40': 245, 'suggestion': 'ready-mix'}
estimate(column_volume(12, 4, 4))      # four 12 in sonotubes, 4 ft deep -> bags
rebar(20, 10, spacing_in=18)           # bars each way, linear feet, 20 ft sticks
cost_range(200, "stamped", 5, True)    # {'low': 3040, 'high': 5200, 'currency': 'USD'}
pour_advice(112, 7)["start"]           # 'Reschedule if you can; otherwise start at first light ...'
```

| Function | What it gives you |
|---|---|
| `slab_volume`, `footing_volume`, `column_volume`, `steps_volume` | cubic feet |
| `estimate(cubic_feet, waste=0.10)` | cubic feet/yards with waste, order yards (next 1/4 yd), bag counts, bags vs ready-mix |
| `rebar(length_ft, width_ft, spacing_in=18)` | grid bars, linear feet, 20 ft sticks with 10 % lap |
| `mesh_sheets(area_sq_ft)` | 5 x 10 ft welded-wire sheets |
| `cost_range(area, finish, thickness_in, remove_old)` | rough USD range for broom, colored, exposed or stamped flatwork |
| `pour_advice(forecast_high_f, month)` | heat risk, start window, tips, monsoon note, cure days |

The same formulas ship for JavaScript, Rust, Dart, C#, Ruby and PHP (see `SPEC.md` in the repository).
Cost figures are planning numbers, not a quote.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat, from a [concrete contractor in Phoenix](https://concretecontractorsphoenix.net/).
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
