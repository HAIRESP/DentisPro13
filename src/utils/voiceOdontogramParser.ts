import { ToothConditionType, ToothSurface } from '../types';

export interface VoiceOdontogramResult {
  action: 'apply_condition' | 'select_teeth' | 'clear_teeth' | 'add_notes';
  teeth: number[];
  conditionType: ToothConditionType;
  surfaces: ToothSurface[];
  isWholeTooth: boolean;
  notes?: string;
  summary: string;
  spokenFeedback: string;
}

// Canonical permanent teeth
const ALL_PERMANENTS = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38
];

const ALL_DECIDUOUS = [
  55, 54, 53, 52, 51,
  61, 62, 63, 64, 65,
  85, 84, 83, 82, 81,
  71, 72, 73, 74, 75
];

// Spoken number words in Portuguese to numbers
const WORD_TO_NUMBER: Record<string, number> = {
  'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4, 'cinco': 5,
  'seis': 6, 'meia': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
  'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14, 'catorze': 14, 'quinze': 15,
  'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19, 'vinte': 20,
  'vinte e um': 21, 'vinte e dois': 22, 'vinte e três': 23, 'vinte e quatro': 24, 'vinte e cinco': 25,
  'vinte e seis': 26, 'vinte e sete': 27, 'vinte e oito': 28, 'vinte e nove': 29, 'trinta': 30,
  'trinta e um': 31, 'trinta e dois': 32, 'trinta e três': 33, 'trinta e quatro': 34, 'trinta e cinco': 35,
  'trinta e seis': 36, 'trinta e sete': 37, 'trinta e oito': 38, 'quarenta': 40,
  'quarenta e um': 41, 'quarenta e dois': 42, 'quarenta e três': 43, 'quarenta e quatro': 44, 'quarenta e cinco': 45,
  'quarenta e seis': 46, 'quarenta e sete': 47, 'quarenta e oito': 48,
  'cinquenta e um': 51, 'cinquenta e dois': 52, 'cinquenta e três': 53, 'cinquenta e quatro': 54, 'cinquenta e cinco': 55,
  'sessenta e um': 61, 'sessenta e dois': 62, 'sessenta e três': 63, 'sessenta e quatro': 64, 'sessenta e cinco': 65,
  'setenta e um': 71, 'setenta e dois': 72, 'setenta e três': 73, 'setenta e quatro': 74, 'setenta e cinco': 75,
  'oitenta e um': 81, 'oitenta e dois': 82, 'oitenta e três': 83, 'oitenta e quatro': 84, 'oitenta e cinco': 85
};

/**
 * Heuristic fallback parser for offline speech recognition or immediate local parsing
 */
