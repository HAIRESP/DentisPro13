import type { InventoryItem } from '../types';

// quantity and qty remain in the inventory's stock unit. Packaging is explicit.
export interface StockDeductionRequest {
  itemId: string;
  qty: number;
  stockUnit?: string;
  consumption?: { quantity: number; unit: string };
}

type Conversion =
  | { ok: true; quantity: number; stockUnit: string }
  | { ok: false; error: string };

export function normalizeStockUnit(value: string): string {
  const key = value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const aliases: Record<string, string> = {
    unidades: 'unidade', un: 'unidade', unid: 'unidade',
    caixas: 'caixa', pacotes: 'pacote', frascos: 'frasco', tubetes: 'tubete',
    kits: 'kit', pecas: 'peca', conjuntos: 'conjunto', pares: 'par',
    seringas: 'seringa', bisnagas: 'bisnaga', rolos: 'rolo',
    mililitro: 'ml', mililitros: 'ml', grama: 'g', gramas: 'g'
  };
  return aliases[key] || key;
}

export function roundStockQuantity(value: number): number {
  // Avoid 39.989999999999995 after subtracting a fraction of a package.
  return Number(value.toFixed(12));
}

export function resolveStockUsage(item: InventoryItem, quantity: number, requestedUnit: string): Conversion {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: 'Quantidade solicitada inválida.' };
  }
  const stockUnit = normalizeStockUnit(item.unit || '');
  const consumptionUnit = normalizeStockUnit(requestedUnit || '');
  if (!stockUnit || !consumptionUnit) {
    return { ok: false, error: 'Informe a unidade do estoque e do consumo.' };
  }
  if (stockUnit === consumptionUnit) return { ok: true, quantity, stockUnit: item.unit };
  if (normalizeStockUnit(item.consumptionUnit || '') !== consumptionUnit ||
      !Number.isFinite(item.unitsPerStockUnit) || (item.unitsPerStockUnit ?? 0) <= 0) {
    return {
      ok: false,
      error: `Conversão pendente: ${requestedUnit} → ${item.unit}. Cadastre a unidade de consumo e a quantidade por embalagem neste material.`
    };
  }
  const converted = roundStockQuantity(quantity / item.unitsPerStockUnit!);
  if (!Number.isFinite(converted) || converted <= 0) {
    return { ok: false, error: 'Conversão fora da precisão suportada (12 casas decimais).' };
  }
  return { ok: true, quantity: converted, stockUnit: item.unit };
}
