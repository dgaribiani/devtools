const CRON_FIELDS = 5;

interface ParsedField {
  values: Set<number>;
  isAll: boolean;
}

interface ParsedCron {
  minute: ParsedField;
  hour: ParsedField;
  dayOfMonth: ParsedField;
  month: ParsedField;
  dayOfWeek: ParsedField;
}

const FIELD_LIMITS = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 6 }
];

export function computeNextCronRuns(expression: string, baseDate: Date, count: number, useUtc: boolean): Date[] {
  const parsed = parseCron(expression);
  const results: Date[] = [];
  const next = new Date(baseDate.getTime());

  if (useUtc) {
    next.setUTCSeconds(0, 0);
    next.setUTCMinutes(next.getUTCMinutes() + 1);
  } else {
    next.setSeconds(0, 0);
    next.setMinutes(next.getMinutes() + 1);
  }

  let guard = 0;
  while (results.length < count && guard < 1000000) {
    guard++;
    if (matchesCron(next, parsed, useUtc)) {
      results.push(new Date(next.getTime()));
    }
    addMinutes(next, 1, useUtc);
  }

  if (!results.length) {
    throw new Error('No future run times found. Check the expression.');
  }
  return results;
}

export function formatCronRun(date: Date, useUtc: boolean): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: useUtc ? 'UTC' : undefined
  });
  const label = useUtc ? 'UTC' : 'Local';
  return `${formatter.format(date)} (${label}) • ${date.toISOString()}`;
}

export function parseDateTimeLocal(input: string, useUtc: boolean): Date {
  if (!input) {
    return new Date();
  }
  const [datePart, timePart] = input.split('T');
  if (!datePart || !timePart) {
    return new Date();
  }
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if ([year, month, day, hour, minute].some(value => Number.isNaN(value))) {
    return new Date();
  }
  if (useUtc) {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  }
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function parseCron(expression: string): ParsedCron {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== CRON_FIELDS) {
    throw new Error('Cron must have 5 fields (min hour dom mon dow).');
  }
  return {
    minute: parseField(fields[0], FIELD_LIMITS[0]),
    hour: parseField(fields[1], FIELD_LIMITS[1]),
    dayOfMonth: parseField(fields[2], FIELD_LIMITS[2]),
    month: parseField(fields[3], FIELD_LIMITS[3]),
    dayOfWeek: parseField(fields[4], FIELD_LIMITS[4], true)
  };
}

function parseField(value: string, limit: { min: number; max: number }, normalizeDow = false): ParsedField {
  if (value === '*' || value === '?') {
    return { values: buildRange(limit.min, limit.max), isAll: true };
  }
  const values = new Set<number>();
  const parts = value.split(',');
  parts.forEach(part => {
    if (!part) {
      return;
    }
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart ? Number(stepPart) : 1;
    if (!Number.isFinite(step) || step <= 0) {
      throw new Error(`Invalid step: ${part}`);
    }
    const range = rangePart === '*' ? `${limit.min}-${limit.max}` : rangePart;
    const [startRaw, endRaw] = range.split('-');
    const start = normalizeValue(Number(startRaw), limit, normalizeDow);
    const end = endRaw ? normalizeValue(Number(endRaw), limit, normalizeDow) : start;
    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new Error(`Invalid field: ${part}`);
    }
    if (start > end) {
      throw new Error(`Range start must be <= end: ${part}`);
    }
    for (let i = start; i <= end; i += step) {
      values.add(i);
    }
  });

  if (!values.size) {
    throw new Error('Cron field produced no values.');
  }

  const isAll = values.size === limit.max - limit.min + 1;
  return { values, isAll };
}

function normalizeValue(value: number, limit: { min: number; max: number }, normalizeDow: boolean): number {
  if (normalizeDow && value === 7) {
    value = 0;
  }
  if (value < limit.min || value > limit.max) {
    throw new Error(`Value out of range: ${value}`);
  }
  return value;
}

function buildRange(min: number, max: number): Set<number> {
  const set = new Set<number>();
  for (let i = min; i <= max; i++) {
    set.add(i);
  }
  return set;
}

function matchesCron(date: Date, cron: ParsedCron, useUtc: boolean): boolean {
  const minute = useUtc ? date.getUTCMinutes() : date.getMinutes();
  const hour = useUtc ? date.getUTCHours() : date.getHours();
  const dayOfMonth = useUtc ? date.getUTCDate() : date.getDate();
  const month = (useUtc ? date.getUTCMonth() : date.getMonth()) + 1;
  const dayOfWeek = useUtc ? date.getUTCDay() : date.getDay();

  if (!cron.minute.values.has(minute)) {
    return false;
  }
  if (!cron.hour.values.has(hour)) {
    return false;
  }
  if (!cron.month.values.has(month)) {
    return false;
  }

  const domMatch = cron.dayOfMonth.values.has(dayOfMonth);
  const dowMatch = cron.dayOfWeek.values.has(dayOfWeek);

  if (cron.dayOfMonth.isAll && cron.dayOfWeek.isAll) {
    return true;
  }
  if (cron.dayOfMonth.isAll) {
    return dowMatch;
  }
  if (cron.dayOfWeek.isAll) {
    return domMatch;
  }
  return domMatch || dowMatch;
}

function addMinutes(date: Date, amount: number, useUtc: boolean): void {
  if (useUtc) {
    date.setUTCMinutes(date.getUTCMinutes() + amount);
  } else {
    date.setMinutes(date.getMinutes() + amount);
  }
}
