//! Concrete contractors estimator: the take-off done before a pour.
//!
//! Volume for slabs, driveways, patios, footings, round columns and steps; a waste factor; cubic yards
//! to order; 80/60/40 lb bag counts; rebar and welded-wire mesh; a rough installed cost range; and
//! hot-weather pour advice. Zero dependencies. The same numbers ship in the JavaScript, Python, Dart,
//! C#, Ruby and PHP versions.
//!
//! ```
//! use concrete_contractors_estimator as cce;
//! let e = cce::estimate(cce::slab_volume(20.0, 10.0, 4.0).unwrap(), 0.10).unwrap();
//! assert_eq!(e.cubic_yards, 2.72);
//! assert_eq!(e.bags80, 123);
//! ```
//!
//! Planned for desert work by [Concrete Contractors Phoenix](https://concretecontractorsphoenix.net/).

use std::fmt;

/// Cubic feet per bag of premixed concrete: (bag weight lb, yield ft3).
pub const BAG_YIELD: [(u32, f64); 3] = [(80, 0.60), (60, 0.45), (40, 0.30)];

/// Input error.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InputError(pub String);
impl fmt::Display for InputError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result { f.write_str(&self.0) }
}
impl std::error::Error for InputError {}

type R<T> = Result<T, InputError>;

fn pos(name: &str, v: f64) -> R<f64> {
    if v.is_finite() && v > 0.0 { Ok(v) } else { Err(InputError(format!("{name} must be a positive number"))) }
}
fn r2(x: f64) -> f64 { (x * 100.0 + 0.5 + 1e-9).floor() / 100.0 }
fn ceil6(x: f64) -> u64 { ((x * 1e6).round() / 1e6).ceil() as u64 }

/// Cubic feet for a slab, driveway or patio.
pub fn slab_volume(length_ft: f64, width_ft: f64, thickness_in: f64) -> R<f64> {
    Ok(pos("length", length_ft)? * pos("width", width_ft)? * pos("thickness", thickness_in)? / 12.0)
}
/// Cubic feet for a continuous footing.
pub fn footing_volume(length_ft: f64, width_in: f64, depth_in: f64) -> R<f64> {
    Ok(pos("length", length_ft)? * pos("width", width_in)? / 12.0 * pos("depth", depth_in)? / 12.0)
}
/// Cubic feet for `count` round columns.
pub fn column_volume(diameter_in: f64, height_ft: f64, count: u32) -> R<f64> {
    let r = pos("diameter", diameter_in)? / 24.0;
    Ok(std::f64::consts::PI * r * r * pos("height", height_ft)? * pos("count", count as f64)?)
}
/// Cubic feet for a solid stair poured on grade.
pub fn steps_volume(steps: u32, rise_in: f64, run_in: f64, width_ft: f64) -> R<f64> {
    let n = pos("steps", steps as f64)?;
    Ok(pos("width", width_ft)? * pos("run", run_in)? / 12.0 * pos("rise", rise_in)? / 12.0 * n * (n + 1.0) / 2.0)
}

/// Volume with waste converted to order quantities.
#[derive(Debug, Clone, PartialEq)]
pub struct Estimate {
    pub cubic_feet: f64,
    pub cubic_yards: f64,
    pub order_yards: f64,
    pub bags80: u64,
    pub bags60: u64,
    pub bags40: u64,
    /// "bags" under one cubic yard, otherwise "ready-mix".
    pub suggestion: &'static str,
}

/// Add `waste` (0.10 = 10 %) and convert to yards and bags.
pub fn estimate(cubic_feet: f64, waste: f64) -> R<Estimate> {
    pos("volume", cubic_feet)?;
    if !waste.is_finite() || !(0.0..=1.0).contains(&waste) {
        return Err(InputError("waste is a fraction between 0 and 1".into()));
    }
    let v = cubic_feet * (1.0 + waste);
    let yd = v / 27.0;
    Ok(Estimate {
        cubic_feet: r2(v),
        cubic_yards: r2(yd),
        order_yards: ((yd * 4.0 * 1e6).round() / 1e6).ceil() / 4.0,
        bags80: ceil6(v / 0.60),
        bags60: ceil6(v / 0.45),
        bags40: ceil6(v / 0.30),
        suggestion: if yd < 1.0 { "bags" } else { "ready-mix" },
    })
}

/// Rebar grid quantities.
#[derive(Debug, Clone, PartialEq)]
pub struct Rebar { pub bars_along_length: u64, pub bars_along_width: u64, pub linear_feet: f64, pub sticks20: u64 }

/// Rebar grid for a slab at `spacing_in` on center (18 is common for #4 bar), 10 % lap on 20 ft sticks.
pub fn rebar(length_ft: f64, width_ft: f64, spacing_in: f64) -> R<Rebar> {
    pos("length", length_ft)?; pos("width", width_ft)?; pos("spacing", spacing_in)?;
    let al = (width_ft * 12.0 / spacing_in).floor() as u64 + 1;
    let aw = (length_ft * 12.0 / spacing_in).floor() as u64 + 1;
    let lf = al as f64 * length_ft + aw as f64 * width_ft;
    Ok(Rebar { bars_along_length: al, bars_along_width: aw, linear_feet: r2(lf), sticks20: ceil6(lf * 1.1 / 20.0) })
}

/// 5 x 10 ft welded-wire sheets with 10 % overlap.
pub fn mesh_sheets(area_sq_ft: f64) -> R<u64> { Ok(ceil6(pos("area", area_sq_ft)? * 1.1 / 50.0)) }

