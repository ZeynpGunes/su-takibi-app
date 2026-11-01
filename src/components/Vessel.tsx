import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { formatMl } from '../date';
import { colors, fonts } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 280;
const RING = 10; // gap between progress ring and the glass
const R = SIZE / 2 - RING - 6;
const C = SIZE / 2;
const RING_R = SIZE / 2 - 3;
const RING_LEN = 2 * Math.PI * RING_R;

function wave(level: number, phase: number, amp: number, freq: number, top: number) {
  'worklet';
  const h = R * 2;
  const y0 = top + h * (1 - level);
  // Calm the surface when nearly empty or full so the edge doesn't look jagged.
  const a = amp * Math.min(1, level * 8, (1 - level) * 8 + 0.25);
  let d = `M ${C - R} ${y0}`;
  for (let x = C - R; x <= C + R; x += 6) {
    const y = y0 + Math.sin(((x - (C - R)) / h) * Math.PI * 2 * freq + phase) * a;
    d += ` L ${x} ${y}`;
  }
  return `${d} L ${C + R} ${top + h + 4} L ${C - R} ${top + h + 4} Z`;
}

type Props = { total: number; goal: number };

export function Vessel({ total, goal }: Props) {
  const progress = goal > 0 ? total / goal : 0;
  const level = useSharedValue(0);
  const ring = useSharedValue(0);
  const phase = useSharedValue(0);
  const bubble = useSharedValue(0);

  useEffect(() => {
    level.value = withSpring(Math.min(progress, 1), { damping: 14, stiffness: 70 });
    ring.value = withTiming(Math.min(progress, 1), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );
    bubble.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, []);

  const top = C - R;
  const back = useAnimatedProps(() => ({
    d: wave(level.value, -phase.value * 1.3 + 1.7, 7, 1.2, top),
  }));
  const front = useAnimatedProps(() => ({
    d: wave(level.value, phase.value, 9, 1, top),
  }));
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_LEN * (1 - ring.value),
  }));

  // Three bubbles drifting up through the water, staggered along one shared clock.
  const bubbleProps = [0, 0.37, 0.71].map((offset, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedProps(() => {
      const t = (bubble.value + offset) % 1;
      const surface = top + R * 2 * (1 - level.value);
      const bottom = top + R * 2 - 18;
      const visible = level.value > 0.08;
      return {
        cy: bottom - (bottom - surface - 10) * t,
        cx: C + [-46, 22, 58][i] + Math.sin(t * Math.PI * 3 + i) * 6,
        opacity: visible ? 0.55 * Math.sin(t * Math.PI) : 0,
      };
    }),
  );

  const done = total >= goal;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <ClipPath id="glass">
            <Circle cx={C} cy={C} r={R} />
          </ClipPath>
          <SvgGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.waterLight} />
            <Stop offset="1" stopColor={colors.water} />
          </SvgGradient>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.waterLight} />
            <Stop offset="1" stopColor={done ? colors.glow : colors.waterDeep} />
          </SvgGradient>
        </Defs>

        {/* progress ring */}
        <Circle cx={C} cy={C} r={RING_R} stroke={colors.line} strokeWidth={4} fill="none" />
        <AnimatedCircle
          animatedProps={ringProps}
          cx={C}
          cy={C}
          r={RING_R}
          stroke="url(#ring)"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${RING_LEN} ${RING_LEN}`}
          transform={`rotate(-90 ${C} ${C})`}
        />

        {/* glass */}
        <Circle cx={C} cy={C} r={R} fill="#FFFFFF" fillOpacity={0.55} />
        <G clipPath="url(#glass)">
          <AnimatedPath animatedProps={back} fill={colors.waterLight} fillOpacity={0.6} />
          <AnimatedPath animatedProps={front} fill="url(#water)" />
          {bubbleProps.map((p, i) => (
            <AnimatedCircle key={i} animatedProps={p} r={[4, 3, 5][i]} fill="#FFFFFF" />
          ))}
        </G>
        <Circle cx={C} cy={C} r={R} stroke="#FFFFFF" strokeWidth={2} fill="none" />
        {/* glass highlight */}
        <Path
          d={`M ${C - R * 0.72} ${C - R * 0.38} A ${R * 0.82} ${R * 0.82} 0 0 1 ${C - R * 0.2} ${C - R * 0.8}`}
          stroke="#FFFFFF"
          strokeOpacity={0.9}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      <View style={styles.label} pointerEvents="none">
        <Text style={styles.amount}>{formatMl(total)}</Text>
        <Text style={styles.unit}>
          / {formatMl(goal)} ml
        </Text>
        <View style={styles.pctPill}>
          <Text style={styles.pct}>%{Math.round(progress * 100)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignSelf: 'center' },
  label: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: fonts.display,
    fontSize: 64,
    lineHeight: 70,
    color: colors.ink,
    letterSpacing: -2,
  },
  unit: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink, opacity: 0.7 },
  pctPill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  pct: { fontFamily: fonts.bold, fontSize: 13, color: colors.waterDeep, letterSpacing: 0.5 },
});
