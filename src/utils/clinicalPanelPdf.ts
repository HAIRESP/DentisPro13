import { captureClinicalPanel, ageAtExam } from './clinicalPanelCapture';
import { jsPDF, GState } from 'jspdf';
import type { ClinicInfo } from '../context/AppContext';
import type { Professional } from '../types';
async function pdfImage(url?: string): Promise<string | undefined> {
  if (!url) return undefined;
  if (/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(url)) return url;
  return new Promise((resolve,reject)=>{
    const img=new Image();img.crossOrigin='anonymous';
    const timer=setTimeout(()=>reject(Error('Tempo esgotado ao carregar uma imagem do layout.')),10000);
    img.onerror=()=>{clearTimeout(timer);reject(Error('Não foi possível carregar a marca d’água, assinatura ou carimbo. Confira o layout.'));};
    img.onload=()=>{
      clearTimeout(timer);
      try {const canvas=document.createElement('canvas');const scale=Math.min(1,1200/(img.naturalWidth||600));canvas.width=Math.max(1,Math.round((img.naturalWidth||600)*scale));canvas.height=Math.max(1,Math.round((img.naturalHeight||300)*scale));const ctx=canvas.getContext('2d');if(!ctx)throw Error('Conversão da imagem indisponível.');ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/png'));}
      catch {reject(Error('A imagem do layout não permite gerar o PDF. Carregue o arquivo em Configurações.'));}
    };img.src=url;
  });
}
export async function createClinicalPanelPdf(input: {title:string;patient:string;date:string;recordedAt:string;summary:string;clinic:ClinicInfo;professional?:Professional|null;birthDate?:string;source?:HTMLElement|null}) {
  const capture = input.source ? await captureClinicalPanel(input.source) : undefined;
  const pdf=new jsPDF({compress:true});
  const {clinic,professional}=input;
  const [watermark,signature,stamp]=await Promise.all([
    pdfImage(clinic.showWatermark?clinic.watermarkUrl:undefined),
    pdfImage(clinic.showSignatureImage!==false?professional?.signatureImageUrl:undefined),
    pdfImage(clinic.showStampImage!==false?professional?.stampImageUrl:undefined),
  ]);
  const decorate=()=>{
    pdf.setFillColor(255,255,255);pdf.rect(0,0,210,297,'F');
    if(watermark) {
      pdf.saveGraphicsState();pdf.setGState(new GState({opacity:(clinic.watermarkOpacity ?? 15)/100}));
      const props=pdf.getImageProperties(watermark);const w=Math.min(110,110*props.width/props.height);const h=w*props.height/props.width;
      pdf.addImage(watermark,props.fileType,(210-w)/2,(297-h)/2,w,h);pdf.restoreGraphicsState();
    }
    pdf.setFontSize(10);pdf.text(clinic.name || 'DentisPro',18,16);
    pdf.setFontSize(8);pdf.text(`Registrado em ${new Date(input.recordedAt).toLocaleString('pt-BR')}`,18,285);
  };
  decorate();let y=27;
  const line=(text:string,size=10)=>{pdf.setFontSize(size);for(const part of pdf.splitTextToSize(text,174)){if(y>260){pdf.addPage();decorate();y=27;pdf.setFontSize(size);}pdf.text(part,18,y);y+=5;}};
  line(input.title,15);y+=3;line(`Paciente: ${input.patient}`);line(`Data: ${input.date.split('-').reverse().join('/')}`);y+=5;
  line(`Idade na data do exame: ${ageAtExam(input.birthDate, input.date)}`);y+=3;
  if (capture) {
    const mmPerPixel = 174 / capture.width;
    let offset = 0;
    while (offset < capture.height) {
      let available = Math.floor((260 - y) / mmPerPixel);
      const remaining = capture.height - offset;
      const signatureSpace = professional ? 60 : 25;
      if (remaining <= available && remaining * mmPerPixel > 260 - y - signatureSpace) {
        available = Math.max(0, Math.floor((260 - y - signatureSpace) / mmPerPixel));
      }
      if (available < 1) { pdf.addPage();decorate();y=27;line(input.title,12);line(`Paciente: ${input.patient}`);line(`Idade: ${ageAtExam(input.birthDate,input.date)} • Data: ${input.date.split('-').reverse().join('/')}`);y+=3;continue; }
      let height = Math.min(available, capture.height - offset);
      if (height < capture.height - offset && height > 150) {
        // Prefer a whitespace row near the boundary instead of splitting a text line.
        const scan = capture.getContext('2d');
        if (scan) {
          for (let row = offset + height - 1; row > offset + height - 100; row--) {
            const pixels = scan.getImageData(0, row, capture.width, 1).data;
            let dark = 0;
            for (let x = 25; x < capture.width - 25; x += 4) {
              const i = x * 4;
              if (Math.min(pixels[i],pixels[i+1],pixels[i+2]) < 245 && pixels[i+3] > 128) dark++;
            }
            if (dark < 2) { height = row - offset + 1; break; }
          }
        }
      }
      const slice = document.createElement('canvas');slice.width=capture.width;slice.height=height;
      const ctx=slice.getContext('2d');if(!ctx)throw Error('Falha ao paginar a captura da aba.');
      ctx.drawImage(capture,0,offset,capture.width,height,0,0,capture.width,height);
      pdf.addImage(slice.toDataURL('image/jpeg',0.88),'JPEG',18,y,174,height*mmPerPixel);
      if(watermark){pdf.saveGraphicsState();pdf.setGState(new GState({opacity:(clinic.watermarkOpacity ?? 15)/100}));const props=pdf.getImageProperties(watermark);const w=Math.min(110,110*props.width/props.height);pdf.addImage(watermark,props.fileType,(210-w)/2,100,w,w*props.height/props.width);pdf.restoreGraphicsState();}
      y+=height*mmPerPixel;offset+=height;
      if (offset < capture.height) {
        pdf.addPage();decorate();y=27;line(input.title,12);line(`Paciente: ${input.patient}`);
        line(`Idade: ${ageAtExam(input.birthDate,input.date)} • Data: ${input.date.split('-').reverse().join('/')}`);y+=3;
      }
    }
    capture.width=1;capture.height=1;
  } else { for(const row of input.summary.split('\n'))line(row); }
  if(y>(professional?205:245)){pdf.addPage();decorate();y=27;}y+=10;
  const x=clinic.signatureAlignment==='left'?18:clinic.signatureAlignment==='center'?80:140;
  const graphic=(url:string|undefined,height:number)=>{if(!url)return; const props=pdf.getImageProperties(url);const w=Math.min(50,height*props.width/props.height);const h=w*props.height/props.width;pdf.addImage(url,props.fileType,x,y,w,h);y+=h;};
  if(professional){
    if(clinic.showSignatureImage!==false)graphic(signature,14);
    y+=10;
    if(clinic.showStampImage!==false)graphic(stamp,18);
    y+=6;pdf.setFontSize(9);
    const alignment=clinic.signatureAlignment || 'right';
    pdf.text(pdf.splitTextToSize(`${professional.name} - ${professional.cro}`,60),alignment==='left'?18:alignment==='center'?105:190,y,{align:alignment});
  } else {line('Assinatura do profissional: ______________________________');}
  for(let page=1;page<=pdf.getNumberOfPages();page++){pdf.setPage(page);pdf.setFontSize(8);pdf.text(`${page} / ${pdf.getNumberOfPages()}`,192,285,{align:'right'});}
  return pdf.output('datauristring');
}
