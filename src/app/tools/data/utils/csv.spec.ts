import { csvToJson, jsonToCsv } from './csv';

describe('csv utils', () => {
  it('converts CSV to JSON array', () => {
    const { data, errors } = csvToJson('name,age\nAda,30', { delimiter: ',', header: true });
    expect(errors.length).toBe(0);
    expect(Array.isArray(data)).toBe(true);
    const row = (data as Array<Record<string, string>>)[0];
    expect(row.name).toBe('Ada');
  });

  it('converts JSON array to CSV', () => {
    const input = JSON.stringify([{ name: 'Ada', age: 30 }]);
    const result = jsonToCsv(input, { delimiter: ',', header: true });
    expect(result.error).toBeUndefined();
    expect(result.csv).toContain('name');
    expect(result.csv).toContain('Ada');
  });
});
