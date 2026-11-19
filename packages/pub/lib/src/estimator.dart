import 'dart:math' as math;

/// Cubic feet per bag of premixed concrete, by bag weight in pounds.
const Map<int, double> bagYield = {80: 0.60, 60: 0.45, 40: 0.30};

/// Rough installed cost per square foot (low, high) in USD.
const Map<String, List<int>> finishes = {
  'broom': [6, 10],
  'colored': [8, 13],
  'exposed': [9, 14],
  'stamped': [12, 20],
};

double _pos(String name, num v) {
  if (!v.isFinite || v <= 0) throw ArgumentError('$name must be a positive number');
  return v.toDouble();
}

double _r2(double x) => ((x * 100) + 0.5 + 1e-9).floorToDouble() / 100;
int _ceil6(double x) => ((x * 1e6).roundToDouble() / 1e6).ceil();

/// Cubic feet for a slab, driveway or patio.
double slabVolume(num lengthFt, num widthFt, num thicknessIn) =>
    _pos('length', lengthFt) * _pos('width', widthFt) * _pos('thickness', thicknessIn) / 12;

/// Cubic feet for a continuous footing.
double footingVolume(num lengthFt, num widthIn, num depthIn) =>
    _pos('length', lengthFt) * _pos('width', widthIn) / 12 * _pos('depth', depthIn) / 12;

/// Cubic feet for [count] round columns.
double columnVolume(num diameterIn, num heightFt, [int count = 1]) {
  final r = _pos('diameter', diameterIn) / 24;
  return math.pi * r * r * _pos('height', heightFt) * _pos('count', count);
}

/// Cubic feet for a solid stair poured on grade.
double stepsVolume(int steps, num riseIn, num runIn, num widthFt) {
  final n = _pos('steps', steps);
  return _pos('width', widthFt) * _pos('run', runIn) / 12 * _pos('rise', riseIn) / 12 * n * (n + 1) / 2;
}

/// Volume with waste converted to order quantities.
class Estimate {
  final double cubicFeet, cubicYards, orderYards;
  final int bags80, bags60, bags40;

  /// `bags` under one cubic yard, otherwise `ready-mix`.
  final String suggestion;
  const Estimate(this.cubicFeet, this.cubicYards, this.orderYards, this.bags80, this.bags60, this.bags40, this.suggestion);

  Map<String, Object> toJson() => {
        'cubicFeet': cubicFeet,
        'cubicYards': cubicYards,
        'orderYards': orderYards,
        'bags80': bags80,
        'bags60': bags60,
        'bags40': bags40,
        'suggestion': suggestion,
      };
}

/// Adds [waste] (0.10 = 10 %) and converts to yards and bags.
Estimate estimate(num cubicFeet, [num waste = 0.10]) {
  _pos('volume', cubicFeet);
  if (!waste.isFinite || waste < 0 || waste > 1) throw ArgumentError('waste is a fraction between 0 and 1');
  final v = cubicFeet * (1 + waste);
  final yd = v / 27;
  return Estimate(
    _r2(v.toDouble()),
    _r2(yd),
    ((yd * 4 * 1e6).roundToDouble() / 1e6).ceil() / 4,
    _ceil6(v / 0.60),
    _ceil6(v / 0.45),
    _ceil6(v / 0.30),
    yd < 1 ? 'bags' : 'ready-mix',
  );
}

/// Rebar grid quantities.
class Rebar {
  final int barsAlongLength, barsAlongWidth, sticks20;
  final double linearFeet;
  const Rebar(this.barsAlongLength, this.barsAlongWidth, this.linearFeet, this.sticks20);
}

/// Rebar grid for a slab at [spacingIn] on center, 10 % lap on 20 ft sticks.
Rebar rebar(num lengthFt, num widthFt, [num spacingIn = 18]) {
  _pos('length', lengthFt);
  _pos('width', widthFt);
  _pos('spacing', spacingIn);
  final al = (widthFt * 12 / spacingIn).floor() + 1;
  final aw = (lengthFt * 12 / spacingIn).floor() + 1;
  final lf = al * lengthFt + aw * widthFt;
  return Rebar(al, aw, _r2(lf.toDouble()), _ceil6(lf * 1.1 / 20));
}

/// 5 x 10 ft welded-wire sheets with 10 % overlap.
int meshSheets(num areaSqFt) => _ceil6(_pos('area', areaSqFt) * 1.1 / 50);

/// Rough installed cost range in USD: `(low, high)`.
({int low, int high}) costRange(num areaSqFt, {String finish = 'broom', num thicknessIn = 4, bool removeOld = false}) {
  _pos('area', areaSqFt);
  _pos('thickness', thicknessIn);
  final f = finishes[finish];
  if (f == null) throw ArgumentError('finish must be one of: ${finishes.keys.join(', ')}');
  final m = thicknessIn > 4 ? 1 + 0.1 * (thicknessIn - 4) : 1.0;
  final dl = removeOld ? 2 : 0, dh = removeOld ? 4 : 0;
  return (
    low: (areaSqFt * (f[0] * m + dl) + 0.5).floor(),
    high: (areaSqFt * (f[1] * m + dh) + 0.5).floor(),
  );
}

/// Hot-weather pour plan.
class PourAdvice {
  final String risk, start;
  final List<String> tips;
  final bool monsoon;
  static const footTrafficDays = 2, vehicleDays = 7, moistCureDays = 7, fullStrengthDays = 28;
  const PourAdvice(this.risk, this.start, this.tips, this.monsoon);
}

/// Advice from the forecast high in F and an optional [month] (1-12).
PourAdvice pourAdvice(num forecastHighF, [int? month]) {
  if (!forecastHighF.isFinite) throw ArgumentError('forecast high must be a number');
  if (month != null && (month < 1 || month > 12)) throw ArgumentError('month must be 1-12');
  final t = forecastHighF;
  final tips = <String>['Check the slump on arrival and do not add extra water to make it easier to place.'];
  late String risk, start;
  if (t < 90) {
    risk = 'low';
    start = 'Any time; finish before the afternoon peak.';
  } else if (t < 100) {
    risk = 'moderate';
    start = 'Start by 7:00 am.';
  } else if (t < 110) {
    risk = 'high';
    start = 'Start 5:00-6:00 am and finish by 10:00 am.';
  } else {
    risk = 'extreme';
    start = 'Reschedule if you can; otherwise start at first light and finish by 9:00 am.';
  }
  if (t >= 90) {
    tips.add('Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix.');
    tips.add('Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast.');
  }
  if (t >= 100) {
    tips.add('Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water).');
    tips.add('Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks.');
  }
  if (t >= 110) {
    tips.add('Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours.');
  }
  tips.add('Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days.');
  final monsoon = month != null && month >= 6 && month <= 9;
  if (monsoon) {
    tips.add('Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab.');
  }
  return PourAdvice(risk, start, List.unmodifiable(tips), monsoon);
}
