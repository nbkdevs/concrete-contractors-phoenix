# Packages: link map and publish commands

Every homepage / project URL field points to https://concretecontractorsphoenix.net/. In-text README anchors rotate: "Concrete Contractors Phoenix" stays the most common, mixed with natural variations (concrete contractor in Phoenix, Phoenix concrete company, concrete services), the brand "Phoenix Concrete Contractors", and the naked URL. At most one or two site links per page. Author: Phoenix Concrete Contractors. MIT. Version 1.0.0.

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
