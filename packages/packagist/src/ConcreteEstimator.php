<?php

declare(strict_types=1);

namespace PhoenixConcreteContractors\Estimator;

use InvalidArgumentException;

/**
 * Concrete take-off formulas shared with the JavaScript, Python, Rust, Dart, C# and Ruby packages.
 */
final class ConcreteEstimator
{
    public const BAG_YIELD = [80 => 0.60, 60 => 0.45, 40 => 0.30];
    public const FINISHES = ['broom' => [6, 10], 'colored' => [8, 13], 'exposed' => [9, 14], 'stamped' => [12, 20]];
    public const CURE = ['footTrafficDays' => 2, 'vehicleDays' => 7, 'moistCureDays' => 7, 'fullStrengthDays' => 28];

    private static function pos(string $name, float|int $v): float
    {
        if (!is_finite((float) $v) || $v <= 0) {
            throw new InvalidArgumentException("$name must be a positive number");
        }
        return (float) $v;
    }

    private static function r2(float $x): float
    {
        return floor($x * 100 + 0.5 + 1e-9) / 100;
    }

    private static function ceil6(float $x): int
    {
        return (int) ceil(round($x, 6));
    }

    /** Cubic feet for a slab, driveway or patio. */
    public static function slabVolume(float $lengthFt, float $widthFt, float $thicknessIn): float
    {
        return self::pos('length', $lengthFt) * self::pos('width', $widthFt) * self::pos('thickness', $thicknessIn) / 12;
    }

    /** Cubic feet for a continuous footing. */
    public static function footingVolume(float $lengthFt, float $widthIn, float $depthIn): float
    {
        return self::pos('length', $lengthFt) * self::pos('width', $widthIn) / 12 * self::pos('depth', $depthIn) / 12;
    }

    /** Cubic feet for round columns or sonotubes. */
    public static function columnVolume(float $diameterIn, float $heightFt, int $count = 1): float
    {
        $r = self::pos('diameter', $diameterIn) / 24;
        return M_PI * $r * $r * self::pos('height', $heightFt) * self::pos('count', $count);
    }

    /** Cubic feet for a solid stair poured on grade. */
    public static function stepsVolume(int $steps, float $riseIn, float $runIn, float $widthFt): float
    {
        $n = self::pos('steps', $steps);
        return self::pos('width', $widthFt) * self::pos('run', $runIn) / 12 * self::pos('rise', $riseIn) / 12 * $n * ($n + 1) / 2;
    }

    /**
     * Adds waste (0.10 = 10 %) and converts to yards and bags.
     *
     * @return array{cubicFeet: float, cubicYards: float, orderYards: float, bags80: int, bags60: int, bags40: int, suggestion: string}
     */
    public static function estimate(float $cubicFeet, float $waste = 0.10): array
    {
        self::pos('volume', $cubicFeet);
        if (!is_finite($waste) || $waste < 0 || $waste > 1) {
            throw new InvalidArgumentException('waste is a fraction between 0 and 1');
        }
        $v = $cubicFeet * (1 + $waste);
        $yd = $v / 27;
        return [
            'cubicFeet' => self::r2($v),
            'cubicYards' => self::r2($yd),
            'orderYards' => ceil(round($yd * 4, 6)) / 4,
            'bags80' => self::ceil6($v / 0.60),
            'bags60' => self::ceil6($v / 0.45),
            'bags40' => self::ceil6($v / 0.30),
            'suggestion' => $yd < 1 ? 'bags' : 'ready-mix',
        ];
    }

    /**
     * Rebar grid for a slab at $spacingIn on center, 10 % lap on 20 ft sticks.
     *
     * @return array{barsAlongLength: int, barsAlongWidth: int, linearFeet: float, sticks20: int}
     */
    public static function rebar(float $lengthFt, float $widthFt, float $spacingIn = 18): array
    {
        self::pos('length', $lengthFt);
        self::pos('width', $widthFt);
        self::pos('spacing', $spacingIn);
        $al = (int) floor($widthFt * 12 / $spacingIn) + 1;
        $aw = (int) floor($lengthFt * 12 / $spacingIn) + 1;
        $lf = $al * $lengthFt + $aw * $widthFt;
        return ['barsAlongLength' => $al, 'barsAlongWidth' => $aw, 'linearFeet' => self::r2($lf), 'sticks20' => self::ceil6($lf * 1.1 / 20)];
    }

