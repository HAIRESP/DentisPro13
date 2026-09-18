/**
 * Utilitário e Esquema SQL Padrão para Banco de Dados TUSS (DentisPro)
 * 
 * Estrutura Relacional Normalizada:
 * - ELEMENTO PRINCIPAL: Procedimento Odontológico (tuss_procedures) com CHAVE PRIMÁRIA (id INT PRIMARY KEY AUTO_INCREMENT / SERIAL)
 * - TABELAS RELACIONADAS:
 *   - price_tables (Convênios / Tabelas de Preço com Chave Primária id)
 *   - procedure_prices (Preços por Convênio com Chave Primária id e FKs procedure_id, price_table_id)
 *   - correlation_rules (Regras de Odontograma com Chave Primária id e FK procedure_id)
 */

import { TUSSProcedure, PriceTable, CorrelationRule } from '../types';

export const TUSS_SQL_DDL = `-- =============================================================================
-- ESQUEMA DE BANCO DE DADOS RELACIONAL SQL PADRÃO ANSI / POSTGRESQL
-- SISTEMA DENTISPRO - MÓDULO TABELA TUSS / ANS & REGRAS DE CORRELAÇÃO
-- ELEMENTO PRINCIPAL: PROCEDIMENTO ODONTOLÓGICO (tuss_procedures)
-- =============================================================================

-- 1. TABELA PRINCIPAL: PROCEDIMENTOS TUSS (Elemento Principal)
CREATE TABLE IF NOT EXISTS tuss_procedures (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    code VARCHAR(50) NOT NULL UNIQUE,                           -- CÓDIGO TUSS/ANS (Chave Única)
    tiss_code VARCHAR(50),                                      -- Código TISS correspondente
    description TEXT NOT NULL,                                  -- NOME DO PROCEDIMENTO (Elemento Principal)
    full_description TEXT,                                      -- Detalhamento técnico completo
    specialty VARCHAR(150) NOT NULL,                            -- Especialidade Odontológica
    category VARCHAR(100),                                      -- Categoria clínica
    faces VARCHAR(100),                                         -- Faces aplicáveis textuais
    scope_type VARCHAR(50) DEFAULT 'dente',                     -- 'face' | 'dente' | 'area'
    anatomical_scope VARCHAR(100),                              -- Escopo anatômico TUSS
    tooth_faces_count VARCHAR(50),                              -- '1_face' | '2_faces' | '3_faces' | '4_ou_mais_faces'
    default_region VARCHAR(50),                                 -- Região anatômica padrão
    suggested_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,        -- Custo sugerido particular
    rol_ans BOOLEAN DEFAULT FALSE,                              -- Cobertura obrigatória pelo Rol da ANS
    ans_rol_current BOOLEAN DEFAULT TRUE,                       -- Vigência no Rol ANS
    odonto_grouping VARCHAR(150),                               -- Agrupamento Odontológico ANS
    subgroup VARCHAR(150),                                      -- Subgrupo Tabela 22 ANS
    required_materials JSONB DEFAULT '[]'::jsonb,               -- Materiais/Insumos necessários
    images JSONB DEFAULT '[]'::jsonb,                           -- Imagens ilustrativas
    videos JSONB DEFAULT '[]'::jsonb,                           -- Vídeos explicativos
    active BOOLEAN DEFAULT TRUE,                                -- Registro ativo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CONVÊNIOS & TABELAS DE PREÇO
CREATE TABLE IF NOT EXISTS price_tables (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    code VARCHAR(50) NOT NULL UNIQUE,                           -- Identificador ('particular', 'amil', 'bradesco')
    name VARCHAR(255) NOT NULL,                                 -- Nome amigável do convênio
    description TEXT,                                           -- Detalhes do convênio / tabela
    is_default BOOLEAN DEFAULT FALSE,                           -- Tabela padrão particular
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,                -- Desconto base percentual
    ans_registration VARCHAR(50),                               -- Número de registro da operadora na ANS
    cnpj VARCHAR(30),                                           -- CNPJ da operadora
    active BOOLEAN DEFAULT TRUE,                                -- Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA RELACIONAL: PREÇOS POR PROCEDIMENTO E CONVÊNIO (N:N)
CREATE TABLE IF NOT EXISTS procedure_prices (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    procedure_id INT NOT NULL,                                  -- FK -> tuss_procedures.id (ELEMENTO PRINCIPAL)
    price_table_id INT NOT NULL,                                -- FK -> price_tables.id
    price NUMERIC(10, 2) NOT NULL,                              -- Valor cobrado neste convênio
    co_payment NUMERIC(10, 2) DEFAULT 0.00,                     -- Coparticipação do paciente
    authorized BOOLEAN DEFAULT TRUE,                            -- Cobertura autorizada
    coverage_notes TEXT,                                        -- Observações de autorização/perícia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_procedure_prices_proc FOREIGN KEY (procedure_id) REFERENCES tuss_procedures(id) ON DELETE CASCADE,
    CONSTRAINT fk_procedure_prices_table FOREIGN KEY (price_table_id) REFERENCES price_tables(id) ON DELETE CASCADE,
    CONSTRAINT uq_proc_price_table UNIQUE (procedure_id, price_table_id)
);

-- 4. TABELA RELACIONAL: REGRAS DE CORRELAÇÃO CLÍNICA ODONTOGRAMA -> PROCEDIMENTO
CREATE TABLE IF NOT EXISTS correlation_rules (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    procedure_id INT,                                           -- FK -> tuss_procedures.id (ELEMENTO PRINCIPAL)
    procedure_description TEXT NOT NULL,                        -- Descrição redundante para performance
    tuss_code VARCHAR(50),                                      -- Código TUSS
    condition_type VARCHAR(50) NOT NULL,                        -- Achado odontograma ('carie', 'canal', etc.)
    price_table_id INT,                                         -- FK -> price_tables.id (opcional)
    scope_type VARCHAR(50) DEFAULT 'dente',                     -- 'face' | 'dente' | 'area'
    min_surfaces INT DEFAULT 0,                                 -- Mínimo de faces
    max_surfaces INT DEFAULT 5,                                 -- Máximo de faces
    applicable_faces JSONB DEFAULT '[]'::jsonb,                 -- Faces permitidas
    teeth_group VARCHAR(50) DEFAULT 'todos',                    -- Grupo anatômico
    applicable_teeth JSONB DEFAULT '[]'::jsonb,                 -- Dentes numéricos específicos
    aggregation_mode VARCHAR(50) DEFAULT 'dente',               -- 'hemiarco', 'sextante', 'arcada', 'ambas_arcadas'
    applicable_regions JSONB DEFAULT '[]'::jsonb,               -- Regiões aplicáveis
    region_code VARCHAR(50),                                    -- Código regional
    suggested_cost NUMERIC(10, 2),                              -- Custo referencial
    specialty VARCHAR(150),                                     -- Especialidade
    notes TEXT,                                                 -- Orientações clínicas
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_correlation_proc FOREIGN KEY (procedure_id) REFERENCES tuss_procedures(id) ON DELETE CASCADE,
    CONSTRAINT fk_correlation_price_table FOREIGN KEY (price_table_id) REFERENCES price_tables(id) ON DELETE SET NULL
);

-- 5. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tuss_code ON tuss_procedures(code);
CREATE INDEX IF NOT EXISTS idx_tuss_specialty ON tuss_procedures(specialty);
CREATE INDEX IF NOT EXISTS idx_tuss_scope ON tuss_procedures(scope_type);
CREATE INDEX IF NOT EXISTS idx_proc_prices_proc ON procedure_prices(procedure_id);
CREATE INDEX IF NOT EXISTS idx_proc_prices_table ON procedure_prices(price_table_id);
CREATE INDEX IF NOT EXISTS idx_correlation_proc ON correlation_rules(procedure_id);
CREATE INDEX IF NOT EXISTS idx_correlation_condition ON correlation_rules(condition_type);
CREATE INDEX IF NOT EXISTS idx_correlation_scope ON correlation_rules(scope_type);
`;

