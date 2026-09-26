# Correção de consentimento — 26/09/2026

Primeira etapa das correções da revisão de segurança. Não constitui liberação clínica da aplicação.

## Regra aprovada

- Link do paciente: 24 horas desde a emissão, inclusive links renovados.
- Código: seis dígitos, cinco minutos, uso único, até cinco tentativas.
- Novo profissional: atendimento de oito horas ou tratamento de **um mês de calendário**, a partir da confirmação pelo paciente, sem prorrogação automática.
- O mês usa o horário de Fortaleza. Exemplo: 26/09 às 10h → 26/10 às 10h; 31/01 → último dia de fevereiro no mesmo horário. Não significa sempre trinta dias.
- Renovar tratamento exige nova solicitação e novo consentimento; o prazo da nova confirmação não é acumulado ao saldo anterior.
- Autorizações antigas não foram modificadas em banco. O servidor preserva a opção legada indefinida apenas para o responsável inicial; a interface oferece oito horas ou um mês. Outros profissionais não podem receber novas autorizações indefinidas.

## R01: códigos anteriores à suspensão

Cada profissional tem uma versão de consentimento no paciente. Solicitações registram a versão; suspensão e confirmação bem-sucedida incrementam essa versão. Confirmação antiga é rejeitada dentro da mesma transação que grava a autorização. Não basta esconder um botão. Uma nova solicitação posterior à suspensão pode ser confirmada normalmente pelo paciente.

## R02: renovação do gerenciamento independente do tratamento

O paciente reabre o link recebido por e-mail e usa “Renovar link de gerenciamento por e-mail”, inclusive se as 24 horas expiraram. O link vencido só permite solicitar envio; não permite consultar autorizações, suspender diretamente ou ver dados clínicos.

O servidor envia um novo link e código **somente ao contato já confirmado**, sem aceitar endereço de destino do navegador. O paciente confirma o código no novo link. Esse desafio tem finalidade `management`: não cria, reativa ou estende nenhuma autorização profissional. O painel passa a permitir a suspensão dos acessos existentes.

Limites persistidos por paciente: um envio por minuto e cinco por dia, separados dos limites de consentimento. Link e código não são devolvidos à equipe nem no retorno da renovação. Falha de entrega não torna o desafio utilizável.

Limitações: exige acesso a um link anterior e ao contato confirmado. Contato perdido/alterado, representante legal e perda de todos os e-mails continuam exigindo procedimento próprio. Possuidor de link antigo pode solicitar envio ao contato original, sujeito aos limites; nunca escolhe destinatário ou ganha acesso apenas com o link vencido. Preservar metadados necessários à recuperação ao definir políticas de retenção/limpeza de desafios.

## R07: acesso excepcional

Exceções ativas aparecem no painel do paciente com motivo e prazo. O paciente pode suspendê-las mesmo sem existir autorização comum para o administrador. Uma suspensão ocorrida durante envio da notificação invalida a solicitação excepcional em andamento.

Uma **nova** solicitação excepcional continua possível pelo administrador, com senha recente, justificativa, notificação e auditoria, conforme a política anterior. Suspensão não elimina definitivamente a função excepcional; a interface não deve prometer isso.

## Validação

- 39 testes passaram, incluindo sete novos testes de consentimento/renovação, códigos antigos, concorrência, exceção, datas de fim de mês, tentativas e falha de entrega.
- TypeScript e build passaram. Continua aviso de bundle grande.
- Fixture compartilhado preserva transações serializadas e proíbe leitura após escrita. Ainda falta homologação no Firestore e navegador reais.
- Nenhum e-mail real enviado e nenhuma regra ou dado de produção alterado.

R01, R02 e R07 têm correções locais e regressões nesta etapa. Os demais achados R03–R06 e R08–R16 continuam pendentes; consultar o relatório original. `probes.mjs` e `probe-results.json` são evidências da base anterior à correção, não o estado atual. Para verificar as correções use `npm test`.
