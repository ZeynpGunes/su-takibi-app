import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { dayKey, lastDays } from './date';

export type Entry = { t: number; ml: number };

type Stored = {
  goalMl: number;
  cupMl: number;
  days: Record<string, Entry[]>;
};

const STORAGE_KEY = 'su-takibi/v1';
const KEEP_DAYS = 90;

const DEFAULTS: Stored = { goalMl: 2000, cupMl: 250, days: {} };

function prune(days: Record<string, Entry[]>): Record<string, Entry[]> {
  const cutoff = dayKey(lastDays(KEEP_DAYS)[0]);
  const out: Record<string, Entry[]> = {};
  for (const k of Object.keys(days)) if (k >= cutoff) out[k] = days[k];
  return out;
}

const sum = (entries: Entry[] = []) => entries.reduce((a, e) => a + e.ml, 0);

export function useWater() {
  const [data, setData] = useState<Stored>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(dayKey());
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          setData({ ...DEFAULTS, ...parsed, days: prune(parsed.days ?? {}) });
        }
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  // Persist after the initial load so defaults never overwrite saved data.
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  // Roll over to a new day at midnight or when the app comes back to the foreground.
  useEffect(() => {
    const tick = () => setToday(dayKey());
    const id = setInterval(tick, 60_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && tick());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const addCup = useCallback(
    (ml?: number) =>
      setData((d) => {
        const k = dayKey();
        const entry = { t: Date.now(), ml: ml ?? d.cupMl };
        return { ...d, days: { ...d.days, [k]: [...(d.days[k] ?? []), entry] } };
      }),
    [],
  );

  const undo = useCallback(
    () =>
      setData((d) => {
        const k = dayKey();
        const list = d.days[k];
        if (!list?.length) return d;
        return { ...d, days: { ...d.days, [k]: list.slice(0, -1) } };
      }),
    [],
  );

  const setGoal = useCallback((goalMl: number) => setData((d) => ({ ...d, goalMl })), []);
  const setCup = useCallback((cupMl: number) => setData((d) => ({ ...d, cupMl })), []);

  const entries = data.days[today] ?? [];
  const total = sum(entries);

  const week = useMemo(
    () => lastDays(7).map((date) => ({ date, total: sum(data.days[dayKey(date)]) })),
    // `today` invalidates the window after midnight.
    [data.days, today],
  );

  // Consecutive days (ending today, or yesterday if today isn't done yet) that hit the goal.
  const streak = useMemo(() => {
    const days = lastDays(KEEP_DAYS).reverse();
    let n = 0;
    for (let i = 0; i < days.length; i++) {
      const hit = sum(data.days[dayKey(days[i])]) >= data.goalMl;
      if (hit) n++;
      else if (i > 0) break;
    }
    return n;
  }, [data.days, data.goalMl, today]);

  return {
    ready,
    goalMl: data.goalMl,
    cupMl: data.cupMl,
    total,
    entries,
    week,
    streak,
    addCup,
    undo,
    setGoal,
    setCup,
  };
}
