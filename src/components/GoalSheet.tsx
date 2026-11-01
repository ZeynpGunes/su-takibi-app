import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMl } from '../date';
import { colors, fonts } from '../theme';

const PRESETS = [1500, 2000, 2500, 3000];
const STEP = 250;
const MIN = 500;
const MAX = 6000;

type Props = {
  visible: boolean;
  goal: number;
  onClose: () => void;
  onSave: (ml: number) => void;
};

export function GoalSheet({ visible, goal, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(goal);

  useEffect(() => {
    if (visible) setValue(goal);
  }, [visible, goal]);

  const step = (dir: 1 | -1) => setValue((v) => Math.min(MAX, Math.max(MIN, v + dir * STEP)));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Kapat" />
      <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.grip} />
        <Text style={styles.kicker}>Günlük hedef</Text>
        <Text style={styles.hint}>Çoğu yetişkin için 2–2,5 litre iyi bir başlangıç.</Text>

        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => step(-1)}
            accessibilityLabel="250 ml azalt"
          >
            <Text style={styles.stepTxt}>−</Text>
          </Pressable>
          <View style={styles.valueBox}>
            <Text style={styles.value}>{formatMl(value)}</Text>
            <Text style={styles.valueUnit}>ml</Text>
          </View>
          <Pressable
            style={styles.stepBtn}
            onPress={() => step(1)}
            accessibilityLabel="250 ml artır"
          >
            <Text style={styles.stepTxt}>+</Text>
          </Pressable>
        </View>

        <View style={styles.presets}>
          {PRESETS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setValue(p)}
              style={[styles.preset, value === p && styles.presetOn]}
            >
              <Text style={[styles.presetTxt, value === p && styles.presetTxtOn]}>
                {p / 1000} L
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.save}
          onPress={() => {
            onSave(value);
            onClose();
          }}
        >
          <Text style={styles.saveTxt}>Kaydet</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(14,42,71,0.35)' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  grip: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
    marginBottom: 20,
  },
  kicker: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, marginTop: 4 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: { fontFamily: fonts.medium, fontSize: 28, color: colors.ink, marginTop: -2 },
  valueBox: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  value: { fontFamily: fonts.display, fontSize: 56, color: colors.ink, letterSpacing: -1.5 },
  valueUnit: { fontFamily: fonts.medium, fontSize: 16, color: colors.inkSoft },
  presets: { flexDirection: 'row', gap: 8, marginTop: 24 },
  preset: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  presetOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  presetTxt: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  presetTxtOn: { color: '#FFFFFF' },
  save: {
    marginTop: 24,
    backgroundColor: colors.waterDeep,
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveTxt: { fontFamily: fonts.bold, fontSize: 16, color: '#FFFFFF' },
});
