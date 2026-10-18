import React from 'react';
import type { ClinicalPanelReport } from '../../types';
export function ClinicalReportsGallery({reports=[]}:{reports?:ClinicalPanelReport[]}) {
  const download=(report:ClinicalPanelReport)=>{
    const encoded=report.pdf.split(',')[1];
    if(!encoded) return;
    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=`${report.title.replace(/[^\p{L}\p{N}-]/gu,'_')}_${report.examDate}_${report.id.slice(0,8)}.pdf`;
    anchor.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
  };
  return <section className="bg-white border rounded-2xl p-5 space-y-3">
    <h3 className="font-bold">PDFs dos exames salvos</h3>
    {!reports.length && <p className="text-sm text-stone-500">Os PDFs aparecerão aqui ao salvar os painéis de exame.</p>}
    {reports.map(report=><div key={report.id} className="border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-semibold">{report.title} — {report.examDate.split('-').reverse().join('/')}</p>
        <p className="text-xs text-stone-500">{report.professionalName} · Arquivado em {new Date(report.createdAt).toLocaleString('pt-BR')}</p></div>
      <button type="button" onClick={()=>download(report)} className="border rounded-lg p-2 text-sm">Baixar PDF</button>
    </div>)}
  </section>;
}
