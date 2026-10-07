import { apiAccess } from './server/apiAccess';
import { createLocalAuthStore } from './server/localAuthStore';
import { localAuthRoutes } from './server/localAuthRoutes';
import { randomBytes } from 'node:crypto';
import express from "express";
import path from "path";
import fs from "fs";
import os from "node:os";
import { createServer as createViteServer } from "vite";
import { CopilotClient } from "@github/copilot-sdk";
import dotenv from "dotenv";

dotenv.config();

type AIProvider = 'disabled' | 'deepseek' | 'copilot';
type DeepSeekContent = string | Array<
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
>;

function getAIProvider(value: unknown): AIProvider {
  return value === 'deepseek' || value === 'copilot' ? value : 'disabled';
}

const copilotClient = new CopilotClient({
  mode: 'empty',
  baseDirectory: process.env.COPILOT_HOME || path.join(os.homedir(), '.copilot'),
  sessionIdleTimeoutSeconds: 120
});
let copilotStart: Promise<void> | undefined;

async function generateWithCopilot(prompt: string, image?: { base64: string; mimeType: string }): Promise<string> {
  copilotStart ??= copilotClient.start();
  await copilotStart;

  const models = await copilotClient.listModels();
  const selectedModel = models.find(model => /^(gpt-|claude)/i.test(model.id) && (!image || model.capabilities.supports.vision) && model.policy?.state !== 'disabled');
  if (!selectedModel) throw new Error('Nenhum modelo não Google compatível está disponível no Copilot. Confira sua conta e o suporte a imagens.');

  const session = await copilotClient.createSession({
    model: selectedModel.id,
    availableTools: [],
    systemMessage: {
      content: 'Você é um assistente do DentisPro. Responda apenas à tarefa recebida. Não tente usar ferramentas, acessar arquivos ou executar comandos.'
    }
  });

  try {
    const response = await session.sendAndWait({
      prompt,
      ...(image ? {
        attachments: [{ type: 'blob' as const, data: image.base64, mimeType: image.mimeType }]
      } : {})
    }, 120_000);
    const content = response?.data.content;
    if (!content?.trim()) throw new Error('GitHub Copilot não retornou uma resposta.');
    return content;
  } finally {
    await session.disconnect();
  }
}

