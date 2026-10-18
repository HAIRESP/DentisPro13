export const AUTOCLAVE_QUARANTINE_HOURS = 48;

export interface SterilizationCycleReleaseCheck {
  date: string;
  itemsIncludedIds?: string[];
  cycleStatus?: 'quarantined' | 'rejected' | 'released';
  biologicalTestResult: 'Aprovado (Negativo)' | 'Pendente' | 'Reprovado (Positivo)';
  chemicalIntegratorResult: 'Aprovado (Cor Conforme)' | 'Não Aprovado';
  physicalTableResult: 'Aprovado (Parâmetros Físicos OK)' | 'Desvio Detectado';
}

export type SterilizationReleaseBlockReason =
  | 'rejected'
  | 'already_released'
  | 'untracked_items'
  | 'test_not_approved'
  | 'invalid_cycle_date'
  | 'quarantine_incomplete';

export function getSterilizationReleaseBlockReason(
  cycle: SterilizationCycleReleaseCheck,
  now = Date.now()
): SterilizationReleaseBlockReason | null {
  if (cycle.cycleStatus === 'rejected' ||
    cycle.biologicalTestResult === 'Reprovado (Positivo)' ||
    cycle.chemicalIntegratorResult === 'Não Aprovado' ||
    cycle.physicalTableResult === 'Desvio Detectado') {
    return 'rejected';
  }
  if (cycle.cycleStatus === 'released') return 'already_released';
  if (!cycle.itemsIncludedIds?.length) return 'untracked_items';
  if (cycle.biologicalTestResult !== 'Aprovado (Negativo)' ||
    cycle.chemicalIntegratorResult !== 'Aprovado (Cor Conforme)' ||
    cycle.physicalTableResult !== 'Aprovado (Parâmetros Físicos OK)') {
    return 'test_not_approved';
  }

  const cycleTime = new Date(cycle.date).getTime();
  if (!Number.isFinite(cycleTime)) return 'invalid_cycle_date';
  if (now - cycleTime < AUTOCLAVE_QUARANTINE_HOURS * 60 * 60 * 1000) {
    return 'quarantine_incomplete';
  }
  return null;
}