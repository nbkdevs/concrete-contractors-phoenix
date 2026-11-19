import 'package:concrete_contractors_estimator/concrete_contractors_estimator.dart' as c;
import 'package:flutter/material.dart';

const _months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class PourScreen extends StatefulWidget {
  const PourScreen({super.key});

  @override
  State<PourScreen> createState() => _PourScreenState();
}

class _PourScreenState extends State<PourScreen> {
  double _high = 104;
  int _month = DateTime.now().month;

  Color _riskColor(String risk) => switch (risk) {
        'low' => const Color(0xFF3B8F5A),
        'moderate' => const Color(0xFFD18B1F),
        'high' => const Color(0xFFC8553D),
        _ => const Color(0xFF8E1F1F),
      };

  @override
  Widget build(BuildContext context) {
    final p = c.pourAdvice(_high.round(), _month);
    final text = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Forecast high: ${_high.round()} °F', style: text.titleMedium),
        Slider(value: _high, min: 60, max: 120, divisions: 60, label: '${_high.round()} °F', onChanged: (v) => setState(() => _high = v)),
        DropdownButtonFormField<int>(
          initialValue: _month,
          decoration: const InputDecoration(labelText: 'Month', border: OutlineInputBorder(), isDense: true),
          items: [for (var i = 0; i < 12; i++) DropdownMenuItem(value: i + 1, child: Text(_months[i]))],
          onChanged: (v) => setState(() => _month = v ?? _month),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Chip(
                label: Text('${p.risk[0].toUpperCase()}${p.risk.substring(1)} heat risk', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                backgroundColor: _riskColor(p.risk),
                side: BorderSide.none,
              ),
              const SizedBox(height: 8),
              Text(p.start, style: text.titleMedium),
            ]),
          ),
        ),
        Card(
          child: Column(children: [
            for (final t in p.tips) ListTile(dense: true, leading: const Icon(Icons.check_circle_outline), title: Text(t)),
          ]),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.schedule),
            title: const Text('Cure schedule'),
            subtitle: Text('Foot traffic after ${c.PourAdvice.footTrafficDays} days · vehicles after ${c.PourAdvice.vehicleDays} days · keep moist ${c.PourAdvice.moistCureDays} days · design strength at ${c.PourAdvice.fullStrengthDays} days'),
          ),
        ),
      ],
    );
  }
}
