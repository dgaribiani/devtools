export interface TimestampResult {
  epochMs: number;
  local: string;
  utc: string;
}

export function parseTimestampInput(input: string): TimestampResult | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let epochMs: number | null = null;

  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (trimmed.length <= 10) {
      epochMs = numeric * 1000;
    } else {
      epochMs = numeric;
    }
  } else {
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      epochMs = parsed;
    }
  }

  if (epochMs === null || Number.isNaN(epochMs)) {
    return null;
  }

  return formatTimestamp(epochMs);
}

export function formatTimestamp(epochMs: number): TimestampResult {
  const date = new Date(epochMs);
  return {
    epochMs,
    local: date.toLocaleString(),
    utc: date.toUTCString()
  };
}
