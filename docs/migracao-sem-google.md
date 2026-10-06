# Migração de avaliação: DentisPro sem serviços Google

Esta branch remove as integrações ativas com Firebase Auth, Firestore, Gemini,
Cloud Run e fontes Google. Não apaga nenhum projeto ou dado remoto do provedor.
A alteração ainda precisa ser validada no Windows da clínica antes do uso rotineiro.

## Instalação no computador atual

1. Faça o backup JSON pela versão atual e guarde-o fora da pasta do projeto.
   Versões antigas podem não incluir modelos e documentos salvos; a atualização
   de código não apaga os dados do navegador. Mantenha o mesmo navegador, perfil
   e endereço `http://localhost:3000` para continuar acessando os dados locais.
2. Pare o servidor com `Ctrl+C` e feche as outras abas do DentisPro.
3. Aplique o pacote desta revisão ou use a branch de migração. Não sobrescreva
   alterações locais desconhecidas. O instalador do pacote verifica as versões
   dos arquivos e guarda uma cópia dos arquivos de código que alterar.
4. Com Node.js 24.x e npm 11.x, execute na pasta DentisPro13:

   ```powershell
   npm ci
   npm run lint
   npm run dev
   ```

5. No primeiro início, o terminal exibirá um código de instalação. Abra
   `http://localhost:3000`, informe esse código, nome, e-mail e uma **nova senha
   de 12 a 256 caracteres**, confirmada duas vezes. Depois entre com a nova conta.
6. Cadastre os demais usuários na gestão de usuários e confira os vínculos dos
   profissionais. Contas anteriores não são importadas e senhas antigas não são
   reaproveitadas. Não compartilhe uma conta entre os profissionais.

O e-mail funciona como identificador de acesso; não é necessário um serviço de
Google nem de envio de e-mails. Não publique o código de instalação, senhas ou
conteúdo do arquivo `.env`.

## Senhas, contas e cópias de segurança

As contas ficam em `.dentispro-data/accounts.sqlite` no servidor, ou na pasta
`DENTISPRO_DATA_DIR` configurada. Senhas usam derivação scrypt com salt individual;
sessões têm duração máxima de oito horas e vinte minutos de inatividade no
servidor. Mudança de senha ou de perfil/vínculo profissional revoga sessões.
A tela também encerra sessões por inatividade local.

O backup JSON clínico **não inclui contas ou sessões**. Para copiar o banco de
contas, pare o servidor e copie a pasta de dados inteira para um local protegido.
No Docker, use um volume persistente em `/data`. O registro de eventos de acesso
é básico; não é uma trilha clínica imutável.

A troca normal de senha exige a senha atual. Se o administrador perder a senha,
o responsável com acesso aos arquivos do servidor pode, com o servidor parado,
executar na mesma pasta e com o mesmo `.env`:

```powershell
node scripts/recover-admin.mjs
```

O comando solicita e-mail e nova senha sem mostrá-la, exige confirmação e revoga
as sessões dessa conta. Não passe senhas como argumentos do terminal.

## Materiais: como conferir no atendimento

- Abra os materiais do atendimento. O seletor múltiplo mostra os insumos já
  associados; o mesmo item do estoque não pode ser incluído novamente.
- Confira apresentação e quantidade. Se a embalagem é uma caixa de 100 agulhas,
  configure essa conversão e indique quantas unidades foram utilizadas.
- A marcação de material utilizado é diferente da seleção para planejar a lista.
  Só os consumíveis marcados entram na baixa. Instrumentais reutilizáveis pedem
  conferência de preparo e não são consumidos como descartáveis.
- Salve a lista antes da baixa. O modelo permanente é separado por procedimento,
  clínica e profissional. Uma lista salva vazia continua vazia.
- O relatório diário usa o item realmente associado ao estoque, não apenas o nome.
  Atendimentos cancelados, faltosos, concluídos ou já baixados não são contados
  novamente como planejamento pendente. Conversão ausente, validade vencida e
  material fora da clínica/profissional exigem conferência.
- O leitor não preenche mais produtos, preços e fornecedores fictícios. Quando
  não houver identificação verificada, cadastre pela embalagem ou nota fiscal.

## Restauração do backup clínico

Use somente um JSON exportado pelo DentisPro. Feche outras abas antes de
restaurar. A restauração valida a estrutura básica, usa as chaves corretas e
restaura o registro conjunto de agenda/estoque/modelos de materiais. A página
recarrega somente depois da gravação. Em erro de gravação, tenta desfazer as
alterações e informa se a recuperação também falhar.

Versões antigas que não exportaram documentos/modelos deixam esses campos atuais
preservados. Modelos de materiais ausentes são reiniciados, para não aplicar um
modelo de outra base à agenda restaurada. Novas exportações incluem documentos
salvos e modelos. Dados clínicos de exemplo removidos não são reinseridos na
lista já salva ao reiniciar.

O armazenamento local ainda não oferece uma transação única para todas as
chaves em caso de queda abrupta do navegador/computador. Mantenha o arquivo
original do backup até conferir pacientes, documentos, agenda e estoque.
A exportação ZIP de configuração contém somente a configuração da clínica,
conforme o novo rótulo; não é instalador do software ou backup clínico completo.

## Vários computadores e nuvem: etapa ainda pendente

É possível preparar um servidor para autenticar vários computadores, usando
proxy HTTPS, disco persistente e `DENTISPRO_PUBLIC_ORIGIN` com a origem exata.
A escuta padrão é somente `127.0.0.1`; acesso pela rede exige configuração
explícita. Não exponha a porta diretamente como substituto de HTTPS.

**Os prontuários, agenda e estoque ainda ficam no navegador de cada computador.**
Hospedar esta branch não compartilha esses dados. Falta implementar banco clínico
no servidor, permissões por paciente, versionamento e tratamento de conflitos
para edições concorrentes e sincronização offline. PostgreSQL opcional no `.env`
não ativa essa funcionalidade. Não considere esta versão pronta para uso clínico
compartilhado entre computadores ou como sistema de produção em nuvem.

## Recursos opcionais e limites da validação

A IA fica desativada por padrão. Copilot e DeepSeek são opções sem integração
Google, que exigem configuração própria. Copilot restringe a seleção a modelos
GPT/Claude; imagens exigem modelo com visão. DeepSeek, nesta implementação, não
recebe imagens. Não foram feitos testes com contas pagas desses provedores.

Comandos de voz só tentam reconhecimento no dispositivo; se o navegador não
oferecer essa capacidade, use a digitação. Síntese de voz só utiliza voz local.
Não há fallback de reconhecimento remoto do navegador.

Validação em Linux/Node 24: testes automatizados, TypeScript, compilação e fluxo
de ativação/login em DOM simulado. Instalação PowerShell, interface visual real,
impressões no Windows, Docker e infraestrutura HTTPS ainda precisam de validação.
