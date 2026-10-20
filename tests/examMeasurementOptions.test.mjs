import { test } from 'node:test';
import assert from 'node:assert/strict';
import { temperatureOptions, systolicOptions, diastolicOptions, heartRateOptions, oxygenOptions, splitBloodPressure, joinBloodPressure } from '../src/utils/examMeasurementOptions.ts';

test('listas têm os limites e incrementos solicitados, sem arredondamentos acumulados', () => {
  for (const [options, min, max, step, count] of [
    [temperatureOptions, 28, 44, .1, 161], [systolicOptions, 80, 270, 5, 39],
    [diastolicOptions, 40, 130, 5, 19], [heartRateOptions, 45, 130, 1, 86], [oxygenOptions, 90, 100, 1, 11]
  ]) {
    assert.equal(options.length, count);
    assert.equal(Number(options[0]), min);
    assert.equal(Number(options.at(-1)), max);
    options.forEach((v, i) => assert.equal(Math.round(Number(v) * 10), Math.round((min + step * i) * 10)));
  }
  assert.ok(temperatureOptions.every(v => /^\d{2}\.\d$/.test(v)));
});

test('pressão preserva cada componente, inclusive edição parcial e campo vazio', () => {
  for (const [a,b] of [['120','80'],['270','130'],['','40'],['80',''],['','']]) {
    assert.deepEqual(splitBloodPressure(joinBloodPressure(a,b)), [a,b]);
  }
  assert.deepEqual(splitBloodPressure('120/80'), ['120','80']);
  assert.equal(joinBloodPressure('', ''), '');
});