function escapeSqlString(val: string | undefined | null): string {
  if (val === undefined || val === null) return "''";
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Gera um script completo .sql populado com procedimentos, tabelas de preços,
 * junções de preços relacionais e regras de correlação prontas para execução em PostgreSQL/MySQL/Cloud SQL.
 */
export function generateTussDatabaseSqlDump(
  procedures: TUSSProcedure[],
  priceTables: PriceTable[],
  correlationRules: CorrelationRule[]
): string {
  const lines: string[] = [];

  lines.push(`-- =============================================================================`);
  lines.push(`-- DUMP COMPLETO DO BANCO DE DADOS TUSS - DENTISPRO`);
  lines.push(`-- Data de Exportação: ${new Date().toISOString()}`);
  lines.push(`-- Total de Procedimentos (Elemento Principal): ${procedures.length}`);
  lines.push(`-- Total de Convênios: ${priceTables.length}`);
  lines.push(`-- Total de Regras de Correlação: ${correlationRules.length}`);
  lines.push(`-- =============================================================================\n`);

  lines.push(TUSS_SQL_DDL);
  lines.push(`\n-- =============================================================================`);
  lines.push(`-- CARGA DE DADOS RELACIONAIS (INSERTS)`);
  lines.push(`-- =============================================================================\n`);

  // 1. Inserir Tabelas de Preço (Convênios)
  lines.push(`-- 1. Inserção de Tabelas de Preço & Convênios`);
  priceTables.forEach((tbl, idx) => {
    const pId = idx + 1;
    const isDefault = tbl.isDefault ? 'TRUE' : 'FALSE';
    lines.push(
      `INSERT INTO price_tables (id, code, name, description, is_default, discount_percent, active) ` +
      `VALUES (${pId}, ${escapeSqlString(tbl.id)}, ${escapeSqlString(tbl.name)}, ${escapeSqlString(tbl.description || '')}, ${isDefault}, 0.00, TRUE) ` +
      `ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`
    );
  });
  lines.push(``);

  // 2. Inserir Procedimentos TUSS (Elemento Principal com Chave Primária)
  lines.push(`-- 2. Inserção de Procedimentos TUSS (Elemento Principal com Chave Primária)`);
  const procedureIdMap = new Map<string, number>();

  procedures.forEach((proc, index) => {
    const pkId = typeof proc.id === 'number' ? proc.id : index + 1;
    procedureIdMap.set(proc.code, pkId);

    const cost = Number(proc.suggestedCost || 0).toFixed(2);
    const rolAns = proc.rolAns ? 'TRUE' : 'FALSE';
    const scopeType = proc.scopeType || (proc.faces ? 'face' : 'dente');

    lines.push(
      `INSERT INTO tuss_procedures (id, code, tiss_code, description, full_description, specialty, faces, scope_type, suggested_cost, rol_ans, default_region) ` +
      `VALUES (${pkId}, ${escapeSqlString(proc.code)}, ${escapeSqlString(proc.tissCode || '')}, ${escapeSqlString(proc.description)}, ${escapeSqlString(proc.fullDescription || proc.description)}, ${escapeSqlString(proc.specialty)}, ${escapeSqlString(proc.faces || '')}, ${escapeSqlString(scopeType)}, ${cost}, ${rolAns}, ${escapeSqlString(proc.defaultRegion || '')}) ` +
      `ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, suggested_cost = EXCLUDED.suggested_cost, specialty = EXCLUDED.specialty;`
    );
  });
  lines.push(``);

  // 3. Inserir Preços Relacionais por Convênio
  lines.push(`-- 3. Inserção de Preços Relacionais (Vinculados à Chave Primária do Procedimento)`);
  let priceCounter = 1;
  procedures.forEach((proc) => {
    const procPk = procedureIdMap.get(proc.code);
    if (!procPk) return;

    // Se possui objeto de preços customizados
    if (proc.prices) {
      Object.entries(proc.prices).forEach(([tblCode, val]) => {
        const tableIdx = priceTables.findIndex(t => t.id === tblCode);
        const tblPk = tableIdx >= 0 ? tableIdx + 1 : null;
        if (tblPk && typeof val === 'number') {
          lines.push(
            `INSERT INTO procedure_prices (id, procedure_id, price_table_id, price, authorized) ` +
            `VALUES (${priceCounter++}, ${procPk}, ${tblPk}, ${val.toFixed(2)}, TRUE) ` +
            `ON CONFLICT (procedure_id, price_table_id) DO UPDATE SET price = EXCLUDED.price;`
          );
        }
      });
    } else {
      // Preço particular base padrão
      lines.push(
        `INSERT INTO procedure_prices (id, procedure_id, price_table_id, price, authorized) ` +
        `VALUES (${priceCounter++}, ${procPk}, 1, ${Number(proc.suggestedCost || 0).toFixed(2)}, TRUE) ` +
        `ON CONFLICT (procedure_id, price_table_id) DO UPDATE SET price = EXCLUDED.price;`
      );
    }
  });
  lines.push(``);

  // 4. Inserir Regras de Correlação
  lines.push(`-- 4. Inserção de Regras de Correlação Clínicas (Vinculadas ao Procedimento)`);
  correlationRules.forEach((rule, rIdx) => {
    const rPk = rIdx + 1;
    const procPk = rule.tussCode ? procedureIdMap.get(rule.tussCode) || 'NULL' : 'NULL';
    const cost = rule.suggestedCost ? Number(rule.suggestedCost).toFixed(2) : 'NULL';
    const facesJson = JSON.stringify(rule.applicableFaces || []);
    const teethJson = JSON.stringify(rule.applicableTeeth || []);
    const regionsJson = JSON.stringify(rule.applicableRegions || []);

    lines.push(
      `INSERT INTO correlation_rules (id, procedure_id, procedure_description, tuss_code, condition_type, scope_type, min_surfaces, max_surfaces, applicable_faces, teeth_group, applicable_teeth, applicable_regions, suggested_cost, specialty, notes) ` +
      `VALUES (${rPk}, ${procPk}, ${escapeSqlString(rule.procedureDescription)}, ${escapeSqlString(rule.tussCode || '')}, ${escapeSqlString(rule.conditionType)}, ${escapeSqlString(rule.scopeType || 'dente')}, ${rule.minSurfaces ?? 0}, ${rule.maxSurfaces ?? 5}, '${facesJson}'::jsonb, ${escapeSqlString(rule.teethGroup || 'todos')}, '${teethJson}'::jsonb, '${regionsJson}'::jsonb, ${cost}, ${escapeSqlString(rule.specialty || '')}, ${escapeSqlString(rule.notes || '')});`
    );
  });

  lines.push(`\n-- Fim do script SQL DentisPro`);
  return lines.join('\n');
}

/**
 * Dispara o download automático do script .sql no navegador do usuário
 */
export function downloadTussSqlScript(
  procedures: TUSSProcedure[],
  priceTables: PriceTable[],
  correlationRules: CorrelationRule[],
  filename: string = 'dentispro_tuss_banco_dados.sql'
) {
  const sqlContent = generateTussDatabaseSqlDump(procedures, priceTables, correlationRules);
  const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
