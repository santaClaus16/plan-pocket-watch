import { SalarySettings } from './types';

export interface Period {
  start: Date;
  end: Date;
  label: string;
  daysTotal: number;
  daysElapsed: number;
  daysRemaining: number;
  progress: number; // 0..1
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);

export function getCurrentPeriod(settings: SalarySettings, now = new Date()): Period {
  if (settings.schedule === 'biweekly') {
    const anchor = startOfDay(new Date(settings.anchorDate));
    const today = startOfDay(now);
    const days = diffDays(anchor, today);
    const periodIndex = Math.floor(days / 14);
    const start = new Date(anchor);
    start.setDate(start.getDate() + periodIndex * 14);
    const end = new Date(start);
    end.setDate(end.getDate() + 13);
    return buildPeriod(start, end, today);
  }

  // twice-monthly
  const today = startOfDay(now);
  const d1 = Math.min(settings.payDay1, 28);
  const d2 = Math.min(settings.payDay2, 28);
  const [first, second] = d1 < d2 ? [d1, d2] : [d2, d1];

  const y = today.getFullYear();
  const m = today.getMonth();
  const day = today.getDate();

  let start: Date;
  let end: Date;

  if (day < first) {
    // previous month's second period through first - 1
    const prev = new Date(y, m - 1, second);
    start = prev;
    end = new Date(y, m, first - 1);
  } else if (day < second) {
    start = new Date(y, m, first);
    end = new Date(y, m, second - 1);
  } else {
    start = new Date(y, m, second);
    const next = new Date(y, m + 1, first - 1);
    end = next;
  }
  return buildPeriod(start, end, today);
}

function buildPeriod(start: Date, end: Date, today: Date): Period {
  const daysTotal = diffDays(start, end) + 1;
  const elapsedRaw = diffDays(start, today) + 1;
  const daysElapsed = Math.max(0, Math.min(daysTotal, elapsedRaw));
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const progress = daysTotal > 0 ? daysElapsed / daysTotal : 0;

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return {
    start,
    end,
    label: `${fmt(start)} – ${fmt(end)}`,
    daysTotal,
    daysElapsed,
    daysRemaining,
    progress,
  };
}

export function isWithin(date: string | Date, period: Period): boolean {
  const d = startOfDay(new Date(date));
  return d >= period.start && d <= period.end;
}
