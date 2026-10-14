import {buildAnamnesisPdf} from './anamnesisPdf.ts';
import {clinicalPanelRows,panelTitles,examDateValue} from './clinicalPanelRecord.ts';
import type {ClinicalPanelKind,ToothCondition,Patient,Professional} from '../types/index.ts';
import type {ClinicInfo} from '../context/AppContext';
const colors:Record<string,string>={carie:'#ef4444',restauracao:'#2563eb',restauracao_insatisfatoria:'#4ade80',necessidade_endodontica:'#fef08a',canal:'#f97316',endodontia_insatisfatoria:'#f97316',endodontia_satisfatoria:'#172554',extracao_indicada:'#9333ea',ausente:'#4b5563',implante:'#059669',protese:'#0891b2',girovertido:'#ea580c',calculo_supragengival:'#d97706',calculo_subgengival:'#92400e',sio:'#ffffff'};
export async function buildClinicalPanelPdf(input:{patient:Patient;panel:ClinicalPanelKind;date:string;data:any;clinic:ClinicInfo;professional?:Professional}){
 const rows=clinicalPanelRows(input.panel,input.data);
 const drawIntro=input.panel==='odontogram'?(pdf:any,y:number)=>{
  const conditions:ToothCondition[]=input.data.conditions || [];
  const groups=[[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],[55,54,53,52,51,61,62,63,64,65],[85,84,83,82,81,71,72,73,74,75],[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]];
  for(const group of groups){
   const start=(210-group.length*11)/2;
   group.forEach((tooth,i)=>{
    const d=conditions.find(c=>c.toothNumber===tooth),x=start+i*11;const upper=[1,2,5,6].includes(Math.floor(tooth/10));const anterior=tooth%10<=3;
    pdf.setFontSize(6);pdf.setTextColor(20);pdf.text(String(tooth),x+3,y);
    const right=[1,4,5,8].includes(Math.floor(tooth/10));
    const faces=['vestibular',right?'distal':'mesial',anterior?'incisal':'oclusal',right?'mesial':'distal',upper?'palatina':'lingual'];
    const cells=[[x,y+2,9,2],[x,y+4,2,5],[x+2,y+4,5,5],[x+7,y+4,2,5],[x,y+9,9,2]];
    cells.forEach((cell,j)=>{const recorded=d?.surfaces?.[faces[j]]||d?.wholeToothCondition;pdf.setFillColor(colors[recorded]||'#eeeeee');pdf.setDrawColor(120);pdf.rect(...cell,'FD');});
    if(d?.wholeToothCondition==='ausente'){pdf.setDrawColor(0);pdf.line(x,y+2,x+9,y+11);pdf.line(x+9,y+2,x,y+11);}
   });y+=18;
  }
  pdf.setTextColor(20);pdf.setFontSize(8);pdf.text('Cinza claro: sem registro. Os detalhes de cada face e condição estão abaixo.',15,y);return y+8;
 }:undefined;
 return buildAnamnesisPdf({patient:input.patient,anamnesis:{},clinic:input.clinic,professional:input.professional,date:examDateValue(input.date),documentTitle:panelTitles[input.panel],rows,drawIntro});
}
