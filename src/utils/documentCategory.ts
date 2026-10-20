export function documentCategoryLabel(category:string):string {
 const labels:Record<string,string>={atestado:'Atestado',receita:'Receita',receituario:'Receita',solicitacao:'Solicitação',declaracao:'Declaração',termo:'Termo',prontuario:'Prontuário',outro:'Outro'};
 return labels[category] || 'Outro';
}

export function validateModelMetadata<T extends {title:string;subtitle:string;description:string;category:string}>(details:T):T {
 if(!details.title.trim())throw Error('Informe o nome do modelo.');
 if(!['atestado','receita','solicitacao','declaracao','termo','outro'].includes(details.category))throw Error('Tipo de documento inválido.');
 return {...details,title:details.title.trim()};
}
export function removeCustomModel<T extends {id:string}>(models:T[],id:string):T[] {
 if(!id.startsWith('custom-'))throw Error('Este modelo padrão não pode ser excluído.');
 return models.filter(model=>model.id!==id);
}
