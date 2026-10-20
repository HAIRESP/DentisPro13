# Materiais por atendimento — 4 de outubro de 2026

## Uso clínico

1. Abra Materiais do atendimento na Agenda ou no Estoque.
2. Para cada material, escolha o produto cadastrado. A associação fica gravada pelo identificador do produto, sem escolher automaticamente o primeiro nome parecido.
3. Ajuste quantidade e unidade: por exemplo, 2 tubetes, conforme o consumo que você efetivamente realizou. A conversão para embalagem depende do fator cadastrado no estoque.
4. Acrescente ou remova materiais. Salve somente para este atendimento ou marque a opção de padrão do procedimento para o profissional e a clínica. Salvar não movimenta estoque.
5. Marque somente os consumíveis usados e confirme o consumo. Itens não marcados não são descontados. Instrumentais e equipamentos não são consumidos.
6. Confira o comprovante. Após a baixa, a lista fica protegida contra edição e uma segunda baixa é bloqueada.

O padrão usa código exato do procedimento, clínica e profissional. Sem esses vínculos, é possível salvar somente no atendimento. Listas já personalizadas de outros atendimentos não são substituídas. As marcações de uso não se tornam padrão e precisam ser confirmadas em cada atendimento. Listas e padrões permanecem no armazenamento local do sistema; esta alteração não implementa sincronização entre computadores.

## Proteções e validação

- Lista do atendimento e padrão gravados juntos na mesma transação local, sem consumir estoque.
- Falha de gravação não publica sucesso nem altera os dados em memória.
- Conflitos de lista/padrão entre janelas são rejeitados; revisão exige fechar e reabrir.
- Baixa revalida lista, saldo, conversões e disponibilidade com o bloqueio de escrita existente.
- Padrões incluídos no backup de dados do sistema.
- 75 testes Node aprovados (14 novos), verificação TypeScript e build aprovados.
- Teste de interface em DOM simulado aprovado: escolha de alternativa, edição de quantidade, salvamento permanente sem baixa e consumo exclusivo do item marcado. Navegador completo não disponível neste ambiente; a conferência visual no Windows continua necessária.
- `npm ci --ignore-scripts --no-audit --no-fund` aprovado após reparar três entradas de dependências ausentes no lockfile do ZIP.

## Histórico local usado para preparar a branch

O primeiro commit preserva o código do ZIP de 2 de outubro, que ainda não estava na branch de instalação. Essas mudanças anteriores incluem autenticação e outras áreas e não representam uma nova auditoria dessas áreas. O segundo commit contém esta correção. A branch de produção não foi alterada. O arquivo de cópia antiga do modal de login foi omitido da branch, pois não é um módulo ativo; o pacote de instalação não remove esse arquivo local.

## Atualização do seletor múltiplo

O aviso “Regra de Filtragem Ativa” foi removido da tela. O seletor múltiplo exibe os produtos já associados como marcados; marcar inclui e desmarcar remove da lista. Isso não marca consumo. Um mesmo identificador de produto não pode ocupar duas linhas: a associação individual desabilita produtos já incluídos e o salvamento também rejeita duplicatas. Para consumir mais unidades, altere a quantidade na linha existente.
