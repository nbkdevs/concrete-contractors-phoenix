import 'package:concrete_contractors_estimator/concrete_contractors_estimator.dart';
import 'package:test/test.dart';

void main() {
  test('slab vector', () {
    final e = estimate(slabVolume(20, 10, 4));
    expect(e.toJson(), {'cubicFeet': 73.33, 'cubicYards': 2.72, 'orderYards': 2.75, 'bags80': 123, 'bags60': 163, 'bags40': 245, 'suggestion': 'ready-mix'});
  });
  test('shapes', () {
    expect(estimate(footingVolume(40, 12, 12)).cubicFeet, 44);
    expect(estimate(columnVolume(12, 4, 4)).bags80, 24);
    expect(estimate(stepsVolume(3, 7, 11, 4)).cubicFeet, 14.12);
    expect(estimate(27, 0).orderYards, 1);
  });
  test('rebar, mesh, cost', () {
    final r = rebar(20, 10);
    expect([r.barsAlongLength, r.barsAlongWidth, r.linearFeet, r.sticks20], [7, 14, 280, 16]);
    expect(meshSheets(200), 5);
    expect(costRange(200, finish: 'stamped', thicknessIn: 5, removeOld: true), (low: 3040, high: 5200));
    expect(costRange(100), (low: 600, high: 1000));
    expect(() => costRange(100, finish: 'gold'), throwsArgumentError);
  });
  test('pour advice', () {
    expect(pourAdvice(85).risk, 'low');
    expect(pourAdvice(95).risk, 'moderate');
    expect(pourAdvice(105).risk, 'high');
    final x = pourAdvice(112, 7);
    expect(x.risk, 'extreme');
    expect(x.monsoon, isTrue);
    expect(x.tips.length, 8);
    expect(pourAdvice(85, 1).tips.length, 2);
    expect(() => pourAdvice(100, 13), throwsArgumentError);
  });
  test('validation', () {
    expect(() => slabVolume(0, 10, 4), throwsArgumentError);
    expect(() => estimate(10, 2), throwsArgumentError);
  });
}
