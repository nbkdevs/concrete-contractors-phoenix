(function () {
  'use strict';
  var C = window.ConcreteEstimator;
  var SHAPES = {
    slab: [['length', 'Length (ft)', 20], ['width', 'Width (ft)', 10], ['thickness', 'Thickness (in)', 4], ['spacing', 'Rebar spacing (in)', 18]],
    footing: [['length', 'Total length (ft)', 40], ['width', 'Width (in)', 12], ['depth', 'Depth (in)', 12]],
    column: [['diameter', 'Diameter (in)', 12], ['height', 'Height / depth (ft)', 4], ['count', 'How many', 4]],
    steps: [['steps', 'Number of steps', 3], ['rise', 'Rise (in)', 7], ['run', 'Run / tread (in)', 11], ['width', 'Width (ft)', 4]]
  };
  var shape = 'slab';
  var $ = function (id) { return document.getElementById(id); };
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(function (m, i) { var o = document.createElement('option'); o.value = i + 1; o.textContent = m; $('month').appendChild(o); });
  $('month').value = new Date().getMonth() + 1;

  function drawFields() {
    var html = '<div class="row">';
    SHAPES[shape].forEach(function (f) {
      html += '<div><label for="f_' + f[0] + '">' + f[1] + '</label><input id="f_' + f[0] + '" type="number" min="0" step="any" value="' + f[2] + '"></div>';
    });
    $('fields').innerHTML = html + '</div>';
    var slab = shape === 'slab';
    $('finishWrap').style.display = slab ? '' : 'none';
    $('removeOld').parentNode.style.display = slab ? '' : 'none';
    $('slabExtras').style.display = slab ? '' : 'none';
    $('fields').querySelectorAll('input').forEach(function (i) { i.addEventListener('input', calc); });
  }
  function v(id) { return Number($('f_' + id).value); }

  function calc() {
    $('err').textContent = '';
    try {
      var cuft;
      if (shape === 'slab') cuft = C.slabVolume(v('length'), v('width'), v('thickness'));
      if (shape === 'footing') cuft = C.footingVolume(v('length'), v('width'), v('depth'));
      if (shape === 'column') cuft = C.columnVolume(v('diameter'), v('height'), v('count'));
      if (shape === 'steps') cuft = C.stepsVolume(v('steps'), v('rise'), v('run'), v('width'));
      var e = C.estimate(cuft, Number($('waste').value) / 100);
      $('yards').textContent = e.cubicYards + ' yd\u00b3';
      $('order').textContent = e.cubicFeet + ' ft\u00b3 incl. waste - order ' + e.orderYards + ' yd\u00b3 of ready-mix';
      $('b80').textContent = e.bags80; $('b60').textContent = e.bags60; $('b40').textContent = e.bags40;
      $('suggest').textContent = e.suggestion === 'bags'
        ? 'Under one cubic yard: mixing bags on site is usually cheaper than a short-load ready-mix delivery.'
        : 'One cubic yard or more: order ready-mix; that many bags is a long, hot day of mixing.';
      if (shape === 'slab') {
        var r = C.rebar(v('length'), v('width'), v('spacing'));
        $('rebar').textContent = 'Rebar: ' + r.barsAlongLength + ' + ' + r.barsAlongWidth + ' bars = ' + r.linearFeet + ' ft (' + r.sticks20 + ' x 20 ft sticks), or ' + C.meshSheets(v('length') * v('width')) + ' sheets of 5 x 10 ft mesh.';
        var c = C.costRange(v('length') * v('width'), $('finish').value, v('thickness'), $('removeOld').checked);
        $('cost').textContent = 'Rough installed cost: $' + c.low.toLocaleString('en-US') + ' - $' + c.high.toLocaleString('en-US');
      }
    } catch (err) { $('err').textContent = err.message; }
    try {
      var p = C.pourAdvice(Number($('high').value), Number($('month').value));
      $('risk').className = 'risk ' + p.risk; $('risk').textContent = p.risk + ' heat';
      $('start').textContent = p.start;
      $('tips').innerHTML = '';
      p.tips.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; $('tips').appendChild(li); });
    } catch (err) { $('err').textContent = err.message; }
  }

  $('tabs').addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    shape = b.dataset.s;
    $('tabs').querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    drawFields(); calc();
  });
  ['waste', 'finish', 'removeOld', 'high', 'month'].forEach(function (id) { $(id).addEventListener('input', calc); $(id).addEventListener('change', calc); });
  drawFields(); calc();
})();
