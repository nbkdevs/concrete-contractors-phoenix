#!/usr/bin/env node
'use strict';
const c = require('../lib/index.js');

const USAGE = `concrete-estimate - concrete volume, bags, rebar, cost and pour advice

Usage:
  concrete-estimate slab <length-ft> <width-ft> <thickness-in> [--waste 0.10] [--finish broom|colored|exposed|stamped] [--remove-old] [--spacing 18]
  concrete-estimate footing <length-ft> <width-in> <depth-in> [--waste 0.10]
  concrete-estimate column <diameter-in> <height-ft> [count] [--waste 0.10]
  concrete-estimate steps <steps> <rise-in> <run-in> <width-ft> [--waste 0.10]
  concrete-estimate pour <forecast-high-F> [month 1-12]
  Add --json for machine-readable output.`;

function parse(argv) {
  const pos = []; const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json' || a === '--remove-old') opt[a.slice(2)] = true;
    else if (a.startsWith('--')) opt[a.slice(2)] = argv[++i];
    else pos.push(a);
  }
  return { pos, opt };
}
const num = (s, name) => { const n = Number(s); if (s === undefined || !isFinite(n)) throw new RangeError(name + ' is required and must be a number'); return n; };

function run(argv) {
  const { pos, opt } = parse(argv);
  const cmd = pos.shift();
  const waste = opt.waste !== undefined ? num(opt.waste, 'waste') : 0.1;
  let out;
  if (cmd === 'slab') {
    const [L, W, T] = [num(pos[0], 'length'), num(pos[1], 'width'), num(pos[2], 'thickness')];
    out = { shape: 'slab', ...c.estimate(c.slabVolume(L, W, T), waste),
      rebar: c.rebar(L, W, opt.spacing ? num(opt.spacing, 'spacing') : 18),
      meshSheets: c.meshSheets(L * W),
      cost: c.costRange(L * W, opt.finish || 'broom', T, !!opt['remove-old']) };
  } else if (cmd === 'footing') {
    out = { shape: 'footing', ...c.estimate(c.footingVolume(num(pos[0], 'length'), num(pos[1], 'width'), num(pos[2], 'depth')), waste) };
  } else if (cmd === 'column') {
    out = { shape: 'column', ...c.estimate(c.columnVolume(num(pos[0], 'diameter'), num(pos[1], 'height'), pos[2] ? num(pos[2], 'count') : 1), waste) };
  } else if (cmd === 'steps') {
    out = { shape: 'steps', ...c.estimate(c.stepsVolume(num(pos[0], 'steps'), num(pos[1], 'rise'), num(pos[2], 'run'), num(pos[3], 'width')), waste) };
  } else if (cmd === 'pour') {
    out = c.pourAdvice(num(pos[0], 'forecast high'), pos[1] ? num(pos[1], 'month') : undefined);
  } else {
    return { code: cmd ? 2 : 0, text: USAGE };
  }
  if (opt.json) return { code: 0, text: JSON.stringify(out, null, 2) };
  return { code: 0, text: format(out) };
}

function format(o) {
  if (o.risk) {
    return [`Heat risk: ${o.risk}`, `Start: ${o.start}`, ...o.tips.map(t => `- ${t}`),
      `Cure: foot traffic ${o.cure.footTrafficDays} d, vehicles ${o.cure.vehicleDays} d, full strength ${o.cure.fullStrengthDays} d`].join('\n');
  }
  const lines = [`${o.shape}: ${o.cubicYards} yd3 (${o.cubicFeet} ft3 incl. waste) - order ${o.orderYards} yd3`,
    `Bags: ${o.bags80} x 80 lb, ${o.bags60} x 60 lb or ${o.bags40} x 40 lb`, `Suggestion: ${o.suggestion}`];
  if (o.rebar) lines.push(`Rebar: ${o.rebar.linearFeet} ft (${o.rebar.sticks20} x 20 ft sticks) or ${o.meshSheets} mesh sheets`);
  if (o.cost) lines.push(`Rough installed cost: $${o.cost.low.toLocaleString('en-US')} - $${o.cost.high.toLocaleString('en-US')}`);
  return lines.join('\n');
}

module.exports = { run };
if (require.main === module) {
  try { const r = run(process.argv.slice(2)); console.log(r.text); process.exitCode = r.code; }
  catch (e) { console.error('Error: ' + e.message); process.exitCode = 1; }
}
