---
title: Concrete Contractors Estimator
emoji: 🏗️
colorFrom: yellow
colorTo: red
sdk: static
pinned: false
license: mit
short_description: Concrete yards, bags, rebar, cost and hot-weather pour plan
---

# Concrete Contractors Estimator

A static calculator for the take-off concrete contractors do before a pour. Pick a slab, driveway, patio,
footing, round column or set of steps, enter the measurements and it shows:

- cubic yards with a waste allowance, and the quantity to order from a ready-mix plant (next 1/4 yd)
- 80, 60 and 40 lb bag counts, and whether bags or ready-mix make more sense
- rebar grid quantities (bars each way, linear feet, 20 ft sticks) or welded-wire mesh sheets for slabs
- a rough installed cost range for broom, colored, exposed-aggregate or stamped finishes
- a pour-day plan from the forecast high and month: heat risk, start window, tips and a cure schedule

Everything runs in the browser. No tracking, no network calls, nothing stored.

The planning numbers follow how [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/) approach desert work:
pour early, pre-wet the subgrade, keep the mix cool and start curing as soon as the finish is done.

| File | Purpose |
|---|---|
| `index.html` | The page |
| `estimator.js` | Formulas (same as the npm package `concrete-contractors-estimator`) |
| `app.js` | UI wiring |

Source and packages for npm, PyPI, crates.io, pub.dev, NuGet, RubyGems and Packagist:
https://github.com/nbkdevs/concrete-contractors-phoenix
