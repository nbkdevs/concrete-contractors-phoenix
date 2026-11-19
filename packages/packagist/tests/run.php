<?php

declare(strict_types=1);

require __DIR__ . '/../src/ConcreteEstimator.php';

use PhoenixConcreteContractors\Estimator\ConcreteEstimator as C;

$failed = 0;
$check = function (string $name, bool $ok) use (&$failed): void {
    echo ($ok ? 'ok   ' : 'FAIL ') . $name . PHP_EOL;
    if (!$ok) {
        $failed++;
    }
};
$throws = function (callable $f): bool {
    try {
        $f();
        return false;
    } catch (InvalidArgumentException) {
        return true;
    }
};

$check('slab vector', C::estimate(C::slabVolume(20, 10, 4)) == ['cubicFeet' => 73.33, 'cubicYards' => 2.72, 'orderYards' => 2.75, 'bags80' => 123, 'bags60' => 163, 'bags40' => 245, 'suggestion' => 'ready-mix']);
$check('footing', C::estimate(C::footingVolume(40, 12, 12))['cubicFeet'] == 44);
$check('column', C::estimate(C::columnVolume(12, 4, 4))['bags80'] === 24);
$check('steps', C::estimate(C::stepsVolume(3, 7, 11, 4))['cubicFeet'] == 14.12);
$check('order yards', C::estimate(27, 0)['orderYards'] == 1);
$check('rebar', C::rebar(20, 10) == ['barsAlongLength' => 7, 'barsAlongWidth' => 14, 'linearFeet' => 280, 'sticks20' => 16]);
$check('mesh', C::meshSheets(200) === 5);
$check('cost stamped', C::costRange(200, 'stamped', 5, true) === ['low' => 3040, 'high' => 5200, 'currency' => 'USD']);
$check('cost broom', C::costRange(100) === ['low' => 600, 'high' => 1000, 'currency' => 'USD']);
$check('pour bands', C::pourAdvice(85)['risk'] === 'low' && C::pourAdvice(95)['risk'] === 'moderate' && C::pourAdvice(105)['risk'] === 'high');
$x = C::pourAdvice(112, 7);
$check('pour extreme', $x['risk'] === 'extreme' && $x['monsoon'] && count($x['tips']) === 8 && count(C::pourAdvice(85, 1)['tips']) === 2);
$check('validation', $throws(fn () => C::slabVolume(0, 10, 4)) && $throws(fn () => C::costRange(100, 'gold')) && $throws(fn () => C::pourAdvice(100, 13)) && $throws(fn () => C::estimate(10, 2)));
echo $failed === 0 ? 'All tests passed' . PHP_EOL : "$failed failed" . PHP_EOL;
exit($failed === 0 ? 0 : 1);
