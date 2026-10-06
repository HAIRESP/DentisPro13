# Revisão ampla — 6 de outubro de 2026

Escopo: código enviado para revisão e branch de materiais. Este levantamento
não equivale a uma auditoria completa de segurança nem a validação clínica.
A contagem abaixo representa frentes de trabalho confirmadas, não o número
final de alterações de código que o sistema precisará.

## Oito frentes tratadas nesta sequência

| Nº | Frente | Resultado e benefício no consultório |
| --- | --- | --- |
| 1 | Lista de materiais | Seletor múltiplo pré-selecionado, bloqueio de duplicatas, salvamento antes da baixa e modelo por procedimento/clínica/profissional. Já publicado no PR de materiais. |
| 2 | Relatório diário | Identificação pelo ID do estoque, conversão de unidades, modelos e listas vazias respeitados, sem recontar atendimentos encerrados/cancelados. |
| 3 | Serviços Google | Integrações e dependências Firebase/Gemini, Cloud Run e fontes externas removidas do código; sem apagar contas ou dados remotos. |
| 4 | Autenticação independente | Contas no servidor, ativação inicial com código, senhas scrypt, sessões limitadas, gestão restrita ao administrador e recuperação local. |
| 5 | Restauração/exportação | Corrigida gravação em chaves erradas e ausência de documentos/modelos; validação básica, bloqueio de escrita do estoque e desfazimento em falha. |
| 6 | Identificação de materiais | Removidos produtos aleatórios e preços/fornecedores inventados. Produto não identificado exige preenchimento manual. |
| 7 | Reinserção de demonstração | Listas clínicas já salvas não recebem novamente pacientes, prescrições, evoluções, tratamentos, pagamentos ou lançamentos de exemplo removidos. Odontogramas persistidos também não são mesclados aos exemplos. |
| 8 | ZIP enganoso | Exportação de configuração deixa de se apresentar como software completo para pendrive. |

Essas correções estão em avaliação. Elas não resolvem os itens pendentes abaixo.

## Sete frentes prioritárias ainda abertas

| Nº | Prioridade | Trabalho restante | Evidência/limite |
| --- | --- | --- | --- |
| 9 | Bloqueia uso compartilhado | Banco clínico central e APIs autorizadas para prontuários, agenda, documentos e estoque | `AppContext.tsx` ainda mantém dados clínicos em localStorage. Login compartilhado não compartilha a base. |
| 10 | Bloqueia sincronização offline | Revisões, conflitos, fila offline, retomada e prevenção de dupla baixa entre computadores | Bloqueio atual protege abas da mesma origem; não protege computadores diferentes. Depende do item 9. |
| 11 | Alta | Permissões clínicas por função/paciente/profissional aplicadas no servidor e na interface | Restringir abas de recepção não impede acesso a detalhes dentro da tela de pacientes. Administrador ainda tem acesso clínico amplo. |
| 12 | Alta | Persistência e recuperação completas | Escritas locais de outras entidades não têm tratamento uniforme de quota; importação local não é transação única resistente a queda. Banco de contas tem backup separado. |
| 13 | Alta | Histórico clínico auditável | Eventos de autenticação básicos não substituem histórico de alteração clínica com autor, versão e proteção contra adulteração. |
| 14 | Média | Dependências de ferramentas de banco | Restam quatro alertas moderados propagados pela cadeia drizzle-kit → esm-loader → core-utils → esbuild. Não foi aplicada atualização forçada incompatível. |
| 15 | Média | WhatsApp real e estado de conexão | Rotas atuais retornam conexão simulada/envio por log; precisam integração real e confirmação de entrega antes de prometer mensagem enviada. |

Estimativa atual: **sete frentes conhecidas restantes**, sendo banco compartilhado,
sincronização e permissões as maiores. Uma estimativa responsável em horas exige
definir servidor/hospedagem, acesso pela internet versus rede da clínica e regras
de conflitos offline. Não há base para afirmar que bastam sete pequenas correções
ou para prometer prazo exato. Outros problemas podem aparecer na validação.

## Validação e pendências de teste

- 98 testes automatizados aprovados: materiais, conversão/baixa, relatório diário, backup,
  autorização de APIs, conta inicial, senhas, revogação e recuperação.
- TypeScript e compilação de frontend/servidor verificadas.
- Ativação e login exercitados com DOM simulado e rotas Express reais.
- Inicialização de produção sem credenciais Google verificada; API sem sessão
  recusada e origem não autorizada recusada.
- `npm audit`: nove alertas antes (quatro moderados/cinco altos), quatro moderados
  depois da remoção de dependências; zero altos/críticos no resultado observado.
- Restam validação visual/instalação no Windows, impressão dos documentos
  protegidos, Docker, provedores de IA e infraestrutura de rede. São pendências
  de validação, não defeitos já comprovados.
- O build mantém aviso de pacote frontend grande; otimização separada, sem
  impacto demonstrado que justifique tratá-lo como bloqueador desta revisão.

Nenhum layout protegido de receituário, assinatura ou impressão foi alterado.

## Atualização após o relatório do Windows (mesmo dia)

O usuário encontrou 11 alertas na instalação ainda com Firebase/Gemini. Uma nova
consulta desta branch, já sem Google, passou a identificar também `proxy-addr`
(crítico) e `source-map-js` (alto), totalizando seis. O resultado anterior de
quatro alertas era o observado naquela consulta; não deve ser usado como garantia
permanente, pois a base de avisos muda.

Foram atualizadas somente duas dependências transitivas, dentro das faixas já
aceitas pelo projeto: `proxy-addr` 2.0.7 → 2.0.8 e `source-map-js` 1.2.1 → 1.2.2.
Nenhuma dependência Google foi reintroduzida. As versões corrigidas constam dos
avisos oficiais:

- https://github.com/jshttp/proxy-addr/security/advisories/GHSA-jqcg-44mw-7w3h
- https://github.com/advisories/GHSA-68fv-2mgg-jv7q

Após a correção: **quatro alertas moderados, zero altos e zero críticos** na nova
consulta. Os 98 testes e o build passaram novamente. O pacote de migração foi
atualizado, inclusive para aceitar como origem a primeira edição sem Google.
Instalar dependências com `npm ci` não atualiza os arquivos do projeto nem muda
a branch Git; primeiro é preciso aplicar o pacote ou carregar a branch correta.
