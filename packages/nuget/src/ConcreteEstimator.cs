using System;
using System.Collections.Generic;

namespace PhoenixConcreteContractors.Estimator
{
    /// <summary>Volume with waste converted to order quantities.</summary>
    public sealed class Estimate
    {
        /// <summary>Cubic feet including waste.</summary>
        public double CubicFeet { get; set; }
        /// <summary>Cubic yards including waste.</summary>
        public double CubicYards { get; set; }
        /// <summary>Cubic yards rounded up to the next quarter yard.</summary>
        public double OrderYards { get; set; }
        /// <summary>80 lb bags.</summary>
        public int Bags80 { get; set; }
        /// <summary>60 lb bags.</summary>
        public int Bags60 { get; set; }
        /// <summary>40 lb bags.</summary>
        public int Bags40 { get; set; }
        /// <summary>"bags" under one cubic yard, otherwise "ready-mix".</summary>
        public string Suggestion { get; set; } = "";
    }

    /// <summary>Rebar grid quantities.</summary>
    public sealed class Rebar
    {
        /// <summary>Bars running the length of the slab.</summary>
        public int BarsAlongLength { get; set; }
        /// <summary>Bars running the width of the slab.</summary>
        public int BarsAlongWidth { get; set; }
        /// <summary>Total linear feet of bar.</summary>
        public double LinearFeet { get; set; }
        /// <summary>20 ft sticks with a 10 % lap allowance.</summary>
        public int Sticks20 { get; set; }
    }

    /// <summary>Hot-weather pour plan.</summary>
    public sealed class PourAdvice
    {
        /// <summary>low, moderate, high or extreme.</summary>
        public string Risk { get; set; } = "";
        /// <summary>Recommended start window.</summary>
        public string Start { get; set; } = "";
        /// <summary>Practical tips for the day.</summary>
        public IReadOnlyList<string> Tips { get; set; } = Array.Empty<string>();
        /// <summary>True in June-September.</summary>
        public bool Monsoon { get; set; }
        /// <summary>Days before foot traffic.</summary>
        public const int FootTrafficDays = 2;
        /// <summary>Days before vehicles.</summary>
        public const int VehicleDays = 7;
        /// <summary>Days to keep the slab moist.</summary>
        public const int MoistCureDays = 7;
        /// <summary>Days to design strength.</summary>
        public const int FullStrengthDays = 28;
    }

    /// <summary>Concrete take-off formulas shared with the JavaScript, Python, Rust, Dart, Ruby and PHP packages.</summary>
    public static class ConcreteEstimator
    {
        /// <summary>Rough installed cost per sq ft (low, high) in USD by finish.</summary>
        public static readonly IReadOnlyDictionary<string, (int Low, int High)> Finishes = new Dictionary<string, (int, int)>
        {
            ["broom"] = (6, 10), ["colored"] = (8, 13), ["exposed"] = (9, 14), ["stamped"] = (12, 20),
        };

        private static double Pos(string name, double v)
        {
            if (double.IsNaN(v) || double.IsInfinity(v) || v <= 0) throw new ArgumentOutOfRangeException(name, name + " must be a positive number");
            return v;
        }
        private static double R2(double x) => Math.Floor(x * 100 + 0.5 + 1e-9) / 100;
        private static int Ceil6(double x) => (int)Math.Ceiling(Math.Round(x * 1e6) / 1e6);

        /// <summary>Cubic feet for a slab, driveway or patio.</summary>
        public static double SlabVolume(double lengthFt, double widthFt, double thicknessIn) =>
            Pos("length", lengthFt) * Pos("width", widthFt) * Pos("thickness", thicknessIn) / 12;

        /// <summary>Cubic feet for a continuous footing.</summary>
        public static double FootingVolume(double lengthFt, double widthIn, double depthIn) =>
            Pos("length", lengthFt) * Pos("width", widthIn) / 12 * Pos("depth", depthIn) / 12;

        /// <summary>Cubic feet for round columns or sonotubes.</summary>
        public static double ColumnVolume(double diameterIn, double heightFt, int count = 1)
        {
            var r = Pos("diameter", diameterIn) / 24;
            return Math.PI * r * r * Pos("height", heightFt) * Pos("count", count);
        }

        /// <summary>Cubic feet for a solid stair poured on grade.</summary>
        public static double StepsVolume(int steps, double riseIn, double runIn, double widthFt)
        {
            var n = Pos("steps", steps);
            return Pos("width", widthFt) * Pos("run", runIn) / 12 * Pos("rise", riseIn) / 12 * n * (n + 1) / 2;
        }

