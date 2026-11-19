"""Command line interface: ``concrete-contractors-estimator slab 20 10 4``."""

from __future__ import annotations

import argparse
import json
import sys
from typing import List, Optional

from . import core


def _build() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="concrete-contractors-estimator", description="Concrete volume, bags, rebar, cost and pour advice.")
    p.add_argument("--json", action="store_true", help="print JSON")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("slab", help="slab, driveway or patio")
    s.add_argument("length_ft", type=float); s.add_argument("width_ft", type=float); s.add_argument("thickness_in", type=float)
    s.add_argument("--finish", default="broom", choices=sorted(core.FINISHES))
    s.add_argument("--spacing", type=float, default=18.0, help="rebar spacing in inches")
    s.add_argument("--remove-old", action="store_true")
    f = sub.add_parser("footing")
    f.add_argument("length_ft", type=float); f.add_argument("width_in", type=float); f.add_argument("depth_in", type=float)
    c = sub.add_parser("column")
    c.add_argument("diameter_in", type=float); c.add_argument("height_ft", type=float); c.add_argument("count", type=int, nargs="?", default=1)
    st = sub.add_parser("steps")
    st.add_argument("steps", type=int); st.add_argument("rise_in", type=float); st.add_argument("run_in", type=float); st.add_argument("width_ft", type=float)
    for sp in (s, f, c, st):
        sp.add_argument("--waste", type=float, default=0.10)
    po = sub.add_parser("pour", help="hot-weather pour advice")
    po.add_argument("forecast_high_f", type=float); po.add_argument("month", type=int, nargs="?")
    return p


def run(argv: Optional[List[str]] = None) -> str:
    a = _build().parse_args(argv)
    if a.cmd == "pour":
        out = core.pour_advice(a.forecast_high_f, a.month)
    elif a.cmd == "slab":
        out = {"shape": "slab", **core.estimate(core.slab_volume(a.length_ft, a.width_ft, a.thickness_in), a.waste),
               "rebar": core.rebar(a.length_ft, a.width_ft, a.spacing),
               "mesh_sheets": core.mesh_sheets(a.length_ft * a.width_ft),
               "cost": core.cost_range(a.length_ft * a.width_ft, a.finish, a.thickness_in, a.remove_old)}
    elif a.cmd == "footing":
        out = {"shape": "footing", **core.estimate(core.footing_volume(a.length_ft, a.width_in, a.depth_in), a.waste)}
    elif a.cmd == "column":
        out = {"shape": "column", **core.estimate(core.column_volume(a.diameter_in, a.height_ft, a.count), a.waste)}
    else:
        out = {"shape": "steps", **core.estimate(core.steps_volume(a.steps, a.rise_in, a.run_in, a.width_ft), a.waste)}
    if a.json:
        return json.dumps(out, indent=2)
    if "risk" in out:
        lines = [f"Heat risk: {out['risk']}", f"Start: {out['start']}"] + [f"- {t}" for t in out["tips"]]
        cu = out["cure"]
        lines.append(f"Cure: foot traffic {cu['foot_traffic_days']} d, vehicles {cu['vehicle_days']} d, full strength {cu['full_strength_days']} d")
        return "\n".join(lines)
    lines = [f"{out['shape']}: {out['cubic_yards']} yd3 ({out['cubic_feet']} ft3 incl. waste) - order {out['order_yards']} yd3",
             f"Bags: {out['bags80']} x 80 lb, {out['bags60']} x 60 lb or {out['bags40']} x 40 lb",
             f"Suggestion: {out['suggestion']}"]
    if "rebar" in out:
        lines.append(f"Rebar: {out['rebar']['linear_feet']} ft ({out['rebar']['sticks20']} x 20 ft sticks) or {out['mesh_sheets']} mesh sheets")
        lines.append(f"Rough installed cost: ${out['cost']['low']:,} - ${out['cost']['high']:,}")
    return "\n".join(lines)


def main(argv: Optional[List[str]] = None) -> int:
    try:
        print(run(argv))
        return 0
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
