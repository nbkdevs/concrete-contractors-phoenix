# frozen_string_literal: true

require_relative "lib/concrete_contractors_estimator/version"

Gem::Specification.new do |s|
  s.name        = "concrete_contractors_estimator"
  s.version     = ConcreteContractorsEstimator::VERSION
  s.summary     = "Concrete contractors estimator: volume, bag counts, rebar, cost range and hot-weather pour advice"
  s.description = "Take-off math concrete contractors use before a pour: slab, driveway, patio, footing, column and steps volume with waste, cubic yards to order, 80/60/40 lb bag counts, rebar and mesh, a rough installed cost range and hot-weather pour advice. Library and CLI, no dependencies."
  s.authors     = ["Phoenix Concrete Contractors"]
  s.homepage    = "https://concretecontractorsphoenix.net/"
  s.license     = "MIT"
  s.required_ruby_version = ">= 3.0"
  s.files       = Dir["lib/**/*.rb", "exe/*", "README.md", "LICENSE"]
  s.bindir      = "exe"
  s.executables = ["concrete_contractors_estimator"]
  s.metadata = {
    "homepage_uri" => "https://concretecontractorsphoenix.net/",
    "source_code_uri" => "https://github.com/nbkdevs/concrete-contractors-phoenix",
    "bug_tracker_uri" => "https://github.com/nbkdevs/concrete-contractors-phoenix/issues"
  }
end