        /// <summary>Adds waste (0.10 = 10 %) and converts to yards and bags.</summary>
        public static Estimate Estimate(double cubicFeet, double waste = 0.10)
        {
            Pos("volume", cubicFeet);
            if (double.IsNaN(waste) || waste < 0 || waste > 1) throw new ArgumentOutOfRangeException(nameof(waste), "waste is a fraction between 0 and 1");
            var v = cubicFeet * (1 + waste);
            var yd = v / 27;
            return new Estimate
            {
                CubicFeet = R2(v),
                CubicYards = R2(yd),
                OrderYards = Math.Ceiling(Math.Round(yd * 4 * 1e6) / 1e6) / 4,
                Bags80 = Ceil6(v / 0.60),
                Bags60 = Ceil6(v / 0.45),
                Bags40 = Ceil6(v / 0.30),
                Suggestion = yd < 1 ? "bags" : "ready-mix",
            };
        }

        /// <summary>Rebar grid for a slab at spacingIn on center.</summary>
        public static Rebar Rebar(double lengthFt, double widthFt, double spacingIn = 18)
        {
            Pos("length", lengthFt); Pos("width", widthFt); Pos("spacing", spacingIn);
            var al = (int)Math.Floor(widthFt * 12 / spacingIn) + 1;
            var aw = (int)Math.Floor(lengthFt * 12 / spacingIn) + 1;
            var lf = al * lengthFt + aw * widthFt;
            return new Rebar { BarsAlongLength = al, BarsAlongWidth = aw, LinearFeet = R2(lf), Sticks20 = Ceil6(lf * 1.1 / 20) };
        }

        /// <summary>5 x 10 ft welded-wire sheets with 10 % overlap.</summary>
        public static int MeshSheets(double areaSqFt) => Ceil6(Pos("area", areaSqFt) * 1.1 / 50);

        /// <summary>Rough installed cost range in USD.</summary>
        public static (int Low, int High) CostRange(double areaSqFt, string finish = "broom", double thicknessIn = 4, bool removeOld = false)
        {
            Pos("area", areaSqFt); Pos("thickness", thicknessIn);
            if (!Finishes.TryGetValue(finish, out var f)) throw new ArgumentException("finish must be one of: broom, colored, exposed, stamped", nameof(finish));
            var m = thicknessIn > 4 ? 1 + 0.1 * (thicknessIn - 4) : 1.0;
            double dl = removeOld ? 2 : 0, dh = removeOld ? 4 : 0;
            return ((int)Math.Floor(areaSqFt * (f.Low * m + dl) + 0.5), (int)Math.Floor(areaSqFt * (f.High * m + dh) + 0.5));
        }

        /// <summary>Hot-weather pour advice from the forecast high (F) and optional month (1-12).</summary>
        public static PourAdvice PourAdvice(double forecastHighF, int? month = null)
        {
            if (double.IsNaN(forecastHighF) || double.IsInfinity(forecastHighF)) throw new ArgumentOutOfRangeException(nameof(forecastHighF));
            if (month.HasValue && (month < 1 || month > 12)) throw new ArgumentOutOfRangeException(nameof(month), "month must be 1-12");
            var t = forecastHighF;
            var tips = new List<string> { "Check the slump on arrival and do not add extra water to make it easier to place." };
            string risk, start;
            if (t < 90) { risk = "low"; start = "Any time; finish before the afternoon peak."; }
            else if (t < 100) { risk = "moderate"; start = "Start by 7:00 am."; }
            else if (t < 110) { risk = "high"; start = "Start 5:00-6:00 am and finish by 10:00 am."; }
            else { risk = "extreme"; start = "Reschedule if you can; otherwise start at first light and finish by 9:00 am."; }
            if (t >= 90)
            {
                tips.Add("Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix.");
                tips.Add("Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast.");
            }
            if (t >= 100)
            {
                tips.Add("Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water).");
                tips.Add("Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks.");
            }
            if (t >= 110) tips.Add("Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours.");
            tips.Add("Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days.");
            var monsoon = month.HasValue && month >= 6 && month <= 9;
            if (monsoon) tips.Add("Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab.");
            return new PourAdvice { Risk = risk, Start = start, Tips = tips, Monsoon = monsoon };
        }
    }
}
