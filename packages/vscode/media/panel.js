/* Estimator webview script. Uses window.ConcreteEstimator and window.ConcreteReport. No network access. */
(function () {
  'use strict';
  var R = window.ConcreteReport, C = window.ConcreteEstimator;
  var vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : { postMessage: function () {}, getState: function () {}, setState: function () {} };
  var cfg = window.__ESTIMATOR_SETTINGS__ || {};
  var $ = function (id) { return document.getElementById(id); };
  var st = (vscode.getState && vscode.getState()) || {};
  var shape = st.shape || 'slab';
  var values = st.values || {};
  var last = null;

  $('waste').value = st.waste != null ? st.waste : (cfg.wastePercent != null ? cfg.wastePercent : 10);
  $('spacing').value = st.spacing != null ? st.spacing : (cfg.rebarSpacing != null ? cfg.rebarSpacing : 18);
  Object.keys(C.FINISHES).forEach(function (f) {
    var o = document.createElement('option'); o.value = f; o.textContent = R.FINISH_LABELS[f]; o.title = '$' + C.FINISHES[f][0] + '-' + C.FINISHES[f][1] + ' per sq ft'; $('finish').appendChild(o);
  });
  $('finish').value = st.finish || cfg.finish || 'broom';
  $('removeOld').checked = !!st.removeOld;

  Object.keys(R.SHAPES).forEach(function (k) {
    var b = document.createElement('button'); b.textContent = R.SHAPES[k].label; b.setAttribute('role', 'tab'); b.dataset.shape = k;
    b.addEventListener('click', function () { shape = k; drawFields(); render(); });
    $('tabs').appendChild(b);
  });

  function drawFields() {
    document.querySelectorAll('#tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.shape === shape)); });
    document.body.classList.toggle('not-slab', shape !== 'slab');
    var box = $('fields'); box.textContent = '';
    R.SHAPES[shape].fields.forEach(function (f) {
      var l = document.createElement('label'); l.textContent = f[1];
      var i = document.createElement('input'); i.id = 'f-' + f[0]; i.inputMode = 'decimal';
      var key = shape + '.' + f[0];
      i.value = values[key] != null ? values[key] : f[2];
      i.addEventListener('input', function () { values[key] = i.value; render(); });
      l.appendChild(i); box.appendChild(l);
    });
  }
  function inputs() {
    var i = { shape: shape, waste: parseFloat($('waste').value) / 100 };
    R.SHAPES[shape].fields.forEach(function (f) { i[f[0]] = parseFloat($('f-' + f[0]).value); });
    if (shape === 'slab') { i.spacing = parseFloat($('spacing').value); i.finish = $('finish').value; i.removeOld = $('removeOld').checked; }
    return i;
  }
  function render() {
    vscode.setState && vscode.setState({ shape: shape, values: values, waste: $('waste').value, spacing: $('spacing').value, finish: $('finish').value, removeOld: $('removeOld').checked });
    var i = inputs();
    try {
      var r = R.build(i); last = i; $('err').textContent = '';
      var e = r.estimate;
      $('headline').textContent = e.suggestion === 'ready-mix' ? e.orderYards + ' cu yd ready-mix' : e.bags80 + ' x 80 lb bags';
      $('subline').textContent = e.cubicYards + ' cu yd including ' + Math.round(r.waste * 100) + '% waste' + (r.cost ? ' \u00b7 rough cost $' + r.cost.low.toLocaleString('en-US') + ' to $' + r.cost.high.toLocaleString('en-US') : '');
      var tb = $('rows'); tb.textContent = '';
      R.rows(r).forEach(function (x) {
        var tr = document.createElement('tr');
        x.forEach(function (c) { var td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
        tb.appendChild(tr);
      });
    } catch (err) { last = null; $('err').textContent = err.message; }
  }
  ['waste', 'spacing', 'finish', 'removeOld'].forEach(function (id) { $(id).addEventListener(id === 'finish' || id === 'removeOld' ? 'change' : 'input', render); });
  $('insert').addEventListener('click', function () { if (last) vscode.postMessage({ type: 'insert', inputs: last }); });
  $('copy').addEventListener('click', function () { if (last) vscode.postMessage({ type: 'copy', inputs: last }); });
  drawFields(); render();
})();
