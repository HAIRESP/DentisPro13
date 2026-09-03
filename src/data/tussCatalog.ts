import { TUSSProcedure } from '../types';
import { TUSS_PROCEDURES_DIAGNOSTICS } from './tussCatalogDiagnostics';
import { TUSS_PROCEDURES_SURGERY } from './tussCatalogSurgery';
import { TUSS_PROCEDURES_CLINICAL } from './tussCatalogDentistryEndoPerio';
import { TUSS_PROCEDURES_PROSTHETICS_ORTHO } from './tussCatalogProstheticsOrtho';

/**
 * Catálogo Unificado e Oficial de Procedimentos TUSS / Rol da ANS
 * Resoluções Normativas ANS (RN nº 211/2010 alt. RN nº 262/2011 e posteriores)
 * Tabela 22 - Terminologia de Procedimentos Odontológicos
 */
export const OFFICIAL_ANS_TUSS_PROCEDURES: TUSSProcedure[] = [
  ...TUSS_PROCEDURES_DIAGNOSTICS,
  ...TUSS_PROCEDURES_SURGERY,
  ...TUSS_PROCEDURES_CLINICAL,
  ...TUSS_PROCEDURES_PROSTHETICS_ORTHO
];

/**
 * Total de procedimentos catalogados com conformidade ANS/TUSS
 */
export const TOTAL_OFFICIAL_TUSS_PROCEDURES = OFFICIAL_ANS_TUSS_PROCEDURES.length;

/**
 * Procedimentos cobertos pelo ROL ANS Odontológico
 */
export const ANS_ROL_COVERED_PROCEDURES = OFFICIAL_ANS_TUSS_PROCEDURES.filter(p => p.rolAns);

/**
 * Procedimentos Extra-Rol (Privados / Eletivos / Estéticos / Reabilitadores Avançados)
 */
export const EXTRA_ROL_PROCEDURES = OFFICIAL_ANS_TUSS_PROCEDURES.filter(p => !p.rolAns);

/**
 * Lista de especialidades únicas disponíveis no catálogo
 */
export const TUSS_SPECIALTIES = Array.from(
  new Set(OFFICIAL_ANS_TUSS_PROCEDURES.map(p => p.specialty))
).sort();

/**
 * Função utilitária para busca textual inteligente por código TUSS, descrição ou especialidade
 */
export function searchTussProcedures(query: string, rolOnly: boolean = false): TUSSProcedure[] {
  if (!query && !rolOnly) return OFFICIAL_ANS_TUSS_PROCEDURES;
  
  const cleanQuery = query.toLowerCase().trim();
  
  return OFFICIAL_ANS_TUSS_PROCEDURES.filter(proc => {
    if (rolOnly && !proc.rolAns) return false;
    if (!cleanQuery) return true;
    
    return (
      proc.code.toLowerCase().includes(cleanQuery) ||
      proc.description.toLowerCase().includes(cleanQuery) ||
      proc.specialty.toLowerCase().includes(cleanQuery) ||
      (proc.subgroup && proc.subgroup.toLowerCase().includes(cleanQuery)) ||
      (proc.rolAnsDescription && proc.rolAnsDescription.toLowerCase().includes(cleanQuery))
    );
  });
}