/// Flatwork finish.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Finish { Broom, Colored, Exposed, Stamped }
impl Finish {
    /// USD per sq ft (low, high).
    pub fn rate(self) -> (f64, f64) {
        match self { Finish::Broom => (6.0, 10.0), Finish::Colored => (8.0, 13.0), Finish::Exposed => (9.0, 14.0), Finish::Stamped => (12.0, 20.0) }
    }
}
impl std::str::FromStr for Finish {
    type Err = InputError;
    fn from_str(s: &str) -> R<Self> {
        match s { "broom" => Ok(Finish::Broom), "colored" => Ok(Finish::Colored), "exposed" => Ok(Finish::Exposed), "stamped" => Ok(Finish::Stamped),
            _ => Err(InputError("finish must be one of: broom, colored, exposed, stamped".into())) }
    }
}

/// Rough installed cost range in USD.
pub fn cost_range(area_sq_ft: f64, finish: Finish, thickness_in: f64, remove_old: bool) -> R<(u64, u64)> {
    pos("area", area_sq_ft)?; pos("thickness", thickness_in)?;
    let (lo, hi) = finish.rate();
    let m = if thickness_in > 4.0 { 1.0 + 0.1 * (thickness_in - 4.0) } else { 1.0 };
    let (dl, dh) = if remove_old { (2.0, 4.0) } else { (0.0, 0.0) };
    Ok(((area_sq_ft * (lo * m + dl) + 0.5).floor() as u64, (area_sq_ft * (hi * m + dh) + 0.5).floor() as u64))
}

/// Hot-weather pour plan.
#[derive(Debug, Clone, PartialEq)]
pub struct PourAdvice { pub risk: &'static str, pub start: &'static str, pub tips: Vec<&'static str>, pub monsoon: bool }

/// Cure schedule in days: (foot traffic, vehicles, moist cure, full strength).
pub const CURE_DAYS: (u32, u32, u32, u32) = (2, 7, 7, 28);

/// Advice from the forecast high in F and an optional month (1-12).
pub fn pour_advice(forecast_high_f: f64, month: Option<u32>) -> R<PourAdvice> {
    if !forecast_high_f.is_finite() { return Err(InputError("forecast high must be a number".into())); }
    if let Some(m) = month { if !(1..=12).contains(&m) { return Err(InputError("month must be 1-12".into())); } }
    let t = forecast_high_f;
    let mut tips = vec!["Check the slump on arrival and do not add extra water to make it easier to place."];
    let (risk, start) = if t < 90.0 { ("low", "Any time; finish before the afternoon peak.") }
        else if t < 100.0 { ("moderate", "Start by 7:00 am.") }
        else if t < 110.0 { ("high", "Start 5:00-6:00 am and finish by 10:00 am.") }
        else { ("extreme", "Reschedule if you can; otherwise start at first light and finish by 9:00 am.") };
    if t >= 90.0 {
        tips.push("Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix.");
        tips.push("Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast.");
    }
    if t >= 100.0 {
        tips.push("Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water).");
        tips.push("Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks.");
    }
    if t >= 110.0 { tips.push("Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours."); }
    tips.push("Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days.");
    let monsoon = matches!(month, Some(6..=9));
    if monsoon { tips.push("Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab."); }
    Ok(PourAdvice { risk, start, tips, monsoon })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn slab_vector() {
        let e = estimate(slab_volume(20.0, 10.0, 4.0).unwrap(), 0.1).unwrap();
        assert_eq!(e, Estimate { cubic_feet: 73.33, cubic_yards: 2.72, order_yards: 2.75, bags80: 123, bags60: 163, bags40: 245, suggestion: "ready-mix" });
    }
    #[test]
    fn shapes() {
        assert_eq!(estimate(footing_volume(40.0, 12.0, 12.0).unwrap(), 0.1).unwrap().cubic_feet, 44.0);
        assert_eq!(estimate(column_volume(12.0, 4.0, 4).unwrap(), 0.1).unwrap().bags80, 24);
        let s = estimate(steps_volume(3, 7.0, 11.0, 4.0).unwrap(), 0.1).unwrap();
        assert_eq!(s.cubic_feet, 14.12);
        assert_eq!(s.suggestion, "bags");
        assert_eq!(estimate(27.0, 0.0).unwrap().order_yards, 1.0);
    }
    #[test]
    fn rebar_mesh_cost() {
        assert_eq!(rebar(20.0, 10.0, 18.0).unwrap(), Rebar { bars_along_length: 7, bars_along_width: 14, linear_feet: 280.0, sticks20: 16 });
        assert_eq!(mesh_sheets(200.0).unwrap(), 5);
        assert_eq!(cost_range(200.0, Finish::Stamped, 5.0, true).unwrap(), (3040, 5200));
        assert_eq!(cost_range(100.0, Finish::Broom, 4.0, false).unwrap(), (600, 1000));
        assert!("gold".parse::<Finish>().is_err());
    }
    #[test]
    fn pour() {
        assert_eq!(pour_advice(85.0, None).unwrap().risk, "low");
        assert_eq!(pour_advice(95.0, None).unwrap().risk, "moderate");
        assert_eq!(pour_advice(105.0, None).unwrap().risk, "high");
        let x = pour_advice(112.0, Some(7)).unwrap();
        assert_eq!(x.risk, "extreme");
        assert!(x.monsoon);
        assert_eq!(x.tips.len(), 8);
        assert_eq!(pour_advice(85.0, Some(1)).unwrap().tips.len(), 2);
        assert!(pour_advice(100.0, Some(13)).is_err());
    }
    #[test]
    fn validation() {
        assert!(slab_volume(0.0, 10.0, 4.0).is_err());
        assert!(estimate(10.0, 2.0).is_err());
        assert!(steps_volume(0, 7.0, 11.0, 4.0).is_err());
    }
}
