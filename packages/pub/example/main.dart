import 'package:concrete_contractors_estimator/concrete_contractors_estimator.dart';

void main() {
  final e = estimate(slabVolume(20, 10, 4));
  print('${e.cubicYards} yd3, order ${e.orderYards} yd3, ${e.bags80} x 80 lb bags');
  final c = costRange(200, finish: 'stamped', thicknessIn: 5, removeOld: true);
  print('Rough installed cost: \$${c.low} - \$${c.high}');
  print(pourAdvice(108, 7).start);
}
