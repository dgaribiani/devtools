import * as Papa from 'papaparse';

export interface CsvOptions {
  delimiter: string;
  header: boolean;
}

export function csvToJson(csv: string, options: CsvOptions): { data: unknown; errors: string[] } {
  const result = Papa.parse(csv, {
    delimiter: options.delimiter || ',',
    header: options.header,
    skipEmptyLines: true
  });

  const errors = result.errors.map((error: Papa.ParseError) => error.message);
  return { data: result.data, errors };
}

export function jsonToCsv(jsonText: string, options: CsvOptions): { csv: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      return { csv: '', error: 'JSON must be an array of objects to convert to CSV.' };
    }
    const csv = Papa.unparse(parsed, {
      delimiter: options.delimiter || ',',
      header: options.header
    });
    return { csv };
  } catch (error) {
    return { csv: '', error: 'Invalid JSON input.' };
  }
}
