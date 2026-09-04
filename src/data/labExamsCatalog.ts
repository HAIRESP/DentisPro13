export interface LabExamItem {
  id: string;
  name: string;
  category: string;
  subtitle?: string;
  subItems?: string[];
  description?: string;
  defaultChecked?: boolean;
  isCustom?: boolean;
  preparation?: string;
}

export interface LabExamCategoryGroup {
  id: string;
  title: string;
  iconName: string;
  description: string;
  badge: string;
  items: LabExamItem[];
}

export const LAB_EXAMS_CATALOG: LabExamCategoryGroup[] = [
  {
    id: 'hematologia',
    title: '1. Hematologia & Série Sanguínea',
    iconName: 'Activity',
    description: 'Avaliação quantitativa e qualitativa dos elementos figurados do sangue e anemias.',
    badge: 'Série Vermelha / Branca',
    items: [
      {
        id: 'hemograma_completo',
        name: 'Hemograma Completo com Plaquetas',
        category: 'Hematologia',
        subtitle: 'Eritrograma, Leucograma & Contagem de Plaquetas',
        subItems: [
          'Eritrograma: Hemácias, Hemoglobina, Hematócrito, VCM, HCM, CHCM, RDW',
          'Leucograma: Leucócitos Totais, Neutrófilos (Bastonetes e Segmentados), Eosinófilos, Basófilos, Linfócitos, Monócitos',
          'Plaquetograma: Contagem de Plaquetas e Volume Plaquetário Médio (VPM)'
        ],
        description: 'Avaliação de anemias, infecções agudas/crônicas, leucopenia, imunossupressão e plaquetopenia.',
        defaultChecked: true,
        preparation: 'Jejum recomendado de 4 a 8 horas.'
      },
      {
        id: 'vhs',
        name: 'Velocidade de Hemossedimentação (VHS)',
        category: 'Hematologia',
        subtitle: 'Marcador inespecífico de inflamação / infecção',
        description: 'Monitoramento de processos inflamatórios e infecciosos sistêmicos.',
        defaultChecked: false
      },
      {
        id: 'reticulocitos',
        name: 'Contagem de Reticulócitos',
        category: 'Hematologia',
        subtitle: 'Atividade eritropoética da medula óssea',
        description: 'Diferenciação de anemias regenerativas e hipoproliferativas.',
        defaultChecked: false
      },
      {
        id: 'ferritina',
        name: 'Ferritina Sérica',
        category: 'Hematologia',
        subtitle: 'Reserva orgânica de ferro e reagente de fase aguda',
        description: 'Avaliação de estoques corporais de ferro e desordens inflamatórias.',
        defaultChecked: false
      },
      {
        id: 'ferro_ctff',
        name: 'Ferro Sérico & Capacidade Total de Fixação do Ferro (CTFF / TIBC)',
        category: 'Hematologia',
        subtitle: 'Cinética do ferro e transferrina',
        description: 'Diagnóstico diferencial de anemias microcíticas.',
        defaultChecked: false
      },
      {
        id: 'vitamina_b12_folato',
        name: 'Vitamina B12 (Cobalamina) & Ácido Fólico Sérico',
        category: 'Hematologia',
        subtitle: 'Fatores de maturação eritrocitária e saúde neurológica',
        description: 'Investigação de anemias megaloblásticas e glossite atrófica.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'coagulo',
    title: '2. Coagulograma & Hemostasia (Risco Hemorrágico)',
    iconName: 'Activity',
    description: 'Avaliação das vias intrínseca, extrínseca e comum da coagulação sanguínea.',
    badge: 'Risco Cirúrgico',
    items: [
      {
        id: 'coagulograma_completo',
        name: 'Coagulograma Completo',
        category: 'Coagulação & Hemostasia',
        subtitle: 'TP, INR, TTPa, Fibrinogênio, TS e TC',
        subItems: [
          'Tempo de Protrombina (TP) / Atividade de Protrombina (%)',
          'INR (International Normalized Ratio - Relação Normalizada Internacional)',
          'Tempo de Tromboplastina Parcial Ativada (TTPa / Relação Paciente/Controle)',
          'Tempo de Sangramento (TS - Método de Duke / Ivy)',
          'Tempo de Coagulação (TC - Lee-White)'
        ],
        description: 'Rastreio pré-operatório mandatório para exodontias complexas, cirurgias ósseas e implantes.',
        defaultChecked: true
      },
      {
        id: 'tp_inr',
        name: 'Tempo de Protrombina (TP / INR)',
        category: 'Coagulação & Hemostasia',
        subtitle: 'Via Extrínseca & Monitoramento de Anticoagulantes Orais (Varfarina)',
        description: 'Avaliação da via extrínseca e controle de pacientes em uso de antagonistas da vitamina K.',
        defaultChecked: true
      },
      {
        id: 'ttpa',
        name: 'Tempo de Tromboplastina Parcial Ativada (TTPa / Relação)',
        category: 'Coagulação & Hemostasia',
        subtitle: 'Via Intrínseca e Comum da Coagulação',
        description: 'Investigação de hemofilias (fatores VIII, IX, XI) e uso de heparinas.',
        defaultChecked: true
      },
      {
        id: 'fibrinogenio',
        name: 'Fibrinogênio Plasmático (Fator I)',
        category: 'Coagulação & Hemostasia',
        subtitle: 'Concentração plasmática de fibrinogênio funcional',
        description: 'Avaliação de coagulopatias de consumo e hipofibrinogenemia.',
        defaultChecked: false
      },
      {
        id: 'tempo_sangramento_coagulacao',
        name: 'Tempo de Sangramento (TS) e Tempo de Coagulação (TC)',
        category: 'Coagulação & Hemostasia',
        subtitle: 'Hemostasia primária e adesividade/agregação plaquetária in vivo',
        description: 'Triagem rápida de hemostasia primária em cirurgia ambulatorial.',
        defaultChecked: true
      },
      {
        id: 'd_dimero',
        name: 'D-Dímero Plasmático',
        category: 'Coagulação & Hemostasia',
        subtitle: 'Produto de degradação da fibrina / Risco trombótico',
        description: 'Marcador de hipercoagulabilidade e trombogênese.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'glicemia',
    title: '3. Metabolismo Glicêmico & Diabetes',
    iconName: 'Activity',
    description: 'Monitoramento do controle glicêmico e cicatrização pós-operatória.',
    badge: 'Controle Metabólico',
    items: [
      {
        id: 'glicemia_jejum',
        name: 'Glicemia de Jejum',
        category: 'Glicemia & Metabolismo',
        subtitle: 'Concentração plasmática de glicose em jejum de 8 a 12h',
        description: 'Rastreamento de diabetes mellitus e tolerância diminuída à glicose.',
        defaultChecked: true,
        preparation: 'Jejum obrigatório de 8 a 12 horas.'
      },
      {
        id: 'hemoglobina_glicada',
        name: 'Hemoglobina Glicada (HbA1c / Fração A1c)',
        category: 'Glicemia & Metabolismo',
        subtitle: 'Média ponderada da glicemia dos últimos 90 a 120 dias',
        description: 'Padrão-ouro para avaliar controle crônico do diabetes antes de implantes e enxertos.',
        defaultChecked: true
      },
      {
        id: 'glicemia_pos_prandial',
        name: 'Glicemia Pós-Prandial (2 horas pós-sobrecarga)',
        category: 'Glicemia & Metabolismo',
        subtitle: 'Pico glicêmico após refeição padronizada',
        description: 'Avaliação da resposta insulínica e controle pós-alimentar.',
        defaultChecked: false
      },
      {
        id: 'insulina_homa',
        name: 'Insulina Basal & Índice HOMA (HOMA-IR e HOMA-BETA)',
        category: 'Glicemia & Metabolismo',
        subtitle: 'Resistência insulínica e capacidade secretória das células beta',
        description: 'Rastreio de síndrome metabólica e resistência à insulina.',
        defaultChecked: false
      },
      {
        id: 'totg_curva',
        name: 'Teste Oral de Tolerância à Glicose (TOTG 75g - 2 Horas)',
        category: 'Glicemia & Metabolismo',
        subtitle: 'Curva glicêmica clássica com sobrecarga de dextrosol',
        description: 'Diagnóstico de diabetes gestacional e pré-diabetes oculto.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'renal',
    title: '4. Função Renal & Equilíbrio Hidroeletrolítico',
    iconName: 'Activity',
    description: 'Avaliação da filtração glomerular, eliminação de fármacos e eletrólitos.',
    badge: 'Filtração & Eliminação',
    items: [
      {
        id: 'creatinina_tfge',
        name: 'Creatinina Sérica com TFGe (CKD-EPI)',
        category: 'Função Renal',
        subtitle: 'Taxa de Filtração Glomerular Estimada e Creatinina Plasmática',
        description: 'Mandatório para ajuste de dose de anti-inflamatórios (AINEs), antibióticos e anestésicos.',
        defaultChecked: true
      },
      {
        id: 'ureia',
        name: 'Ureia Sérica',
        category: 'Função Renal',
        subtitle: 'Produto final do catabolismo proteico',
        description: 'Auxilia na avaliação do estado de hidratação e função renal.',
        defaultChecked: true
      },
      {
        id: 'acido_urico',
        name: 'Ácido Úrico Sérico',
        category: 'Função Renal',
        subtitle: 'Metabolismo das purinas e hiperuricemia / Gota',
        description: 'Investigação de gota e nefropatias por urato.',
        defaultChecked: false
      },
      {
        id: 'eletrolitos_completos',
        name: 'Ionograma / Eletrólitos Séricos (Sódio Na+, Potássio K+, Cloro Cl-)',
        category: 'Função Renal',
        subtitle: 'Sódio (Na+), Potássio (K+), Cloro (Cl-) e Bicarbonato',
        description: 'Avaliação do equilíbrio hidroeletrolítico e risco de arritmias com vasoconstritores.',
        defaultChecked: false
      },
      {
        id: 'clearance_creatinina',
        name: 'Clearance de Creatinina (Depuração Endógena em Urina de 24h)',
        category: 'Função Renal',
        subtitle: 'Medição quantitativa direta da depuração renal',
        description: 'Avaliação precisa da insuficiência renal moderada a grave.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'osseo',
    title: '5. Metabolismo Ósseo, Minerais & Vitaminas',
    iconName: 'Sparkles',
    description: 'Implantodontia, regeneração óssea guiada e risco de osteonecrose (MRONJ).',
    badge: 'Implantodontia & Enxertos',
    items: [
      {
        id: 'vitamina_d',
        name: 'Vitamina D (25-Hidroxivitamina D / 25-OH-D3)',
        category: 'Metabolismo Ósseo',
        subtitle: 'Regulação do cálcio, osseointegração e resposta imune alveolar',
        description: 'Crucial para o sucesso da osseointegração de implantes dentários e consolidação de enxertos.',
        defaultChecked: true
      },
      {
        id: 'calcio_ionico_total',
        name: 'Cálcio Iônico (Cálcio Livre) & Cálcio Total Sérico',
        category: 'Metabolismo Ósseo',
        subtitle: 'Fração biologicamente ativa do cálcio e calcemia total',
        description: 'Mineralização óssea, função muscular e hemostasia.',
        defaultChecked: true
      },
      {
        id: 'fosfatase_alcalina_total_ossea',
        name: 'Fosfatase Alcalina Total & Fração Óssea',
        category: 'Metabolismo Ósseo',
        subtitle: 'Marcador de remodelação e neoformação óssea osteoblástica',
        description: 'Monitoramento da atividade osteoblástica em enxertias e patologias fibro-ósseas.',
        defaultChecked: true
      },
      {
        id: 'fosforo_serico',
        name: 'Fósforo Sérico (Fosfato Inorgânico)',
        category: 'Metabolismo Ósseo',
        subtitle: 'Metabolismo fosfocálcico e matriz mineral do osso',
        description: 'Avaliação complementar do turnover ósseo.',
        defaultChecked: false
      },
      {
        id: 'magnesio',
        name: 'Magnésio Sérico',
        category: 'Metabolismo Ósseo',
        subtitle: 'Cofator enzimático e estabilidade óssea',
        description: 'Avaliação de hipomagnesemia e excitabilidade neuromuscular.',
        defaultChecked: false
      },
      {
        id: 'pth_intacto',
        name: 'Paratormônio Intacto (PTH Molécula Inteira)',
        category: 'Metabolismo Ósseo',
        subtitle: 'Hormônio da paratireoide / Reabsorção e remodelação óssea',
        description: 'Diagnóstico de hiperparatireoidismo e desordens do metabolismo do cálcio.',
        defaultChecked: false
      },
      {
        id: 'ctx_crosslaps',
        name: 'Beta-CrossLaps / CTX Sérico (Telopeptídeo C-Terminal)',
        category: 'Metabolismo Ósseo',
        subtitle: 'Marcador de reabsorção óssea / Risco de Osteonecrose (MRONJ/Bisfosfonatos)',
        description: 'Estratificação de risco para cirurgias ósseas em pacientes com histórico de antirreabsortivos.',
        defaultChecked: false
      },
      {
        id: 'osteocalcina',
        name: 'Osteocalcina Sérica (BGP)',
        category: 'Metabolismo Ósseo',
        subtitle: 'Proteína não colágena da matriz óssea sintetizada por osteoblastos',
        description: 'Marcador específico de síntese e taxa de formação óssea.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'hepatico',
    title: '6. Função Hepática, Enzimas & Perfil Lipídico',
    iconName: 'Activity',
    description: 'Metabolização de anestésicos locais, sedativos, analgésicos e síntese proteica.',
    badge: 'Metabolismo de Fármacos',
    items: [
      {
        id: 'tgo_tgp',
        name: 'Transaminases Hepáticas (TGO / AST & TGP / ALT)',
        category: 'Função Hepática',
        subtitle: 'Aminotransferases para avaliação de integridade hepatocelular',
        description: 'Avaliação do metabolismo hepático para amidas anestésicas e analgésicos.',
        defaultChecked: true
      },
      {
        id: 'gama_gt',
        name: 'Gama-Glutamil Transferase (Gama-GT / GGT)',
        category: 'Função Hepática',
        subtitle: 'Marcador sensível de colestase e indução enzimática hepática',
        description: 'Investigação de esteatose hepática e colestase.',
        defaultChecked: false
      },
      {
        id: 'bilirrubinas',
        name: 'Bilirrubinas Totais e Frações (Direta e Indireta)',
        category: 'Função Hepática',
        subtitle: 'Excreção biliar e hemostasia hepática',
        description: 'Avaliação de icterícia, hemólise e disfunções hepatobiliares.',
        defaultChecked: false
      },
      {
        id: 'proteinas_totais',
        name: 'Proteínas Totais e Frações (Albumina e Globulinas / Relação A/G)',
        category: 'Função Hepática',
        subtitle: 'Pressão coloidosmótica, transporte de fármacos e estado nutricional',
        description: 'Avaliação da capacidade de cicatrização tecidual e ligação de drogas.',
        defaultChecked: false
      },
      {
        id: 'perfil_lipidico',
        name: 'Perfil Lipídico / Lipidograma Completo',
        category: 'Função Hepática',
        subtitle: 'Colesterol Total, HDL-C, LDL-C, VLDL-C e Triglicerídeos',
        description: 'Avaliação de risco cardiovascular e dislipidemias.',
        defaultChecked: false,
        preparation: 'Jejum obrigatório de 12 horas.'
      }
    ]
  },
  {
    id: 'sorologias',
    title: '7. Sorologias & Doenças Infecciosas (Pré-Cirúrgico)',
    iconName: 'ShieldCheck',
    description: 'Biossegurança, rastreamento de infecções transmissíveis e saúde ocupacional.',
    badge: 'Biossegurança & Rastreio',
    items: [
      {
        id: 'hiv_1_2',
        name: 'HIV 1 e 2 (Anticorpos e Antígeno p24 - 4ª Geração)',
        category: 'Sorologias',
        subtitle: 'Rastreio do Vírus da Imunodeficiência Humana',
        description: 'Pesquisa combinada de antígeno p24 e anticorpos anti-HIV 1 e 2.',
        defaultChecked: true
      },
      {
        id: 'hepatite_b_hbsag',
        name: 'Hepatite B - HBsAg (Antígeno de Superfície do VHB)',
        category: 'Sorologias',
        subtitle: 'Marcador de infecção ativa / portador do vírus da Hepatite B',
        description: 'Detecção de replicação viral ativa de hepatite B.',
        defaultChecked: true
      },
      {
        id: 'hepatite_b_antihbs',
        name: 'Hepatite B - Anti-HBs (Anticorpo de Imunidade / Vacinação)',
        category: 'Sorologias',
        subtitle: 'Titulação de anticorpos protetores pós-vacinais ou cura',
        description: 'Confirmação de soroconversão e proteção imunológica contra HBV.',
        defaultChecked: true
      },
      {
        id: 'hepatite_b_antihbc',
        name: 'Hepatite B - Anti-HBc Total e IgM',
        category: 'Sorologias',
        subtitle: 'Contato prévio ou infecção aguda / crônica pelo HBV',
        description: 'Diferenciação entre imunidade por vacina e infecção natural.',
        defaultChecked: false
      },
      {
        id: 'hepatite_c_antihcv',
        name: 'Hepatite C - Anti-HCV (Anticorpos do Vírus da Hepatite C)',
        category: 'Sorologias',
        subtitle: 'Rastreio de infecção pelo vírus HCV',
        description: 'Pesquisa de anticorpos específicos contra hepatite C.',
        defaultChecked: true
      },
      {
        id: 'vdrl_sifilis',
        name: 'VDRL / Teste Não Treponêmico para Sífilis (e FTA-ABS se Reagente)',
        category: 'Sorologias',
        subtitle: 'Rastreamento e titulação de anticorpos anticardiolipina para Treponema pallidum',
        description: 'Diagnóstico de sífilis primária, secundária ou latente.',
        defaultChecked: true
      },
      {
        id: 'beta_hcg',
        name: 'Beta-HCG Quantitativo Sérico',
        category: 'Sorologias',
        subtitle: 'Confirmação diagnóstica de gestação antes de cirurgias ou Rx',
        description: 'Rastreio de gravidez para segurança de prescrições e anestesia.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'inflamatorio',
    title: '8. Marcadores Inflamatórios & Reumatologia',
    iconName: 'Activity',
    description: 'Processos inflamatórios sistêmicos, artrite temporomandibular e autoimunidade.',
    badge: 'Inflamação & Autoimune',
    items: [
      {
        id: 'pcr_ultrassensivel',
        name: 'Proteína C Reativa Ultrassensível (PCR-us)',
        category: 'Marcadores Inflamatórios',
        subtitle: 'Reagente de fase aguda sintetizado pelo fígado',
        description: 'Avaliação da carga inflamatória periodontal e sistêmica.',
        defaultChecked: true
      },
      {
        id: 'fator_reumatoide',
        name: 'Fator Reumatoide (FR / Teste de Látex e Waaler-Rose)',
        category: 'Marcadores Inflamatórios',
        subtitle: 'Investigação de Artrite Reumatoide e comprometimento de ATMs',
        description: 'Auxílio diagnóstico em manifestações articulares temporomandibulares.',
        defaultChecked: false
      },
      {
        id: 'fan_autoanticorpos',
        name: 'FAN (Fator Antinuclear em Células HEp-2)',
        category: 'Marcadores Inflamatórios',
        subtitle: 'Pesquisa de autoanticorpos para Lúpus Eritematoso e Síndrome de Sjögren',
        description: 'Investigação de hipossalivação / xerostomia e lesões orais autoimunes.',
        defaultChecked: false
      },
      {
        id: 'anti_ccp',
        name: 'Anti-CCP (Anticorpos Antipeptídeo Citrulinado Cíclico)',
        category: 'Marcadores Inflamatórios',
        subtitle: 'Marcador de alta especificidade para artrite reumatóide',
        description: 'Diagnóstico precoce de destruição articular.',
        defaultChecked: false
      },
      {
        id: 'complemento_c3_c4',
        name: 'Complemento Sérico C3 e C4',
        category: 'Marcadores Inflamatórios',
        subtitle: 'Atividade do sistema complemento em vasculites e lúpus',
        description: 'Monitoramento de doenças imunomediadas ativas.',
        defaultChecked: false
      }
    ]
  },
  {
    id: 'tireoide',
    title: '9. Função Tireoidiana & Hormônios',
    iconName: 'Activity',
    description: 'Metabolismo basal, sensibilidade a catecolaminas/vasoconstritores e estresse cirúrgico.',
    badge: 'Endocrinologia',
    items: [
      {
        id: 'tsh_ultrassensivel',
        name: 'TSH Ultra-Sensível (Hormônio Tireoestimulante)',
        category: 'Função Tireoidiana',
        subtitle: 'Controle central da função tireoidiana pela hipófise',
        description: 'Rastreio de hipotireoidismo e hipertireoidismo pré-cirúrgico.',
        defaultChecked: false
      },
      {
        id: 't4_livre',
        name: 'T4 Livre (Tiroxina Livre)',
        category: 'Função Tireoidiana',
        subtitle: 'Fração biologicamente ativa da tiroxina circulante',
        description: 'Confirmação do status metabólico tireoidiano.',
        defaultChecked: false
      },
      {
        id: 't3_livre',
        name: 'T3 Livre (Tri-iodotironina Livre)',
        category: 'Função Tireoidiana',
        subtitle: 'Hormônio tireoidiano de ação tecidual direta',
        description: 'Avaliação de tireotoxicoses específicas.',
        defaultChecked: false
      },
      {
        id: 'anti_tpo',
        name: 'Anti-TPO (Anticorpos Anti-Peroxidase Tireoidiana)',
        category: 'Função Tireoidiana',
        subtitle: 'Marcador de Tireoidite de Hashimoto autoimune',
        description: 'Investigação de etiologia autoimune no hipotireoidismo.',
        defaultChecked: false
      },
      {
        id: 'cortisol_basal',
        name: 'Cortisol Sérico Basal (Coleta matinal às 08:00h)',
        category: 'Função Tireoidiana',
        subtitle: 'Avaliação do eixo hipotálamo-hipófise-adrenal e reserva de estresse',
        description: 'Avaliação de supressão adrenal em usuários crônicos de corticosteroides.',
        defaultChecked: false,
        preparation: 'Coleta estritamente entre 07:30 e 08:30 da manhã em repouso.'
      }
    ]
  },
  {
    id: 'urina',
    title: '10. Exames de Urina & Subtítulos Detalhados',
    iconName: 'Activity',
    description: 'Sumário de Urina completo (EAS Tipo I com subitens), urocultura e microalbuminúria.',
    badge: 'EAS Tipo I • Urocultura',
    items: [
      {
        id: 'sumario_urina_completo',
        name: 'Sumário de Urina Completo (EAS / Urina Tipo I / Elementos Anormais e Sedimento)',
        category: 'Exames de Urina',
        subtitle: 'Exame Físico, Químico e Sedimentoscopia Microscópica Completa',
        subItems: [
          'Exame Físico: Volume, Cor, Aspecto, Densidade e pH urinário',
          'Exame Químico: Proteínas, Glicose, Corpos Cetônicos, Bilirrubina, Urobilinogênio, Sangue Oculto/Hemoglobina, Nitrito e Esterase Leucocitária',
          'Sedimentoscopia Microscópica: Contagem de Leucócitos/campo, Hemácias/campo, Células Epiteliais de Descamação, Cilindros (hialinos, granulosos), Cristais (oxalato, ácido úrico, fosfato triplo), Filamentos de Muco e Flora Bacteriana'
        ],
        description: 'Rastreio de infecções do trato urinário, proteinúria, hematúria e nefropatias subclínicas.',
        defaultChecked: true,
        preparation: 'Coleta da 1ª urina da manhã com assepsia prévia e desprezar o 1º jato (jato médio).'
      },
      {
        id: 'urocultura_tsa',
        name: 'Urocultura Quantitativa com Antibiograma / TSA',
        category: 'Exames de Urina',
        subtitle: 'Cultura de Urina, Contagem de Colônias & Teste de Sensibilidade a Antimicrobianos',
        subItems: [
          'Contagem de Colônias (UFC/mL de urina)',
          'Identificação do Microrganismo Patogênico Isolado',
          'Antibiograma / TSA Completo (Concentração Inibitória Mínima - CIM / Kirby-Bauer)'
        ],
        description: 'Identificação de bacteriúria assintomática e direcionamento preciso de antibióticos.',
        defaultChecked: false,
        preparation: 'Higiene genital rigorosa; colher em frasco estéril fornecido pelo laboratório.'
      },
      {
        id: 'microalbuminuria',
        name: 'Microalbuminúria em Amostra Isolada (Relação Albumina / Creatinina)',
        category: 'Exames de Urina',
        subtitle: 'Rastreamento precoce de nefropatia diabética e lesão endotelial',
        description: 'Marcador precoce de dano vascular e renal em pacientes hipertensos e diabéticos.',
        defaultChecked: false
      },
      {
        id: 'urina_24h',
        name: 'Urina de 24 Horas (Volume, Proteinúria de 24h & Clearance de Creatinina)',
        category: 'Exames de Urina',
        subtitle: 'Coleta contínua de 24 horas para dosagem de proteínas totais e depuração renal',
        description: 'Quantificação precisa de perda proteica e função excretora renal.',
        defaultChecked: false,
        preparation: 'Desprezar a primeira micção do dia e coletar todas as micções subsequentes até o dia seguinte.'
      }
    ]
  },
  {
    id: 'microbiologia_oncologia',
    title: '11. Microbiologia Oral, Biópsias & Marcadores Especiais',
    iconName: 'FileText',
    description: 'Diagnóstico de infecções bucomaxilofaciais resistentes, lesões de mucosa e marcadores.',
    badge: 'Bacteriologia & Lesões',
    items: [
      {
        id: 'cultura_antibiograma_oral',
        name: 'Cultura e Antibiograma de Exsudato / Secreção Purulenta Oral',
        category: 'Microbiologia Oral',
        subtitle: 'Isolamento de bactérias aeróbias/anaeróbias e teste de sensibilidade antimicrobiana',
        subItems: [
          'Bacterioscopia Direta com Coloração de Gram',
          'Cultura Microbiológica para Germes Aeróbios e Anaeróbios Estritos',
          'Antibiograma (TSA) com Perfil de Sensibilidade para Amoxicilina, Clavulanato, Clindamicina, Azitromicina, Ciprofloxacino'
        ],
        description: 'Mandatório em abscessos odontogênicos refratários, celulites faciais e osteomielites.',
        defaultChecked: false
      },
      {
        id: 'citopatologia_esfoliativa',
        name: 'Citopatologia Esfoliativa Oral / Raspado de Lesão de Mucosa',
        category: 'Microbiologia Oral',
        subtitle: 'Coloração de Papanicolaou e PAS para diagnóstico de lesões bucais',
        description: 'Triagem citológica de lesões brancas, vermelhas ou suspeitas de malignidade.',
        defaultChecked: false
      },
      {
        id: 'pesquisa_fungos',
        name: 'Pesquisa Direta e Cultura para Fungos (Candidíase Oral / Actinomicose)',
        category: 'Microbiologia Oral',
        subtitle: 'Exame micológico a fresco (KOH 10%) e cultura em ágar Sabouraud',
        description: 'Identificação de espécies de Candida e Actinomyces israelii.',
        defaultChecked: false
      },
      {
        id: 'ca153',
        name: 'Marcador Tumoral CA 15-3',
        category: 'Marcadores Especiais',
        subtitle: 'Antígeno Carcinogênico 15-3',
        description: 'Marcador tumoral sérico de acompanhamento oncológico.',
        defaultChecked: false
      },
      {
        id: 'psa_total_livre',
        name: 'PSA Total e Livre (Antígeno Prostático Específico)',
        category: 'Marcadores Especiais',
        subtitle: 'Rastreio urológico para pacientes masculinos > 45 anos',
        description: 'Avaliação de rotina em check-ups masculinos complementares.',
        defaultChecked: false
      },
      {
        id: 'cea_marcador',
        name: 'CEA (Antígeno Carcinoembrionário)',
        category: 'Marcadores Especiais',
        subtitle: 'Marcador oncofetal sérico',
        description: 'Acompanhamento de neoplasias e rastreamento complementar.',
        defaultChecked: false
      },
      {
        id: 'parasitologico_fezes',
        name: 'Exame Parasitológico de Fezes (EPF / Hoffman-Pons-Janner e MIF)',
        category: 'Marcadores Especiais',
        subtitle: 'Pesquisa de ovos, cistos de protozoários e larvas de helmintos',
        description: 'Investigação de eosinofilia e desnutrição secundária.',
        defaultChecked: false
      }
    ]
  }
];

export interface LabExamPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  examIds: string[];
}

export const LAB_EXAMS_PRESETS: LabExamPreset[] = [
  {
    id: 'pre_op_basico',
    name: 'Pré-Operatório Básico (Cirurgia Oral Menor)',
    description: 'Hemograma Completo + Coagulograma Completo + Glicemia de Jejum + Creatinina + Sumário de Urina (EAS).',
    badge: 'Essencial',
    examIds: [
      'hemograma_completo',
      'coagulograma_completo',
      'tp_inr',
      'ttpa',
      'tempo_sangramento_coagulacao',
      'glicemia_jejum',
      'creatinina_tfge',
      'sumario_urina_completo'
    ]
  },
  {
    id: 'checkup_completo_implantes',
    name: 'Check-up Cirúrgico Completo & Implantodontia / Enxertos',
    description: 'Hemograma + Coagulograma + Glicemia + HbA1c + Creatinina + Ureia + TGO/TGP + Vitamina D + Cálcio Iônico + Fosfatase Alcalina + PCR-us + EAS + Sorologias (HIV, Hepatites B/C, VDRL).',
    badge: 'Recomendado para Implantes',
    examIds: [
      'hemograma_completo',
      'coagulograma_completo',
      'tp_inr',
      'ttpa',
      'tempo_sangramento_coagulacao',
      'glicemia_jejum',
      'hemoglobina_glicada',
      'creatinina_tfge',
      'ureia',
      'tgo_tgp',
      'vitamina_d',
      'calcio_ionico_total',
      'fosfatase_alcalina_total_ossea',
      'pcr_ultrassensivel',
      'sumario_urina_completo',
      'hiv_1_2',
      'hepatite_b_hbsag',
      'hepatite_b_antihbs',
      'hepatite_c_antihcv',
      'vdrl_sifilis'
    ]
  },
  {
    id: 'risco_hemorragico',
    name: 'Painel de Risco Hemorrágico & Coagulograma Estendido',
    description: 'Foco exclusivo em hemostasia primária e secundária (Plaquetograma, TP/INR, TTPa, Fibrinogênio, TS e TC).',
    badge: 'Hemostasia',
    examIds: [
      'hemograma_completo',
      'coagulograma_completo',
      'tp_inr',
      'ttpa',
      'fibrinogenio',
      'tempo_sangramento_coagulacao',
      'd_dimero'
    ]
  },
  {
    id: 'metabolismo_osseo_mronj',
    name: 'Metabolismo Ósseo & Risco de Osteonecrose (MRONJ)',
    description: 'Avaliação de remodelação óssea, CTX Beta-CrossLaps, Vitamina D, Cálcio Iônico, PTH e Fosfatase Alcalina.',
    badge: 'Osseointegração & Bisfosfonatos',
    examIds: [
      'vitamina_d',
      'calcio_ionico_total',
      'fosfatase_alcalina_total_ossea',
      'pth_intacto',
      'ctx_crosslaps',
      'osteocalcina',
      'hemograma_completo',
      'creatinina_tfge'
    ]
  },
  {
    id: 'painel_sorologias',
    name: 'Painel de Biossegurança & Sorologias Infecciosas',
    description: 'HIV 1 e 2 (4ª Geração) + Hepatite B (HBsAg, Anti-HBs) + Hepatite C (Anti-HCV) + VDRL / Sífilis.',
    badge: 'Sorologias',
    examIds: [
      'hiv_1_2',
      'hepatite_b_hbsag',
      'hepatite_b_antihbs',
      'hepatite_b_antihbc',
      'hepatite_c_antihcv',
      'vdrl_sifilis'
    ]
  },
  {
    id: 'painel_renal_urina',
    name: 'Painel Renal, Eletrólitos & Urinário Detalhado',
    description: 'Sumário de Urina (EAS com subitens) + Urocultura com Antibiograma (TSA) + Microalbuminúria + Creatinina com TFGe + Ureia + Ionograma.',
    badge: 'Renal & Urina',
    examIds: [
      'sumario_urina_completo',
      'urocultura_tsa',
      'microalbuminuria',
      'creatinina_tfge',
      'ureia',
      'eletrolitos_completos'
    ]
  },
  {
    id: 'painel_diabetico',
    name: 'Painel Metabólico & Diabético Completo',
    description: 'Glicemia de Jejum + Hemoglobina Glicada (HbA1c) + Insulina Basal com HOMA-IR + Perfil Lipídico Completo + Creatinina.',
    badge: 'Diabetes & Metabolismo',
    examIds: [
      'glicemia_jejum',
      'hemoglobina_glicada',
      'insulina_homa',
      'perfil_lipidico',
      'creatinina_tfge',
      'sumario_urina_completo'
    ]
  }
];

export const DEFAULT_LAB_EXAMS_INSTRUCTIONS = 
`1. Realizar a coleta sanguínea com jejum prévio de 8 a 12 horas (água mineral permitida com moderação);
2. Para o Sumário de Urina (EAS) e Urocultura: coletar a primeira urina da manhã em frasco estéril, realizando assepsia prévia rigorosa e desprezando o primeiro jato urinário (coleta do jato médio);
3. O paciente deve informar ao laboratório de análises clínicas o uso contínuo de medicamentos (especialmente anticoagulantes, antiagregantes plaquetários, antidiabéticos orais ou insulina);
4. Encaminhar os resultados e laudos laboratoriais para o cirurgião-dentista antes da data agendada para o procedimento cirúrgico.`;

export const DEFAULT_LAB_EXAMS_CLINICAL_INDICATION = 
'Avaliação pré-operatória e estratificação de risco cirúrgico odontológico para realização de procedimentos cirúrgicos bucomaxilofaciais / implantodontia sob anestesia local ambulatorial.';
