import { anamnesisFontRegular, anamnesisFontBold } from './anamnesisFont.ts';
import { jsPDF, GState } from 'jspdf';
import type { Anamnesis, Patient, Professional, SavedClinicDocument } from '../types';
import type { ClinicInfo } from '../context/AppContext';
import { anamnesisRows } from './anamnesisData.ts';
import { formatSafeFilename } from './printUtils.ts';

export type AnamnesisPdfInput = { patient: Partial<Patient>; anamnesis: Partial<Anamnesis>;
  clinic: ClinicInfo; professional?: Partial<Professional>; date?: Date };

async function loadImage(url?: string): Promise<string | undefined> {
  if (!url) return undefined;
  if (!url.startsWith('data:image/') && !/^https?:\/\//i.test(url)) throw Error('Formato de imagem do layout não suportado.');
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => reject(Error('Não foi possível carregar uma imagem do layout. Confira a imagem em Configurações.')), 10000);
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch { reject(Error('A imagem do layout não permite exportação. Carregue o arquivo da imagem em Configurações.')); }
    };
    image.onerror = () => { clearTimeout(timer); reject(Error('Uma imagem do layout não carregou. Confira assinatura, carimbo e marca d’água.')); };
    image.src = url;
  });
}
export async function buildAnamnesisPdf(input: AnamnesisPdfInput) {
  const {patient, anamnesis, clinic, professional} = input;
  const date = input.date || new Date();
  if (isNaN(date.getTime())) throw Error('Data do documento inválida.');
  const signatureUrl = clinic.showSignatureImage === false ? undefined : professional?.signatureImageUrl || clinic.signatureImageUrl;
  const stampUrl = clinic.showStampImage === false ? undefined : professional?.stampImageUrl || clinic.stampImageUrl;
  const [watermark, signature, stamp] = await Promise.all([
    loadImage(clinic.showWatermark ? clinic.watermarkUrl : undefined), loadImage(signatureUrl), loadImage(stampUrl),
  ]);
  const pdf = new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
  pdf.addFileToVFS('Anamnesis-Regular.ttf',anamnesisFontRegular);pdf.addFont('Anamnesis-Regular.ttf','Anamnesis','normal');
  pdf.addFileToVFS('Anamnesis-Bold.ttf',anamnesisFontBold);pdf.addFont('Anamnesis-Bold.ttf','Anamnesis','bold');
  const name = professional?.name || clinic.dentistName;
  const cro = professional?.cro || clinic.cro;
  pdf.setProperties({title: 'Prontuário Médico e Histórico Clínico Completo', author:name});
  const left = 15, width = 180, bottom = 275;
  let y = 0;
  function imageBox(data: string, x: number, top: number, w: number, h: number) {
    const dimensions = pdf.getImageProperties(data);
    const scale = Math.min(w / dimensions.width, h / dimensions.height);
    const iw = dimensions.width * scale, ih = dimensions.height * scale;
    pdf.addImage(data,'PNG',x+(w-iw)/2,top+(h-ih)/2,iw,ih);
  }
  function page() {
    pdf.setFillColor(255,255,255); pdf.rect(0,0,210,297,'F');
    if (watermark) {
      pdf.saveGraphicsState();
      const opacity = Math.max(0, Math.min(100, clinic.watermarkOpacity ?? 15)) / 100;
      pdf.setGState(new GState({opacity})); imageBox(watermark,55,95,100,100); pdf.restoreGraphicsState();
    }
    y=16; pdf.setFont('Anamnesis','bold'); pdf.setFontSize(11);
    const header = pdf.splitTextToSize(clinic.headerTitle || clinic.name, width);
    pdf.text(header,left,y); y += header.length * 5;
    pdf.setFont('Anamnesis','normal'); pdf.setFontSize(9);
    const sub = pdf.splitTextToSize(clinic.headerSubtitle || `${name || ''} • ${cro || ''}`,width);
    pdf.text(sub,left,y); y+=sub.length*4+3;
    pdf.setDrawColor(170);pdf.line(left,y,195,y);y+=6;
    pdf.setFont('Anamnesis','bold');pdf.setFontSize(12);
    pdf.text('Prontuário Médico e Histórico Clínico Completo',left,y);y+=7;
    pdf.setFont('Anamnesis','normal');pdf.setFontSize(9);
    const identity = pdf.splitTextToSize(`Paciente: ${patient.name || 'Não informado'} | CPF: ${patient.cpf || 'Não informado'}\nNascimento: ${patient.birthDate?.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1') || 'Não informado'} | Data: ${date.toLocaleDateString('pt-BR')}`,width);
    pdf.text(identity,left,y);y+=identity.length*4+5;
  }
  function ensure(height: number) { if(y+height>bottom){pdf.addPage();page();} }
  function text(value:string,bold=false) {
    pdf.setFont('Anamnesis',bold?'bold':'normal');pdf.setFontSize(9);
    const lines: string[] = pdf.splitTextToSize(value,width);
    for(const line of lines){ensure(5);pdf.text(line,left,y);y+=4.3;}
  }
  page();
  let section='';
  for(const row of anamnesisRows(anamnesis)){
    if(row.section!==section){ensure(18);y+=3;text(row.section,true);y+=2;section=row.section;}
    ensure(10);text(row.label,true);text(row.answer);y+=2;
  }
  const labelLines=pdf.splitTextToSize(clinic.signatureLabel || `${name || ''} • ${cro || ''}`,60);
  const signatureHeight=37 + (signature ? 14 : 0) + (clinic.showSignatureLine!==false ? 4 : 0) + labelLines.length*4 + (stamp ? 28 : 0);
  ensure(signatureHeight);y+=5;
  text('Conferência das informações',true);
  text('Informações relatadas pelo paciente ou responsável e revisadas pelo profissional.');
  y+=10;pdf.line(15,y,95,y);pdf.line(115,y,195,y);y+=5;
  pdf.text('Paciente / responsável',15,y);pdf.text('Data da conferência: ____/____/________',115,y);y+=8;
  const x = clinic.signatureAlignment==='left' ? 15 : clinic.signatureAlignment==='center' ? 75 : 135;
  if(signature){imageBox(signature,x,y,60,14);y+=14;}
  if(clinic.showSignatureLine!==false){pdf.line(x,y,x+60,y);y+=4;}
  const signLabel = pdf.splitTextToSize(clinic.signatureLabel || `${name || ''} • ${cro || ''}`,60);
  pdf.text(signLabel,x,y);y+=signLabel.length*4;
  if(stamp){y+=10;imageBox(stamp,x,y,60,18);y+=18;}
  const pages = pdf.getNumberOfPages();
  for(let p=1;p<=pages;p++){
    pdf.setPage(p);pdf.setFont('Anamnesis','normal');pdf.setFontSize(8);
    const footer=pdf.splitTextToSize(clinic.footerText || `${clinic.address || ''} • ${clinic.city || ''} • ${clinic.phone || ''}`,155);
    pdf.text(footer.slice(0,2),15,286);
    pdf.text(`${p} / ${pages}`,195,290,{align:'right'});
  }
  return {pdf,filename:formatSafeFilename('Prontuario_Medico_Historico_Clinico',patient.name,date)+'.pdf'};
}
export async function exportAnamnesisPdf(input:AnamnesisPdfInput,mode:'download'|'preview'='download') {
  const popup = mode==='preview' ? window.open('about:blank','_blank') : null;
  if(mode==='preview' && !popup) throw Error('O navegador bloqueou a nova aba. Use Baixar PDF ou permita a abertura.');
  if(popup){popup.opener=null;popup.document.title='Preparando prontuário';popup.document.body.textContent='Preparando PDF…';}
  try {
    const {pdf,filename}=await buildAnamnesisPdf(input);
    if(mode==='download'){pdf.save(filename);return;}
    const url=URL.createObjectURL(pdf.output('blob'));
    popup!.location.replace(url);
    // The browser PDF viewer offers printing and saving. Keep its URL valid while open.
    const timer=window.setInterval(()=>{if(popup!.closed){URL.revokeObjectURL(url);window.clearInterval(timer);}},1000);
  } catch(error){popup?.close();throw error;}
}
export function archivedAnamnesisInput(doc:SavedClinicDocument,clinic:ClinicInfo):AnamnesisPdfInput {
  let data: unknown;
  try{data=JSON.parse(doc.content || '');}catch{throw Error('O prontuário arquivado não contém respostas legíveis.');}
  if(!data || typeof data!=='object' || Array.isArray(data))throw Error('Formato do prontuário arquivado inválido.');
  return {patient:{...doc.patientSnapshot,id:doc.patientId,name:doc.patientName,cpf:doc.patientCpf},
    anamnesis:data as Anamnesis,
    clinic:doc.templateData?.anamnesisLayout || {...clinic,showSignatureImage:false,showStampImage:false,signatureLabel:`${doc.professionalName || ''} • ${doc.professionalCro || ''}`},
    professional:doc.templateData?.anamnesisProfessional || {name:doc.professionalName,cro:doc.professionalCro},date:new Date(doc.createdAt)};
}

export function openStoredPatientPdf(dataUrl:string) {
  if(!dataUrl.startsWith('data:application/pdf') || !dataUrl.includes(';base64,'))throw Error('Arquivo PDF inválido.');
  const binary=atob(dataUrl.split(',')[1]);
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const popup=window.open(url,'_blank');
  if(!popup){URL.revokeObjectURL(url);throw Error('Permita a abertura de uma nova aba para visualizar o PDF.');}
  popup.opener=null;
  const timer=window.setInterval(()=>{if(popup.closed){URL.revokeObjectURL(url);window.clearInterval(timer);}},1000);
}
