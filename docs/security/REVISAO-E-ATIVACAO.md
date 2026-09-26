# Atendimento protegido — versão em revisão

Data: 25/09/2026. **Não substituir a instalação clínica em uso nem mesclar na main antes da homologação.**

## O que foi implementado

- Login Firebase obrigatório; não existem contas de demonstração geradas como alternativa a falhas de login.
- Vínculo da equipe com uma clínica, separado do perfil de autenticação. O administrador não ganha acesso clínico universal.
- Cadastro e agenda administrativos separados do conteúdo clínico.
- Profissional responsável no cadastro; demais profissionais precisam de autorização por paciente.
- Código criptograficamente aleatório de seis dígitos, validade de cinco minutos, uso único, cinco tentativas. Reenvio limitado a um por minuto e cinco por dia/paciente.
- Autorização por oito horas ou até suspensão. O link do paciente permite confirmar e suspender autorizações. A suspensão não reativa sozinha: novo código é necessário.
- Token do portal aleatório, armazenado como hash, enviado somente ao paciente; link de 24 horas. O código não é devolvido à recepção pela API.
- Acesso excepcional administrativo, senha recente, justificativa obrigatória, notificação e somente leitura por quinze minutos.
- Auditoria no servidor antes da liberação. Objetos de auditoria em bucket separado, com retenção bloqueada verificada. Nenhuma rota do aplicativo edita ou exclui a auditoria.
- Versões clínicas preservadas, motivo obrigatório e controle de concorrência. Evoluções salvas não são substituídas; correções devem ser novos complementos.
- Novos dados clínicos ficam no servidor e na memória do atendimento, sem cache clínico compartilhado no localStorage.
- Migração administrativa explícita por paciente, com confirmação de senha e responsável selecionado. Não exclui nem sobrescreve o original.
- Impressões, exportações e compartilhamentos iniciados por caminhos instrumentados do aplicativo passam por autorização. O recebimento de dados pelo navegador é registrado; isso não prova que uma pessoa leu o conteúdo.
- Configurações e estoque têm versões no servidor. As telas existentes usam um espaço de trabalho em memória e o botão superior “Salvar versão no servidor”.
- Formulário de novas contas com confirmação de senha. Contas novas começam desativadas e só são ativadas após gravação de perfil e vínculo.
- Mensagens do serviço de autorização em português, com HTML que escapa texto recebido.

A sessão ao fechar a aba e o bloqueio por inatividade continuam adiados por decisão do usuário.

## Validação feita

- `npm test`: 32 testes passaram, incluindo bloqueios por perfil, suspensão, código expirado/reutilizado, tentativas concorrentes, falha de auditoria, falha de entrega, importação sem sobrescrita e conflito entre salvamentos.
- `npm run build`: passou; permanece aviso de bundle grande.
- `npm run lint`: passou sem erros em 26/09/2026. Os 56 erros identificados foram corrigidos sem supressão da verificação.
- Nenhum envio real de código, acesso a prontuário real, mudança de regra publicada ou criação de bucket foi realizado por esta revisão.
- Teste visual automatizado não concluído: o executável de Chromium não estava disponível e seu download falhou. Build e testes de serviço não substituem teste de navegador.
- Os testes de serviço usam armazenamento em memória com transações serializadas e proibição de leitura após escrita. Ainda falta executar o fluxo no Firestore/Storage real ou em ambiente de homologação.

## Pontos que precisam de revisão antes de liberar

1. **Migração e dados antigos:** as cópias existentes no navegador continuam presentes. São acessíveis a quem controla aquele perfil do navegador, mesmo após a atualização. Só retirar essas cópias depois de backup e validação da importação. A importação atual cobre os recursos clínicos enumerados; agenda antiga e configurações precisam de migração específica. Não presumir que todos os dados foram importados.
2. **Telas legadas:** cadastro, documentos, imagens, odontograma, evolução, estoque e configurações precisam de teste manual. Alguns botões internos apenas atualizam o estado em memória; o salvamento definitivo exige o botão superior. Revisar esses avisos antes de uso diário.
3. **Acesso excepcional:** a visualização atual de conteúdo é somente leitura, em formato estruturado. Precisa de acabamento de usabilidade; não é a apresentação final do prontuário.
4. **Contato do paciente:** a identidade e o contato são conferidos no cadastro. Código comprova controle do contato, não identidade civil. Troca de e-mail está bloqueada até existir procedimento seguro de atualização. Representantes legais e paciente sem acesso ao contato ainda precisam de fluxo específico; não existe bypass pela recepção.
5. **Auditoria e alterações:** a cópia autoritativa está no bucket protegido pelo período configurado, não indefinidamente. O índice no Firestore é apenas para consulta; um administrador da infraestrutura tem poderes diferentes de um administrador do aplicativo. Projetar IAM, acesso ao índice, backups e retenção antes da ativação.
6. **Falhas após gravação:** uma falha de confirmação/auditoria posterior ao commit pode retornar erro mesmo com uma versão gravada. Consultar o histórico antes de repetir. Há intenção durável e recibo transacional; falta automação de reconciliação desses casos.
7. **Suspensão:** novas requisições revalidam permissão no servidor. A tela aberta consulta a autorização a cada vinte segundos e ao voltar à aba; não prometer remoção instantânea de dados já entregues nem recolhimento de arquivos exportados.
8. **Compartilhamento:** ações realizadas fora dos caminhos instrumentados, como captura de tela, impressão pelo menu do navegador e cópia pelo sistema operacional, não podem ser impedidas ou comprovadas integralmente por este aplicativo.
9. **Integrações:** o webhook antigo e as operações simuladas de WhatsApp não são apresentados como ativos. O serviço HTTPS de entrega de mensagens ainda precisa de implementação/configuração real. Esta branch fornece o cliente e o contrato, não um provedor de e-mail contratado.
10. **Desempenho:** snapshots clínicos completos por versão e limite HTTP de 25 MB. Testar imagens grandes e acompanhar custos de versões e auditoria. `Server-Timing` informa duração da API; medir a conexão da clínica, sem usar os testes em memória como estimativa de produção.
11. **Cobertura:** esta é uma base de segurança e integração em revisão, não certificação de segurança, conformidade legal ou teste completo de todas as telas.

