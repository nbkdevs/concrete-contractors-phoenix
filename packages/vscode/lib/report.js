/*
 * Concrete take-off for one pour: volume, ready-mix order, bag counts, rebar, mesh and a rough
 * installed cost range, plus Markdown output. UMD so the webview and the extension host share it.
 * No VS Code API and no network access.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core'));
  else root.ConcreteReport = factory(root.ConcreteEstimator);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  var SHAPES = {
    slab: { label: 'Slab, driveway or patio', fields: [['length', 'Length (ft)', 20], ['width', 'Width (ft)', 20], ['thickness', 'Thickness (in)', 4]] },
    footing: { label: 'Continuous footing', fields: [['length', 'Length (ft)', 60], ['width', 'Width (in)', 16], ['depth', 'Depth (in)', 12]] },
    column: { label: 'Round column / pier', fields: [['diameter', 'Diameter (in)', 12], ['height', 'Height (ft)', 4], ['count', 'Count', 6]] },
    steps: { label: 'Steps', fields: [['steps', 'Number of steps', 4], ['rise', 'Rise (in)', 7], ['run', 'Run (in)', 11], ['width', 'Width (ft)', 4]] }
  };
  var FINISH_LABELS = { broom: 'Broom finish', colored: 'Colored', exposed: 'Exposed aggregate', stamped: 'Stamped' };

  function n(v) { return typeof v === 'string' ? parseFloat(v.replace(/[,\s]/g, '')) : v; }
  function fmt(x, d) { return Number(x).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d === undefined ? 2 : d }); }
  function usd(x) { return '$' + fmt(x, 0); }

  function volume(i) {
    switch (i.shape) {
      case 'slab': return C.slabVolume(n(i.length), n(i.width), n(i.thickness));
      case 'footing': return C.footingVolume(n(i.length), n(i.width), n(i.depth));
      case 'column': return C.columnVolume(n(i.diameter), n(i.height), i.count === undefined ? 1 : n(i.count));
      case 'steps': return C.stepsVolume(n(i.steps), n(i.rise), n(i.run), n(i.width));
      default: throw new RangeError('shape must be one of: ' + Object.keys(SHAPES).join(', '));
    }
  }

  /** Full take-off. waste is a fraction (0.10), spacing in inches, finish one of C.FINISHES. */
  function build(i) {
    var waste = i.waste === undefined ? 0.1 : n(i.waste);
    var net = volume(i);
    var out = { shape: i.shape, label: SHAPES[i.shape].label, input: i, netCubicFeet: Math.round(net * 100) / 100, waste: waste, estimate: C.estimate(net, waste) };
    if (i.shape === 'slab') {
      var L = n(i.length), W = n(i.width), area = L * W;
      out.area = Math.round(area * 100) / 100;
      out.rebar = C.rebar(L, W, i.spacing === undefined ? 18 : n(i.spacing));
      out.spacing = i.spacing === undefined ? 18 : n(i.spacing);
      out.mesh = C.meshSheets(area);
      out.finish = i.finish || 'broom';
      out.cost = C.costRange(area, out.finish, n(i.thickness), !!i.removeOld);
    }
    return out;
  }

  function dims(r) {
    var i = r.input;
    switch (r.shape) {
      case 'slab': return fmt(n(i.length)) + ' ft x ' + fmt(n(i.width)) + ' ft x ' + fmt(n(i.thickness)) + ' in';
      case 'footing': return fmt(n(i.length)) + ' ft long, ' + fmt(n(i.width)) + ' in wide, ' + fmt(n(i.depth)) + ' in deep';
      case 'column': return fmt(i.count === undefined ? 1 : n(i.count)) + ' x ' + fmt(n(i.diameter)) + ' in dia, ' + fmt(n(i.height)) + ' ft tall';
      default: return fmt(n(i.steps)) + ' steps, ' + fmt(n(i.rise)) + ' in rise, ' + fmt(n(i.run)) + ' in run, ' + fmt(n(i.width)) + ' ft wide';
    }
  }

  /** [label, value] rows shared by the webview table and the Markdown output. */
  function rows(r) {
    var e = r.estimate, out = [];
    out.push(['Dimensions', dims(r)]);
    if (r.area) out.push(['Area', fmt(r.area) + ' sq ft']);
    out.push(['Net volume', fmt(r.netCubicFeet) + ' cu ft']);
    out.push(['With ' + fmt(r.waste * 100) + '% waste', fmt(e.cubicFeet) + ' cu ft (' + fmt(e.cubicYards) + ' cu yd)']);
    out.push(['Ready-mix order', fmt(e.orderYards) + ' cu yd' + (e.suggestion === 'ready-mix' ? ' (recommended)' : '')]);
    out.push(['80 lb bags', fmt(e.bags80) + (e.suggestion === 'bags' ? ' (recommended)' : '')]);
    out.push(['60 lb bags', fmt(e.bags60)]);
    out.push(['40 lb bags', fmt(e.bags40)]);
    if (r.rebar) {
      out.push(['Rebar grid (' + fmt(r.spacing) + ' in on center)', r.rebar.barsAlongLength + ' + ' + r.rebar.barsAlongWidth + ' bars, ' + fmt(r.rebar.linearFeet) + ' linear ft']);
      out.push(['Rebar to buy (20 ft sticks, +10% laps)', fmt(r.rebar.sticks20)]);
      out.push(['Or wire mesh (5 x 10 ft sheets)', fmt(r.mesh)]);
      out.push(['Rough installed cost (' + FINISH_LABELS[r.finish] + (r.input.removeOld ? ', with tear-out' : '') + ')', usd(r.cost.low) + ' to ' + usd(r.cost.high)]);
    }
    return out;
  }

  function toMarkdown(r) {
    var md = ['### Concrete estimate: ' + r.label.toLowerCase(), '', '| Item | Value |', '|---|---|'];
    rows(r).forEach(function (x) { md.push('| ' + x[0] + ' | ' + x[1] + ' |'); });
    md.push('', '_Bag yields: 80 lb = 0.60, 60 lb = 0.45, 40 lb = 0.30 cu ft. Ready-mix rounded up to the next 1/4 yard. Planning figures, not a bid._', '');
    return md.join('\n');
  }

  return { SHAPES: SHAPES, FINISH_LABELS: FINISH_LABELS, volume: volume, build: build, rows: rows, toMarkdown: toMarkdown };
});
