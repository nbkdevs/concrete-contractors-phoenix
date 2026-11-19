/* Slab & Bag Calculator core | MIT */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ConcreteEstimator = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BAG_YIELD = { 80: 0.6, 60: 0.45, 40: 0.3 };
  var FINISHES = {
    broom: [6, 10],
    colored: [8, 13],
    exposed: [9, 14],
    stamped: [12, 20]
  };
  var CURE = { footTrafficDays: 2, vehicleDays: 7, moistCureDays: 7, fullStrengthDays: 28 };

  function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
  function ceil6(x) { return Math.ceil(Math.round(x * 1e6) / 1e6); }
  function pos(name, v) {
    if (typeof v !== 'number' || !isFinite(v) || v <= 0) throw new RangeError(name + ' must be a positive number');
    return v;
  }
  function nonneg(name, v) {
    if (typeof v !== 'number' || !isFinite(v) || v < 0) throw new RangeError(name + ' must be zero or more');
    return v;
  }

  function slabVolume(lengthFt, widthFt, thicknessIn) {
    return pos('length', lengthFt) * pos('width', widthFt) * pos('thickness', thicknessIn) / 12;
  }
  function footingVolume(lengthFt, widthIn, depthIn) {
    return pos('length', lengthFt) * pos('width', widthIn) / 12 * pos('depth', depthIn) / 12;
  }
  function columnVolume(diameterIn, heightFt, count) {
    if (count === undefined) count = 1;
    var rad = pos('diameter', diameterIn) / 24;
    return Math.PI * rad * rad * pos('height', heightFt) * pos('count', count);
  }
  function stepsVolume(steps, riseIn, runIn, widthFt) {
    var n = pos('steps', steps);
    if (Math.floor(n) !== n) throw new RangeError('steps must be a whole number');
    return pos('width', widthFt) * pos('run', runIn) / 12 * pos('rise', riseIn) / 12 * n * (n + 1) / 2;
  }

  function estimate(cubicFeet, waste) {
    if (waste === undefined) waste = 0.1;
    pos('volume', cubicFeet);
    nonneg('waste', waste);
    if (waste > 1) throw new RangeError('waste is a fraction, e.g. 0.10 for 10%');
    var v = cubicFeet * (1 + waste);
    var yd = v / 27;
    return {
      cubicFeet: r2(v),
      cubicYards: r2(yd),
      orderYards: Math.ceil(Math.round(yd * 4 * 1e6) / 1e6) / 4,
      bags80: ceil6(v / BAG_YIELD[80]),
      bags60: ceil6(v / BAG_YIELD[60]),
      bags40: ceil6(v / BAG_YIELD[40]),
      suggestion: yd < 1 ? 'bags' : 'ready-mix'
    };
  }

  function rebar(lengthFt, widthFt, spacingIn) {
    if (spacingIn === undefined) spacingIn = 18;
    pos('length', lengthFt); pos('width', widthFt); pos('spacing', spacingIn);
    var alongLength = Math.floor(widthFt * 12 / spacingIn) + 1;
    var alongWidth = Math.floor(lengthFt * 12 / spacingIn) + 1;
    var lf = alongLength * lengthFt + alongWidth * widthFt;
    return { barsAlongLength: alongLength, barsAlongWidth: alongWidth, linearFeet: r2(lf), sticks20: ceil6(lf * 1.1 / 20) };
  }

  function meshSheets(areaSqFt) {
    return ceil6(pos('area', areaSqFt) * 1.1 / 50);
  }

  function costRange(areaSqFt, finish, thicknessIn, removeOld) {
    if (finish === undefined) finish = 'broom';
    if (thicknessIn === undefined) thicknessIn = 4;
    pos('area', areaSqFt); pos('thickness', thicknessIn);
    var f = FINISHES[finish];
    if (!f) throw new RangeError('finish must be one of: ' + Object.keys(FINISHES).join(', '));
    var mult = thicknessIn > 4 ? 1 + 0.1 * (thicknessIn - 4) : 1;
    var dl = removeOld ? 2 : 0, dh = removeOld ? 4 : 0;
    return { low: Math.round(areaSqFt * (f[0] * mult + dl)), high: Math.round(areaSqFt * (f[1] * mult + dh)), currency: 'USD' };
  }

  function pourAdvice(forecastHighF, month) {
    if (typeof forecastHighF !== 'number' || !isFinite(forecastHighF)) throw new RangeError('forecastHighF must be a number');
    if (month !== undefined && (month < 1 || month > 12 || Math.floor(month) !== month)) throw new RangeError('month must be 1-12');
    var risk, start;
    var tips = ['Check the slump on arrival and do not add extra water to make it easier to place.'];
    if (forecastHighF < 90) {
      risk = 'low'; start = 'Any time; finish before the afternoon peak.';
    } else if (forecastHighF < 100) {
      risk = 'moderate'; start = 'Start by 7:00 am.';
    } else if (forecastHighF < 110) {
      risk = 'high'; start = 'Start 5:00-6:00 am and finish by 10:00 am.';
    } else {
      risk = 'extreme'; start = 'Reschedule if you can; otherwise start at first light and finish by 9:00 am.';
    }
    if (forecastHighF >= 90) {
      tips.push('Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix.');
      tips.push('Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast.');
    }
    if (forecastHighF >= 100) {
      tips.push('Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water).');
      tips.push('Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks.');
    }
    if (forecastHighF >= 110) {
      tips.push('Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours.');
    }
    tips.push('Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days.');
    var monsoon = month !== undefined && month >= 6 && month <= 9;
    if (monsoon) tips.push('Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab.');
    return { risk: risk, start: start, tips: tips, monsoon: monsoon, cure: Object.assign({}, CURE) };
  }

  return {
    BAG_YIELD: BAG_YIELD,
    FINISHES: FINISHES,
    slabVolume: slabVolume,
    footingVolume: footingVolume,
    columnVolume: columnVolume,
    stepsVolume: stepsVolume,
    estimate: estimate,
    rebar: rebar,
    meshSheets: meshSheets,
    costRange: costRange,
    pourAdvice: pourAdvice
  };
});
