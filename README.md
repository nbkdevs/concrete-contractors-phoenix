# Concrete Contractors Estimator

Open-source tools for the take-off concrete contractors do before every pour: how much concrete a slab,
driveway, patio, footing, round column or set of steps needs, how many 80, 60 or 40 lb bags that is, how
much rebar or mesh to buy, a rough installed cost and how to plan a pour in desert heat.

Built and maintained by Phoenix Concrete Contractors, the team behind
[Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/): a licensed Arizona concrete contractor
(ROC #684568, since 2016) for driveways, patios, stamped concrete, pool decks, repairs, garage floor coatings,
slabs and foundations, commercial and warehouse floors and parking lots.

## What it calculates

| | |
|---|---|
| Volume | slab / driveway / patio, continuous footing, round column or sonotube, solid steps |
| Order | cubic feet and yards with a waste allowance (default 10 %), ready-mix order rounded up to 1/4 yd |
| Bags | 80 lb (0.60 ft3), 60 lb (0.45 ft3), 40 lb (0.30 ft3), plus a bags vs ready-mix call |
| Steel | rebar grid at any spacing (bars each way, linear feet, 20 ft sticks with 10 % lap) or 5 x 10 ft mesh sheets |
| Cost | rough installed range for broom, colored, exposed-aggregate or stamped flatwork, thickness and tear-out |
| Pour day | heat risk and start window from the forecast high, hot-weather tips, monsoon note, cure schedule |

Example: a 20 x 10 ft slab, 4 in thick, 10 % waste = **2.72 yd3** (order 2.75), **123 x 80 lb bags**,
280 ft of #4 bar at 18 in (16 sticks), broom finish roughly $1,200-$2,000. Every port returns exactly these
numbers; the formulas are in [SPEC.md](SPEC.md).

## Install

| Platform | Package | Install |
|---|---|---|
| JavaScript | [`concrete-contractors-estimator`](packages/npm) | `npm i concrete-contractors-estimator` |
| Python | [`concrete-contractors-estimator`](packages/pypi) | `pip install concrete-contractors-estimator` |
| Rust | [`concrete-contractors-estimator`](packages/crates) | `cargo add concrete-contractors-estimator` |
| Dart / Flutter | [`concrete_contractors_estimator`](packages/pub) | `dart pub add concrete_contractors_estimator` |
| .NET | [`PhoenixConcreteContractors.Estimator`](packages/nuget) | `dotnet add package PhoenixConcreteContractors.Estimator` |
| Ruby | [`concrete_contractors_estimator`](packages/rubygems) | `gem install concrete_contractors_estimator` |
| PHP | [`phoenixconcretecontractors/concrete-contractors-estimator`](packages/packagist) | `composer require phoenixconcretecontractors/concrete-contractors-estimator` |
| Docker | [`iamnazzal/concrete-contractors-estimator`](packages/docker) | `docker run -p 8080:8080 iamnazzal/concrete-contractors-estimator` |
| Browser | [static calculator](packages/huggingface-space) | open `index.html` |
| Agents | [SKILL.md](skills/concrete-contractors-estimator/SKILL.md) | ClawHub skill |
| Android | [Flutter app](app) | Material 3, offline, no permissions |
| Edge / Firefox | [Slab & Bag Calculator](extensions) | zero-permission popup |
| VS Code | [Concrete Contractors Estimator](packages/vscode) | estimator panel + insert as Markdown table |

```js
const c = require('concrete-contractors-estimator');
c.estimate(c.slabVolume(20, 10, 4)); // { cubicYards: 2.72, orderYards: 2.75, bags80: 123, ... }
c.pourAdvice(108, 7).start;          // 'Start 5:00-6:00 am and finish by 10:00 am.'
```

```php
use PhoenixConcreteContractors\Estimator\ConcreteEstimator as C;
C::estimate(C::slabVolume(20, 10, 4))['cubicYards']; // 2.72
```

## Repository layout

```
app/                    Flutter Android app (Concrete Contractors Estimator)
packages/npm|pypi|crates|pub|nuget|rubygems|packagist   libraries + CLIs, same formulas
packages/docker/        web app + JSON API image
packages/huggingface-space/   static calculator page
skills/                 ClawHub SKILL.md
packages/vscode/        VS Code extension (estimator panel, Markdown insert)
extensions/             Edge + Firefox "Slab & Bag Calculator" (MV3, no permissions)
themes/chrome/          "Saguaro Sunset" Chrome theme
store-graphics/, listings/    store assets and listing copy
composer.json           Packagist entry (PSR-4 -> packages/packagist/src)
```

Tests: `npm test` (packages/npm, packages/docker), `python -m unittest` (packages/pypi),
`cargo test`, `dart test`, `dotnet run --project packages/nuget/tests`, `ruby -Ilib test/test_estimator.rb`,
`composer test`, `flutter test` (app).

## Links

- Concrete driveways, patios, stamped concrete and repairs, planned around heat, monsoon runoff and desert soil: [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/)
- Privacy: [PRIVACY.md](PRIVACY.md)

## Elsewhere

<!-- elsewhere:start -->
- npm: [concrete-contractors-estimator](https://www.npmjs.com/package/concrete-contractors-estimator)
- PyPI: [concrete-contractors-estimator](https://pypi.org/project/concrete-contractors-estimator/)
- crates.io: [concrete-contractors-estimator](https://crates.io/crates/concrete-contractors-estimator)
- pub.dev: [concrete_contractors_estimator](https://pub.dev/packages/concrete_contractors_estimator)
- NuGet: [PhoenixConcreteContractors.Estimator](https://www.nuget.org/packages/PhoenixConcreteContractors.Estimator)
- RubyGems: [concrete_contractors_estimator](https://rubygems.org/gems/concrete_contractors_estimator)
- Docker Hub: [iamnazzal/concrete-contractors-estimator](https://hub.docker.com/r/iamnazzal/concrete-contractors-estimator)
- Hugging Face: [Concrete Contractors Estimator Space](https://huggingface.co/spaces/iamnazzal/concrete-contractors-estimator)
- ClawHub: [concrete-contractors-estimator skill](https://clawhub.ai/nbkdevs/concrete-contractors-estimator)
- Packagist: [phoenixconcretecontractors/concrete-contractors-estimator](https://packagist.org/packages/phoenixconcretecontractors/concrete-contractors-estimator)
- GitLab mirror: [nbkdevs/concrete-contractors-phoenix](https://gitlab.com/nbkdevs/concrete-contractors-phoenix)
- Amazon Appstore: [Concrete Contractors Estimator for Android](https://www.amazon.com/dp/B0HS7P7BBH) (same ASIN on amazon.co.uk, .de, .fr, .it, .es, .co.jp, .ca, .com.br, .com.mx and .com.au)
- Microsoft Edge Add-ons: [Slab & Bag Calculator](https://microsoftedge.microsoft.com/addons/detail/giphlfaphcidfjkdncbkgkofomjcpbbc)
- Chrome Web Store: [Saguaro Sunset theme](https://chromewebstore.google.com/detail/lahjefhpjnlgbacnbhplakkdpkkaabio)
- Product Hunt: [Concrete Contractors Estimator](https://www.producthunt.com/products/concrete-contractors-estimator)
- Package indexes: [docs.rs](https://docs.rs/concrete-contractors-estimator), [socket.dev](https://socket.dev/npm/package/concrete-contractors-estimator), [libraries.io](https://libraries.io/npm/concrete-contractors-estimator), [pypistats](https://pypistats.org/packages/concrete-contractors-estimator), [npm.io](https://npm.io/package/concrete-contractors-estimator)
<!-- elsewhere:end -->

## License

MIT, see [LICENSE](LICENSE). Cost figures are planning ranges, not a quote.
