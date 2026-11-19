'use strict';
const test = require('node:test');
const assert = require('node:assert');
const c = require('../lib/index.js');
const { run } = require('../bin/cli.js');

test('slab estimate matches shared vectors', () => {
  const e = c.estimate(c.slabVolume(20, 10, 4));
  assert.deepStrictEqual(e, { cubicFeet: 73.33, cubicYards: 2.72, orderYards: 2.75, bags80: 123, bags60: 163, bags40: 245, suggestion: 'ready-mix' });
});
test('other shapes', () => {
  assert.strictEqual(c.estimate(c.footingVolume(40, 12, 12)).cubicFeet, 44);
  assert.strictEqual(c.estimate(c.columnVolume(12, 4, 4)).bags80, 24);
  assert.strictEqual(c.estimate(c.stepsVolume(3, 7, 11, 4)).cubicFeet, 14.12);
  assert.strictEqual(c.estimate(c.stepsVolume(3, 7, 11, 4)).suggestion, 'bags');
  assert.strictEqual(c.estimate(27, 0).cubicYards, 1);
  assert.strictEqual(c.estimate(27, 0).orderYards, 1);
});
test('rebar, mesh and cost', () => {
  assert.deepStrictEqual(c.rebar(20, 10), { barsAlongLength: 7, barsAlongWidth: 14, linearFeet: 280, sticks20: 16 });
  assert.strictEqual(c.meshSheets(200), 5);
  assert.deepStrictEqual(c.costRange(200, 'stamped', 5, true), { low: 3040, high: 5200, currency: 'USD' });
  assert.deepStrictEqual(c.costRange(100), { low: 600, high: 1000, currency: 'USD' });
});
test('pour advice bands', () => {
  assert.strictEqual(c.pourAdvice(85).risk, 'low');
  assert.strictEqual(c.pourAdvice(95).risk, 'moderate');
  assert.strictEqual(c.pourAdvice(105).risk, 'high');
  const x = c.pourAdvice(112, 7);
  assert.strictEqual(x.risk, 'extreme');
  assert.ok(x.monsoon);
  assert.strictEqual(x.tips.length, 8);
  assert.strictEqual(c.pourAdvice(85, 1).tips.length, 2);
  assert.strictEqual(x.cure.vehicleDays, 7);
});
test('validation', () => {
  assert.throws(() => c.slabVolume(0, 10, 4), RangeError);
  assert.throws(() => c.stepsVolume(2.5, 7, 11, 4), RangeError);
  assert.throws(() => c.costRange(100, 'gold'), RangeError);
  assert.throws(() => c.estimate(10, 2), RangeError);
  assert.throws(() => c.pourAdvice(100, 13), RangeError);
});
test('cli', () => {
  assert.match(run(['slab', '20', '10', '4']).text, /2\.72 yd3/);
  assert.strictEqual(JSON.parse(run(['pour', '104', '8', '--json']).text).risk, 'high');
  assert.strictEqual(run(['nope']).code, 2);
});
