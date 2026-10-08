# Acesso clínico na cópia de conferência

Continuação da etapa 1, em 07/10/2026. Links externos permanecem como links e não
exigem preparação offline. Arquivos incorporados ao JSON continuam preservados.

## O que foi conectado

O servidor pode abrir um banco de conferência existente, criado pelo importador.
As novas APIs consultam essa cópia e registram autorizações e auditoria nela.
O painel **Configurações → Usuários → Autorizações da cópia de conferência** permite
ao administrador selecionar pacientes importados e conceder/revogar consulta por
dentista. Não exibe o conteúdo clínico ao administrador.

**As telas atuais de prontuário, agenda e estoque ainda usam o navegador.** As
restrições desta etapa protegem as novas APIs; não corrigem, por si só, a exposição
dos dados legados no localStorage. Ainda não usar esta etapa para operação clínica
multiusuário. A próxima integração deverá remover a dependência desses dados locais
das telas e aplicar as mesmas regras a todas as leituras e gravações.

## Habilitar a conferência no servidor Windows

Primeiro crie uma cópia nova conforme `MIGRACAO-CLINICA-ETAPA-1.md`. Mantenha o banco
de contas atual em seu local. Para esta avaliação, no PowerShell da pasta do código
atualizado:

```powershell
$env:DENTISPRO_CLINICAL_REVIEW_DB = 'D:\DentisPro\conferencia\clinico-conferencia-01.sqlite'
npm run dev
```

Essa variável vale para o processo iniciado nesse terminal. O arquivo precisa
existir e ser um banco de conferência; um caminho inválido interrompe a inicialização
sem criar um banco vazio. Não altere `DENTISPRO_DATA_DIR` para habilitar a conferência.
Ao abrir pela primeira vez, o banco de conferência recebe uma atualização transacional
de esquema de versão 1 para 2, preservando seus registros. Copie o arquivo com o
servidor parado antes dessa atualização se quiser guardar também a versão 1.

Para desabilitar, encerre esse servidor com Ctrl+C e execute:

```powershell
Remove-Item Env:DENTISPRO_CLINICAL_REVIEW_DB
npm run dev
```

Sem a variável, a API de conferência não fica habilitada. O painel informa que a
consulta está indisponível. Nenhum banco clínico de produção é ativado automaticamente.

## Conferir pelo painel

1. Entre como administrador e abra **Configurações → Usuários**.
2. Na conta do dentista, selecione **Profissional vinculado**. O profissional deve
   existir também na cópia importada. A alteração encerra sessões anteriores dessa
   conta; o dentista precisa entrar novamente. Selecionar um profissional na tela
   principal não equivale a esse vínculo de identidade.
3. Clique em **Abrir conferência** e escolha o paciente importado.
4. Escolha a conta do dentista, validade de 1 a 30 dias e referência do registro de
   confirmação presencial. Marque a confirmação somente se ela foi efetivamente
   obtida; use pacientes fictícios nos testes. Não coloque diagnóstico ou conteúdo
   clínico no campo de referência.
5. Informe sua senha atual e clique em **Registrar autorização de consulta**.
6. Para revogar, informe novamente sua senha e clique em **Revogar acesso** na linha.

A confirmação é uma declaração registrada pelo administrador, não uma validação
independente de identidade ou assinatura do paciente. Portal/token do paciente,
revogação pelo próprio paciente e acesso excepcional do administrador continuam
pendentes. A conta administradora permanece sem acesso clínico nesta API, inclusive
quando tem um profissional vinculado.

## Regras implementadas

| Perfil | Cadastro e agenda | Prontuário | Autorizações e auditoria |
| --- | --- | --- | --- |
| Recepção | Campos expressamente permitidos; sem anamnese, fotos, notas clínicas ou detalhes do procedimento | Negado | Negado |
| Dentista | Apenas pacientes autorizados | Autorização vigente por paciente, conta e vínculo profissional | Não pode conceder acesso ou consultar auditoria geral |
| Administrador | Campos cadastrais e agenda | Negado | Gerencia autorizações e consulta auditoria; senha atual exigida para conceder/revogar via HTTP |

- O catálogo de procedimentos tem consulta separada para administrador e dentista.
- Autorizações exigem conta com papel dentista e profissional existente na cópia.
- Prazo máximo de 30 dias por registro, com nova confirmação para renovação.
- Revogação/expiração bloqueia a próxima consulta ao servidor. Não recolhe arquivos
  já vistos, baixados ou fotografados pelo usuário.
- Concessões e revogações verificam a versão atual para impedir sobrescrita por uma
  tela desatualizada. Isso ainda não é controle de concorrência de edição clínica.
- O painel concede apenas consulta. O banco reconhece a permissão `write` para
  evolução futura, mas **não existe endpoint de edição clínica nesta etapa**.
- A identidade vem da sessão do servidor; nome do profissional selecionado no
  navegador, UID ou papel enviados no corpo não concedem acesso.
- As respostas usam `Cache-Control: no-store`. Não há rota para baixar o JSON
  original, banco de contas ou arquivo SQLite.
- Tentativas de reautenticação para autorizações são limitadas a 10 por conta a
  cada 15 minutos por processo. Reiniciar o servidor reinicia esse limite.

## Auditoria e seus limites

Leituras permitidas, acessos negados, concessões e revogações ficam registrados no
banco de conferência. A alteração de permissão e seu evento são gravados na mesma
transação. Uma falha de auditoria impede entregar o resultado da consulta ou salvar
a permissão. Eventos não incluem senhas ou cópias do prontuário; a referência de
consentimento é registrada. IDs de pacientes também são dados que precisam proteção.

Triggers impedem UPDATE/DELETE na tabela de eventos. **Isso não torna o registro
imutável contra alguém com controle do arquivo SQLite ou do computador.** Ainda
faltam armazenamento externo protegido e política de retenção. Requisições sem
sessão válida, rotas desconhecidas, erros de parsing e excesso de tentativas não
formam uma trilha completa nesta tabela; a auditoria global continua pendente.

## APIs de conferência

Todas estão sob `/api/clinical-review` e exigem Bearer da sessão do servidor.

| Método e caminho | Função |
| --- | --- |
| GET `/status` | Modo de conferência e versão |
| GET `/patients?after=&limit=50` | Cadastro filtrado por perfil, até 100 por página |
| GET `/patients/:id/demographics` | Cadastro sem dados clínicos |
| GET `/patients/:id/appointments` | Agenda sem notas ou detalhes clínicos |
| GET `/patients/:id/record` | Prontuário completo do paciente autorizado |
| GET `/procedures?after=&limit=50` | Catálogo separado |
| GET `/patients/:id/access` | Autorizações e versões para administrador |
| POST `/patients/:id/access` | Concessão/renovação com confirmação presencial e senha atual |
| POST `/patients/:id/access/revoke` | Revogação com versão esperada e senha atual |
| GET `/audit?after=0` | Até 100 eventos por página, administrador |

## Testes

```powershell
node --test tests/clinicalMigration.test.mjs tests/clinicalReview.test.mjs tests/localAuth.test.mjs
npm run lint
npm run build
```

Os testes usam somente dados fictícios. Cobrem separação de perfis, campos enviados
à recepção, vínculo profissional, expiração, revogação, conflito de versões entre
duas conexões, rollback se auditoria falhar e APIs HTTP com sessões reais do servidor.
