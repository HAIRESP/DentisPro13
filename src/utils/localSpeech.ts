export function speechErrorMessage(code:string){
 const messages:Record<string,string>={'not-allowed':'Permita o microfone para este site no Chrome.','service-not-allowed':'O reconhecimento de fala está bloqueado pelo navegador.','audio-capture':'Não foi possível acessar o microfone. Confira o dispositivo de entrada.','language-not-supported':'O reconhecimento local em português não está disponível. Confira o pacote de idioma do navegador.','no-speech':'Nenhuma fala foi detectada. Aproxime-se do microfone e tente novamente.','network':'Falha no reconhecimento local. O áudio não foi enviado para um provedor remoto.','aborted':'Captura encerrada.'};
 return messages[code] || `Não foi possível iniciar a transcrição (${code || 'erro desconhecido'}).`;
}
export async function prepareLocalSpeech(Ctor:any,recognition:any,report:(message:string)=>void){
 if(!Ctor || !recognition || !('processLocally' in recognition))throw Error('Este navegador não oferece reconhecimento local de voz. Use a transcrição digitada enquanto verificamos o suporte.');
 recognition.processLocally=true;recognition.lang='pt-BR';
 if(typeof Ctor.available==='function'){
  report('Verificando reconhecimento local em português…');
  const status=await Ctor.available({langs:['pt-BR'],processLocally:true});
  if(status==='unavailable')throw Error('Português não está disponível para reconhecimento local neste navegador.');
  if(status!=='available'){
   if(typeof Ctor.install!=='function')throw Error('O pacote local de português não está instalado e este navegador não oferece sua preparação.');
   report('Preparando pacote de português. Aguarde…');
   const installed=await Ctor.install({langs:['pt-BR']});
   if(!installed)throw Error('Não foi possível preparar o pacote local de português. Tente novamente.');
   if(await Ctor.available({langs:['pt-BR'],processLocally:true})!=='available')throw Error('O pacote de português ainda não está disponível. Aguarde a preparação e tente novamente.');
  }
 }
 report('Solicitando acesso ao microfone…');
}
