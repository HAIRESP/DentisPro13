import { TUSSProcedure } from '../types';

/**
 * Tabela 22 - Grupo 81: Consultas, Diagnóstico, Urgência e Radiologia Odontológica
 * Rol ANS (RN 211/2010 alt RN 262/2011)
 */
export const TUSS_PROCEDURES_DIAGNOSTICS: TUSSProcedure[] = [
  {
    code: '81000014',
    description: 'Condicionamento em Odontologia',
    specialty: 'Odontopediatria & Pacientes Especiais',
    suggestedCost: 150,
    rolAns: true,
    rolAnsDescription: 'CONDICIONAMENTO EM ODONTOLOGIA (COM DIRETRIZ DE UTILIZAÇÃO)',
    subgroup: 'CONSULTAS, VISITAS E AVALIAÇÕES',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura mínima obrigatória de 03 (três) sessões/ano para beneficiários com comportamento não cooperativo/de difícil manejo, conforme indicação do cirurgião-dentista assistente.',
    fullDescription: 'Manejo comportamental e adaptação psicológica do paciente pediátrico ou com necessidades especiais para viabilizar o atendimento clínico seguro e humanizado.'
  },
  {
    code: '81000030',
    description: 'Consulta odontológica',
    specialty: 'Diagnóstico & Clínica Geral',
    suggestedCost: 120,
    rolAns: true,
    rolAnsDescription: 'CONSULTA ODONTOLÓGICA INICIAL',
    subgroup: 'CONSULTAS, VISITAS E AVALIAÇÕES',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Exame clínico geral intra e extraoral, anamnese detalhada, avaliação de histórico de saúde sistêmica e bucal.'
  },
  {
    code: '81000049',
    description: 'Consulta odontológica de Urgência',
    specialty: 'Urgência & Emergência',
    suggestedCost: 180,
    rolAns: true,
    rolAnsDescription: 'CONSULTA ODONTOLÓGICA INICIAL',
    subgroup: 'CONSULTAS, VISITAS E AVALIAÇÕES',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Atendimento de urgência para alívio de dor aguda, hemorragia, infecção odontogênica ou trauma dentofacial em horário regular.'
  },
  {
    code: '81000057',
    description: 'Consulta odontológica de Urgência 24 hs',
    specialty: 'Urgência & Emergência',
    suggestedCost: 250,
    rolAns: true,
    rolAnsDescription: 'CONSULTA ODONTOLÓGICA INICIAL',
    subgroup: 'CONSULTAS, VISITAS E AVALIAÇÕES',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Atendimento de urgência e emergência odontológica prestado em regime de plantão 24 horas.'
  },
  {
    code: '81000065',
    description: 'Consulta odontológica para avaliação técnica de auditoria',
    specialty: 'Auditoria Odontológica',
    suggestedCost: 130,
    rolAns: true,
    rolAnsDescription: 'CONSULTA ODONTOLÓGICA PARA AVALIAÇÃO TÉCNICA DE AUDITORIA',
    subgroup: 'CONSULTAS, VISITAS E AVALIAÇÕES',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Perícia clínica presencial inicial ou final realizada por cirurgião-dentista auditor para conferência de elegibilidade e conformidade dos procedimentos.'
  },
  {
    code: '81000073',
    description: 'Fotografia',
    specialty: 'Ortodontia & Radiologia',
    suggestedCost: 40,
    rolAns: false,
    subgroup: 'MÉTODOS DIAGNÓSTICOS',
    fullDescription: 'Registro fotográfico digital extraoral e intraoral padronizado para diagnóstico, planejamento estético e prontuário.'
  },
  {
    code: '81000081',
    description: 'Mapeamento de retina',
    specialty: 'Diagnóstico Complementar',
    suggestedCost: 160,
    rolAns: false,
    subgroup: 'OUTROS EXAMES',
    fullDescription: 'Exame oftalmológico especializado complementar.'
  },
  {
    code: '81000138',
    description: 'Modelos de gesso',
    specialty: 'Ortodontia & Prótese',
    suggestedCost: 80,
    rolAns: false,
    subgroup: 'MÉTODOS DIAGNÓSTICOS',
    fullDescription: 'Modelos anatômicos e de estudo em gesso especial tipo III/IV obtidos a partir de moldagem intraoral.'
  },
  {
    code: '81000146',
    description: 'Modelos ortodônticos',
    specialty: 'Ortodontia',
    suggestedCost: 90,
    rolAns: false,
    subgroup: 'MÉTODOS DIAGNÓSTICOS',
    fullDescription: 'Par de modelos ortodônticos zocalados para análise de discrepância de modelos e planejamento ortodôntico.'
  },
  {
    code: '81000154',
    description: 'Panorâmica especial para ATM',
    specialty: 'Radiologia & Imaginologia',
    suggestedCost: 110,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Radiografia panorâmica especializada em boca aberta e boca fechada para estudo dinâmico e comparativo das cabeças da mandíbula (côndilos).'
  },
  {
    code: '81000162',
    description: 'Planejamento em Odontologia',
    specialty: 'Diagnóstico & Reabilitação Oral',
    suggestedCost: 150,
    rolAns: true,
    rolAnsDescription: 'PLANEJAMENTO EM ODONTOLOGIA',
    subgroup: 'CONSULTAS, VISITAS E AVALIAÇÕES',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Elaboração detalhada de plano de tratamento interdisciplinar, análise estética/funcional e orçamento com consentimento informado.'
  },
  {
    code: '81000197',
    description: 'Radiografia Bite-wing (interproximal)',
    specialty: 'Radiologia Odontológica',
    suggestedCost: 35,
    rolAns: true,
    rolAnsDescription: 'RADIOGRAFIA INTERPROXIMAL - BITE-WING',
    subgroup: 'RADIOGRAFIAS INTRA-ORAIS',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Tomada radiográfica com aleta de mordida bilateral para detecção precoce de cáries interproximais e cristas ósseas alveolares.'
  },
  {
    code: '81000200',
    description: 'Radiografia da ATM',
    specialty: 'Radiologia & DTM',
    suggestedCost: 80,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Incidências radiográficas transcranianas ou transfaríngeas para análise da anatomia e mobilidade da Articulação Temporomandibular.'
  },
  {
    code: '81000219',
    description: 'Radiografia da mão e punho (carpal)',
    specialty: 'Ortodontia & Radiologia',
    suggestedCost: 95,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Radiografia carpal para determinação do estágio de maturação esquelética e surto de crescimento puberal em pacientes em fase ortodôntica.'
  },
  {
    code: '81000260',
    description: 'Radiografia oclusal',
    specialty: 'Radiologia Odontológica',
    suggestedCost: 45,
    rolAns: true,
    rolAnsDescription: 'RADIOGRAFIA OCLUSAL',
    subgroup: 'RADIOGRAFIAS INTRA-ORAIS',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Incidência intraoral total superior ou inferior para avaliação de dentes inclusos, sialolitíases no assoalho bucal e fraturas palatinas/mandibulares.'
  },
  {
    code: '81000278',
    description: 'Radiografia panorâmica de mandíbula/maxila (ortopantomografia)',
    specialty: 'Radiologia Odontológica',
    suggestedCost: 90,
    rolAns: true,
    rolAnsDescription: 'RADIOGRAFIA PANORÂMICA DE MANDÍBULA/MAXILA (ORTOPANTOMOGRAFIA) - COM DIRETRIZ DE UTILIZAÇÃO',
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória quando preenchido pelo menos um dos seguintes critérios, conforme indicação do cirurgião-dentista assistente: a. pacientes com dentes inclusos/impactados, anodontias ou dentes supranumerários; b. pacientes portadores de lesões ósseas nos ossos maxilares; c. pacientes com traumatismo bucomaxilofacial; d. pacientes com necessidade de avaliação ortodôntica/ortopédica ou com anomalias de desenvolvimento craniofacial; e. pacientes com necessidade de avaliação do padrão de reabsorção óssea periodontal generalizada.',
    fullDescription: 'Exame radiográfico extraoral panorâmico abrangendo todo o complexo maxilomandibular, dentes, seios maxilares e articulações têmporo-mandibulares.'
  },
  {
    code: '81000294',
    description: 'Radiografia panorâmica de mandíbula/maxila (ortopantomografia) com traçado cefalométrico',
    specialty: 'Radiologia & Ortodontia',
    suggestedCost: 120,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Ortopantomografia digital acompanhada de laudo cefalométrico ou medidas lineares/angulares associadas.'
  },
  {
    code: '81000308',
    description: 'Radiografia periapical',
    specialty: 'Radiologia Odontológica',
    suggestedCost: 35,
    rolAns: true,
    rolAnsDescription: 'RADIOGRAFIA PERIAPICAL',
    subgroup: 'RADIOGRAFIAS INTRA-ORAIS',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Exame intraoral periapical pela técnica do paralelismo com posicionador para visualização detalhada da coroa, raiz e espaço periodontal.'
  },
  {
    code: '81000316',
    description: 'Radiografia póstero-anterior',
    specialty: 'Radiologia & Imaginologia',
    suggestedCost: 85,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Incidência craniomaxilofacial póstero-anterior (PA) de face para avaliação de assimetrias craniofaciais e fraturas zigomático-mandibulares.'
  },
  {
    code: '81000324',
    description: 'Radiografia semi-axial (Waters)',
    specialty: 'Radiologia & Imaginologia',
    suggestedCost: 85,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Incidência occípito-mento para visualização dos seios maxilares, rebordos orbitários inferiores e ossos próprios do nariz.'
  },
  {
    code: '81000472',
    description: 'Telerradiografia',
    specialty: 'Radiologia & Ortodontia',
    suggestedCost: 90,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Telerradiografia lateral de crânio padronizada com cefalostato para diagnóstico de padrão esquelético facial.'
  },
  {
    code: '81000480',
    description: 'Telerradiografia com traçado cefalométrico',
    specialty: 'Radiologia & Ortodontia',
    suggestedCost: 130,
    rolAns: false,
    subgroup: 'RADIOGRAFIAS EXTRA-ORAIS',
    fullDescription: 'Telerradiografia cefalométrica acompanhada de análise informatizada ou manual das grandezas esqueléticas, dentárias e tegumentares.'
  },
  {
    code: '81000510',
    description: 'Tomografia computadorizada por feixe cônico – cone beam',
    specialty: 'Radiologia & Tomografia 3D',
    suggestedCost: 350,
    rolAns: false,
    subgroup: 'TOMOGRAFIA COMPUTADORIZADA',
    fullDescription: 'Exame tomográfico tridimensional volumétrico de alta resolução (Cone Beam CT) para planejamento de implantes, cirurgia guiada e endodontia complexa.'
  },
  {
    code: '81000529',
    description: 'Tomografia convencional – linear ou multi-direcional',
    specialty: 'Radiologia & Imaginologia',
    suggestedCost: 250,
    rolAns: false,
    subgroup: 'TOMOGRAFIA',
    fullDescription: 'Tomografia médica convencional de cortes axiais e coronais para avaliação da região maxilofacial.'
  },
  {
    code: '81000537',
    description: 'Traçado Cefalométrico',
    specialty: 'Ortodontia & Radiologia',
    suggestedCost: 70,
    rolAns: false,
    subgroup: 'MÉTODOS DIAGNÓSTICOS',
    fullDescription: 'Desenho anatômico e cálculo de ângulos e distâncias cefalométricas para estudo ortodôntico ou cirúrgico ortognático.'
  }
];
