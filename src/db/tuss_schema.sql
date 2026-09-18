-- =============================================================================
-- DENTISPRO - ESQUEMA DE BANCO DE DADOS RELACIONAL SQL PADRÃO ANSI / POSTGRESQL
-- ELEMENTO PRINCIPAL: PROCEDIMENTO ODONTOLÓGICO (tuss_procedures)
-- =============================================================================

-- 1. TABELA PRINCIPAL: PROCEDIMENTOS TUSS (Elemento Central do Banco de Dados)
CREATE TABLE IF NOT EXISTS tuss_procedures (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA (ID autoincremental único)
    code VARCHAR(50) NOT NULL UNIQUE,                           -- CÓDIGO TUSS/ANS (Chave de Negócio Única)
    tiss_code VARCHAR(50),                                      -- Código TISS correspondente
    description TEXT NOT NULL,                                  -- NOME DO PROCEDIMENTO (Elemento Principal)
    full_description TEXT,                                      -- Detalhamento técnico e orientações clínicas
    specialty VARCHAR(150) NOT NULL,                            -- Especialidade Odontológica
    category VARCHAR(100),                                      -- Categoria clínica
    faces VARCHAR(100),                                         -- Faces aplicáveis
    scope_type VARCHAR(50) DEFAULT 'dente',                     -- 'face' | 'dente' | 'area'
    anatomical_scope VARCHAR(100),                              -- Escopo anatômico
    tooth_faces_count VARCHAR(50),                              -- '1_face' | '2_faces' | '3_faces' | '4_ou_mais_faces'
    default_region VARCHAR(50),                                 -- Região padrão
    suggested_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,        -- Valor base particular sugerido
    rol_ans BOOLEAN DEFAULT FALSE,                              -- Cobertura obrigatória ANS
    ans_rol_current BOOLEAN DEFAULT TRUE,                       -- Vigência normativa atual
    odonto_grouping VARCHAR(150),                               -- Agrupamento Odontológico ANS
    subgroup VARCHAR(150),                                      -- Subgrupo Tabela 22 ANS
    required_materials JSONB DEFAULT '[]'::jsonb,               -- Materiais/Insumos necessários
    images JSONB DEFAULT '[]'::jsonb,                           -- Galeria ilustrativa
    videos JSONB DEFAULT '[]'::jsonb,                           -- Vídeos demonstrativos
    active BOOLEAN DEFAULT TRUE,                                -- Ativo/Inativo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE TABELAS DE PREÇO & CONVÊNIOS ODONTOLÓGICOS
CREATE TABLE IF NOT EXISTS price_tables (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    code VARCHAR(50) NOT NULL UNIQUE,                           -- Identificador da tabela ('particular', 'amil', 'bradesco')
    name VARCHAR(255) NOT NULL,                                 -- Nome amigável do convênio / plano
    description TEXT,                                           -- Descrição das condições contratuais
    is_default BOOLEAN DEFAULT FALSE,                           -- Tabela padrão particular
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,                -- Desconto base percentual
    ans_registration VARCHAR(50),                               -- Número de registro da operadora na ANS
    cnpj VARCHAR(30),                                           -- CNPJ da operadora
    active BOOLEAN DEFAULT TRUE,                                -- Ativo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA RELACIONAL: PREÇOS POR PROCEDIMENTO E CONVÊNIO
-- (Junção N:N com Chave Primária própria e Chaves Estrangeiras para Procedimento e Tabela)
CREATE TABLE IF NOT EXISTS procedure_prices (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    procedure_id INT NOT NULL,                                  -- FK -> tuss_procedures.id (ELEMENTO PRINCIPAL)
    price_table_id INT NOT NULL,                                -- FK -> price_tables.id (CONVÊNIO)
    price NUMERIC(10, 2) NOT NULL,                              -- Valor cobrado para este procedimento neste convênio
    co_payment NUMERIC(10, 2) DEFAULT 0.00,                     -- Coparticipação do paciente
    authorized BOOLEAN DEFAULT TRUE,                            -- Cobertura autorizada contratualmente
    coverage_notes TEXT,                                        -- Observações de autorização / regras de perícia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_procedure_prices_proc FOREIGN KEY (procedure_id) REFERENCES tuss_procedures(id) ON DELETE CASCADE,
    CONSTRAINT fk_procedure_prices_table FOREIGN KEY (price_table_id) REFERENCES price_tables(id) ON DELETE CASCADE,
    CONSTRAINT uq_proc_price_table UNIQUE (procedure_id, price_table_id)
);

-- 4. TABELA RELACIONAL: REGRAS DE CORRELAÇÃO ODONTOGRAMA -> PROCEDIMENTO
CREATE TABLE IF NOT EXISTS correlation_rules (
    id SERIAL PRIMARY KEY,                                      -- CHAVE PRIMÁRIA
    procedure_id INT,                                           -- FK -> tuss_procedures.id (ELEMENTO PRINCIPAL)
    procedure_description TEXT NOT NULL,                        -- Descrição do procedimento
    tuss_code VARCHAR(50),                                      -- Código TUSS ANS
    condition_type VARCHAR(50) NOT NULL,                        -- Achado clínico ('carie', 'canal', 'extracao_indicada', etc.)
    price_table_id INT,                                         -- FK -> price_tables.id (opcional para regra específica de plano)
    scope_type VARCHAR(50) DEFAULT 'dente',                     -- 'face' | 'dente' | 'area'
    min_surfaces INT DEFAULT 0,                                 -- Mínimo de faces afetadas
    max_surfaces INT DEFAULT 5,                                 -- Máximo de faces afetadas
    applicable_faces JSONB DEFAULT '[]'::jsonb,                 -- Faces permitidas (['oclusal', 'mesial', etc.])
    teeth_group VARCHAR(50) DEFAULT 'todos',                    -- Grupo dentário ('todos', 'molares', 'sisos', etc.)
    applicable_teeth JSONB DEFAULT '[]'::jsonb,                 -- Dentes específicos ([18, 28, 38, 48])
    aggregation_mode VARCHAR(50) DEFAULT 'dente',               -- 'hemiarco', 'sextante', 'arcada', 'ambas_arcadas'
    applicable_regions JSONB DEFAULT '[]'::jsonb,               -- Regiões específicas (['HASD', 'S1', 'AS', etc.])
    region_code VARCHAR(50),                                    -- Código regional
    suggested_cost NUMERIC(10, 2),                              -- Custo referencial
    specialty VARCHAR(150),                                     -- Especialidade clínica
    notes TEXT,                                                 -- Observações clínicas
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_correlation_proc FOREIGN KEY (procedure_id) REFERENCES tuss_procedures(id) ON DELETE CASCADE,
    CONSTRAINT fk_correlation_price_table FOREIGN KEY (price_table_id) REFERENCES price_tables(id) ON DELETE SET NULL
);

-- 5. ÍNDICES DE PERFORMANCE RELACIONAL
CREATE INDEX IF NOT EXISTS idx_tuss_code ON tuss_procedures(code);
CREATE INDEX IF NOT EXISTS idx_tuss_specialty ON tuss_procedures(specialty);
CREATE INDEX IF NOT EXISTS idx_tuss_scope ON tuss_procedures(scope_type);
CREATE INDEX IF NOT EXISTS idx_proc_prices_proc ON procedure_prices(procedure_id);
CREATE INDEX IF NOT EXISTS idx_proc_prices_table ON procedure_prices(price_table_id);
CREATE INDEX IF NOT EXISTS idx_correlation_proc ON correlation_rules(procedure_id);
CREATE INDEX IF NOT EXISTS idx_correlation_condition ON correlation_rules(condition_type);
CREATE INDEX IF NOT EXISTS idx_correlation_scope ON correlation_rules(scope_type);
