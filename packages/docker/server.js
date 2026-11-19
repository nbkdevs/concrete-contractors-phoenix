'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const C = require('./lib/estimator.js');

const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function num(q, k, def) {
  const s = q.get(k);
  if (s === null || s === '') { if (def !== undefined) return def; throw new RangeError(k + ' is required'); }
  const n = Number(s);
  if (!Number.isFinite(n)) throw new RangeError(k + ' must be a number');
  return n;
}

function api(pathname, q) {
  if (pathname === '/api/estimate') {
    const shape = q.get('shape') || 'slab';
    const waste = num(q, 'waste', 0.1);
    let cuft; const out = { shape };
    if (shape === 'slab') {
      const L = num(q, 'length'), W = num(q, 'width'), T = num(q, 'thickness', 4);
      cuft = C.slabVolume(L, W, T);
      out.rebar = C.rebar(L, W, num(q, 'spacing', 18));
      out.meshSheets = C.meshSheets(L * W);
      out.cost = C.costRange(L * W, q.get('finish') || 'broom', T, q.get('removeOld') === 'true');
    } else if (shape === 'footing') cuft = C.footingVolume(num(q, 'length'), num(q, 'width'), num(q, 'depth'));
    else if (shape === 'column') cuft = C.columnVolume(num(q, 'diameter'), num(q, 'height'), num(q, 'count', 1));
    else if (shape === 'steps') cuft = C.stepsVolume(num(q, 'steps'), num(q, 'rise'), num(q, 'run'), num(q, 'width'));
    else throw new RangeError('shape must be slab, footing, column or steps');
    return Object.assign(out, C.estimate(cuft, waste));
  }
  if (pathname === '/api/pour') {
    const m = q.get('month');
    return C.pourAdvice(num(q, 'high'), m ? Number(m) : undefined);
  }
  return null;
}

function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('ok'); }
  if (url.pathname.startsWith('/api/')) {
    try {
      const body = api(url.pathname, url.searchParams);
      if (!body) { res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"error":"not found"}'); }
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(body));
    } catch (e) {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }
  const file = url.pathname === '/' ? 'index.html' : path.basename(url.pathname);
  const p = path.join(PUBLIC, file);
  if (!TYPES[path.extname(p)] || !fs.existsSync(p)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] });
  fs.createReadStream(p).pipe(res);
}

module.exports = { handler, api };
if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  http.createServer(handler).listen(port, () => console.log('Concrete Contractors Estimator on :' + port));
}
