(function () {
  'use strict';
  var C = window.ConcreteEstimator;
  var SHAPES = {
    slab: [['length', 'Length (ft)', 20], ['width', 'Width (ft)', 10], ['thickness', 'Thickness (in)', 4], ['spacing', 'Rebar spacing (in)', 18]],
    footing: [['length', 'Length (ft)', 40], ['width', 'Width (in)', 12], ['depth', 'Depth (in)', 12]],
    column: [['diameter', 'Diameter (in)', 12], ['height', 'Height (ft)', 4], ['count', 'How many', 4]],
    steps: [['steps', 'Steps', 3], ['rise', 'Rise (in)', 7], ['run', 'Run (in)', 11], ['width', 'Width (ft)', 4]]
  };
  var shape = 'slab';
  function $(id) { return document.getElementById(id); }
  function v(id) { return Number($('f_' + id).value); }

  function draw() {
    var box = $('fields');
    box.textContent = '';
    var grid = document.createElement('div');
    grid.className = 'grid';
    SHAPES[shape].forEach(function (f) {
      var l = document.createElement('label');
      l.textContent = f[1];
      var i = document.createElement('input');
      i.type = 'number'; i.min = '0'; i.step = 'any'; i.id = 'f_' + f[0]; i.value = f[2];
      i.addEventListener('input', calc);
      l.appendChild(i); grid.appendChild(l);
    });
    box.appendChild(grid);
  }

  function calc() {
    $('err').textContent = '';
    try {
      var cuft;
      if (shape === 'slab') cuft = C.slabVolume(v('length'), v('width'), v('thickness'));
      else if (shape === 'footing') cuft = C.footingVolume(v('length'), v('width'), v('depth'));
      else if (shape === 'column') cuft = C.columnVolume(v('diameter'), v('height'), v('count'));
      else cuft = C.stepsVolume(v('steps'), v('rise'), v('run'), v('width'));
      var e = C.estimate(cuft, Number($('waste').value) / 100);
      $('yd').textContent = e.cubicYards + ' yd\u00b3';
      $('order').textContent = e.cubicFeet + ' ft\u00b3 with waste \u00b7 order ' + e.orderYards + ' yd\u00b3';
      $('b80').textContent = e.bags80; $('b60').textContent = e.bags60; $('b40').textContent = e.bags40;
      $('tip').textContent = e.suggestion === 'bags' ? 'Under 1 yd\u00b3: bags are usually the cheaper way.' : '1 yd\u00b3 or more: ready-mix delivery is usually the better way.';
      if (shape === 'slab') {
        var r = C.rebar(v('length'), v('width'), v('spacing'));
        $('rebar').textContent = 'Rebar: ' + r.linearFeet + ' ft (' + r.sticks20 + ' \u00d7 20 ft sticks) or ' + C.meshSheets(v('length') * v('width')) + ' mesh sheets (5 \u00d7 10 ft).';
      } else {
        $('rebar').textContent = '';
      }
    } catch (err) {
      $('err').textContent = err.message;
    }
  }

  $('tabs').addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    shape = b.getAttribute('data-s');
    Array.prototype.forEach.call($('tabs').querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    draw(); calc();
  });
  $('waste').addEventListener('input', calc);
  draw(); calc();
})();
