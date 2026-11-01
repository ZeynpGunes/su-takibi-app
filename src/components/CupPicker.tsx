import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, ClipPath, Defs, G } from 'react-native-svg';

import { colors, fonts } from '../theme';

export const CUP_SIZES = [150, 250, 330, 500];

/** A small tumbler whose height grows with its volume. */
function Glass({ ml, active }: { ml: number; active: boolean }) {
  const h = 18 + (ml / 500) * 16;
  const w = 22;
  const top = 36 - h;
  const outline = `M 2 ${top} L ${w - 2} ${top} L ${w - 4} 36 L 4 36 Z`;
  return (
    <Svg width={w} height={38}>
      <Defs>
        <ClipPath id={`g${ml}`}>
          <Path d={outline} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#g${ml})`}>
        <Rect
          x={0}
          y={top + h * 0.35}
          width={w}
          height={h}
          fill={active ? '#FFFFFF' : colors.waterLight}
          fillOpacity={active ? 0.85 : 1}
        />
      </G>
      <Path
        d={outline}
        stroke={active ? '#FFFFFF' : colors.ink}
        strokeOpacity={active ? 1 : 0.55}
        strokeWidth={1.5}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type Props = { value: number; onChange: (ml: number) => void };

export function CupPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {CUP_SIZES.map((ml) => {
        const active = ml === value;
        return (
          <Pressable
            key={ml}
            onPress={() => onChange(ml)}
            style={[styles.chip, active && styles.chipOn]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Glass ml={ml} active={active} />
            <Text style={[styles.txt, active && styles.txtOn]}>{ml}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  txt: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  txtOn: { color: '#FFFFFF' },
});