export function parseLocalDentalVoiceCommand(
  rawTranscript: string,
  currentlySelectedTeeth: number[] = []
): VoiceOdontogramResult {
  const text = rawTranscript.toLowerCase().trim();

  // Determine Action
  let action: 'apply_condition' | 'select_teeth' | 'clear_teeth' | 'add_notes' = 'apply_condition';
  if (text.includes('selecionar') || text.includes('marque os dentes') || text.includes('escolha os dentes')) {
    action = 'select_teeth';
  }
  if (text.includes('limpar') || text.includes('remover') || text.includes('apagar') || text.includes('hígido') || text.includes('higido') || text.includes('sem alteração')) {
    action = 'clear_teeth';
  }

  // Extract Teeth Numbers
  const extractedTeeth: number[] = [];

  // Group keywords
  if (text.includes('arcada superior') || text.includes('maxilar') || text.includes('dentes superiores')) {
    extractedTeeth.push(...[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]);
  } else if (text.includes('arcada inferior') || text.includes('mandíbula') || text.includes('mandibula') || text.includes('dentes inferiores')) {
    extractedTeeth.push(...[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]);
  } else if (text.includes('ambas as arcadas') || text.includes('toda a boca') || text.includes('todos os dentes') || text.includes('todos permanentes')) {
    extractedTeeth.push(...ALL_PERMANENTS);
  } else if (text.includes('decíduos') || text.includes('deciduos') || text.includes('dentes de leite') || text.includes('infantil')) {
    extractedTeeth.push(...ALL_DECIDUOUS);
  } else if (text.includes('molares')) {
    if (text.includes('superior')) extractedTeeth.push(...[18, 17, 16, 26, 27, 28]);
    else if (text.includes('inferior')) extractedTeeth.push(...[48, 47, 46, 36, 37, 38]);
    else extractedTeeth.push(...[18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38]);
  } else if (text.includes('pré-molares') || text.includes('pre molares') || text.includes('pré molares') || text.includes('premolares')) {
    extractedTeeth.push(...[15, 14, 24, 25, 45, 44, 34, 35]);
  } else if (text.includes('anteriores')) {
    if (text.includes('inferior')) extractedTeeth.push(...[43, 42, 41, 31, 32, 33]);
    else if (text.includes('superior')) extractedTeeth.push(...[13, 12, 11, 21, 22, 23]);
    else extractedTeeth.push(...[13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33]);
  } else if (text.includes('siso') || text.includes('sisos') || text.includes('terceiro molar') || text.includes('terceiros molares')) {
    extractedTeeth.push(...[18, 28, 38, 48]);
  }

  // Regex matching digits (e.g., 16, 17, 21) or range (e.g. 11 ao 16)
  const rangeMatch = text.match(/(\d{2})\s*(?:a|ao|até|ate)\s*(\d{2})/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    for (let i = min; i <= max; i++) {
      if (ALL_PERMANENTS.includes(i) || ALL_DECIDUOUS.includes(i)) {
        extractedTeeth.push(i);
      }
    }
  }

  // Match all 2-digit numbers
  const numberMatches = text.match(/\b\d{2}\b/g);
  if (numberMatches) {
    numberMatches.forEach(numStr => {
      const n = parseInt(numStr, 10);
      if (ALL_PERMANENTS.includes(n) || ALL_DECIDUOUS.includes(n)) {
        extractedTeeth.push(n);
      }
    });
  }

  // Check word numbers if none found
  if (extractedTeeth.length === 0) {
    Object.entries(WORD_TO_NUMBER).forEach(([word, val]) => {
      if (text.includes(word) && (ALL_PERMANENTS.includes(val) || ALL_DECIDUOUS.includes(val))) {
        extractedTeeth.push(val);
      }
    });
  }

  // Fallback to currently selected teeth if user speaks "neste dente", "nestes dentes" or no tooth mentioned
  const finalTeeth = extractedTeeth.length > 0 
    ? Array.from(new Set(extractedTeeth))
    : (currentlySelectedTeeth.length > 0 ? currentlySelectedTeeth : [16]);

  // Determine Condition Type
  let conditionType: ToothConditionType = 'carie';
  let isWholeTooth = false;

  if (text.includes('cárie') || text.includes('carie') || text.includes('lesão') || text.includes('cavidade') || text.includes('mancha')) {
    conditionType = 'carie';
  } else if (text.includes('insatisfatória') || text.includes('insatisfatoria') || text.includes('infiltrada') || text.includes('infiltração') || text.includes('recidiva')) {
    if (text.includes('endo') || text.includes('canal')) {
      conditionType = 'canal'; // Endodontia insatisfatória
      isWholeTooth = true;
    } else {
      conditionType = 'restauracao_insatisfatoria';
    }
  } else if (text.includes('necessidade endodôntica') || text.includes('necessidade endodontica') || text.includes('biopulpectomia') || text.includes('necropulpectomia') || text.includes('abrir canal')) {
    conditionType = 'necessidade_endodontica';
    isWholeTooth = true;
  } else if (text.includes('endodontia satisfatória') || text.includes('endodontia satisfatoria') || text.includes('canal tratado') || text.includes('canal obturado') || text.includes('endo tratada')) {
    conditionType = 'endodontia_satisfatoria';
    isWholeTooth = true;
  } else if (text.includes('restauração') || text.includes('restauracao') || text.includes('resina') || text.includes('amálgama') || text.includes('amalgama') || text.includes('obturado') || text.includes('obturação')) {
    conditionType = 'restauracao';
  } else if (text.includes('canal') || text.includes('endodontia') || text.includes('endo')) {
    conditionType = 'canal'; // Endodontia insatisfatória
    isWholeTooth = true;
  } else if (text.includes('extração') || text.includes('extracao') || text.includes('extrair') || text.includes('exodontia') || text.includes('residual')) {
    conditionType = 'extracao_indicada';
    isWholeTooth = true;
  } else if (text.includes('ausente') || text.includes('perdido') || text.includes('extraído') || text.includes('extraido') || text.includes('falta') || text.includes('não tem') || text.includes('agenesia')) {
    conditionType = 'ausente';
    isWholeTooth = true;
  } else if (text.includes('implante') || text.includes('parafuso') || text.includes('osseointegrado')) {
    conditionType = 'implante';
    isWholeTooth = true;
  } else if (text.includes('prótese') || text.includes('protese') || text.includes('coroa') || text.includes('metalocerâmica') || text.includes('faceta') || text.includes('bloco') || text.includes('onlay') || text.includes('inlay')) {
    conditionType = 'protese';
    isWholeTooth = true;
  } else if (text.includes('subgengival') || text.includes('tártaro sub') || text.includes('tartaro sub') || text.includes('bolsa')) {
    conditionType = 'calculo_subgengival';
    isWholeTooth = true;
  } else if (text.includes('supragengival') || text.includes('tártaro supra') || text.includes('tartaro supra') || text.includes('cálculo') || text.includes('calculo') || text.includes('tártaro') || text.includes('tartaro')) {
    conditionType = 'calculo_supragengival';
    isWholeTooth = true;
  } else if (text.includes('girovertido') || text.includes('giroversão') || text.includes('giro') || text.includes('rodado') || text.includes('girado')) {
    conditionType = 'girovertido';
    isWholeTooth = true;
  } else if (text.includes('hígido') || text.includes('higido') || text.includes('saudável') || text.includes('limpo') || text.includes('sem alteração')) {
    conditionType = 'sio';
    isWholeTooth = true;
  }

  // Extract Surfaces
  const surfaces: ToothSurface[] = [];
  if (text.includes('oclusal') || text.includes('mastigatória') || text.includes('topo')) surfaces.push('oclusal');
  if (text.includes('incisal') || text.includes('ponta') || text.includes('borda')) surfaces.push('incisal');
  if (text.includes('mesial') || text.includes('frente do dente')) surfaces.push('mesial');
  if (text.includes('distal') || text.includes('trás do dente')) surfaces.push('distal');
  if (text.includes('vestibular') || text.includes('labial') || text.includes('bochecha')) surfaces.push('vestibular');
  if (text.includes('palatina') || text.includes('céu da boca')) surfaces.push('palatina');
  if (text.includes('lingual') || text.includes('língua') || text.includes('lingua')) surfaces.push('lingual');
  if (text.includes('todas as faces') || text.includes('toda a coroa')) {
    surfaces.push('vestibular', 'mesial', 'oclusal', 'distal', 'lingual', 'palatina');
  }

  // If no surfaces specified and condition is carie or restauracao, default to oclusal (for posterior) or vestibular/incisal
  if (surfaces.length === 0 && !isWholeTooth && conditionType !== 'sio') {
    surfaces.push('oclusal');
  }

  // If action is clear_teeth, set conditionType to sio
  if (action === 'clear_teeth') {
    conditionType = 'sio';
    isWholeTooth = true;
  }

  const teethStr = finalTeeth.sort((a, b) => a - b).join(', ');
  let summary = '';
  let spokenFeedback = '';

  if (action === 'select_teeth') {
    summary = `Dentes ${teethStr} selecionados.`;
    spokenFeedback = `Dentes ${teethStr} selecionados na tela.`;
  } else if (action === 'clear_teeth' || conditionType === 'sio') {
    summary = `Dente(s) ${teethStr} redefinido(s) para hígido.`;
    spokenFeedback = `Dente ${teethStr} limpo com sucesso.`;
  } else {
    const condLabel = conditionType.replace('_', ' ').toUpperCase();
    const surfLabel = surfaces.length > 0 ? `nas faces ${surfaces.join(', ')}` : 'no dente inteiro';
    summary = `Aplicado ${condLabel} ${surfLabel} no(s) dente(s) ${teethStr}.`;
    spokenFeedback = `Pronto! Registrei ${condLabel} no dente ${teethStr}.`;
  }

  return {
    action,
    teeth: finalTeeth,
    conditionType,
    surfaces,
    isWholeTooth,
    notes: text,
    summary,
    spokenFeedback
  };
}

