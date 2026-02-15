export interface CsvProfileColumn {
  name: string;
  index: number;
  total: number;
  empty: number;
  unique: number;
  minLength: number;
  maxLength: number;
  avgLength: number;
}

export interface CsvProfileResult {
  rows: number;
  columns: number;
  delimiter: string;
  hasHeader: boolean;
  columnProfiles: CsvProfileColumn[];
}

export function profileCsv(data: string[][], delimiter: string, hasHeader: boolean): CsvProfileResult {
  if (!data.length) {
    return { rows: 0, columns: 0, delimiter, hasHeader, columnProfiles: [] };
  }
  const rows = hasHeader ? data.slice(1) : data;
  const headers = hasHeader
    ? data[0].map((value, index) => value || `column_${index + 1}`)
    : data[0].map((_, index) => `column_${index + 1}`);

  const columns = headers.length;
  const profiles: CsvProfileColumn[] = headers.map((name, index) => ({
    name,
    index,
    total: 0,
    empty: 0,
    unique: 0,
    minLength: Number.POSITIVE_INFINITY,
    maxLength: 0,
    avgLength: 0
  }));

  const uniques = profiles.map(() => new Set<string>());

  rows.forEach(row => {
    for (let i = 0; i < columns; i++) {
      const value = row[i] ?? '';
      const profile = profiles[i];
      profile.total += 1;
      if (!value) {
        profile.empty += 1;
      } else {
        uniques[i].add(value);
      }
      const length = value.length;
      profile.minLength = Math.min(profile.minLength, length);
      profile.maxLength = Math.max(profile.maxLength, length);
      profile.avgLength += length;
    }
  });

  profiles.forEach((profile, index) => {
    profile.unique = uniques[index].size;
    profile.avgLength = profile.total ? Number((profile.avgLength / profile.total).toFixed(2)) : 0;
    if (profile.minLength === Number.POSITIVE_INFINITY) {
      profile.minLength = 0;
    }
  });

  return {
    rows: rows.length,
    columns,
    delimiter,
    hasHeader,
    columnProfiles: profiles
  };
}
