using System;
using PhoenixConcreteContractors.Estimator;
using static PhoenixConcreteContractors.Estimator.ConcreteEstimator;

int failed = 0;
void Check(string name, bool ok) { Console.WriteLine((ok ? "ok   " : "FAIL ") + name); if (!ok) failed++; }
bool Throws(Action a) { try { a(); return false; } catch (ArgumentException) { return true; } }

var e = Estimate(SlabVolume(20, 10, 4));
Check("slab vector", e.CubicFeet == 73.33 && e.CubicYards == 2.72 && e.OrderYards == 2.75 && e.Bags80 == 123 && e.Bags60 == 163 && e.Bags40 == 245 && e.Suggestion == "ready-mix");
Check("footing", Estimate(FootingVolume(40, 12, 12)).CubicFeet == 44);
Check("column", Estimate(ColumnVolume(12, 4, 4)).Bags80 == 24);
Check("steps", Estimate(StepsVolume(3, 7, 11, 4)).CubicFeet == 14.12);
Check("order yards", Estimate(27, 0).OrderYards == 1);
var r = Rebar(20, 10);
Check("rebar", r.BarsAlongLength == 7 && r.BarsAlongWidth == 14 && r.LinearFeet == 280 && r.Sticks20 == 16);
Check("mesh", MeshSheets(200) == 5);
Check("cost stamped", CostRange(200, "stamped", 5, true) == (3040, 5200));
Check("cost broom", CostRange(100) == (600, 1000));
Check("pour bands", PourAdvice(85).Risk == "low" && PourAdvice(95).Risk == "moderate" && PourAdvice(105).Risk == "high");
var x = PourAdvice(112, 7);
Check("pour extreme", x.Risk == "extreme" && x.Monsoon && x.Tips.Count == 8 && PourAdvice(85, 1).Tips.Count == 2);
Check("validation", Throws(() => SlabVolume(0, 10, 4)) && Throws(() => CostRange(100, "gold")) && Throws(() => PourAdvice(100, 13)) && Throws(() => Estimate(10, 2)));
Console.WriteLine(failed == 0 ? "All tests passed" : $"{failed} failed");
return failed == 0 ? 0 : 1;
