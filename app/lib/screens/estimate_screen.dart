import 'package:concrete_contractors_estimator/concrete_contractors_estimator.dart' as c;
import 'package:flutter/material.dart';

enum Shape { slab, footing, column, steps }

class _Field {
  final String key, label;
  final num initial;
  const _Field(this.key, this.label, this.initial);
}

const _fields = {
  Shape.slab: [_Field('length', 'Length (ft)', 20), _Field('width', 'Width (ft)', 10), _Field('thickness', 'Thickness (in)', 4), _Field('spacing', 'Rebar spacing (in)', 18)],
  Shape.footing: [_Field('length', 'Total length (ft)', 40), _Field('width', 'Width (in)', 12), _Field('depth', 'Depth (in)', 12)],
  Shape.column: [_Field('diameter', 'Diameter (in)', 12), _Field('height', 'Height (ft)', 4), _Field('count', 'How many', 4)],
  Shape.steps: [_Field('steps', 'Steps', 3), _Field('rise', 'Rise (in)', 7), _Field('run', 'Run (in)', 11), _Field('width', 'Width (ft)', 4)],
};

/// Result of one calculation, or an error message.
class EstimateResult {
  final c.Estimate? estimate;
  final c.Rebar? rebar;
  final int? mesh;
  final ({int low, int high})? cost;
  final String? error;
  const EstimateResult({this.estimate, this.rebar, this.mesh, this.cost, this.error});
}

/// Pure function used by the screen and the tests.
EstimateResult calculate(Shape shape, Map<String, double?> v, {double wastePct = 10, String finish = 'broom', bool removeOld = false}) {
  double need(String k) {
    final x = v[k];
    if (x == null) throw ArgumentError('Enter a number for every field');
    return x;
  }

  try {
    final double cuft;
    switch (shape) {
      case Shape.slab:
        cuft = c.slabVolume(need('length'), need('width'), need('thickness'));
      case Shape.footing:
        cuft = c.footingVolume(need('length'), need('width'), need('depth'));
      case Shape.column:
        cuft = c.columnVolume(need('diameter'), need('height'), need('count').round());
      case Shape.steps:
        cuft = c.stepsVolume(need('steps').round(), need('rise'), need('run'), need('width'));
    }
    final e = c.estimate(cuft, wastePct / 100);
    if (shape != Shape.slab) return EstimateResult(estimate: e);
    final area = need('length') * need('width');
    return EstimateResult(
      estimate: e,
      rebar: c.rebar(need('length'), need('width'), need('spacing')),
      mesh: c.meshSheets(area),
      cost: c.costRange(area, finish: finish, thicknessIn: need('thickness'), removeOld: removeOld),
    );
  } on ArgumentError catch (err) {
    return EstimateResult(error: err.message.toString());
  }
}

class EstimateScreen extends StatefulWidget {
  const EstimateScreen({super.key});

  @override
  State<EstimateScreen> createState() => _EstimateScreenState();
}

class _EstimateScreenState extends State<EstimateScreen> {
  Shape _shape = Shape.slab;
  final Map<String, TextEditingController> _ctl = {};
  double _waste = 10;
  String _finish = 'broom';
  bool _removeOld = false;

  TextEditingController _c(_Field f) => _ctl.putIfAbsent('${_shape.name}.${f.key}', () => TextEditingController(text: '${f.initial}'));

  @override
  void dispose() {
    for (final t in _ctl.values) {
      t.dispose();
    }
    super.dispose();
  }

  String _money(int n) => n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');

