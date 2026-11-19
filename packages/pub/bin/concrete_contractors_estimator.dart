import 'dart:io';

import 'package:concrete_contractors_estimator/concrete_contractors_estimator.dart';

const usage = '''concrete_contractors_estimator - concrete volume, bags, rebar, cost and pour advice

  slab <length-ft> <width-ft> <thickness-in> [finish]
  footing <length-ft> <width-in> <depth-in>
  column <diameter-in> <height-ft> [count]
  steps <steps> <rise-in> <run-in> <width-ft>
  pour <forecast-high-F> [month]''';

void _print(String shape, Estimate e) {
  stdout.writeln('$shape: ${e.cubicYards} yd3 (${e.cubicFeet} ft3 incl. waste) - order ${e.orderYards} yd3');
  stdout.writeln('Bags: ${e.bags80} x 80 lb, ${e.bags60} x 60 lb or ${e.bags40} x 40 lb');
  stdout.writeln('Suggestion: ${e.suggestion}');
}

void main(List<String> args) {
  double n(int i) => double.parse(args[i]);
  try {
    switch (args.isEmpty ? '' : args[0]) {
      case 'slab':
        final l = n(1), w = n(2), t = n(3);
        _print('slab', estimate(slabVolume(l, w, t)));
        final rb = rebar(l, w);
        stdout.writeln('Rebar: ${rb.linearFeet} ft (${rb.sticks20} x 20 ft sticks) or ${meshSheets(l * w)} mesh sheets');
        final c = costRange(l * w, finish: args.length > 4 ? args[4] : 'broom', thicknessIn: t);
        stdout.writeln('Rough installed cost: \$${c.low} - \$${c.high}');
      case 'footing':
        _print('footing', estimate(footingVolume(n(1), n(2), n(3))));
      case 'column':
        _print('column', estimate(columnVolume(n(1), n(2), args.length > 3 ? int.parse(args[3]) : 1)));
      case 'steps':
        _print('steps', estimate(stepsVolume(int.parse(args[1]), n(2), n(3), n(4))));
      case 'pour':
        final p = pourAdvice(n(1), args.length > 2 ? int.parse(args[2]) : null);
        stdout.writeln('Heat risk: ${p.risk}\nStart: ${p.start}');
        for (final t in p.tips) {
          stdout.writeln('- $t');
        }
      default:
        stdout.writeln(usage);
    }
  } on Object catch (e) {
    stderr.writeln('Error: $e');
    exitCode = 1;
  }
}