/**
 * Sends speech text to server Gemini AI route with fallback to local heuristic
 */
export async function parseDentalVoiceCommandWithGemini(
  textCommand: string,
  currentSelectedTeeth: number[] = []
): Promise<VoiceOdontogramResult> {
  try {
    const response = await fetch('/api/gemini/parse-voice-odontogram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textCommand, currentSelectedTeeth })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        return {
          action: data.data.action || 'apply_condition',
          teeth: data.data.teeth && data.data.teeth.length > 0 ? data.data.teeth : currentSelectedTeeth,
          conditionType: data.data.conditionType || 'carie',
          surfaces: data.data.surfaces || ['oclusal'],
          isWholeTooth: Boolean(data.data.isWholeTooth),
          notes: data.data.notes || '',
          summary: data.data.summary || `Comando processado para dente(s) ${data.data.teeth?.join(', ')}`,
          spokenFeedback: data.data.spokenFeedback || 'Comando registrado com sucesso!'
        };
      }
    }
  } catch (err) {
    console.warn('[VOICE GEMINI] Fallback para parser local inteligente:', err);
  }

  return parseLocalDentalVoiceCommand(textCommand, currentSelectedTeeth);
}

/**
 * Text to Speech (TTS) confirmation helper using Web Speech Synthesis API
 */
export function speakDentalFeedback(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt') || v.lang.includes('BR'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Erro ao sintetizar voz:', err);
  }
}