  @override
  Widget build(BuildContext context) {
    final fields = _fields[_shape]!;
    final values = {for (final f in fields) f.key: double.tryParse(_c(f).text)};
    final r = calculate(_shape, values, wastePct: _waste, finish: _finish, removeOld: _removeOld);
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SegmentedButton<Shape>(
          segments: const [
            ButtonSegment(value: Shape.slab, label: Text('Slab')),
            ButtonSegment(value: Shape.footing, label: Text('Footing')),
            ButtonSegment(value: Shape.column, label: Text('Column')),
            ButtonSegment(value: Shape.steps, label: Text('Steps')),
          ],
          selected: {_shape},
          showSelectedIcon: false,
          onSelectionChanged: (s) => setState(() => _shape = s.first),
        ),
        const SizedBox(height: 6),
        Text(_shape == Shape.slab ? 'Driveways, patios, garage floors and pool decks' : _shape == Shape.footing ? 'Continuous wall or fence footings' : _shape == Shape.column ? 'Round piers and sonotubes' : 'Solid steps poured on grade',
            style: text.bodySmall),
        const SizedBox(height: 12),
        Wrap(spacing: 12, runSpacing: 12, children: [
          for (final f in fields)
            SizedBox(
              width: (MediaQuery.sizeOf(context).width - 44) / 2,
              child: TextField(
                key: ValueKey('${_shape.name}.${f.key}'),
                controller: _c(f),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(labelText: f.label, border: const OutlineInputBorder(), isDense: true),
                onChanged: (_) => setState(() {}),
              ),
            ),
        ]),
        const SizedBox(height: 12),
        Text('Waste allowance: ${_waste.round()} %', style: text.labelLarge),
        Slider(value: _waste, min: 0, max: 25, divisions: 25, label: '${_waste.round()} %', onChanged: (v) => setState(() => _waste = v)),
        if (_shape == Shape.slab) ...[
          DropdownButtonFormField<String>(
            initialValue: _finish,
            decoration: const InputDecoration(labelText: 'Finish', border: OutlineInputBorder(), isDense: true),
            items: const [
              DropdownMenuItem(value: 'broom', child: Text('Broom finish')),
              DropdownMenuItem(value: 'colored', child: Text('Colored')),
              DropdownMenuItem(value: 'exposed', child: Text('Exposed aggregate')),
              DropdownMenuItem(value: 'stamped', child: Text('Stamped')),
            ],
            onChanged: (v) => setState(() => _finish = v ?? 'broom'),
          ),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Remove old concrete first'), value: _removeOld, onChanged: (v) => setState(() => _removeOld = v)),
        ],
        const SizedBox(height: 8),
        if (r.error != null)
          Card(color: scheme.errorContainer, child: Padding(padding: const EdgeInsets.all(16), child: Text(r.error!, style: TextStyle(color: scheme.onErrorContainer))))
        else ...[
          Card(
            color: scheme.primaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${r.estimate!.cubicYards} yd³', style: text.displaySmall?.copyWith(color: scheme.onPrimaryContainer, fontWeight: FontWeight.bold)),
                Text('${r.estimate!.cubicFeet} ft³ with waste · order ${r.estimate!.orderYards} yd³', style: TextStyle(color: scheme.onPrimaryContainer)),
                const SizedBox(height: 8),
                Text(r.estimate!.suggestion == 'bags' ? 'Under 1 yd³: mixing bags is usually cheaper than a short-load delivery.' : '1 yd³ or more: order ready-mix.',
                    style: TextStyle(color: scheme.onPrimaryContainer)),
              ]),
            ),
          ),
          Row(children: [
            for (final b in [('80 lb', r.estimate!.bags80), ('60 lb', r.estimate!.bags60), ('40 lb', r.estimate!.bags40)])
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Column(children: [Text('${b.$2}', style: text.titleLarge), Text('${b.$1} bags', style: text.bodySmall)]),
                  ),
                ),
              ),
          ]),
          if (r.rebar != null)
            Card(
              child: ListTile(
                leading: const Icon(Icons.grid_on),
                title: Text('${r.rebar!.linearFeet} ft of rebar · ${r.rebar!.sticks20} × 20 ft sticks'),
                subtitle: Text('${r.rebar!.barsAlongLength} + ${r.rebar!.barsAlongWidth} bars, or ${r.mesh} sheets of 5 × 10 ft mesh'),
              ),
            ),
          if (r.cost != null)
            Card(
              child: ListTile(
                leading: const Icon(Icons.attach_money),
                title: Text('\$${_money(r.cost!.low)} – \$${_money(r.cost!.high)}'),
                subtitle: const Text('Rough installed cost (planning range, not a quote)'),
              ),
            ),
        ],
      ],
    );
  }
}
