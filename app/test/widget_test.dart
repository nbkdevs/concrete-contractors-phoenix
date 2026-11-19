import 'package:concrete_estimator_app/main.dart';
import 'package:concrete_estimator_app/screens/estimate_screen.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('calculate slab', () {
    final r = calculate(Shape.slab, {'length': 20, 'width': 10, 'thickness': 4, 'spacing': 18});
    expect(r.estimate!.cubicYards, 2.72);
    expect(r.rebar!.sticks20, 16);
    expect(r.cost, (low: 1200, high: 2000));
  });

  test('calculate reports bad input', () {
    expect(calculate(Shape.footing, {'length': 40, 'width': null, 'depth': 12}).error, isNotNull);
    expect(calculate(Shape.column, {'diameter': 0, 'height': 4, 'count': 1}).error, contains('positive'));
  });

  testWidgets('estimate, pour and about tabs', (tester) async {
    await tester.pumpWidget(const EstimatorApp());
    expect(find.text('2.72 yd³'), findsOneWidget);
    await tester.tap(find.text('Column'));
    await tester.pumpAndSettle();
    expect(find.text('0.51 yd³'), findsOneWidget);
    await tester.tap(find.text('Pour day'));
    await tester.pumpAndSettle();
    expect(find.textContaining('heat risk'), findsOneWidget);
    await tester.tap(find.text('About'));
    await tester.pumpAndSettle();
    expect(find.text('https://concretecontractorsphoenix.net/'), findsOneWidget);
  });
}
