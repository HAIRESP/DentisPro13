import { TUSSProcedure } from '../types';

/**
 * Tabela 22 - Grupos 854, 855, 86: Prótese Dentária, DTM/Oclusão e Ortodontia/Ortopedia Facial
 * Rol ANS (RN 211/2010 alt RN 262/2011)
 */
export const TUSS_PROCEDURES_PROSTHETICS_ORTHO: TUSSProcedure[] = [
  // ==========================================
  // GRUPO 854: PRÓTESE DENTÁRIA
  // ==========================================
  {
    code: '85400017',
    description: 'Ajuste Oclusal',
    specialty: 'Prótese & Oclusão',
    suggestedCost: 150,
    rolAns: true,
    rolAnsDescription: 'AJUSTE OCLUSAL',
    subgroup: 'TERAPÊUTICA',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Desgastes seletivos em esmalte ou superfícies de restaurações com pontas diamantadas finas e papel articular de 12 micras para harmonização oclusal e eliminação de contatos prematuros e interferências.'
  },
  {
    code: '85400025',
    description: 'Conserto em prótese parcial removível',
    specialty: 'Prótese Dentária',
    suggestedCost: 220,
    rolAns: false,
    subgroup: 'PRÓTESE REMOVÍVEL',
    fullDescription: 'Reparo laboratorial ou em consultório de fratura de acrílico ou substituição/soldagem de grampo retentor quebrado.'
  },
  {
    code: '85400033',
    description: 'Conserto em prótese total',
    specialty: 'Prótese Dentária',
    suggestedCost: 200,
    rolAns: false,
    subgroup: 'PRÓTESE TOTAL',
    fullDescription: 'Reunião e acrilização com resina autopolimerizável de base de prótese total fraturada.'
  },
  {
    code: '85400041',
    description: 'Coroa de acetato em dente permanente',
    specialty: 'Dentística & Prótese',
    suggestedCost: 250,
    rolAns: true,
    rolAnsDescription: 'REABILITAÇÃO COM COROA DE ACETATO, AÇO OU POLICARBONATO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória quando preenchido pelo menos um dos seguintes critérios, conforme indicação do cirurgião-dentista assistente: a. dentes decíduos não passíveis de reconstrução por meio direto; b. dentes permanentes em pacientes não cooperativos/de difícil manejo.',
    fullDescription: 'Restauração com matriz anatômica pré-fabricada de acetato e resina composta em dente permanente jovem.'
  },
  {
    code: '85400050',
    description: 'Coroa de aço em dente permanente',
    specialty: 'Dentística & Prótese',
    suggestedCost: 260,
    rolAns: true,
    rolAnsDescription: 'REABILITAÇÃO COM COROA DE ACETATO, AÇO OU POLICARBONATO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória quando preenchido pelo menos um dos seguintes critérios, conforme indicação do cirurgião-dentista assistente: a. dentes decíduos não passíveis de reconstrução por meio direto; b. dentes permanentes em pacientes não cooperativos/de difícil manejo.',
    fullDescription: 'Coroa de aço inoxidável para proteção temporária/transicional de molares permanentes hipoplásicos ou com grande destruição coronária.'
  },
  {
    code: '85400068',
    description: 'Coroa de policarbonato em dente permanente',
    specialty: 'Dentística & Prótese',
    suggestedCost: 250,
    rolAns: true,
    rolAnsDescription: 'REABILITAÇÃO COM COROA DE ACETATO, AÇO OU POLICARBONATO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória quando preenchido pelo menos um dos seguintes critérios, conforme indicação do cirurgião-dentista assistente: a. dentes decíduos não passíveis de reconstrução por meio direto; b. dentes permanentes em pacientes não cooperativos/de difícil manejo.',
    fullDescription: 'Instalação de coroa pré-fabricada termoplástica estética em dente permanente.'
  },
  {
    code: '85400076',
    description: 'Coroa provisória com pino',
    specialty: 'Prótese Dentária',
    suggestedCost: 280,
    rolAns: true,
    rolAnsDescription: 'COROA PROVISÓRIA COM OU SEM PINO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Confecção e cimentação provisória de coroa estética em resina acrílica prensada ou fresada integrada a pino plástico/metálico de sustentação intrarradicular.'
  },
  {
    code: '85400084',
    description: 'Coroa provisória sem pino',
    specialty: 'Prótese Dentária',
    suggestedCost: 220,
    rolAns: true,
    rolAnsDescription: 'COROA PROVISÓRIA COM OU SEM PINO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Coroa acrílica provisória confeccionada de forma direta com resina bisacrílica ou em laboratório para proteção do dente preparado e manutenção do espaço.'
  },
  {
    code: '85400092',
    description: 'Coroa total em cerômero',
    specialty: 'Prótese Dentária',
    suggestedCost: 780,
    rolAns: false,
    subgroup: 'PRÓTESE FIXA',
    fullDescription: 'Coroa total metal-free de polímero com carga cerâmica microparticulada termopolimerizada sob calor e pressão.'
  },
  {
    code: '85400106',
    description: 'Coroa total livre de metal (porcelana pura)',
    specialty: 'Prótese Dentária & Estética',
    suggestedCost: 1400,
    rolAns: false,
    subgroup: 'PRÓTESE FIXA ESTÉTICA',
    fullDescription: 'Coroa total pura em cerâmica vítrea (Dissilicato de Lítio - E.max) ou cerâmica policristalina (Zircônia) fresada em sistema CAD/CAM.'
  },
  {
    code: '85400114',
    description: 'Coroa total metálica',
    specialty: 'Prótese Dentária',
    suggestedCost: 550,
    rolAns: true,
    rolAnsDescription: 'COROA TOTAL METÁLICA (COM DIRETRIZ DE UTILIZAÇÃO)',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória nos dentes pré-molares e molares permanentes com destruição coronária que impossibilite restauração direta, conforme indicação do cirurgião-dentista assistente.',
    fullDescription: 'Coroa total fundida em liga metálica nobre ou não nobre (Ni-Cr, Co-Cr) indicada para dentes posteriores com espaço interoclusal reduzido.'
  },
  {
    code: '85400122',
    description: 'Coroa total metaloplástica',
    specialty: 'Prótese Dentária',
    suggestedCost: 650,
    rolAns: false,
    subgroup: 'PRÓTESE FIXA',
    fullDescription: 'Coroa protética com infraestrutura metálica fundida recoberta por faceta de resina estética.'
  },
  {
    code: '85400130',
    description: 'Coroa total metalocerâmica',
    specialty: 'Prótese Dentária',
    suggestedCost: 950,
    rolAns: false,
    subgroup: 'PRÓTESE FIXA',
    fullDescription: 'Coroa fixa com coping metálico fundido recoberto por estratificação artística de porcelana feldspática dental.'
  },
  {
    code: '85400157',
    description: 'Faceta laminada em cerâmica',
    specialty: 'Dentística & Prótese Estética',
    suggestedCost: 1350,
    rolAns: false,
    subgroup: 'ESTÉTICA DENTAL',
    fullDescription: 'Lente de contato dental ou faceta cerâmica fina cimentada adesivamente na face vestibular do esmalte preparado.'
  },
  {
    code: '85400165',
    description: 'Faceta laminada em cerômero',
    specialty: 'Dentística & Prótese',
    suggestedCost: 650,
    rolAns: false,
    subgroup: 'ESTÉTICA DENTAL',
    fullDescription: 'Lâmina estética em resina composta laboratorial termopolimerizada indireta.'
  },
  {
    code: '85400181',
    description: 'Guia cirúrgico para implante',
    specialty: 'Implantodontia',
    suggestedCost: 450,
    rolAns: false,
    subgroup: 'IMPLANTODONTIA',
    fullDescription: 'Dispositivo protético/tomográfico impresso em 3D ou acrílico para direcionamento das fresas na cirurgia guiada de implantes.'
  },
  {
    code: '85400190',
    description: 'Núcleo de preenchimento',
    specialty: 'Dentística & Prótese',
    suggestedCost: 180,
    rolAns: true,
    rolAnsDescription: 'NÚCLEO DE PREENCHIMENTO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Preenchimento e reconstrução coronária com resina composta de alta resistência ou ionômero de vidro para preparo de dente para prótese.'
  },
  {
    code: '85400203',
    description: 'Núcleo metálico fundido',
    specialty: 'Prótese Dentária',
    suggestedCost: 280,
    rolAns: true,
    rolAnsDescription: 'REABILITAÇÃO COM NÚCLEO METÁLICO FUNDIDO/NÚCLEO PRÉ-FABRICADO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória em dentes permanentes com tratamento endodôntico prévio, conforme indicação do cirurgião-dentista assistente.',
    fullDescription: 'Modelagem intracanal direta em resina Duralay ou indireta, fundição em liga metálica e cimentação com cimento de fosfato de zinco.'
  },
  {
    code: '85400211',
    description: 'Pino de fibra de vidro',
    specialty: 'Dentística & Prótese',
    suggestedCost: 290,
    rolAns: true,
    rolAnsDescription: 'REABILITAÇÃO COM NÚCLEO METÁLICO FUNDIDO/NÚCLEO PRÉ-FABRICADO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória em dentes permanentes com tratamento endodôntico prévio, conforme indicação do cirurgião-dentista assistente.',
    fullDescription: 'Pino intrarradicular translúcido de fibra de vidro com módulo de elasticidade similar à dentina, silanizado e cimentado com cimento resinoso dual.'
  },
  {
    code: '85400246',
    description: 'Prótese Parcial Removível com grampos bilateral (Roach)',
    specialty: 'Prótese Dentária',
    suggestedCost: 1450,
    rolAns: false,
    subgroup: 'PRÓTESE REMOVÍVEL',
    fullDescription: 'Prótese dentária removível com estrutura metálica em cromo-cobalto fundida, dentes de resina acrílica e grampos retentores bilaterais.'
  },
  {
    code: '85400254',
    description: 'Prótese Parcial Removível Provisória',
    specialty: 'Prótese Dentária',
    suggestedCost: 450,
    rolAns: true,
    rolAnsDescription: 'COROA PROVISÓRIA / PRÓTESE PROVISÓRIA',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Placa acrílica transitória simples com grampos de fio ortodôntico e dentes artificiais para uso imediato pré-reabilitação.'
  },
  {
    code: '85400262',
    description: 'Prótese Total (Dentadura)',
    specialty: 'Prótese Dentária',
    suggestedCost: 1350,
    rolAns: false,
    subgroup: 'PRÓTESE TOTAL',
    fullDescription: 'Reabilitação bimaxilar ou monomaxilar mucossuportada com base em resina acrílica termopolimerizada e dentes prensados em tripla prensagem.'
  },
  {
    code: '85400289',
    description: 'Reembasamento de prótese total ou parcial',
    specialty: 'Prótese Dentária',
    suggestedCost: 250,
    rolAns: true,
    rolAnsDescription: 'REEMBASAMENTO DE PRÓTESE TOTAL OU PARCIAL',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Aplicação direta em consultório com resina reembasadora resiliente/rígida ou indireta em laboratório para restabelecimento da retenção e selamento periférico da prótese desadaptada.'
  },
  {
    code: '85400300',
    description: 'Restauração em cerâmica pura - Inlay/Onlay/Overlay',
    specialty: 'Dentística & Prótese',
    suggestedCost: 1200,
    rolAns: false,
    subgroup: 'PRÓTESE FIXA INDIRETA',
    fullDescription: 'Restauração indireta confeccionada em cerâmica pura vítrea de alta resistência (Dissilicato de lítio) cimentada sob isolamento absoluto.'
  },
  {
    code: '85400319',
    description: 'Restauração metálica fundida - RMF',
    specialty: 'Prótese & Dentística',
    suggestedCost: 380,
    rolAns: true,
    rolAnsDescription: 'RESTAURAÇÃO METÁLICA FUNDIDA (COM DIRETRIZ DE UTILIZAÇÃO)',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    dut: '1. Cobertura obrigatória nos dentes pré-molares e molares permanentes com destruição coronária que impossibilite restauração direta, conforme indicação do cirurgião-dentista assistente.',
    fullDescription: 'Bloco intracoronário fundido em liga metálica para reconstrução oclusal e funcional de dentes posteriores.'
  },
  {
    code: '85400327',
    description: 'Recimentação de prótese fixa ou núcleo',
    specialty: 'Prótese Dentária & Urgência',
    suggestedCost: 120,
    rolAns: true,
    rolAnsDescription: 'RECIMENTAÇÃO DE TRABALHOS PROTÉTICOS',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Limpeza interna do retentor, assepsia do remanescente dental e recimentação definitiva com cimento ionomérico ou resinoso.'
  },
  {
    code: '85400335',
    description: 'Remoção de trabalho protético',
    specialty: 'Prótese Dentária',
    suggestedCost: 150,
    rolAns: true,
    rolAnsDescription: 'REMOÇÃO DE TRABALHO PROTÉTICO',
    subgroup: 'BOCA',
    group: 'CABEÇA E PESCOÇO',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Secção longitudinal de coroas ou pontes antigas desadaptadas com brocas transmetal ou saca-pontes pneumático.'
  },

  // ==========================================
  // GRUPO 855: DISFUNÇÃO TEMPOROMANDIBULAR (DTM) & OCLUSÃO
  // ==========================================
  {
    code: '85500011',
    description: 'Placa de oclusão miorelaxante (resina acrílica)',
    specialty: 'DTM & Dor Orofacial',
    suggestedCost: 550,
    rolAns: true,
    rolAnsDescription: 'PLACA DE OCLUSÃO / DISPOSITIVO INTEROCLUSAL',
    subgroup: 'TERAPÊUTICA',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Placa miorrelaxante rígida em resina acrílica prensada ou usinada, plana com guia canina e anterior para desprogramação neuromuscular e alívio do bruxismo/aperto dental.'
  },
  {
    code: '85500020',
    description: 'Tratamento de dor orofacial e DTM (terapia conservadora)',
    specialty: 'DTM & Dor Orofacial',
    suggestedCost: 250,
    rolAns: true,
    rolAnsDescription: 'CONSULTA ODONTOLÓGICA / TRATAMENTO CONSERVADOR DE ATM',
    subgroup: 'CONSULTAS E TERAPÊUTICA',
    group: 'PROCEDIMENTOS CLÍNICOS',
    chapter: 'PROCEDIMENTOS ODONTOLÓGICOS',
    segmentation: 'OD',
    fullDescription: 'Protocolo clínico integrado de controle de pontos-gatilho miofasciais, termoterapia, agulhamento a seco e orientações cognitivo-comportamentais.'
  },

  // ==========================================
  // GRUPO 86: ORTODONTIA E ORTOPEDIA FACIAL
  // ==========================================
  {
    code: '86000010',
    description: 'Documentação ortodôntica completa',
    specialty: 'Ortodontia & Radiologia',
    suggestedCost: 280,
    rolAns: false,
    subgroup: 'ORTODONTIA',
    fullDescription: 'Conjunto propedêutico diagnóstico com fotos extra e intraorais, modelos em gesso/digitais 3D, radiografia panorâmica, telerradiografia de perfil e traçado cefalométrico computadorizado.'
  },
  {
    code: '86000028',
    description: 'Aparelho ortodôntico fixo metálico',
    specialty: 'Ortodontia',
    suggestedCost: 850,
    rolAns: false,
    subgroup: 'ORTODONTIA FIXA',
    fullDescription: 'Montagem e colagem direta de braquetes metálicos, tubos e bandas molares em ambos os arcos.'
  },
  {
    code: '86000036',
    description: 'Aparelho ortodôntico fixo estético (Safira/Cerâmica)',
    specialty: 'Ortodontia',
    suggestedCost: 1600,
    rolAns: false,
    subgroup: 'ORTODONTIA FIXA',
    fullDescription: 'Instalação de braquetes estéticos monocristalinos translúcidos de safira ou cerâmica policristalina com alta estabilidade de cor.'
  },
  {
    code: '86000044',
    description: 'Aparelho ortodôntico autoligável',
    specialty: 'Ortodontia',
    suggestedCost: 1800,
    rolAns: false,
    subgroup: 'ORTODONTIA FIXA',
    fullDescription: 'Instalação de sistema de braquetes autoligáveis de baixo atrito com clipes de fechamento integrados.'
  },
  {
    code: '86000052',
    description: 'Manutenção de aparelho ortodôntico fixo',
    specialty: 'Ortodontia',
    suggestedCost: 150,
    rolAns: false,
    subgroup: 'ORTODONTIA',
    fullDescription: 'Consulta mensal de ativação: troca de arcos de NiTi/aço, molas, dobras ortodônticas, elásticos e reposicionamento de acessórios.'
  },
  {
    code: '86000060',
    description: 'Aparelho ortopédico funcional dos maxilares',
    specialty: 'Ortopedia Funcional dos Maxilares',
    suggestedCost: 800,
    rolAns: false,
    subgroup: 'ORTOPEDIA FACIAL',
    fullDescription: 'Aparelho removível de estímulo postural mandibular (Bionator de Balters, Klammt, Twin Block ou Frankel) para correção de discrepâncias esqueléticas em fase de crescimento.'
  },
  {
    code: '86000079',
    description: 'Alinhador ortodôntico invisível (por placa)',
    specialty: 'Ortodontia Digital',
    suggestedCost: 400,
    rolAns: false,
    subgroup: 'ORTODONTIA DIGITAL',
    fullDescription: 'Placa alinhadora sequencial termoplástica personalizada produzida via escaneamento intraoral e planejamento virtual (Setup 3D).'
  },
  {
    code: '86000087',
    description: 'Contenção ortodôntica fixa (arco inferior)',
    specialty: 'Ortodontia',
    suggestedCost: 200,
    rolAns: false,
    subgroup: 'CONTENÇÃO',
    fullDescription: 'Barra lingual 3x3 em fio de aço trançado ou liso colada diretamente nas faces linguais dos caninos e incisivos inferiores.'
  },
  {
    code: '86000095',
    description: 'Placa de contenção removível (Hawley / Essix)',
    specialty: 'Ortodontia',
    suggestedCost: 260,
    rolAns: false,
    subgroup: 'CONTENÇÃO',
    fullDescription: 'Aparelho superior de contenção confeccionado em acrílico com arco vestibular contínuo e grampos de retenção.'
  },
  {
    code: '86000109',
    description: 'Disjuntor palatino tipo Hyrax / Hass',
    specialty: 'Ortodontia & Ortopedia',
    suggestedCost: 650,
    rolAns: false,
    subgroup: 'EXPANSÃO MAXILAR',
    fullDescription: 'Dispositivo expansor rápido da maxila com parafuso expansor soldado a bandas ou colado com acrílico para abertura da sutura palatina mediana.'
  }
];