## Ativação em ambiente separado

Não use imediatamente a pasta Windows em que está atendendo. Faça uma cópia de homologação e preserve backup do projeto e dos dados.

1. Definir um ambiente Firebase/Google Cloud de homologação, identidade de serviço e permissões mínimas. Credenciais somente no servidor, nunca no navegador, no Git ou em variáveis VITE_*.
2. Publicar e validar `firestore.rules` e `storage.rules` no ambiente correto. As regras novas retiram leitura clínica direta também de administradores; métodos antigos de gravação direta deixarão de funcionar. A API faz uma verificação adicional de bloqueio de leitura direta, mas isso não substitui testar todas as regras com os perfis reais.
3. Configurar dois buckets privados diferentes: versões clínicas e auditoria. Ambos com prevenção de acesso público. Definir o prazo de retenção de auditoria antes de bloquear a política; o bloqueio é uma decisão de infraestrutura e não foi realizado pelo código.
4. Configurar as variáveis descritas em `.env.example`:
   - `GOOGLE_APPLICATION_CREDENTIALS` ou identidade de serviço do ambiente.
   - `DENTISPRO_CLINIC_ID`, `DENTISPRO_BOOTSTRAP_ADMIN_UID`.
   - `DENTISPRO_CLINICAL_BUCKET`, `DENTISPRO_AUDIT_BUCKET`, `DENTISPRO_AUDIT_RETENTION_SECONDS`.
   - `DENTISPRO_CODE_SECRET`, aleatório, no mínimo 32 caracteres.
   - `DENTISPRO_PUBLIC_URL`, `DENTISPRO_DELIVERY_URL`, `DENTISPRO_DELIVERY_TOKEN`.
5. O adaptador HTTPS de entrega recebe POST autenticado por Bearer com `{channel:"email", destination, subject, message, html}`. Deve entregar realmente, responder erro quando falhar e não registrar códigos/tokens em logs. Não há modo que mostra código à recepção como substituto.
6. Para abrir links no celular do paciente, é necessária URL pública HTTPS. `localhost:3000` só funciona no próprio computador e não atende esse fluxo móvel. A confirmação presencial de código recebido por e-mail pode ser testada no PC quando o envio estiver configurado.
7. Instalar com `npm ci`, executar `npm test`, `npm run build` e iniciar em homologação. Se faltar infraestrutura, a interface bloqueia o atendimento protegido e informa configuração pendente.
8. Criar paciente fictício, confirmar contato, testar dentista autorizado/não autorizado, suspensão, acesso excepcional, notificação e trilha externa. Repetir com duas sessões e edição simultânea.
9. Validar documentos protegidos e impressão sem mudar as regras do AGENTS.md. Testar uploads e reabertura após reiniciar o servidor.
10. Só depois importar dados reais, conferir o responsável de cada paciente e planejar a retirada autorizada de cópias locais. Fazer rollout separado da revisão de código.

## Revisão dividida em etapas

- Etapa 1: código, testes de serviço e publicação como rascunho — entregue nesta branch.
- Etapa 2: correções de tipos e homologação de interface/migração — pendente.
- Etapa 3: infraestrutura, entrega real, regras, testes de ponta a ponta e medidas de desempenho — pendente.
- Etapa 4: ativação clínica supervisionada, com backup e plano de recuperação — pendente.

Referências técnicas: https://firebase.google.com/docs/admin/setup ; https://firebase.google.com/docs/firestore/manage-data/transactions ; https://cloud.google.com/storage/docs/bucket-lock .

## Correções de 26/09/2026

- Corrigidos campos de documentos, anamnese, cadastros, baixa de estoque e ordenação de materiais.
- Laudos não criam mais consulta/evolução fictícias na ausência de eventos; o resumo do exame utiliza observações registradas. O exame inicial não é preenchido com achados normais.
- Cadastros mínimos recebem estruturas vazias para renderização; respostas médicas ausentes permanecem desconhecidas. Importação CSV não inventa CPF, telefone, e-mail, nascimento ou endereço.
- Sugestões de procedimentos usam o catálogo cadastrado, sem acrescentar exemplos fixos.
- Dois testes de regressão cobrem ausência de achados e preservação de respostas médicas. Ainda é necessário revisar todos os textos padrão dos modelos legados: esta etapa não certifica integralmente o conteúdo de todos os documentos.
