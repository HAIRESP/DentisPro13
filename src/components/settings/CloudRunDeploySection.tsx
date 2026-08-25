import React, { useState } from 'react';
import { 
  Cloud, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Server, 
  HelpCircle,
  FileCode,
  Globe
} from 'lucide-react';

export const CloudRunDeploySection: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const gcloudCommands = [
    {
      title: '1. Definir o Projeto GCP Alvo (da sua outra conta do Gmail)',
      cmd: 'gcloud config set project NOME_DO_SEU_PROJETO_GCP'
    },
    {
      title: '2. Habilitar os Serviços do Cloud Run e Cloud Build no GCP',
      cmd: 'gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com'
    },
    {
      title: '3. Executar o Comando de Implantação Direta (Single-Command Deploy)',
      cmd: 'gcloud run deploy dentispro-app \\\n  --source . \\\n  --region us-central1 \\\n  --allow-unauthenticated \\\n  --port 3000'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5d1] p-5 sm:p-6 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base text-[#2c2c2c] flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-600" />
            <span>Implantação no Google Cloud Run (Outra Conta Gmail / GCP)</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Instruções completas e comandos prontos para publicar o software no Cloud Run de outra conta do Google
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://console.cloud.google.com/run"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
            <span>Console Cloud Run</span>
          </a>
        </div>
      </div>

      <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-2">
        <p className="font-bold flex items-center gap-1.5 text-sky-950">
          <Server className="w-4 h-4 text-sky-600" />
          <span>Estrutura Pronta para Produção Docker / Cloud Run:</span>
        </p>
        <p className="leading-relaxed font-medium">
          O projeto já possui os arquivos <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-bold">Dockerfile</code>, <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-bold">.dockerignore</code> e <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-bold">server.ts</code> compilados para escutar na porta <strong>3000</strong>.
        </p>
      </div>

      {/* Step-by-Step Commands */}
      <div className="space-y-4">
        <h4 className="font-bold text-xs text-[#5a5a40] uppercase tracking-wide flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-[#d4a373]" />
          <span>Passos para Implantar na Nova Conta (Via Google Cloud Shell):</span>
        </h4>

        <div className="space-y-3">
          {gcloudCommands.map((step, idx) => (
            <div key={idx} className="bg-[#18181b] text-zinc-100 p-3.5 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>{step.title}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(step.cmd, idx)}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-[11.5px] font-mono text-emerald-400 whitespace-pre-wrap break-all bg-black/40 p-2.5 rounded-lg border border-zinc-800">
                {step.cmd}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Key Steps Explanation */}
      <div className="bg-[#fbfbf9] p-4 rounded-xl border border-[#e5e5d1] text-xs space-y-2 text-stone-700 font-medium">
        <p className="font-bold text-[#2c2c2c] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#5a5a40]" />
          <span>Dicas e Boas Práticas de Implantação:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
          <li><strong>Múltiplos Usuários:</strong> As sessões e permissões continuam ativas através da integração com o Firebase Auth e Firestore.</li>
          <li><strong>HTTPS Automático:</strong> O Cloud Run gera um domínio com certificado SSL automático gratuito (ex: <code className="bg-[#e5e5d1] px-1 rounded">https://dentispro-app-xxx-uc.a.run.app</code>).</li>
          <li><strong>Variáveis de Ambiente:</strong> No console do Cloud Run, você pode configurar <code className="bg-[#e5e5d1] px-1 rounded">GEMINI_API_KEY</code> para o assistente de IA.</li>
        </ul>
      </div>
    </div>
  );
};
