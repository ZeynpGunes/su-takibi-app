import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '../theme';

type Props = { cupMl: number; onAdd: () => void };

export function AddButton({ cupMl, onAdd }: Props) {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);

  const btn = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ring = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ripple.value),
    transform: [{ scale: 1 + ripple.value * 0.35 }],
  }));

  const press = () => {
    ripple.value = 0;
    ripple.value = withTiming(1, { duration: 650 });
    scale.value = withSequence(withTiming(0.94, { duration: 80 }), withSpring(1, { damping: 8 }));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdd();
  };

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ring]} pointerEvents="none" />
      <Animated.View style={btn}>
        <Pressable onPress={press} accessibilityRole="button" accessibilityLabel={`${cupMl} ml ekle`}>
          <LinearGradient
            colors={[colors.water, colors.waterDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <Text style={styles.plus}>+</Text>
            <View>
              <Text style={styles.label}>Bir bardak ekle</Text>
              <Text style={styles.sub}>{cupMl} ml</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'stretch', justifyContent: 'center' },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.water,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 26,
    shadowColor: colors.waterDeep,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 30,
    lineHeight: 46,
    textAlign: 'center',
    overflow: 'hidden',
  },
  label: { fontFamily: fonts.bold, fontSize: 17, color: '#FFFFFF' },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
});