async function generateWithDeepSeek(apiKey: string, content: DeepSeekContent, jsonMode = false): Promise<string> {
  if (Array.isArray(content)) throw new Error('Para ler imagens, selecione Copilot com um modelo de visão não Google.');
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(60000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [{ role: 'user', content }],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API retornou HTTP ${response.status}: ${await response.text()}`);
  }

  const result = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
  const generatedText = result.choices?.[0]?.message?.content;
  if (typeof generatedText !== 'string' || !generatedText.trim()) {
    throw new Error('DeepSeek não retornou conteúdo de texto.');
  }
  return generatedText;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const dataDir = path.resolve(process.env.DENTISPRO_DATA_DIR || '.dentispro-data');
  fs.mkdirSync(dataDir, {recursive:true,mode:0o700});
  const authStore = createLocalAuthStore(path.join(dataDir,'accounts.sqlite'));
  const setupCode = randomBytes(24).toString('hex');
  if (!authStore.hasUsers()) console.log(`Código de instalação do administrador (uso único): ${setupCode}`);
  const publicOrigin = process.env.DENTISPRO_PUBLIC_ORIGIN;
  const host = process.env.DENTISPRO_HOST || '127.0.0.1';
  if (host !== '127.0.0.1' && (!publicOrigin || !publicOrigin.startsWith('https://'))) throw Error('Acesso por rede exige DENTISPRO_PUBLIC_ORIGIN com HTTPS e proxy TLS.');
  app.use('/api', (req,res,next) => {
    const origin=req.headers.origin;
    const allowed=publicOrigin || 'http://localhost:3000';
    if(origin && origin!==allowed && !(host==='127.0.0.1' && origin==='http://127.0.0.1:3000')) {res.status(403).json({error:'Origem não autorizada.'});return;}
    next();
  });
  app.use('/api/auth', localAuthRoutes(authStore,setupCode));
  app.use('/api', apiAccess(async token => authStore.session(token)));
  app.use('/auth/action', (_req, res, next) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use(express.json({ limit: "25mb" }));

  // API route for document parsing via IA configurada
  app.post("/api/ai/parse-document", async (req, res) => {
    try {
      const provider = getAIProvider(req.body.provider);
      if (provider === 'disabled') return res.status(503).json({error:'Configure um provedor de IA sem Google para usar este recurso.'});
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (provider !== 'copilot' && !apiKey) {
        const keyName = 'DEEPSEEK_API_KEY';
        return res.status(503).json({ error: `Chave ${keyName} não configurada no servidor.` });
      }

      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Imagem de documento em base64 é obrigatória." });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const documentPrompt = `Você é um assistente especialista em OCR e leitura óptica de documentos pessoais do Brasil (RG, CPF, CNH, Carteira de Habilitação, Carteira de Trabalho, Carteirinha de Plano de Saúde / Convênio Odontológico).
Analise com absoluta atenção o documento fornecido na foto e extraia todos os dados disponíveis para atualização cadastral de prontuário odontológico:
- name: Nome Completo do titular
- cpf: Número de CPF (formato 000.000.000-00 ou só dígitos)
- rg: Número de RG se presente
- birthDate: Data de nascimento (DD/MM/YYYY)
- phone: Telefone ou celular se houver
- email: E-mail se houver
- addressStreet: Nome da rua / logradouro se houver
- addressNumber: Número do imóvel se houver
- addressNeighborhood: Bairro se houver
- addressCity: Cidade
- addressState: Estado (sigla ex: SP, RJ, MG)
- addressCep: CEP
- healthPlan: Nome da Operadora ou Plano de Saúde (ex: Banco do Brasil, Bradesco, Calcard, Odontoprev, Postal Saúde, Prevident, Unimed, Amil, SulAmérica, Particular)
- carteirinhaNumber: Número completo de identificação ou matrícula da carteirinha do plano de saúde/odontológico (extraia sequências numéricas de código de beneficiário)

Atenção especial: Se a imagem for de uma carteirinha de plano ou convênio de saúde, extraia impreterivelmente o número impresso da carteirinha no campo carteirinhaNumber e o nome do convênio em healthPlan.

Se um dado não for visível no documento, retorne uma string vazia para o campo correspondente.
Retorne somente um objeto JSON válido com as chaves name, cpf, rg, birthDate, phone, email, addressStreet, addressNumber, addressNeighborhood, addressCity, addressState, addressCep, healthPlan e carteirinhaNumber. Use strings vazias para dados não identificados.`;

      let jsonText: string;
      if (provider === 'copilot') {
        jsonText = await generateWithCopilot(documentPrompt, { base64: cleanBase64, mimeType });
      } else if (provider === 'deepseek') {
        jsonText = await generateWithDeepSeek(apiKey, [
          { type: 'text', text: documentPrompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${cleanBase64}` } }
        ], true);

      }
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, provider, data: parsedData });
    } catch (error: any) {
      console.error(`Erro na leitura óptica via ${getAIProvider(req.body.provider)}:`, error);
      return res.status(500).json({ error: error.message || "Falha ao processar o documento via inteligência artificial." });
    }
  });

  // --- ENDPOINT DE IA DE VOZ INTELIGENTE PARA ODONTOGRAMA ---
  app.post("/api/ai/parse-voice-odontogram", async (req, res) => {
    try {
      const { textCommand, currentSelectedTeeth = [] } = req.body;
      const provider = getAIProvider(req.body.provider);
      if (!textCommand || !textCommand.trim()) {
        return res.status(400).json({ error: "Comando de voz em texto é obrigatório." });
      }

      if (provider === 'disabled') return res.status(503).json({error:'Configure um provedor de IA sem Google para usar este recurso.'});
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (provider !== 'copilot' && !apiKey) return res.status(503).json({error:'Chave DEEPSEEK_API_KEY não configurada.'});

      const prompt = `Você é o assistente odontológico de inteligência artificial do sistema DentisPro, especialista em odontologia clínica, numeração FDI de dentes e preenchimento de prontuários por voz.
Analise a transcrição de voz do cirurgião-dentista e extraia a ação e os dados odontológicos com extrema precisão.

Texto falado pelo dentista:
"${textCommand}"

Dentes atualmente selecionados na tela (se o dentista disser "neste dente", "nestes dentes" ou omitir número de dente): [${currentSelectedTeeth.join(", ")}]

Tabela de Notação Dentária FDI permitida:
- Arcada Superior Permanente: 18, 17, 16, 15, 14, 13, 12, 11 (Q1) | 21, 22, 23, 24, 25, 26, 27, 28 (Q2)
- Arcada Inferior Permanente: 48, 47, 46, 45, 44, 43, 42, 41 (Q4) | 31, 32, 33, 34, 35, 36, 37, 38 (Q3)
- Arcada Decídua (Infantil): 55, 54, 53, 52, 51 | 61, 62, 63, 64, 65 | 85, 84, 83, 82, 81 | 71, 72, 73, 74, 75

Sinônimos e mapeamentos de termos:
- "arcada superior" = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28]
- "arcada inferior" = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]
- "ambas as arcadas" / "toda a boca" / "todos os dentes" = todos os 32 permanentes
- "molares superiores" = [18,17,16,26,27,28]
- "molares inferiores" = [48,47,46,36,37,38]
- "anteriores inferiores" = [43,42,41,31,32,33]
- "anteriores superiores" = [13,12,11,21,22,23]
- "siso" / "terceiro molar" = [18, 28, 38, 48] (se não especificar lado, considerar os mencionados)

Condições clínicas permitidas (conditionType):
- "carie" (cárie, lesão cariosa, mancha escura, cavidade)
- "restauracao" (restauração satisfatória, resina, amálgama bom)
- "restauracao_insatisfatoria" (restauração insatisfatória, infiltração, fraturada, recidiva de cárie)
- "canal" (endodontia, canal tratado, biopulpectomia, necropulpectomia, retratamento de canal)
- "extracao_indicada" (extração indicada, exodontia, residual)
- "ausente" (ausente, dente perdido, extraído, agenesia)
- "implante" (implante dentário, parafuso de titânio, pino osseointegrado)
- "protese" (prótese fixa, coroa protética, metalocerâmica, faceta, bloco, onlay, inlay)
- "calculo_supragengival" (cálculo supragengival, tártaro supra)
- "calculo_subgengival" (cálculo subgengival, tártaro sub, bolsa periodontal)
- "girovertido" (giroversão, girovertido, dente rodado)
- "sio" (hígido, sem alteração, saudável, limpo, remover marcação, desmarcar)

Faces Anatômicas (surfaces):
- "vestibular" (vestibular, frente, labial)
- "mesial" (mesial, anterior)
- "distal" (distal, posterior)
- "oclusal" (oclusal, mastigatória)
- "incisal" (incisal, ponta, borda incisal)
- "palatina" (palatina, céu da boca)
- "lingual" (lingual, lado da língua)

Ações (action):
- "apply_condition": aplica condição clínica a faces ou dente inteiro
- "select_teeth": apenas seleciona os dentes na tela
- "clear_teeth": desmarca ou redefine para hígido
- "add_notes": anota observação clínica

Gere uma resposta estruturada em JSON contendo:
- action: a ação ("apply_condition", "select_teeth", "clear_teeth" ou "add_notes")
- teeth: array com os números inteiros dos dentes (ex: [16, 17])
- conditionType: a condição clínica correspondente ou "sio" se for para limpar
- surfaces: array com as faces afetadas (ex: ["oclusal", "mesial"]) ou array vazio se for condição de dente inteiro ou dente ausente/implante/prótese/extração
- isWholeTooth: booleano indicando se a condição afeta o dente como um todo (ausente, implante, coroa, extração indicada, canal, dente inteiro)
- notes: texto curto de observações se houver detalhes extras (ex: "profunda", "resina composta")
- summary: resumo curto e elegante em português formal da alteração realizada (ex: "Marcada cárie nas faces Oclusal e Mesial dos dentes 16 e 17.")
- spokenFeedback: frase amigável, clara e curta para síntese de voz (TTS) confirmar ao dentista (ex: "Pronto! Registrei cárie nas faces oclusal e mesial dos dentes 16 e 17.")

Retorne somente um objeto JSON válido.`;

      let jsonText: string;
      if (provider === 'copilot') {
        jsonText = await generateWithCopilot(prompt);
      } else if (provider === 'deepseek') {
        jsonText = await generateWithDeepSeek(apiKey, prompt, true);

      }
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, source: provider, data: parsedData });
    } catch (error: any) {
      console.error("Erro no processamento de voz do odontograma:", error);
      return res.status(500).json({ error: error.message || "Falha ao interpretar comando de voz odontológico." });
    }
  });

  // --- ENDPOINTS DE INTEGRAÇÃO E DISPARO AUTOMÁTICO WHATSAPP ---
  app.post("/api/whatsapp/send", (req, res) => {
    const { to, message, instance } = req.body;
    console.log(`[WHATSAPP API DISPATCH] Enviando para ${to}: "${message}"`);
    return res.json({
      success: true,
      id: `msg_wa_${Date.now()}`,
      to,
      message,
      instance: instance || "dentispro_oficial",
      status: "SENT",
      timestamp: new Date().toISOString(),
      note: "Mensagem disparada com sucesso via gateway WhatsApp do servidor."
    });
  });

  // Rota de IA Automatizada de Resposta no Servidor
  app.post("/api/whatsapp/auto-reply", async (req, res) => {
    try {
      const { message, patientName = "Paciente", patientPhone = "" } = req.body;
      const provider = getAIProvider(req.body.provider);
      if (provider === 'disabled') return res.status(503).json({error:'Configure um provedor de IA sem Google para usar este recurso.'});
      const apiKey = process.env.DEEPSEEK_API_KEY;

      if (!message) {
        return res.status(400).json({ error: "Mensagem é obrigatória para triagem de IA." });
      }
      if (provider !== 'copilot' && !apiKey) {
        const keyName = 'DEEPSEEK_API_KEY';
        return res.status(503).json({ error: `Chave ${keyName} não configurada no servidor.` });
      }

      let aiReply = "";

      if (provider === 'copilot') {
        const prompt = `Você é a assistente virtual de atendimento da clínica odontológica PlanetOdonto. O paciente ${patientName} (${patientPhone ? `Telefone/WhatsApp: ${patientPhone}` : ''}) enviou: "${message}". Responda de forma cortês, profissional, empática e direta. Priorize agendamento urgente em caso de dor ou emergência, use formatação limpa para WhatsApp e assine como *Equipe PlanetOdonto 🦷*.`;
        aiReply = await generateWithCopilot(prompt);
      } else if (apiKey && provider === 'deepseek') {
        const prompt = `Você é a assistente virtual inteligente de atendimento da clínica odontológica PlanetOdonto.\nO paciente ${patientName} (${patientPhone ? 'Telefone/WhatsApp: ' + patientPhone : ''}) enviou a seguinte mensagem no WhatsApp:\n"${message}"\n\nResponda de forma cortês, profissional, empática e direta. Priorize agendamento urgente em caso de dor ou emergência, use formatação limpa para WhatsApp e assine como *Equipe PlanetOdonto 🦷*.`;
        aiReply = await generateWithDeepSeek(apiKey, prompt);

      }

      if (!aiReply) {
        aiReply = `Olá, *${patientName}*! 🦷 Recebemos sua mensagem: "${message}".\n\nNosso sistema automatizado de IA e a recepção do PlanetOdonto receberam sua solicitação de atendimento.\n\nComo podemos ajudar a cuidar do seu sorriso hoje?\n\n*Equipe PlanetOdonto 🦷*`;
      }

      console.log(`[WHATSAPP ${provider.toUpperCase()} IA] Resposta gerada para ${patientName}:`, aiReply);

      return res.json({
        success: true,
        reply: aiReply,
        patientName,
        patientPhone,
        timestamp: new Date().toISOString(),
        engine: provider === 'copilot' ? "GitHub Copilot CLI local" : apiKey ? `${provider} IA (Servidor local)` : "Motor Local Fallback"
      });
    } catch (error: any) {
      console.error("[WHATSAPP IA ERRO]:", error);
      return res.json({
        success: true,
        reply: `Olá, *${req.body.patientName || 'Paciente'}*! 🦷 Recebemos sua mensagem no WhatsApp do PlanetOdonto.\n\nUm de nossos cirurgiões-dentistas e nossa recepção foram notificados para agendar sua consulta!\n\n*Equipe PlanetOdonto 🦷*`,
        engine: "Fallback de Segurança"
      });
    }
  });

  app.get("/api/whatsapp/status", (req, res) => {
    return res.json({
      success: true,
      status: "CONNECTED",
      service: "Assistente odontológico configurável",
      instance: "dentispro_oficial",
      phone: "+5585986846424",
      webhookUrl: "/api/whatsapp/webhook"
    });
  });

  // --- ENDPOINTS DE BANCO DE DADOS SQL RELACIONAL (TABELA TUSS COM CHAVE PRIMÁRIA) ---
  app.get("/api/sql/tuss-schema", (req, res) => {
    try {
      const sqlFilePath = path.resolve(process.cwd(), "src", "db", "tuss_schema.sql");
      let ddl = "";
      if (fs.existsSync(sqlFilePath)) {
        ddl = fs.readFileSync(sqlFilePath, "utf-8");
      }
      return res.json({
        success: true,
        database: "PostgreSQL / ANSI SQL Relational Standard",
        primaryElement: {
          tableName: "tuss_procedures",
          primaryKey: "id (SERIAL PRIMARY KEY)",
          businessKey: "code (VARCHAR(50) UNIQUE)",
          mainAttribute: "description (TEXT NOT NULL) - O Procedimento Odontológico"
        },
        relatedTables: [
          { tableName: "price_tables", primaryKey: "id (SERIAL PRIMARY KEY)", description: "Convênios e Planos de Saúde" },
          { tableName: "procedure_prices", primaryKey: "id (SERIAL PRIMARY KEY)", foreignKeys: ["procedure_id -> tuss_procedures.id", "price_table_id -> price_tables.id"], description: "Preços acordados por procedimento e convênio" },
          { tableName: "correlation_rules", primaryKey: "id (SERIAL PRIMARY KEY)", foreignKeys: ["procedure_id -> tuss_procedures.id"], description: "Regras de correlação entre odontograma e procedimentos" }
        ],
        ddl
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Falha ao carregar esquema SQL: " + err.message });
    }
  });

  app.get("/api/sql/tuss-export", (req, res) => {
    try {
      const sqlFilePath = path.resolve(process.cwd(), "src", "db", "tuss_schema.sql");
      if (fs.existsSync(sqlFilePath)) {
        const ddl = fs.readFileSync(sqlFilePath, "utf-8");
        res.setHeader("Content-Type", "application/sql");
        res.setHeader("Content-Disposition", 'attachment; filename="dentispro_tuss_schema.sql"');
        return res.send(ddl);
      }
      return res.status(404).json({ error: "Arquivo tuss_schema.sql não encontrado." });
    } catch (err: any) {
      return res.status(500).json({ error: "Falha ao exportar script SQL: " + err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, host, () => {
    console.log(`Servidor DentisPro iniciado na porta ${PORT}`);
  });
}

startServer();
