# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/concrete_contractors_estimator"

class EstimatorTest < Minitest::Test
  C = ConcreteContractorsEstimator

  def test_slab_vector
    assert_equal({ cubic_feet: 73.33, cubic_yards: 2.72, order_yards: 2.75, bags80: 123, bags60: 163, bags40: 245, suggestion: "ready-mix" },
                 C.estimate(C.slab_volume(20, 10, 4)))
  end

  def test_shapes
    assert_equal 44, C.estimate(C.footing_volume(40, 12, 12))[:cubic_feet]
    assert_equal 24, C.estimate(C.column_volume(12, 4, 4))[:bags80]
    assert_equal 14.12, C.estimate(C.steps_volume(3, 7, 11, 4))[:cubic_feet]
    assert_equal 1, C.estimate(27, 0)[:order_yards]
  end

  def test_rebar_mesh_cost
    assert_equal({ bars_along_length: 7, bars_along_width: 14, linear_feet: 280, sticks20: 16 }, C.rebar(20, 10))
    assert_equal 5, C.mesh_sheets(200)
    assert_equal({ low: 3040, high: 5200, currency: "USD" }, C.cost_range(200, finish: "stamped", thickness_in: 5, remove_old: true))
    assert_equal({ low: 600, high: 1000, currency: "USD" }, C.cost_range(100))
  end

  def test_pour
    assert_equal "low", C.pour_advice(85)[:risk]
    assert_equal "moderate", C.pour_advice(95)[:risk]
    assert_equal "high", C.pour_advice(105)[:risk]
    x = C.pour_advice(112, 7)
    assert_equal "extreme", x[:risk]
    assert x[:monsoon]
    assert_equal 8, x[:tips].size
    assert_equal 2, C.pour_advice(85, 1)[:tips].size
  end

  def test_validation
    assert_raises(ArgumentError) { C.slab_volume(0, 10, 4) }
    assert_raises(ArgumentError) { C.steps_volume(2.5, 7, 11, 4) }
    assert_raises(ArgumentError) { C.cost_range(100, finish: "gold") }
    assert_raises(ArgumentError) { C.pour_advice(100, 13) }
  end
end
