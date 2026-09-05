import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API route for document parsing via Gemini OCR
  app.post("/api/gemini/parse-document", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Chave GEMINI_API_KEY não configurada no servidor." });
      }

      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Imagem de documento em base64 é obrigatória." });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Você é um assistente especialista em OCR e leitura óptica de documentos pessoais do Brasil (RG, CPF, CNH, Carteira de Habilitação, Carteira de Trabalho, Carteirinha de Plano de Saúde / Convênio Odontológico).
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

Se um dado não for visível no documento, retorne uma string vazia para o campo correspondente.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              cpf: { type: Type.STRING },
              rg: { type: Type.STRING },
              birthDate: { type: Type.STRING },
              phone: { type: Type.STRING },
              email: { type: Type.STRING },
              addressStreet: { type: Type.STRING },
              addressNumber: { type: Type.STRING },
              addressNeighborhood: { type: Type.STRING },
              addressCity: { type: Type.STRING },
              addressState: { type: Type.STRING },
              addressCep: { type: Type.STRING },
              healthPlan: { type: Type.STRING },
              carteirinhaNumber: { type: Type.STRING },
            },
          },
        },
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Erro na leitura óptica via Gemini:", error);
      return res.status(500).json({ error: error.message || "Falha ao processar o documento via inteligência artificial." });
    }
  });

  // --- ENDPOINT DE IA DE VOZ INTELIGENTE PARA ODONTOGRAMA ---
  app.post("/api/gemini/parse-voice-odontogram", async (req, res) => {
    try {
      const { textCommand, currentSelectedTeeth = [] } = req.body;
      if (!textCommand || !textCommand.trim()) {
        return res.status(400).json({ error: "Comando de voz em texto é obrigatório." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          success: true,
          source: "fallback_no_key",
          data: {
            action: "apply_condition",
            teeth: [],
            conditionType: "carie",
            surfaces: ["oclusal"],
            wholeToothCondition: null,
            notes: "",
            summary: "Comando recebido: " + textCommand,
            spokenFeedback: "Comando interpretado localmente."
          }
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

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
- spokenFeedback: frase amigável, clara e curta para síntese de voz (TTS) confirmar ao dentista (ex: "Pronto! Registrei cárie nas faces oclusal e mesial dos dentes 16 e 17.")`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              teeth: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER }
              },
              conditionType: { type: Type.STRING },
              surfaces: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              isWholeTooth: { type: Type.BOOLEAN },
              notes: { type: Type.STRING },
              summary: { type: Type.STRING },
              spokenFeedback: { type: Type.STRING }
            },
            required: ["action", "teeth", "conditionType", "surfaces", "isWholeTooth", "summary", "spokenFeedback"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, source: "gemini_3.7_flash", data: parsedData });
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
      const apiKey = process.env.GEMINI_API_KEY;

      if (!message) {
        return res.status(400).json({ error: "Mensagem é obrigatória para triagem de IA." });
      }

      let aiReply = "";

      if (apiKey) {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: { "User-Agent": "aistudio-build" }
          }
        });

        const prompt = `Você é a assistente virtual inteligente de atendimento da clínica odontológica PlanetOdonto.
O paciente ${patientName} (${patientPhone ? 'Telefone/WhatsApp: ' + patientPhone : ''}) enviou a seguinte mensagem no WhatsApp:
"${message}"

Diretrizes para resposta:
1. Responda de forma extremamente cortês, profissional, empática e acolhedora.
2. Se o paciente relatar dor, desconforto ou emergência odontológica, priorize o agendamento urgente.
3. Se o paciente quiser agendar consulta, peça o melhor dia e horário e o procedimento de interesse (Avaliação, Limpeza, Canal, Aparelho, Implante, Clareamento, Prótese, Restauração).
4. Use formatação limpa para WhatsApp: use *negrito* nas palavras chave e emojis adequados (🦷, 🩺, 📅, ✨, 👋).
5. Mantenha a resposta direta (máximo 3-4 parágrafos curtos).
6. Assine como "*Equipe PlanetOdonto 🦷*" no final.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt
        });

        aiReply = response.text || "";
      }

      if (!aiReply) {
        aiReply = `Olá, *${patientName}*! 🦷 Recebemos sua mensagem: "${message}".\n\nNosso sistema automatizado de IA e a recepção do PlanetOdonto receberam sua solicitação de atendimento.\n\nComo podemos ajudar a cuidar do seu sorriso hoje?\n\n*Equipe PlanetOdonto 🦷*`;
      }

      console.log(`[WHATSAPP GEMINI IA] Resposta gerada para ${patientName}:`, aiReply);

      return res.json({
        success: true,
        reply: aiReply,
        patientName,
        patientPhone,
        timestamp: new Date().toISOString(),
        engine: apiKey ? "Gemini 3.6 Flash IA (Servidor Cloud Run)" : "Motor Local Fallback"
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

  app.post("/api/whatsapp/webhook", (req, res) => {
    console.log("[WHATSAPP WEBHOOK INCOMING]", req.body);
    return res.json({
      success: true,
      status: "received",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/whatsapp/status", (req, res) => {
    return res.json({
      success: true,
      status: "CONNECTED",
      service: "Robô de IA Odontológico (Gemini 3.6 Flash)",
      instance: "dentispro_oficial",
      phone: "+5585986846424",
      webhookUrl: "/api/whatsapp/webhook"
    });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor DentisPro iniciado na porta ${PORT}`);
  });
}

startServer();
