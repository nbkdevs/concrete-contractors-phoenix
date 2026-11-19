# frozen_string_literal: true

require_relative "concrete_contractors_estimator/version"

# Concrete take-off formulas shared with the JavaScript, Python, Rust, Dart, C# and PHP packages.
module ConcreteContractorsEstimator
  BAG_YIELD = { 80 => 0.60, 60 => 0.45, 40 => 0.30 }.freeze
  FINISHES = { "broom" => [6, 10], "colored" => [8, 13], "exposed" => [9, 14], "stamped" => [12, 20] }.freeze
  CURE = { foot_traffic_days: 2, vehicle_days: 7, moist_cure_days: 7, full_strength_days: 28 }.freeze

  module_function

  def pos(name, v)
    raise ArgumentError, "#{name} must be a positive number" unless v.is_a?(Numeric) && v.finite? && v.positive?

    v.to_f
  end

  def r2(x) = ((x * 100) + 0.5 + 1e-9).floor / 100.0
  def ceil6(x) = x.round(6).ceil

  # Cubic feet for a slab, driveway or patio.
  def slab_volume(length_ft, width_ft, thickness_in)
    pos("length", length_ft) * pos("width", width_ft) * pos("thickness", thickness_in) / 12
  end

  # Cubic feet for a continuous footing.
  def footing_volume(length_ft, width_in, depth_in)
    pos("length", length_ft) * pos("width", width_in) / 12 * pos("depth", depth_in) / 12
  end

  # Cubic feet for round columns or sonotubes.
  def column_volume(diameter_in, height_ft, count = 1)
    r = pos("diameter", diameter_in) / 24
    Math::PI * r * r * pos("height", height_ft) * pos("count", count)
  end

  # Cubic feet for a solid stair poured on grade.
  def steps_volume(steps, rise_in, run_in, width_ft)
    raise ArgumentError, "steps must be a whole number" unless steps.is_a?(Integer)

    n = pos("steps", steps)
    pos("width", width_ft) * pos("run", run_in) / 12 * pos("rise", rise_in) / 12 * n * (n + 1) / 2
  end

  # Adds waste (0.10 = 10 %) and converts to yards and bags.
  def estimate(cubic_feet, waste = 0.10)
    pos("volume", cubic_feet)
    raise ArgumentError, "waste is a fraction between 0 and 1" unless waste.is_a?(Numeric) && waste >= 0 && waste <= 1

    v = cubic_feet * (1 + waste)
    yd = v / 27.0
    {
      cubic_feet: r2(v), cubic_yards: r2(yd), order_yards: (yd * 4).round(6).ceil / 4.0,
      bags80: ceil6(v / 0.60), bags60: ceil6(v / 0.45), bags40: ceil6(v / 0.30),
      suggestion: yd < 1 ? "bags" : "ready-mix"
    }
  end

  # Rebar grid for a slab at spacing_in on center, 10 % lap on 20 ft sticks.
  def rebar(length_ft, width_ft, spacing_in = 18)
    pos("length", length_ft); pos("width", width_ft); pos("spacing", spacing_in)
    al = (width_ft * 12.0 / spacing_in).floor + 1
    aw = (length_ft * 12.0 / spacing_in).floor + 1
    lf = (al * length_ft) + (aw * width_ft)
    { bars_along_length: al, bars_along_width: aw, linear_feet: r2(lf), sticks20: ceil6(lf * 1.1 / 20) }
  end

  # 5 x 10 ft welded-wire sheets with 10 % overlap.
  def mesh_sheets(area_sq_ft) = ceil6(pos("area", area_sq_ft) * 1.1 / 50)

  # Rough installed cost range in USD.
  def cost_range(area_sq_ft, finish: "broom", thickness_in: 4, remove_old: false)
    pos("area", area_sq_ft); pos("thickness", thickness_in)
    f = FINISHES[finish.to_s] or raise ArgumentError, "finish must be one of: #{FINISHES.keys.join(', ')}"
    m = thickness_in > 4 ? 1 + (0.1 * (thickness_in - 4)) : 1.0
    dl, dh = remove_old ? [2, 4] : [0, 0]
    { low: ((area_sq_ft * ((f[0] * m) + dl)) + 0.5).floor, high: ((area_sq_ft * ((f[1] * m) + dh)) + 0.5).floor, currency: "USD" }
  end

  # Hot-weather pour advice from the forecast high (F) and optional month (1-12).
  def pour_advice(forecast_high_f, month = nil)
    raise ArgumentError, "forecast high must be a number" unless forecast_high_f.is_a?(Numeric) && forecast_high_f.finite?
    raise ArgumentError, "month must be 1-12" unless month.nil? || (month.is_a?(Integer) && month.between?(1, 12))

    t = forecast_high_f
    tips = ["Check the slump on arrival and do not add extra water to make it easier to place."]
    risk, start =
      if t < 90 then ["low", "Any time; finish before the afternoon peak."]
      elsif t < 100 then ["moderate", "Start by 7:00 am."]
      elsif t < 110 then ["high", "Start 5:00-6:00 am and finish by 10:00 am."]
      else ["extreme", "Reschedule if you can; otherwise start at first light and finish by 9:00 am."]
      end
    if t >= 90
      tips << "Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix."
      tips << "Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast."
    end
    if t >= 100
      tips << "Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water)."
      tips << "Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks."
    end
    tips << "Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours." if t >= 110
    tips << "Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days."
    monsoon = !month.nil? && month.between?(6, 9)
    tips << "Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab." if monsoon
    { risk: risk, start: start, tips: tips, monsoon: monsoon, cure: CURE.dup }
  end
end
