import { InventoryItem } from '../types';

export type ReadinessInfo = {
  isReady: boolean;
  statusType: 'sterilized' | 'maintenance_ok' | 'expired' | 'maintenance_overdue' | 'not_sterilized';
  badgeText: string;
  badgeTooltip: string;
  badgeClass: string;
};

export const getSterilizationExpiryDateStr = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts.map(part => parseInt(part, 10));
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + 6);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatBRDate = (dateStr?: string): string => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

export const getItemReadinessInfo = (item: InventoryItem, todayStr = new Date().toISOString().split('T')[0]): ReadinessInfo => {
  const isEquipment = item.category === 'Equipamentos' || item.itemType === 'equipamento' || item.requiresMaintenance;
  if (item.expirationDate && item.expirationDate < todayStr) {
    return {
      isReady: false,
      statusType: 'expired',
      badgeText: 'Vencido (Ind. Apagado)',
      badgeTooltip: `Validade expirada em ${item.expirationDate}. Proibido uso em procedimentos.`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold opacity-90'
    };
  }

  const nextMaintenance = item.nextMaintenanceDate || item.maintenanceDate;
  if (isEquipment && nextMaintenance && nextMaintenance < todayStr) {
    return {
      isReady: false,
      statusType: 'maintenance_overdue',
      badgeText: 'Manutenção Vencida',
      badgeTooltip: `Revisão técnica vencida em ${nextMaintenance}. Equipamento bloqueado até a manutenção.`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold opacity-90'
    };
  }

  const requiresSterilization = item.itemType === 'instrumental' || item.category === 'Instrumentais' || item.requiresSterilization === true;
  if (!requiresSterilization) {
    return {
      isReady: true,
      statusType: isEquipment ? 'maintenance_ok' : 'sterilized',
      badgeText: isEquipment ? 'Em Dia (Pronto p/ Uso)' : 'Pronto p/ Uso (Isento)',
      badgeTooltip: isEquipment ? 'Manutenção em dia.' : 'Este item não requer controle de esterilização em autoclave.',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
    };
  }

  if (item.isSterilized !== true || !item.sterilizationCycleId || !item.sterilizationReleasedAt) {
    return {
      isReady: false,
      statusType: 'not_sterilized',
      badgeText: item.isSterilized === false ? 'Em quarentena / Não liberado' : 'Sem ciclo rastreável',
      badgeTooltip: 'O item só pode ser liberado por ciclo rastreável aprovado e após a quarentena.',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
    };
  }

  const sterilizationExpiry = getSterilizationExpiryDateStr(item.sterilizationDate);
  if (sterilizationExpiry && sterilizationExpiry < todayStr) {
    return {
      isReady: false,
      statusType: 'not_sterilized',
      badgeText: 'Esterilização Vencida (+6m)',
      badgeTooltip: `Ciclo de ${formatBRDate(item.sterilizationDate)} vencido em ${formatBRDate(sterilizationExpiry)}. Necessita reesterilização.`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold opacity-90'
    };
  }

  return {
    isReady: true,
    statusType: 'sterilized',
    badgeText: 'Esterilizado (Pronto p/ Uso)',
    badgeTooltip: `Ciclo aprovado em ${formatBRDate(item.sterilizationDate)}; liberação rastreável confirmada.`,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
  };
};