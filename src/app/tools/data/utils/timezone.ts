export const TIMEZONE_LIST = [
  'UTC',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Asia/Dubai',
  'Asia/Jerusalem',
  'Asia/Tehran',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Manila',
  'Asia/Jakarta',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu'
];

export interface TimezoneConversionResult {
  utc: Date;
  sourceLabel: string;
  targetLabel: string;
}

export function parseDateTimeLocal(input: string): { year: number; month: number; day: number; hour: number; minute: number } | null {
  if (!input) {
    return null;
  }
  const [datePart, timePart] = input.split('T');
  if (!datePart || !timePart) {
    return null;
  }
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if ([year, month, day, hour, minute].some(value => Number.isNaN(value))) {
    return null;
  }
  return { year, month, day, hour, minute };
}

export function convertTimeZone(
  input: string,
  sourceZone: string,
  targetZone: string
): TimezoneConversionResult {
  const parts = parseDateTimeLocal(input);
  if (!parts) {
    throw new Error('Select a date/time first.');
  }
  const utcDate = toUtcDate(parts, sourceZone);
  return {
    utc: utcDate,
    sourceLabel: formatInZone(utcDate, sourceZone),
    targetLabel: formatInZone(utcDate, targetZone)
  };
}

export function formatInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone
  }).format(date);
}

function toUtcDate(
  parts: { year: number; month: number; day: number; hour: number; minute: number },
  timeZone: string
): Date {
  const wallUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0));
  const offset = getTimeZoneOffsetMinutes(timeZone, wallUtc);
  return new Date(wallUtc.getTime() - offset * 60000);
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};
  parts.forEach(part => {
    values[part.type] = part.value;
  });

  const asUtc = Date.UTC(
    Number(values['year']),
    Number(values['month']) - 1,
    Number(values['day']),
    Number(values['hour']),
    Number(values['minute']),
    Number(values['second'])
  );

  return (asUtc - date.getTime()) / 60000;
}

export function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
