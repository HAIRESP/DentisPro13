import { DocumentVariableDefinition, CustomDocumentTemplate } from '../types';

export const RELATIONAL_DOCUMENT_VARIABLES: DocumentVariableDefinition[] = [
  // PACIENTE
  {
    placeholder: '{{NOME_PACIENTE}}',
    label: 'Nome do Paciente',
    dbPath: 'patients.name',
    category: 'paciente',
    description: 'Nome completo do paciente conforme o cadastro no banco de dados',
    exampleValue: 'Ana Silva Santos'
  },
  {
    placeholder: '{{CPF_PACIENTE}}',
    label: 'CPF do Paciente',
    dbPath: 'patients.cpf',
    category: 'paciente',
    description: 'Número de CPF formatado (000.000.000-00)',
    exampleValue: '123.456.789-00'
  },
  {
    placeholder: '{{RG_PACIENTE}}',
    label: 'RG do Paciente',
    dbPath: 'patients.rg',
    category: 'paciente',
    description: 'Registro Geral (RG) e órgão emissor do paciente',
    exampleValue: '12.345.678-9 SSP/SP'
  },
  {
    placeholder: '{{DATA_NASCIMENTO_PACIENTE}}',
    label: 'Data de Nascimento',
    dbPath: 'patients.birth_date',
    category: 'paciente',
    description: 'Data de nascimento do paciente (DD/MM/AAAA)',
    exampleValue: '14/05/1992'
  },
  {
    placeholder: '{{IDADE_PACIENTE}}',
    label: 'Idade do Paciente',
    dbPath: 'patients.age (calculado)',
    category: 'paciente',
    description: 'Idade cronológica calculada automaticamente em anos',
    exampleValue: '34 anos'
  },
  {
    placeholder: '{{ENDERECO_PACIENTE}}',
    label: 'Endereço Completo do Paciente',
    dbPath: 'patients.street, number, neighborhood, city, state, cep',
    category: 'paciente',
    description: 'Endereço residencial completo do paciente',
    exampleValue: 'Av. Paulista, 1500 - Apt 42, Bela Vista, São Paulo - SP, CEP: 01310-200'
  },
  {
    placeholder: '{{CONVENIO_PACIENTE}}',
    label: 'Plano de Saúde / Convênio',
    dbPath: 'patients.health_insurance',
    category: 'paciente',
    description: 'Nome do plano de saúde ou convênio odontológico',
    exampleValue: 'Unimed Odonto'
  },
  {
    placeholder: '{{CARTEIRA_CONVENIO}}',
    label: 'Número da Carteira do Convênio',
    dbPath: 'patients.insurance_number',
    category: 'paciente',
    description: 'Número de identificação do plano de saúde',
    exampleValue: '88776655'
  },

  // PROFISSIONAL
  {
    placeholder: '{{NOME_DENTISTA}}',
    label: 'Nome do Cirurgião-Dentista',
    dbPath: 'professionals.name / users.name',
    category: 'profissional',
    description: 'Nome do profissional responsável com título de Doutor(a)',
    exampleValue: 'Dr. Lucas Mendes'
  },
  {
    placeholder: '{{CRO_DENTISTA}}',
    label: 'Inscrição no Conselho (CRO)',
    dbPath: 'professionals.cro',
    category: 'profissional',
    description: 'Número do CRO e sigla do estado (ex: CRO/SP 123456)',
    exampleValue: 'CRO/SP 123456'
  },
  {
    placeholder: '{{ESPECIALIDADE_DENTISTA}}',
    label: 'Especialidade Odontológica',
    dbPath: 'professionals.specialty',
    category: 'profissional',
    description: 'Especialidade odontológica registrada no conselho',
    exampleValue: 'Implantodontia & Reabilitação Oral'
  },

  // CLÍNICA
  {
    placeholder: '{{NOME_CLINICA}}',
    label: 'Nome da Clínica / Consultório',
    dbPath: 'clinic_units.name',
    category: 'clinica',
    description: 'Razão social ou nome fantasia da unidade da clínica',
    exampleValue: 'DentisPro Odontologia Integrada'
  },
  {
    placeholder: '{{CNPJ_CLINICA}}',
    label: 'CNPJ da Clínica',
    dbPath: 'clinic_units.cnpj',
    category: 'clinica',
    description: 'Cadastro Nacional da Pessoa Jurídica da clínica (Omitido em Controle Especial)',
    exampleValue: '22.144.932/0001-40'
  },
  {
    placeholder: '{{EPAO_CLINICA}}',
    label: 'Registro EPAO da Clínica',
    dbPath: 'clinic_units.cro_technical_manager',
    category: 'clinica',
    description: 'Inscrição de Entidade de Prestação de Assistência Odontológica',
    exampleValue: 'EPAO 99999'
  },
  {
    placeholder: '{{ENDERECO_CLINICA}}',
    label: 'Endereço da Clínica',
    dbPath: 'clinic_units.street, number, city, state',
    category: 'clinica',
    description: 'Endereço físico e cidade da unidade ativa',
    exampleValue: 'Av. Paulista, 1500 - Conjunto 304, São Paulo - SP'
  },
  {
    placeholder: '{{TELEFONE_CLINICA}}',
    label: 'Telefone / WhatsApp da Clínica',
    dbPath: 'clinic_units.phone',
    category: 'clinica',
    description: 'Telefone comercial e contato do consultório',
    exampleValue: '(11) 3251-4000'
  },

  // ATENDIMENTO E DOCUMENTO
  {
    placeholder: '{{CID_CODIGO_E_DESCRICAO}}',
    label: 'Código e Diagnóstico CID-10',
    dbPath: 'documents.cid',
    category: 'documento',
    description: 'Código CID-10 e descrição patológica odontológica',
    exampleValue: 'K02.1 - Cárie da dentina / Lesão profunda'
  },
  {
    placeholder: '{{DIAS_AFASTAMENTO}}',
    label: 'Dias de Afastamento',
    dbPath: 'documents.days_off',
    category: 'documento',
    description: 'Quantidade de dias estipulada para repouso e licença médica',
    exampleValue: '3 (três)'
  },
  {
    placeholder: '{{HORARIO_ATENDIMENTO}}',
    label: 'Período / Horário de Atendimento',
    dbPath: 'appointments.time',
    category: 'atendimento',
    description: 'Horário de início e término da consulta médica/odontológica',
    exampleValue: '09:00 às 10:30 horas'
  },
  {
    placeholder: '{{NOME_PROCEDIMENTO}}',
    label: 'Procedimento Realizado / Agendado',
    dbPath: 'appointments.procedure_name / treatment_plans.title',
    category: 'atendimento',
    description: 'Descrição do procedimento odontológico realizado',
    exampleValue: 'Exodontia de Terceiro Molar Incluso (Elemento 38)'
  },
  {
    placeholder: '{{MOTIVO_DECLARACAO}}',
    label: 'Motivo da Consulta / Acompanhamento',
    dbPath: 'documents.reason',
    category: 'documento',
    description: 'Finalidade do comparecimento ou acompanhamento do paciente',
    exampleValue: 'realização de procedimento cirúrgico odontológico e consulta de retorno'
  },
  {
    placeholder: '{{NOME_MEDICAMENTO}}',
    label: 'Medicamento Prescrito e Posologia',
    dbPath: 'prescriptions.medications',
    category: 'documento',
    description: 'Nome, concentração, apresentação e modo de usar do fármaco',
    exampleValue: 'Amoxicilina 500mg — Tomar 1 cápsula via oral de 8 em 8 horas por 7 dias'
  },
  {
    placeholder: '{{DATA_ATUAL}}',
    label: 'Data de Emissão por Extenso',
    dbPath: 'current_date (sistema)',
    category: 'documento',
    description: 'Cidade e data de emissão formatada por extenso',
    exampleValue: 'São Paulo - SP, 09 de Agosto de 2026'
  }
];

