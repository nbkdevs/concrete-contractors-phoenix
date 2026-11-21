'use strict';
const test = require('node:test');
const assert = require('node:assert');
const report = require('../lib/report');
const panel = require('../lib/panel');

test('20 x 20 ft 4 in slab matches the shared estimator', () => {
  const r = report.build({ shape: 'slab', length: 20, width: 20, thickness: 4 });
  assert.strictEqual(r.netCubicFeet, 133.33);
  assert.deepStrictEqual(r.estimate, { cubicFeet: 146.67, cubicYards: 5.43, orderYards: 5.5, bags80: 245, bags60: 326, bags40: 489, suggestion: 'ready-mix' });
  assert.deepStrictEqual(r.rebar, { barsAlongLength: 14, barsAlongWidth: 14, linearFeet: 560, sticks20: 31 });
  assert.strictEqual(r.mesh, 9);
  assert.deepStrictEqual(r.cost, { low: 2400, high: 4000, currency: 'USD' });
});

test('zero waste gives exact yards', () => {
  const r = report.build({ shape: 'slab', length: 27, width: 12, thickness: 12, waste: 0 });
  assert.strictEqual(r.estimate.cubicYards, 12);
  assert.strictEqual(r.estimate.orderYards, 12);
});

test('footing, column and steps volumes', () => {
  assert.strictEqual(report.volume({ shape: 'footing', length: 60, width: 12, depth: 12 }), 60);
  assert.ok(Math.abs(report.volume({ shape: 'column', diameter: 12, height: 4, count: 6 }) - 6 * Math.PI) < 1e-9);
  assert.ok(Math.abs(report.volume({ shape: 'steps', steps: 3, rise: 6, run: 12, width: 4 }) - 12) < 1e-9);
});

test('small pours recommend bags', () => {
  const r = report.build({ shape: 'column', diameter: 12, height: 4, count: 6 });
  assert.strictEqual(r.estimate.suggestion, 'bags');
  assert.strictEqual(r.rebar, undefined);
});

test('stamped finish with tear-out raises the cost range', () => {
  const base = report.build({ shape: 'slab', length: 20, width: 20, thickness: 4 }).cost;
  const fancy = report.build({ shape: 'slab', length: 20, width: 20, thickness: 4, finish: 'stamped', removeOld: true }).cost;
  assert.ok(fancy.low > base.low && fancy.high > base.high);
  assert.deepStrictEqual([fancy.low, fancy.high], [5600, 9600]);
});

test('markdown table output', () => {
  const md = report.toMarkdown(report.build({ shape: 'slab', length: 20, width: 20, thickness: 4 }));
  assert.match(md, /^### Concrete estimate: slab, driveway or patio\n\n\| Item \| Value \|\n\|---\|---\|/);
  assert.match(md, /\| Ready-mix order \| 5\.5 cu yd \(recommended\) \|/);
  assert.match(md, /\| 80 lb bags \| 245 \|/);
  assert.match(md, /\| Rebar to buy \(20 ft sticks, \+10% laps\) \| 31 \|/);
  assert.match(md, /\| Rough installed cost \(Broom finish\) \| \$2,400 to \$4,000 \|/);
  assert.ok(!/https?:\/\//.test(md));
});

test('invalid input throws readable errors', () => {
  assert.throws(() => report.build({ shape: 'slab', length: 0, width: 10, thickness: 4 }), /length must be a positive number/);
  assert.throws(() => report.build({ shape: 'steps', steps: 2.5, rise: 7, run: 11, width: 4 }), /whole number/);
  assert.throws(() => report.build({ shape: 'dome' }), /shape must be one of/);
});

test('webview html has a strict CSP and no remote resources', () => {
  const h = panel.html({ cspSource: 'vscode-resource:', nonce: 'n1', coreUri: 'c.js', reportUri: 'r.js', scriptUri: 'p.js', styleUri: 's.css' });
  assert.match(h, /default-src 'none'/);
  assert.match(h, /script-src 'nonce-n1'/);
  assert.ok(!/https?:\/\//.test(h));
});
