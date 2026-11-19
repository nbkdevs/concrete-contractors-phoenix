"""Core formulas. See SPEC.md in the repository; every language port returns the same numbers."""

from __future__ import annotations

import math
from typing import Dict, List, Optional, Tuple

BAG_YIELD: Dict[int, float] = {80: 0.60, 60: 0.45, 40: 0.30}
FINISHES: Dict[str, Tuple[int, int]] = {
    "broom": (6, 10),
    "colored": (8, 13),
    "exposed": (9, 14),
    "stamped": (12, 20),
}
CURE = {"foot_traffic_days": 2, "vehicle_days": 7, "moist_cure_days": 7, "full_strength_days": 28}


def _r2(x: float) -> float:
    # half-up rounding to 2 decimals, matching JavaScript Math.round
    return math.floor(x * 100 + 0.5 + 1e-9) / 100


def _round(x: float) -> int:
    return int(math.floor(x + 0.5))


def _ceil6(x: float) -> int:
    return int(math.ceil(round(x, 6)))


def _pos(name: str, v: float) -> float:
    if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or v <= 0:
        raise ValueError(f"{name} must be a positive number")
    return float(v)


def slab_volume(length_ft: float, width_ft: float, thickness_in: float) -> float:
    """Cubic feet for a slab, driveway or patio."""
    return _pos("length", length_ft) * _pos("width", width_ft) * _pos("thickness", thickness_in) / 12


def footing_volume(length_ft: float, width_in: float, depth_in: float) -> float:
    """Cubic feet for a continuous footing."""
    return _pos("length", length_ft) * _pos("width", width_in) / 12 * _pos("depth", depth_in) / 12


def column_volume(diameter_in: float, height_ft: float, count: int = 1) -> float:
    """Cubic feet for one or more round columns or sonotubes."""
    r = _pos("diameter", diameter_in) / 24
    return math.pi * r * r * _pos("height", height_ft) * _pos("count", count)


def steps_volume(steps: int, rise_in: float, run_in: float, width_ft: float) -> float:
    """Cubic feet for a solid stair of ``steps`` steps poured on grade."""
    n = _pos("steps", steps)
    if n != int(n):
        raise ValueError("steps must be a whole number")
    return _pos("width", width_ft) * _pos("run", run_in) / 12 * _pos("rise", rise_in) / 12 * n * (n + 1) / 2


def estimate(cubic_feet: float, waste: float = 0.10) -> dict:
    """Add waste and convert to cubic yards, order quantity and bag counts."""
    _pos("volume", cubic_feet)
    if isinstance(waste, bool) or not isinstance(waste, (int, float)) or waste < 0 or waste > 1:
        raise ValueError("waste is a fraction between 0 and 1, e.g. 0.10 for 10%")
    v = cubic_feet * (1 + waste)
    yd = v / 27
    return {
        "cubic_feet": _r2(v),
        "cubic_yards": _r2(yd),
        "order_yards": math.ceil(round(yd * 4, 6)) / 4,
        "bags80": _ceil6(v / BAG_YIELD[80]),
        "bags60": _ceil6(v / BAG_YIELD[60]),
        "bags40": _ceil6(v / BAG_YIELD[40]),
        "suggestion": "bags" if yd < 1 else "ready-mix",
    }


def rebar(length_ft: float, width_ft: float, spacing_in: float = 18) -> dict:
    """Rebar grid quantities for a slab (bars each way, linear feet, 20 ft sticks with 10% lap)."""
    _pos("length", length_ft)
    _pos("width", width_ft)
    _pos("spacing", spacing_in)
    along_length = math.floor(width_ft * 12 / spacing_in) + 1
    along_width = math.floor(length_ft * 12 / spacing_in) + 1
    lf = along_length * length_ft + along_width * width_ft
    return {
        "bars_along_length": along_length,
        "bars_along_width": along_width,
        "linear_feet": _r2(lf),
        "sticks20": _ceil6(lf * 1.1 / 20),
    }


def mesh_sheets(area_sq_ft: float) -> int:
    """Number of 5 x 10 ft welded-wire mesh sheets, with 10% overlap."""
    return _ceil6(_pos("area", area_sq_ft) * 1.1 / 50)


def cost_range(area_sq_ft: float, finish: str = "broom", thickness_in: float = 4, remove_old: bool = False) -> dict:
    """Rough installed cost range in USD for flatwork."""
    _pos("area", area_sq_ft)
    _pos("thickness", thickness_in)
    if finish not in FINISHES:
        raise ValueError("finish must be one of: " + ", ".join(FINISHES))
    lo, hi = FINISHES[finish]
    mult = 1 + 0.1 * (thickness_in - 4) if thickness_in > 4 else 1
    dl, dh = (2, 4) if remove_old else (0, 0)
    return {
        "low": _round(area_sq_ft * (lo * mult + dl)),
        "high": _round(area_sq_ft * (hi * mult + dh)),
        "currency": "USD",
    }


def pour_advice(forecast_high_f: float, month: Optional[int] = None) -> dict:
    """Hot-weather pour plan from the forecast high (F) and optional month (1-12)."""
    if isinstance(forecast_high_f, bool) or not isinstance(forecast_high_f, (int, float)) or not math.isfinite(forecast_high_f):
        raise ValueError("forecast_high_f must be a number")
    if month is not None and (not isinstance(month, int) or month < 1 or month > 12):
        raise ValueError("month must be 1-12")
    t = forecast_high_f
    tips: List[str] = ["Check the slump on arrival and do not add extra water to make it easier to place."]
    if t < 90:
        risk, start = "low", "Any time; finish before the afternoon peak."
    elif t < 100:
        risk, start = "moderate", "Start by 7:00 am."
    elif t < 110:
        risk, start = "high", "Start 5:00-6:00 am and finish by 10:00 am."
    else:
        risk, start = "extreme", "Reschedule if you can; otherwise start at first light and finish by 9:00 am."
    if t >= 90:
        tips.append("Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix.")
        tips.append("Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast.")
    if t >= 100:
        tips.append("Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water).")
        tips.append("Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks.")
    if t >= 110:
        tips.append("Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours.")
    tips.append("Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days.")
    monsoon = month is not None and 6 <= month <= 9
    if monsoon:
        tips.append("Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab.")
    return {"risk": risk, "start": start, "tips": tips, "monsoon": monsoon, "cure": dict(CURE)}
