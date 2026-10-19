import type { AIProvider } from '../context/AppContext';
import type { ToothCondition, ToothConditionType, ToothSurface } from '../types/index.ts';

export interface VoiceOdontogramResult {
  action: 'apply_condition' | 'select_teeth' | 'clear_teeth' | 'add_notes' | 'needs_review';
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


const normalize = (text:string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const validTeeth = new Set([...ALL_PERMANENTS,...ALL_DECIDUOUS]);
const allFaces:ToothSurface[]=['mesial','distal','oclusal','incisal','vestibular','lingual','palatina'];
const surfaceConditions=new Set<ToothConditionType>(['carie','restauracao','restauracao_insatisfatoria']);
function validFaces(tooth:number):ToothSurface[]{
  const quadrant=Math.floor(tooth/10),position=tooth%10;
  const upper=[1,2,5,6].includes(quadrant);
  return ['mesial','distal','vestibular',position<=3?'incisal':'oclusal',upper?'palatina':'lingual'] as ToothSurface[];
}
function review(message:string):VoiceOdontogramResult {
  return {action:'needs_review',teeth:[],conditionType:'sio',surfaces:[],isWholeTooth:false,summary:message,spokenFeedback:message};
}
export function parseLocalDentalVoiceCommand(rawTranscript:string,currentlySelectedTeeth:number[]=[]):VoiceOdontogramResult {
  const raw=rawTranscript.trim();const text=normalize(raw);
  if(!text)return review('Digite ou fale um comando. Nenhuma alteração foi feita.');
  const noteAction=/^(?:por favor )?(anotar|anote|observacao|observacoes|nota|notas|registrar observacao|adicionar observacao)\b/.test(text);
  const selectAction=/\b(selecionar|selecione|escolher|escolha|marque os dentes)\b/.test(text);
  const clearAction=/\b(limpar|apagar|redefinir|restaurar higido)\b/.test(text);
  // Notes may contain numbers and clinical words; only the explicit tooth phrase is a target.
  let toothText=noteAction ? (text.match(/\bdentes?\s+(.+?)(?=\s+(?:nota|observacao|com|apresenta|relata|sensibilidade|dor)\b|[:;]|$)/)?.[1] || '') : text;
  for(const [word,number] of Object.entries(WORD_TO_NUMBER).sort((a,b)=>b[0].length-a[0].length)){
    const w=normalize(word);toothText=toothText.replace(new RegExp('\\b'+w+'\\b','g'),String(number));
  }
  toothText=toothText.replace(/\b([1-8])\s+([1-8])\b/g,'$1$2');
  let teeth:number[]=[];
  const arch= /\bsuperior(?:es)?\b/.test(text)?'upper':/\binferior(?:es)?\b/.test(text)?'lower':null;
  let group:number[]=[];
  if(/\b(pre[- ]?molares)\b/.test(text))group=[15,14,24,25,45,44,34,35];
  else if(/\bmolares\b/.test(text))group=[18,17,16,26,27,28,48,47,46,36,37,38];
  else if(/\b(anteriores)\b/.test(text))group=[13,12,11,21,22,23,43,42,41,31,32,33];
  else if(/\b(sisos|siso|terceiros? molares?)\b/.test(text))group=[18,28,38,48];
  else if(/\b(deciduos|dentes de leite)\b/.test(text))group=ALL_DECIDUOUS;
  else if(/\b(arcada|permanentes|toda a boca|todos os dentes|todos dentes)\b/.test(text))group=ALL_PERMANENTS;
  if(group.length)teeth=group.filter(t=>!arch || (arch==='upper'?[1,2,5,6]:[3,4,7,8]).includes(Math.floor(t/10)));
  const numbers=[...toothText.matchAll(/\b\d+\b/g)].map(m=>Number(m[0]));
  if(numbers.some(n=>!validTeeth.has(n)))return review('Há um número de dente inválido ou ambíguo. Use a numeração FDI.');
  teeth.push(...numbers);
  const range=toothText.match(/\b(\d{2})\s*(?:a|ao|ate)\s*(\d{2})\b/);
  if(range){
    const a=Number(range[1]),b=Number(range[2]);
    if(Math.floor(a/10)!==Math.floor(b/10))return review('O intervalo atravessa quadrantes. Liste os dentes separadamente.');
    for(let t=Math.min(a,b);t<=Math.max(a,b);t++)if(validTeeth.has(t))teeth.push(t);
  }
  if(!teeth.length){
    if(/\bdentes?\b/.test(text))return review('Não foi possível identificar o dente mencionado. Informe a numeração FDI.');
    teeth=currentlySelectedTeeth.filter(t=>validTeeth.has(t));
  }
  teeth=[...new Set(teeth)].sort((a,b)=>a-b);
  if(!teeth.length)return review('Informe o dente ou selecione os dentes na tela. Nenhuma alteração foi feita.');
  const finish=(action:VoiceOdontogramResult['action'],conditionType:ToothConditionType,surfaces:ToothSurface[],whole:boolean,summary:string):VoiceOdontogramResult=>({action,teeth,conditionType,surfaces,isWholeTooth:whole,notes:raw,summary,spokenFeedback:summary});
  if(noteAction)return finish('add_notes','sio',[],false,`Observação preparada para os dentes ${teeth.join(', ')}.`);
  if(/\b(nao|nega|negou|sem|ausencia de|livre de|descartar|suspeita|possivel|talvez)\b/.test(text) && !/\bnao tem (?:o )?dente\b/.test(text))return review('Frase negativa ou incerta: revise o comando ou registre como observação. Nenhuma condição foi alterada.');
  if(selectAction && clearAction)return review('O comando mistura selecionar e apagar. Envie uma ação por vez.');
  if(selectAction)return finish('select_teeth','sio',[],false,`Dentes ${teeth.join(', ')} selecionados.`);
  if(clearAction){
    if(/\b(face|faces|mesial|distal|oclusal|incisal|vestibular|lingual|palatina|carie|restauracao|calculo|nota|notas)\b/.test(text))return review('Para limpar uma face, use os controles manuais. Este comando não apagou o dente inteiro.');
    return finish('clear_teeth','sio',allFaces,true,`Redefinição para hígido preparada para os dentes ${teeth.join(', ')}.`);
  }
  if((text.match(/\bdentes?\b/g)||[]).length>1)return review('Há comandos separados por dente. Envie uma condição e um grupo de dentes por vez.');
  const matches:ToothConditionType[]=[];
  if(/\b(carie|caries|lesao cariosa)\b/.test(text))matches.push('carie');
  if(/\b(restauracao|restauracoes|resina|amalgama|obturacao)\b/.test(text))matches.push(/\b(insatisfatoria|insatisfatorias|infiltrada|infiltracao|recidiva)\b/.test(text)?'restauracao_insatisfatoria':'restauracao');
  if(/\b(necessidade endodontica|biopulpectomia|necropulpectomia|abrir canal)\b/.test(text))matches.push('necessidade_endodontica');
  else if(/\b(endodontia satisfatoria|canal tratado|canal obturado|endo tratada)\b/.test(text))matches.push('endodontia_satisfatoria');
  else if(/\b(endodontia insatisfatoria|canal insatisfatorio)\b/.test(text))matches.push('endodontia_insatisfatoria');
  else if(/\b(canal|endodontia|endo|tratamento endodontico)\b/.test(text))return review('Informe se a endodontia é necessária, satisfatória ou insatisfatória.');
  if(/\b(extracao indicada|exodontia indicada|extrair)\b/.test(text))matches.push('extracao_indicada');
  else if(/\b(extracao realizada|exodontia realizada)\b/.test(text))matches.push('ausente');
  else if(/\b(extracao|exodontia)\b/.test(text))return review('Informe se a extração é indicada ou já foi realizada.');
  if(/\b(ausente|ausentes|extraido|extraidos|agenesia)\b/.test(text)||/\bnao tem (?:o )?dente\b/.test(text))matches.push('ausente');
  if(/\b(implante|implantes|osseointegrado)\b/.test(text))matches.push('implante');
  if(/\b(protese|coroa|faceta|onlay|inlay)\b/.test(text))matches.push('protese');
  if(/\b(subgengival|subgengivais|tartaro sub)\b/.test(text))matches.push('calculo_subgengival');
  else if(/\b(supragengival|supragengivais|tartaro supra)\b/.test(text))matches.push('calculo_supragengival');
  else if(/\b(calculo|tartaro)\b/.test(text))return review('Informe se o cálculo é supragengival ou subgengival.');
  if(/\b(girovertido|giroversao|girado|rodado)\b/.test(text))matches.push('girovertido');
  if(/\b(higido|integro)\b/.test(text))matches.push('sio');
  if(matches.length!==1)return review(matches.length?'Há condições diferentes no mesmo comando. Envie uma condição por vez.':'Não reconheci uma condição clínica. Nenhuma alteração foi feita.');
  const condition=matches[0];
  if(/\b(necessita|planejar|planejado|indicar|indicado|proposto)\b/.test(text) && condition!=='extracao_indicada')return review('O comando descreve planejamento. Registre uma observação ou informe a condição atual explicitamente.');
  const surfaces:ToothSurface[]=[];
  for(const face of allFaces)if(new RegExp('\\b'+face+'\\b').test(text))surfaces.push(face);
  if(/\btodas as faces\b/.test(text))surfaces.push(...allFaces);
  const whole=!surfaceConditions.has(condition);
  if(!whole && !surfaces.length)return review('Informe a face: mesial, distal, vestibular, palatina, lingual, oclusal ou incisal.');
  // Explicit anatomically impossible faces are rejected; “todas” adapts to each tooth.
  if(!/\btodas as faces\b/.test(text) && surfaces.some(face=>teeth.some(tooth=>!validFaces(tooth).includes(face))))return review('A face informada não corresponde a todos os dentes selecionados. Separe os comandos por dente ou grupo anatômico.');
  if(whole && surfaces.length)return review('Essa condição é registrada no dente inteiro. Revise a indicação de faces.');
  return finish('apply_condition',condition,[...new Set(surfaces)],whole,`Comando preparado: ${condition.replaceAll('_',' ')} nos dentes ${teeth.join(', ')}${surfaces.length?' — '+surfaces.join(', '):''}.`);
}

/** Supported commands are interpreted locally; an AI response cannot invent targets or findings. */
export async function parseDentalVoiceCommandWithAI(text:string,selected:number[]=[],_provider:AIProvider='disabled'):Promise<VoiceOdontogramResult>{
  return parseLocalDentalVoiceCommand(text,selected);
}

/** Build updates without changing unrelated findings; notes append instead of painting a lesion. */
export function buildVoiceToothUpdates(result:VoiceOdontogramResult,existing:ToothCondition[]):ToothCondition[]{
  if(result.action==='needs_review'||result.action==='select_teeth')return [];
  return result.teeth.filter(t=>validTeeth.has(t)).map(toothNumber=>{
    const prior=existing.find(c=>c.toothNumber===toothNumber)||{toothNumber};
    if(result.action==='add_notes')return {...prior,notes:[prior.notes,result.notes].filter(Boolean).join('\n')};
    if(result.action==='clear_teeth'||result.conditionType==='sio')return {...prior,toothNumber,wholeToothCondition:'sio',isGirovertido:false,hasCalculoSupra:false,hasCalculoSub:false,surfaces:Object.fromEntries(allFaces.map(f=>[f,'sio'])),notes:''};
    if(surfaceConditions.has(result.conditionType)){
      const surfaces={...prior.surfaces};
      for(const face of result.surfaces)if(validFaces(toothNumber).includes(face))surfaces[face]=result.conditionType;
      return {...prior,toothNumber,surfaces};
    }
    if(result.conditionType==='girovertido')return {...prior,toothNumber,isGirovertido:true};
    if(result.conditionType==='calculo_supragengival')return {...prior,toothNumber,hasCalculoSupra:true};
    if(result.conditionType==='calculo_subgengival')return {...prior,toothNumber,hasCalculoSub:true};
    return {...prior,toothNumber,wholeToothCondition:result.conditionType};
  });
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
    const ptVoice = voices.find(v => v.localService && (v.lang.startsWith('pt') || v.lang.includes('BR')));
    if (!ptVoice) return;
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Erro ao sintetizar voz:', err);
  }
}
