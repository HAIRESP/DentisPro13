import test from 'node:test';
import assert from 'node:assert/strict';
import { getSterilizationReleaseBlockReason } from '../src/utils/sterilizationCycle.ts';

const passedCycle = {
  date: '2026-09-25T08:00',
  itemsIncludedIds: ['instrument-1', 'instrument-2'],
  cycleStatus: 'quarantined',
  biologicalTestResult: 'Aprovado (Negativo)',
  chemicalIntegratorResult: 'Aprovado (Cor Conforme)',
  physicalTableResult: 'Aprovado (Parâmetros Físicos OK)'
};

test('does not release any item from a rejected cycle', () => {
  assert.equal(getSterilizationReleaseBlockReason({
    ...passedCycle,
    cycleStatus: 'rejected',
    biologicalTestResult: 'Reprovado (Positivo)'
  }, Date.parse('2026-09-28T12:00')), 'rejected');
});

test('keeps a cycle blocked until every indicator is approved', () => {
  assert.equal(getSterilizationReleaseBlockReason({
    ...passedCycle,
    biologicalTestResult: 'Pendente'
  }, Date.parse('2026-09-28T12:00')), 'test_not_approved');
});

test('keeps approved contents quarantined until 48 hours have elapsed', () => {
  assert.equal(getSterilizationReleaseBlockReason(passedCycle, Date.parse('2026-09-27T07:59')), 'quarantine_incomplete');
  assert.equal(getSterilizationReleaseBlockReason(passedCycle, Date.parse('2026-09-27T08:00')), null);
});

test('does not release a cycle without linked inventory item IDs', () => {
  assert.equal(getSterilizationReleaseBlockReason({ ...passedCycle, itemsIncludedIds: [] }, Date.parse('2026-09-28T12:00')), 'untracked_items');
});