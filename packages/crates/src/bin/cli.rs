use concrete_contractors_estimator as cce;
use std::process::ExitCode;

const USAGE: &str = "concrete-contractors-estimator - concrete volume, bags, rebar, cost and pour advice

Usage:
  concrete-contractors-estimator slab <length-ft> <width-ft> <thickness-in> [finish] [--remove-old]
  concrete-contractors-estimator footing <length-ft> <width-in> <depth-in>
  concrete-contractors-estimator column <diameter-in> <height-ft> [count]
  concrete-contractors-estimator steps <steps> <rise-in> <run-in> <width-ft>
  concrete-contractors-estimator pour <forecast-high-F> [month]
Waste is 10 %. finish: broom (default), colored, exposed, stamped.";

fn num(a: &[String], i: usize, name: &str) -> Result<f64, String> {
    a.get(i).ok_or(format!("{name} is required"))?.parse::<f64>().map_err(|_| format!("{name} must be a number"))
}

fn print_estimate(shape: &str, e: &cce::Estimate) {
    println!("{shape}: {} yd3 ({} ft3 incl. waste) - order {} yd3", e.cubic_yards, e.cubic_feet, e.order_yards);
    println!("Bags: {} x 80 lb, {} x 60 lb or {} x 40 lb", e.bags80, e.bags60, e.bags40);
    println!("Suggestion: {}", e.suggestion);
}

fn run(a: Vec<String>) -> Result<(), String> {
    let e = |x: cce::InputError| x.to_string();
    let rest: Vec<String> = a.iter().filter(|s| !s.starts_with("--")).cloned().collect();
    match rest.first().map(String::as_str) {
        Some("slab") => {
            let (l, w, t) = (num(&rest, 1, "length")?, num(&rest, 2, "width")?, num(&rest, 3, "thickness")?);
            let finish: cce::Finish = rest.get(4).map(String::as_str).unwrap_or("broom").parse().map_err(e)?;
            print_estimate("slab", &cce::estimate(cce::slab_volume(l, w, t).map_err(e)?, 0.1).map_err(e)?);
            let rb = cce::rebar(l, w, 18.0).map_err(e)?;
            println!("Rebar: {} ft ({} x 20 ft sticks) or {} mesh sheets", rb.linear_feet, rb.sticks20, cce::mesh_sheets(l * w).map_err(e)?);
            let (lo, hi) = cce::cost_range(l * w, finish, t, a.iter().any(|s| s == "--remove-old")).map_err(e)?;
            println!("Rough installed cost: ${lo} - ${hi}");
        }
        Some("footing") => print_estimate("footing", &cce::estimate(cce::footing_volume(num(&rest, 1, "length")?, num(&rest, 2, "width")?, num(&rest, 3, "depth")?).map_err(e)?, 0.1).map_err(e)?),
        Some("column") => {
            let count = if rest.len() > 3 { num(&rest, 3, "count")? as u32 } else { 1 };
            print_estimate("column", &cce::estimate(cce::column_volume(num(&rest, 1, "diameter")?, num(&rest, 2, "height")?, count).map_err(e)?, 0.1).map_err(e)?)
        }
        Some("steps") => print_estimate("steps", &cce::estimate(cce::steps_volume(num(&rest, 1, "steps")? as u32, num(&rest, 2, "rise")?, num(&rest, 3, "run")?, num(&rest, 4, "width")?).map_err(e)?, 0.1).map_err(e)?),
        Some("pour") => {
            let month = if rest.len() > 2 { Some(num(&rest, 2, "month")? as u32) } else { None };
            let p = cce::pour_advice(num(&rest, 1, "forecast high")?, month).map_err(e)?;
            println!("Heat risk: {}\nStart: {}", p.risk, p.start);
            for t in p.tips { println!("- {t}"); }
            let (f, v, _, s) = cce::CURE_DAYS;
            println!("Cure: foot traffic {f} d, vehicles {v} d, full strength {s} d");
        }
        _ => println!("{USAGE}"),
    }
    Ok(())
}

fn main() -> ExitCode {
    match run(std::env::args().skip(1).collect()) {
        Ok(()) => ExitCode::SUCCESS,
        Err(m) => { eprintln!("Error: {m}"); ExitCode::FAILURE }
    }
}