    /** 5 x 10 ft welded-wire sheets with 10 % overlap. */
    public static function meshSheets(float $areaSqFt): int
    {
        return self::ceil6(self::pos('area', $areaSqFt) * 1.1 / 50);
    }

    /**
     * Rough installed cost range in USD.
     *
     * @return array{low: int, high: int, currency: string}
     */
    public static function costRange(float $areaSqFt, string $finish = 'broom', float $thicknessIn = 4, bool $removeOld = false): array
    {
        self::pos('area', $areaSqFt);
        self::pos('thickness', $thicknessIn);
        if (!isset(self::FINISHES[$finish])) {
            throw new InvalidArgumentException('finish must be one of: ' . implode(', ', array_keys(self::FINISHES)));
        }
        [$lo, $hi] = self::FINISHES[$finish];
        $m = $thicknessIn > 4 ? 1 + 0.1 * ($thicknessIn - 4) : 1.0;
        [$dl, $dh] = $removeOld ? [2, 4] : [0, 0];
        return [
            'low' => (int) floor($areaSqFt * ($lo * $m + $dl) + 0.5),
            'high' => (int) floor($areaSqFt * ($hi * $m + $dh) + 0.5),
            'currency' => 'USD',
        ];
    }

    /**
     * Hot-weather pour advice from the forecast high (F) and an optional month (1-12).
     *
     * @return array{risk: string, start: string, tips: list<string>, monsoon: bool, cure: array<string, int>}
     */
    public static function pourAdvice(float $forecastHighF, ?int $month = null): array
    {
        if (!is_finite($forecastHighF)) {
            throw new InvalidArgumentException('forecast high must be a number');
        }
        if ($month !== null && ($month < 1 || $month > 12)) {
            throw new InvalidArgumentException('month must be 1-12');
        }
        $t = $forecastHighF;
        $tips = ['Check the slump on arrival and do not add extra water to make it easier to place.'];
        if ($t < 90) {
            [$risk, $start] = ['low', 'Any time; finish before the afternoon peak.'];
        } elseif ($t < 100) {
            [$risk, $start] = ['moderate', 'Start by 7:00 am.'];
        } elseif ($t < 110) {
            [$risk, $start] = ['high', 'Start 5:00-6:00 am and finish by 10:00 am.'];
        } else {
            [$risk, $start] = ['extreme', 'Reschedule if you can; otherwise start at first light and finish by 9:00 am.'];
        }
        if ($t >= 90) {
            $tips[] = 'Pre-wet the subgrade and forms so dry desert soil does not pull water out of the mix.';
            $tips[] = 'Have the finishing crew and tools ready before the truck arrives; hot concrete sets fast.';
        }
        if ($t >= 100) {
            $tips[] = 'Ask the plant for a set-retarding admixture and keep the mix below 90 F (ice or chilled water).';
            $tips[] = 'Put up shade or windbreaks; low humidity and wind cause plastic shrinkage cracks.';
        }
        if ($t >= 110) {
            $tips[] = 'Use a smaller crew-sized pour or split the job; do not place more than you can finish in two hours.';
        }
        $tips[] = 'Start curing right after finishing: curing compound, wet burlap or plastic sheeting, kept moist for 7 days.';
        $monsoon = $month !== null && $month >= 6 && $month <= 9;
        if ($monsoon) {
            $tips[] = 'Monsoon season: watch for afternoon storm cells, keep plastic on site and route runoff away from the fresh slab.';
        }
        return ['risk' => $risk, 'start' => $start, 'tips' => $tips, 'monsoon' => $monsoon, 'cure' => self::CURE];
    }
}
