import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { formatLiters, shortWeekday } from '../date';
import { colors, fonts } from '../theme';

type Day = { date: Date; total: number };
type Props = { week: Day[]; goal: number; streak: number };

const CHART_H = 132;

export function WeekChart({ week, goal, streak }: Props) {
  // Scale so the goal line sits at ~75% height, but never clip a big day.
  const max = Math.max(goal / 0.75, ...week.map((d) => d.total));
  const goalY = (goal / max) * CHART_H;
  const avg = week.reduce((a, d) => a + d.total, 0) / week.length;
  const hits = week.filter((d) => d.total >= goal).length;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Son 7 gün</Text>
        <Text style={styles.meta}>
          {hits}/7 hedef{streak > 1 ? `  ·  ${streak} gün seri` : ''}
        </Text>
      </View>

      <View style={[styles.chart, { height: CHART_H }]}>
        <View style={[styles.goalLine, { bottom: goalY }]}>
          <Text style={styles.goalLabel}>{formatLiters(goal)}</Text>
        </View>

        {week.map((d, i) => {
          const isToday = i === week.length - 1;
          const hit = d.total >= goal;
          const h = Math.max(6, (d.total / max) * CHART_H);
          return (
            <View key={i} style={styles.col}>
              <View style={[styles.track, { height: CHART_H }]}>
                {d.total > 0 ? (
                  <LinearGradient
                    colors={
                      hit
                        ? [colors.waterLight, colors.waterDeep]
                        : ['#CFE6F6', isToday ? colors.water : '#8DBBE8']
                    }
                    style={[styles.bar, { height: h }]}
                  />
                ) : (
                  <View style={[styles.bar, styles.empty]} />
                )}
              </View>
              {hit && <View style={styles.dot} />}
            </View>
          );
        })}
      </View>

      <View style={styles.labels}>
        {week.map((d, i) => (
          <Text
            key={i}
            style={[styles.day, i === week.length - 1 && styles.today]}
          >
            {i === week.length - 1 ? 'Bugün' : shortWeekday(d.date)}
          </Text>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footText}>Günlük ortalama</Text>
        <Text style={styles.footValue}>{formatLiters(avg)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft },
  chart: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 26, gap: 10 },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkFaint,
  },
  goalLabel: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.inkSoft,
  },
  col: { flex: 1, alignItems: 'center' },
  track: { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '100%', maxWidth: 30, borderRadius: 999 },
  empty: { height: 6, backgroundColor: colors.line },
  dot: {
    position: 'absolute',
    top: -12,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.glow,
  },
  labels: { flexDirection: 'row', gap: 10, marginTop: 10 },
  day: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  today: { color: colors.ink, fontFamily: fonts.bold },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footText: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  footValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