export const INITIAL_DOCUMENT_TEMPLATES: CustomDocumentTemplate[] = [
  {
    id: 'atestado_medico',
    category: 'atestado',
    title: 'Atestado Odontológico Padrão',
    subtitle: 'Atestado de licença e afastamento das atividades laborais / escolares',
    description: 'Modelo oficial para concessão de dias de repouso por motivo de tratamento odontológico.',
    templateText: `ATESTADO ODONTOLÓGICO

Atesto, para os devidos fins de direito, que o(a) paciente {{NOME_PACIENTE}}, inscrito(a) no CPF sob o nº {{CPF_PACIENTE}}, esteve sob meus cuidados profissionais no dia de hoje, no período das {{HORARIO_ATENDIMENTO}}, necessitando de {{DIAS_AFASTAMENTO}} dia(s) de repouso e afastamento de suas atividades laborais e escolares a partir desta data, por motivo de tratamento odontológico.

Diagnóstico Odontológico (CID-10): {{CID_CODIGO_E_DESCRICAO}}

{{DATA_ATUAL}}`
  },
  {
    id: 'declaracao_comparecimento',
    category: 'declaracao',
    title: 'Declaração de Comparecimento',
    subtitle: 'Comprovante de presença para fins de abono de faltas ou justificativa',
    description: 'Comprova que o paciente ou acompanhante esteve na clínica durante o período especificado.',
    templateText: `DECLARAÇÃO DE COMPARECIMENTO

Declaro para os devidos fins de comprovação que o(a) paciente {{NOME_PACIENTE}}, portador(a) do CPF nº {{CPF_PACIENTE}}, compareceu a esta unidade odontológica no dia de hoje, permanecendo em atendimento profissional no período das {{HORARIO_ATENDIMENTO}}, para {{MOTIVO_DECLARACAO}}.

O presente documento é válido como comprovante de presença para o período acima citado.

{{DATA_ATUAL}}`
  },
  {
    id: 'receituario_simples',
    category: 'receita',
    title: 'Receituário Terapêutico Odontológico',
    subtitle: 'Prescrição de analgésicos, anti-inflamatórios e antibióticos de uso comum',
    description: 'Formulário padrão para prescrição de medicamentos orais com instruções detalhadas.',
    templateText: `RECEITUÁRIO ODONTOLÓGICO

Paciente: {{NOME_PACIENTE}}
CPF: {{CPF_PACIENTE}}

USO INTERNO (VIA ORAL):

1) {{NOME_MEDICAMENTO}}

Orientações e Recomendações:
- Respeitar rigorosamente os horários e a duração total do tratamento prescrito.
- Em caso de reações alérgicas, suspenda o uso e entre em contato imediatamente com a clínica: {{TELEFONE_CLINICA}}.

{{DATA_ATUAL}}`
  },
  {
    id: 'receituario_controle_especial',
    category: 'receita',
    title: 'Receituário de Controle Especial (Anvisa)',
    subtitle: 'Via do Farmacêutico / Via do Paciente (Portaria 344/98 MS)',
    description: 'Modelo em conformidade com as normas sanitárias da Anvisa para substâncias sujeitas a controle especial.',
    templateText: `RECEITUÁRIO DE CONTROLE ESPECIAL

IDENTIFICAÇÃO DO EMITENTE:
{{NOME_DENTISTA}} — {{CRO_DENTISTA}}
{{ESPECIALIDADE_DENTISTA}}
{{NOME_CLINICA}}
{{ENDERECO_CLINICA}} • Tel: {{TELEFONE_CLINICA}}

PACIENTE:
Nome: {{NOME_PACIENTE}}
CPF: {{CPF_PACIENTE}}
Endereço: {{ENDERECO_PACIENTE}}

PRESCRIÇÃO:
{{NOME_MEDICAMENTO}}

{{DATA_ATUAL}}`
  },
  {
    id: 'laudo_odontologico',
    category: 'solicitacao',
    title: 'Laudo Técnico e Justificativa Clínica',
    subtitle: 'Parecer para convênios, auditoria e perícia odontológica',
    description: 'Documento fundamentado para auditoria e aprovação de procedimentos em planos de saúde.',
    templateText: `LAUDO TÉCNICO ODONTOLÓGICO

Ao Departamento de Regulação / Auditoria do Convênio {{CONVENIO_PACIENTE}}

Paciente: {{NOME_PACIENTE}} | Carteira: {{CARTEIRA_CONVENIO}} | CPF: {{CPF_PACIENTE}}

Apresento o parecer técnico-odontológico informando que, após minuciosa avaliação clínica e análise de exames complementares de imagem, constatou-se a necessidade imperiosa da realização do procedimento: {{NOME_PROCEDIMENTO}}.

Diagnóstico Nosológico (CID-10): {{CID_CODIGO_E_DESCRICAO}}

JUSTIFICATIVA CLÍNICA:
O elemento dental supracitado apresenta comprometimento que justifica o tratamento indicado para sanar o quadro sintomático, eliminar foco infeccioso/doloroso e restabelecer a integridade estomatognática, prevenção de perdas ósseas e saúde bucal do paciente.

Coloco-me à disposição para eventuais esclarecimentos técnicos adicionais.

{{DATA_ATUAL}}`
  },
  {
    id: 'termo_consentimento_tcle',
    category: 'declaracao',
    title: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
    subtitle: 'Autorização formal do paciente para execução de procedimentos odontológicos',
    description: 'Termo de responsabilidade e ciência das etapas clínicas, riscos e pós-operatório.',
    templateText: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

Eu, {{NOME_PACIENTE}}, portador(a) do CPF nº {{CPF_PACIENTE}}, residente em {{ENDERECO_PACIENTE}}, declaro que fui devidamente informado(a) e esclarecido(a) pelo(a) cirurgião-dentista {{NOME_DENTISTA}} ({{CRO_DENTISTA}}) sobre o diagnóstico, objetivos, benefícios, riscos potenciais e alternativas do procedimento odontológico: {{NOME_PROCEDIMENTO}}.

Declaro ainda que:
1. Tive a oportunidade de fazer todas as perguntas necessárias e recebi respostas claras e compreensíveis.
2. Fui orientado(a) sobre a importância de seguir as recomendações pré e pós-operatórias para o sucesso do tratamento.
3. Compreendo que a odontologia é uma ciência que busca os melhores resultados, estando os procedimentos sujeitos a variações biológicas individuais.

Diante do exposto, autorizo livremente a realização do tratamento na clínica {{NOME_CLINICA}}.

{{DATA_ATUAL}}`
  },
  {
    id: 'solicitacao_exames',
    category: 'solicitacao',
    title: 'Solicitação de Exames Complementares',
    subtitle: 'Pedido de radiografias, tomografia computada e exames de sangue',
    description: 'Requisição oficial de exames imagiológicos ou laboratoriais com hipótese diagnóstica.',
    templateText: `SOLICITAÇÃO DE EXAMES COMPLEMENTARES

Ao Centro de Radiologia e Diagnóstico Por Imagem / Laboratório

Solicito para o(a) paciente {{NOME_PACIENTE}}, inscrito(a) no CPF nº {{CPF_PACIENTE}}, a realização dos seguintes exames:

1. Radiografia Panorâmica dos Maxilares com Traçado Ortodôntico/Cirúrgico.
2. Tomografia Cone Beam (CBCT) da região de interesse.
3. Hemograma Completo, Coagulograma (TAP/KTTP) e Glicemia em Jejum.

Hipótese Diagnóstica / Indicação Clínica:
Planejamento pré-operatório para {{NOME_PROCEDIMENTO}} (CID-10: {{CID_CODIGO_E_DESCRICAO}}).

{{DATA_ATUAL}}`
  },
  {
    id: 'orientacoes_pos_operatorias',
    category: 'declaracao',
    title: 'Guia de Orientações Pós-Operatórias',
    subtitle: 'Recomendações e cuidados para cicatrização e recuperação do paciente',
    description: 'Instruções de repouso, alimentação, compressas de gelo e higiene pós-cirúrgica.',
    templateText: `RECOMENDAÇÕES E ORIENTAÇÕES PÓS-OPERATÓRIAS

Prezado(a) {{NOME_PACIENTE}}, para garantir uma recuperação tranquila e segura após a realização do procedimento {{NOME_PROCEDIMENTO}}, siga atentamente as instruções abaixo:

1. REPOUSO E CUIDADOS INICIAIS (PRIMEIRAS 24 HORAS):
- Aplique bolsa de gelo na face (lado operado) por 20 minutos com intervalos de 10 minutos nas primeiras 24 horas.
- Mantenha repouso físico e evite exposição ao sol e ambientes quentes.
- NÃO faça bochechos, não cuspa e não use canudo para ingerir líquidos (o vácuo estimula o sangramento).

2. ALIMENTAÇÃO:
- Nas primeiras 24 a 48 horas, consuma apenas alimentos frios, líquidos ou pastosos (sopas frias, açaí, sorvetes, iogurtes, sucos).
- Evite alimentos duros, quentes, crocantes ou temperados/ácidos.

3. HIGIENIZAÇÃO BUCAL:
- Mantenha a escovação suave dos dentes, sem tocar com força no local operado ou nos pontos de sutura.

4. MEDICAÇÃO:
- Tome os medicamentos prescritos rigorosamente nos horários e dosagens indicados.

Em caso de dúvidas ou urgências, entre em contato: {{TELEFONE_CLINICA}} — {{NOME_CLINICA}}

{{DATA_ATUAL}}`
  }
];
