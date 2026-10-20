export const PROCEDURE_PARAMETERS = [
  {
    "key": "code",
    "category": "1. Identificação Técnica & Clínica",
    "label": "Código TUSS",
    "description": "Código oficial da Terminologia Unificada da Saúde Suplementar exigido pelas operadoras.",
    "patientOnly": false
  },
  {
    "key": "description",
    "category": "1. Identificação Técnica & Clínica",
    "label": "Descrição do Procedimento",
    "description": "Nomenclatura padronizada da técnica que será executada no paciente.",
    "patientOnly": false
  },
  {
    "key": "region",
    "category": "1. Identificação Técnica & Clínica",
    "label": "Região / Elemento Dental",
    "description": "Identificação exata do dente (numeração do odontograma) ou da face/região da boca.",
    "patientOnly": false
  },
  {
    "key": "diagnosis",
    "category": "2. Parâmetros Clínicos & Diagnósticos",
    "label": "Diagnóstico Base (CID-10 / CID-11)",
    "description": "Código internacional de doenças bucais associado à necessidade real do tratamento.",
    "patientOnly": false
  },
  {
    "key": "anesthesia",
    "category": "2. Parâmetros Clínicos & Diagnósticos",
    "label": "Anestesiologia Vinculada (Anexar PAIO)",
    "description": "Tipo de anestésico, técnica aplicada e limitação de tubetes baseada no histórico de saúde.",
    "patientOnly": false
  },
  {
    "key": "materials",
    "category": "2. Parâmetros Clínicos & Diagnósticos",
    "label": "Lista de Materiais",
    "description": "Lista de Materiais necessários para a execução segura do procedimento completo.",
    "patientOnly": false
  },
  {
    "key": "chairTime",
    "category": "2. Parâmetros Clínicos & Diagnósticos",
    "label": "Tempo Estimado de Cadeira",
    "description": "Tempo em minutos necessário para a execução segura do procedimento completo.",
    "patientOnly": false
  },
  {
    "key": "fixedCost",
    "category": "3. Estrutura Financeira & Custos",
    "label": "Custo Operacional Fixo Direto",
    "description": "Custo do minuto/hora clínica consumido pelo procedimento (aluguel, equipe, depreciação).",
    "patientOnly": false
  },
  {
    "key": "variableCost",
    "category": "3. Estrutura Financeira & Custos",
    "label": "Custo Variável Próprio (Insumos/EPIs)",
    "description": "Valor exato consumido em materiais odontológicos descartáveis e de consumo específico.",
    "patientOnly": false
  },
  {
    "key": "thirdPartyCost",
    "category": "3. Estrutura Financeira & Custos",
    "label": "Custo de Terceiros / Laboratório",
    "description": "Honorários de profissionais externos (ex: endodontista parceiro) ou custo do laboratório de prótese.",
    "patientOnly": false
  },
  {
    "key": "price",
    "category": "3. Estrutura Financeira & Custos",
    "label": "Valor Final de Venda (Particular)",
    "description": "Preço calculado cobrado ao cliente particular para garantir a margem de lucro ideal.",
    "patientOnly": false
  },
  {
    "key": "predictedComplications",
    "category": "4. Gestão de Riscos & Intercorrências",
    "label": "Intercorrências Clínicas Mapeadas",
    "description": "Lista de intercorrências previsíveis (ex: fratura de instrumento, hemorragia, sensibilidade).",
    "patientOnly": false
  },
  {
    "key": "emergencyProtocol",
    "category": "4. Gestão de Riscos & Intercorrências",
    "label": "Protocolo de Urgência / Mitigação",
    "description": "Ação imediata padronizada a ser tomada em caso de intercorrência clínica.",
    "patientOnly": false
  },
  {
    "key": "financialRisk",
    "category": "4. Gestão de Riscos & Intercorrências",
    "label": "Margem de Risco Financeiro",
    "description": "Percentual financeiro embutido no preço para cobrir custos de retrabalhos ou retornos.",
    "patientOnly": false
  },
  {
    "key": "eligibility",
    "category": "5. Auditoria de Convênio & Faturamento",
    "label": "Status de Elegibilidade & Carência",
    "description": "Validação prévia no portal da operadora se o plano cobre o ato na data da execução.",
    "patientOnly": true
  },
  {
    "key": "evidence",
    "category": "5. Auditoria de Convênio & Faturamento",
    "label": "Evidências Exigidas (Auditoria)(Arquivos)",
    "description": "Exigências de imagens para aprovação e faturamento (Ex: Radiografia Pré/Pós, fotos intraorais).",
    "patientOnly": false
  },
  {
    "key": "recurrence",
    "category": "5. Auditoria de Convênio & Faturamento",
    "label": "Prazo Mínimo de Recorrência",
    "description": "Tempo de garantia exigido pelo convênio antes de permitir cobrar o mesmo dente novamente.",
    "patientOnly": false
  },
  {
    "key": "technique",
    "category": "6. Documentação & Pós-Procedimento",
    "label": "Técnica e Materiais",
    "description": "Descrição obrigatória da técnica de execução e de materiais empregados.",
    "patientOnly": false
  },
  {
    "key": "actualComplications",
    "category": "6. Documentação & Pós-Procedimento",
    "label": "Intercorrências Clínicas Ocorridas",
    "description": "Lista de intercorrências ocorridas (ex: fratura de instrumento, hemorragia, sensibilidade).",
    "patientOnly": true
  },
  {
    "key": "evolutionLots",
    "category": "6. Documentação & Pós-Procedimento",
    "label": "Evolução Clínica e Lotes",
    "description": "Anotação obrigatória da evolução do tratamento no prontuário incluindo lotes de materiais.",
    "patientOnly": true
  },
  {
    "key": "consent",
    "category": "6. Documentação & Pós-Procedimento",
    "label": "Termo de Consentimento (TCLE)",
    "description": "Status de assinatura do documento de consentimento informado e esclarecido do paciente.",
    "patientOnly": true
  }
] as const;
