import type { Appointment, ProcedureMaterialRequirement, TUSSProcedure } from '../types';
import { materialTemplateKey } from './appointmentMaterials';
export function getAppointmentRequirements(appointment: Appointment, tussProcedures: TUSSProcedure[], materialTemplates: Record<string, ProcedureMaterialRequirement[]> = {}): ProcedureMaterialRequirement[] {
  let templateKey: string | undefined;
  try { templateKey = materialTemplateKey(appointment); } catch { /* An unscoped appointment has no scoped template. */ }
  // 1. Resolve required materials for the appointment's procedure
  const matchingTuss = appointment.tussCode
    ? tussProcedures.find(procedure => procedure.code === appointment.tussCode)
    : tussProcedures.find(procedure => procedure.description.trim().toLowerCase() === appointment.procedure.trim().toLowerCase());

  // Default procedural kit fallback if no requiredMaterials explicitly configured
  const defaultProcedureMaterials: ProcedureMaterialRequirement[] = [
    { id: 'req-1', materialName: 'Anestésico Local (Lidocaína / Mepivacaína)', category: 'Anestésicos', quantityNeeded: 1, unit: 'tubete' },
    { id: 'req-2', materialName: 'Agulha Gengival Descartável', category: 'Descartáveis', quantityNeeded: 1, unit: 'unidade' },
    { id: 'req-3', materialName: 'Sugador Odontológico Descartável', category: 'Descartáveis', quantityNeeded: 2, unit: 'unidade' },
    { id: 'req-4', materialName: 'Gaze Estéril Dobrada', category: 'Descartáveis', quantityNeeded: 1, unit: 'pacote' },
    { id: 'req-5', materialName: 'Luvas de Procedimento Nitrílicas/Látex', category: 'Descartáveis', quantityNeeded: 1, unit: 'par' },
    { id: 'req-6', materialName: 'Kit Clínico reutilizável (bandeja, espelho, pinça e explorador)', category: 'Instrumentais', quantityNeeded: 1, unit: 'conjunto' },
  ];

  // Specific additions based on procedure category
  let specificRequirements: ProcedureMaterialRequirement[] = [];
  const procLower = appointment.procedure.toLowerCase();

  if (procLower.includes('resina') || procLower.includes('restauração')) {
    specificRequirements = [
      { id: 'req-res-1', materialName: 'Resina Composta Nanoparticulada (A2/A3)', category: 'Resinas & Adesivos', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-res-2', materialName: 'Sistema Adesivo Fotopolimerizável', category: 'Resinas & Adesivos', quantityNeeded: 1, unit: 'frasco' },
      { id: 'req-res-3', materialName: 'Ácido Fosfórico 37%', category: 'Resinas & Adesivos', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-res-4', materialName: 'Matriz / Tira de Poliéster & Cunha de Madeira', category: 'Descartáveis', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-res-5', materialName: 'Discos e Pasta de Polimento', category: 'Descartáveis', quantityNeeded: 1, unit: 'kit' },
    ];
  } else if (procLower.includes('canal') || procLower.includes('endodont')) {
    specificRequirements = [
      { id: 'req-endo-1', materialName: 'Isolamento Absoluto (Lençol de Borracha + Grampo)', category: 'Endodontia', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-endo-2', materialName: 'Jogo de Limas Endodônticas NiTi', category: 'Endodontia', quantityNeeded: 1, unit: 'kit' },
      { id: 'req-endo-3', materialName: 'Solução Irrigante Hipoclorito de Sódio 2.5%', category: 'Endodontia', quantityNeeded: 1, unit: 'frasco' },
      { id: 'req-endo-4', materialName: 'Cones de Guta-Percha & Cimento Endodôntico Biocerâmico', category: 'Endodontia', quantityNeeded: 1, unit: 'caixa' },
    ];
  } else if (procLower.includes('limpeza') || procLower.includes('profilaxia') || procLower.includes('raspagem')) {
    specificRequirements = [
      { id: 'req-prof-1', materialName: 'Pasta Profilática Fluoretada', category: 'Higiene', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-prof-2', materialName: 'Taça de Borracha / Escova Robinson', category: 'Descartáveis', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-prof-3', materialName: 'Ponta de Ultrassom Perio / Curetas Gracey', category: 'Instrumentais', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-prof-4', materialName: 'Flúor Gel / Verniz Fluoretado', category: 'Higiene', quantityNeeded: 1, unit: 'unidade' },
    ];
  } else if (procLower.includes('extração') || procLower.includes('exodontia') || procLower.includes('cirurgia') || procLower.includes('implante')) {
    specificRequirements = [
      { id: 'req-cir-1', materialName: 'Campo Cirúrgico Estéril & Babador Impermeável', category: 'Cirurgia', quantityNeeded: 1, unit: 'pacote' },
      { id: 'req-cir-2', materialName: 'Fio de Sutura Nylon/Seda 4-0 com Agulha', category: 'Cirurgia', quantityNeeded: 1, unit: 'unidade' },
      { id: 'req-cir-3', materialName: 'Lâmina de Bisturi nº 15 / Kit Fórceps & Alavancas', category: 'Cirurgia', quantityNeeded: 1, unit: 'conjunto' },
      { id: 'req-cir-4', materialName: 'Soro Fisiológico Estéril 0.9% para Irrigação', category: 'Cirurgia', quantityNeeded: 1, unit: 'frasco' },
    ];
  }

  return appointment.customRequiredMaterials ||
    (templateKey && materialTemplates[templateKey]) ||
    (matchingTuss?.requiredMaterials && matchingTuss.requiredMaterials.length > 0
      ? matchingTuss.requiredMaterials
      : [...defaultProcedureMaterials, ...specificRequirements]);

}
