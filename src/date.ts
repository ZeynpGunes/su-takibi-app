const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const WEEKDAYS_SHORT = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The last `n` days ending today, oldest first. */
export function lastDays(n: number, from: Date = new Date()): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

export function longDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

export function shortWeekday(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()];
}

export function timeOfDay(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 1250 -> "1.250" (Turkish thousands separator, no Intl dependency). */
export function formatMl(ml: number): string {
  return Math.round(ml).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 2000 -> "2 L", 2250 -> "2,25 L". */
export function formatLiters(ml: number): string {
  const l = Math.round(ml / 10) / 100;
  return `${l.toString().replace('.', ',')} L`;
}
