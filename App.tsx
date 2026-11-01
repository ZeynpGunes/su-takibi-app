import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fraunces_400Regular_Italic, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

import { AddButton } from './src/components/AddButton';
import { CupPicker } from './src/components/CupPicker';
import { GoalSheet } from './src/components/GoalSheet';
import { Vessel } from './src/components/Vessel';
import { WeekChart } from './src/components/WeekChart';
import { formatLiters, formatMl, longDate, timeOfDay } from './src/date';
import { colors, fonts } from './src/theme';
import { useWater } from './src/useWater';

// Keep the native splash up until fonts and saved data are in, so the first frame is final.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 400, fade: true });

function message(total: number, goal: number): string {
  const left = goal - total;
  const p = total / goal;
  if (total === 0) return 'Güne bir bardak suyla başla.';
  if (p >= 1.25) return 'Hedefin çok üstündesin. Harika!';
  if (p >= 1) return 'Bugünkü hedef tamam. Tebrikler!';
  if (p >= 0.75) return `Az kaldı, sadece ${formatMl(left)} ml.`;
  if (p >= 0.4) return `Güzel gidiyorsun. ${formatMl(left)} ml kaldı.`;
  return `İyi başlangıç. ${formatMl(left)} ml kaldı.`;
}

function Home() {
  const w = useWater();
  const [goalOpen, setGoalOpen] = useState(false);
  const last = w.entries[w.entries.length - 1];

  useEffect(() => {
    if (w.ready) SplashScreen.hide();
  }, [w.ready]);

  return (
    <LinearGradient colors={[colors.mist, colors.paper]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>Bugün</Text>
              <Text style={styles.date}>{longDate(new Date())}</Text>
            </View>
            <Pressable
              style={styles.goalPill}
              onPress={() => setGoalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Günlük hedefi değiştir"
            >
              <Text style={styles.goalPillLabel}>Hedef</Text>
              <Text style={styles.goalPillValue}>{formatLiters(w.goalMl)}</Text>
            </Pressable>
          </View>

          <Text style={styles.message}>{w.ready ? message(w.total, w.goalMl) : ' '}</Text>

          <Vessel total={w.total} goal={w.goalMl} />

          <View style={styles.actions}>
            <CupPicker value={w.cupMl} onChange={w.setCup} />
            <AddButton cupMl={w.cupMl} onAdd={() => w.addCup()} />
            <View style={styles.undoRow}>
              <Text style={styles.undoMeta}>
                {last
                  ? `${w.entries.length} bardak · son ${timeOfDay(last.t)}`
                  : 'Henüz bardak eklenmedi'}
              </Text>
              {last && (
                <Pressable onPress={w.undo} hitSlop={10} accessibilityRole="button">
                  <Text style={styles.undo}>Geri al ({last.ml} ml)</Text>
                </Pressable>
              )}
            </View>
          </View>

          <WeekChart week={w.week} goal={w.goalMl} streak={w.streak} />
        </ScrollView>
      </SafeAreaView>

      <GoalSheet
        visible={goalOpen}
        goal={w.goalMl}
        onClose={() => setGoalOpen(false)}
        onSave={w.setGoal}
      />
      <StatusBar style="dark" />
    </LinearGradient>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Native splash stays visible while fonts load.
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <Home />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 22,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontFamily: fonts.displayItalic, fontSize: 34, color: colors.ink, lineHeight: 40 },
  date: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkSoft, marginTop: 2 },
  goalPill: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  goalPillLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  goalPillValue: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  message: {
    fontFamily: fonts.displayItalic,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: -8,
  },
  actions: { gap: 14 },
  undoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  undoMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  undo: { fontFamily: fonts.bold, fontSize: 13, color: colors.waterDeep },
});
