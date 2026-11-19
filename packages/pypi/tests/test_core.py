import json
import unittest

from concrete_contractors_estimator import core
from concrete_contractors_estimator.cli import run


class CoreTests(unittest.TestCase):
    def test_slab_vector(self):
        e = core.estimate(core.slab_volume(20, 10, 4))
        self.assertEqual(e, {"cubic_feet": 73.33, "cubic_yards": 2.72, "order_yards": 2.75, "bags80": 123,
                             "bags60": 163, "bags40": 245, "suggestion": "ready-mix"})

    def test_shapes(self):
        self.assertEqual(core.estimate(core.footing_volume(40, 12, 12))["cubic_feet"], 44)
        self.assertEqual(core.estimate(core.column_volume(12, 4, 4))["bags80"], 24)
        s = core.estimate(core.steps_volume(3, 7, 11, 4))
        self.assertEqual(s["cubic_feet"], 14.12)
        self.assertEqual(s["suggestion"], "bags")
        self.assertEqual(core.estimate(27, 0)["order_yards"], 1)

    def test_rebar_mesh_cost(self):
        self.assertEqual(core.rebar(20, 10), {"bars_along_length": 7, "bars_along_width": 14, "linear_feet": 280, "sticks20": 16})
        self.assertEqual(core.mesh_sheets(200), 5)
        self.assertEqual(core.cost_range(200, "stamped", 5, True), {"low": 3040, "high": 5200, "currency": "USD"})
        self.assertEqual(core.cost_range(100), {"low": 600, "high": 1000, "currency": "USD"})

    def test_pour(self):
        self.assertEqual(core.pour_advice(85)["risk"], "low")
        self.assertEqual(core.pour_advice(95)["risk"], "moderate")
        self.assertEqual(core.pour_advice(105)["risk"], "high")
        x = core.pour_advice(112, 7)
        self.assertEqual(x["risk"], "extreme")
        self.assertTrue(x["monsoon"])
        self.assertEqual(len(x["tips"]), 8)
        self.assertEqual(len(core.pour_advice(85, 1)["tips"]), 2)

    def test_validation(self):
        with self.assertRaises(ValueError):
            core.slab_volume(0, 10, 4)
        with self.assertRaises(ValueError):
            core.steps_volume(2.5, 7, 11, 4)
        with self.assertRaises(ValueError):
            core.cost_range(100, "gold")
        with self.assertRaises(ValueError):
            core.pour_advice(100, 13)

    def test_cli(self):
        self.assertIn("2.72 yd3", run(["slab", "20", "10", "4"]))
        self.assertEqual(json.loads(run(["--json", "pour", "104", "8"]))["risk"], "high")


if __name__ == "__main__":
    unittest.main()
