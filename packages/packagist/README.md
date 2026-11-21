# Concrete Contractors Estimator (PHP)

`phoenixconcretecontractors/concrete-contractors-estimator` is a dependency-free PHP 8.1+ class for the take-off
concrete contractors do before a pour: volume for slabs, driveways, patios, footings, round columns and
steps, a waste factor, cubic yards to order, 80/60/40 lb bag counts, rebar or wire-mesh quantities, a rough
installed cost range and hot-weather pour advice for desert summers.

```bash
composer require phoenixconcretecontractors/concrete-contractors-estimator
```

```php
use PhoenixConcreteContractors\Estimator\ConcreteEstimator as C;

C::estimate(C::slabVolume(20, 10, 4));
// ['cubicFeet' => 73.33, 'cubicYards' => 2.72, 'orderYards' => 2.75, 'bags80' => 123, ..., 'suggestion' => 'ready-mix']
C::rebar(20, 10, 18);                     // 280 ft, 16 x 20 ft sticks
C::costRange(200, 'stamped', 5, true);    // ['low' => 3040, 'high' => 5200, 'currency' => 'USD']
C::pourAdvice(112, 7)['risk'];            // 'extreme'
```

The package is served from the repository root `composer.json` (PSR-4 to `packages/packagist/src/`).
Run the tests with `composer test`.

## Links

- Driveways, patios, stamped concrete and repairs planned for desert heat, from [Phoenix Concrete Contractors](https://concretecontractorsphoenix.net/).
- Source: https://github.com/nbkdevs/concrete-contractors-phoenix

MIT licensed.
