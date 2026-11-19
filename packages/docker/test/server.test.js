'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { handler, api } = require('../server.js');

test('api estimate slab', () => {
  const r = api('/api/estimate', new URLSearchParams('shape=slab&length=20&width=10&thickness=4'));
  assert.strictEqual(r.cubicYards, 2.72);
  assert.strictEqual(r.rebar.sticks20, 16);
  assert.deepStrictEqual(r.cost, { low: 1200, high: 2000, currency: 'USD' });
});
test('api pour', () => {
  assert.strictEqual(api('/api/pour', new URLSearchParams('high=112&month=7')).risk, 'extreme');
});
test('http server', async () => {
  const srv = http.createServer(handler).listen(0);
  const port = srv.address().port;
  const get = (p) => fetch('http://127.0.0.1:' + port + p);
  assert.strictEqual((await get('/healthz')).status, 200);
  const page = await (await get('/')).text();
  assert.match(page, /Concrete Contractors Estimator/);
  assert.strictEqual((await get('/api/estimate?shape=column&diameter=12&height=4&count=4').then(r => r.json())).bags80, 24);
  assert.strictEqual((await get('/api/estimate?shape=slab&length=0&width=1')).status, 400);
  assert.strictEqual((await get('/../server.js')).status, 404);
  srv.close();
});
