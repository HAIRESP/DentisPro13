// Integer arithmetic avoids floating-point gaps in the temperature list.
export const temperatureOptions = Array.from({ length: 161 }, (_, i) => ((280 + i) / 10).toFixed(1));
export const systolicOptions = Array.from({ length: 39 }, (_, i) => String(80 + i * 5));
export const diastolicOptions = Array.from({ length: 19 }, (_, i) => String(40 + i * 5));
export const heartRateOptions = Array.from({ length: 86 }, (_, i) => String(45 + i));
export const oxygenOptions = Array.from({ length: 11 }, (_, i) => String(90 + i));

export function splitBloodPressure(value = ''): [string, string] {
  const slash = value.indexOf('/');
  return slash < 0 ? [value, ''] : [value.slice(0, slash), value.slice(slash + 1)];
}
export function joinBloodPressure(systolic: string, diastolic: string): string {
  return systolic || diastolic ? `${systolic}/${diastolic}` : '';
}
