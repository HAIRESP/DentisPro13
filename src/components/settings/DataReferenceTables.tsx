import React,{useState} from 'react';
import {PROCEDURE_REFERENCE} from '../../data/procedureReference';
import {ENTITY_REFERENCES} from '../../data/entityReferences';
export function DataReferenceTables(){
 const [selected,setSelected]=useState('procedures');const [query,setQuery]=useState('');
 const entity=ENTITY_REFERENCES.find(e=>e.id===selected);
 const rows=selected==='procedures'?PROCEDURE_REFERENCE:entity?.fields || [];
 const filtered=rows.filter(row=>JSON.stringify(row).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
 return <section className="bg-white border border-[#e5e5d1] rounded-[24px] p-5 space-y-4 text-[#5a5a40]">
  <h2 className="font-bold text-lg">Tabelas de referência</h2>
  <p className="text-xs text-gray-600">Estrutura, regras e exemplos para análise do software. Os exemplos desta página não preenchem cadastros nem registros clínicos.</p>
  <div className="flex flex-wrap gap-3"><label className="text-xs font-semibold">Tabela<select value={selected} onChange={e=>{setSelected(e.target.value);setQuery('');}} className="block border border-[#e5e5d1] rounded-xl p-2 mt-1"><option value="procedures">Procedimentos — planilha anexa (22 parâmetros)</option>{ENTITY_REFERENCES.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label><label className="text-xs font-semibold">Buscar campo<input value={query} onChange={e=>setQuery(e.target.value)} className="block border border-[#e5e5d1] rounded-xl p-2 mt-1" /></label></div>
  <p className="text-xs">{selected==='procedures'?'Fonte: parametros_procedimento_odontologico.xltx. Conteúdo de referência preservado; funcionamento atual indicado em cada linha.':entity?.description}</p>
  <p className="text-xs font-semibold">{filtered.length} de {rows.length} campos</p>
  <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="bg-[#f4f4ec]"><tr>{['Categoria / campo','Descrição / regra','Exemplo ilustrativo','Correspondência no software','Situação'].map(t=><th key={t} className="p-3">{t}</th>)}</tr></thead><tbody>{filtered.map((row:any)=><tr key={row.key} className="border-t border-[#e5e5d1] align-top"><td className="p-3 min-w-[180px]"><span className="block text-gray-500 mb-1">{row.category}</span><strong>{row.label}</strong></td><td className="p-3 min-w-[220px] whitespace-pre-wrap">{row.description}</td><td className="p-3 min-w-[180px] whitespace-pre-wrap text-gray-600">{row.example || 'Não fornecido'}</td><td className="p-3 break-words">{row.path}</td><td className="p-3 min-w-[180px]"><strong>{row.status}</strong>{row.note && <p className="mt-2 text-amber-800">{row.note}</p>}</td></tr>)}</tbody></table></div>
 </section>;
}
