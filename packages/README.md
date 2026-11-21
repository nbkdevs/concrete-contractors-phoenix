# Packages: link map and publish commands

Every homepage / project URL field points to https://concretecontractorsphoenix.net/. At most one or two site links per page. Dofollow listings use the main keyword "Concrete Contractors Phoenix" or "concrete contractors"; nofollow listings (PyPI, npm, RubyGems, NuGet, the Packagist package README) use a variation, the brand "Phoenix Concrete Contractors", or the naked URL. Author: Phoenix Concrete Contractors. MIT. Version 1.0.1 (pub.dev and crates.io 1.0.2).

| Folder | Registry name | Publish (tokens from env, never printed) |
|---|---|---|
| npm | `concrete-contractors-estimator` | `npm publish --access public` (NPM_TOKEN via a temp userconfig) |
| pypi | `concrete-contractors-estimator` | `python -m build && twine upload dist/*` (TWINE_USERNAME=__token__, TWINE_PASSWORD=$PYPI_TOKEN) |
| crates | `concrete-contractors-estimator` | `cargo publish` (CARGO_REGISTRY_TOKEN) |
| pub | `concrete_contractors_estimator` | `dart pub publish --force` (~/.config/dart/pub-credentials.json) |
| nuget | `PhoenixConcreteContractors.Estimator` | `dotnet pack src -c Release && dotnet nuget push *.nupkg --api-key $NUGET_API_KEY --source https://api.nuget.org/v3/index.json` |
| rubygems | `concrete_contractors_estimator` | `gem build *.gemspec && gem push *.gem` (GEM_HOST_API_KEY) |
| packagist | `phoenixconcretecontractors/concrete-contractors-estimator` | served from the repo-root composer.json; submit the repo on packagist.org |
| docker | `iamnazzal/concrete-contractors-estimator` | `docker build` from this folder, or daemonless: `/workspace/softrank/tools/ocipush/ocipush` (DOCKERHUB_USER/DOCKERHUB_TOKEN) |
| huggingface-space | `iamnazzal/concrete-contractors-estimator` | `HfApi().upload_folder(...)` (HF_TOKEN) |
