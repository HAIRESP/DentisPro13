# Seleção e salvamento de materiais por atendimento

A tela de materiais está disponível na Agenda e no Inventário. O profissional escolhe o produto cadastrado, confere quantidade e unidade de uso e salva a lista antes da baixa. Produtos de outras clínicas/profissionais não aparecem nas opções. Sugestões não substituem a escolha explícita do produto.

## Como usar

1. Abra os materiais de um atendimento sem baixa.
2. Escolha o produto de estoque para cada material necessário. Confira o código do produto, o saldo e a conversão indicada.
3. Ajuste quantidade e unidade. Use **Adicionar material cadastrado** para incluir produtos ou **Remover da lista** para retirar linhas.
4. Escolha **Somente neste atendimento** ou **Neste atendimento e como padrão do procedimento** e clique **Salvar lista de materiais**.
5. O padrão é específico para a combinação de procedimento, clínica e profissional. Listas personalizadas têm prioridade; uma lista vazia salva é respeitada.
6. **Preparado** é conferência da bandeja. **Usado neste atendimento** seleciona o consumível para a baixa. As marcações de uso precisam ser feitas em cada atendimento.
7. Clique **Dar Baixa nos Materiais**, confira o resumo e confirme. Somente os itens marcados como usados são descontados. Instrumentais e equipamentos reutilizáveis não são consumidos.

O salvamento usa o armazenamento local já utilizado pelo estoque, sob a mesma trava de escrita. Não acrescenta sincronização de dados entre computadores. Lista e padrão são persistidos em uma única gravação. Falhas são exibidas e não geram mensagem de sucesso; alterações concorrentes exigem reabrir a lista. Após a baixa, a lista fica bloqueada e o comprovante é preservado. O backup JSON inclui os padrões de materiais.

## Verificação desta atualização

- Base recebida: `DentisPro-revisao-materiais-20261002-215902.zip`, preservada em commit separado. A pasta duplicada `Cópia de Segurança` não foi incorporada ao código ativo.
- `npm run lint`: aprovado.
- `node --test tests/*.test.mjs`: 73 testes aprovados. Incluem persistência, falha de gravação, concorrência, isolamento de padrões, listas vazias, conversões, baixa repetida e preservação da lista após mudar o padrão.
- `npm run build`: aprovado; permanece o aviso de tamanho do bundle.
- A validação visual e de cliques em navegador permanece pendente: o ambiente não tinha navegador instalado e o download do navegador de testes falhou. Não houve teste com dados reais nem alteração do computador do usuário.

## Conferência manual antes da integração

Em uma cópia de testes com backup, abra a tela pelos dois acessos (Agenda e Inventário). Escolha entre dois produtos, salve somente no atendimento e reabra/F5. Depois salve como padrão e confira outro atendimento do mesmo procedimento, clínica e profissional, além de outro profissional que não deve herdar o padrão. Adicione e remova um produto; confira quantidade/unidade e a listagem diária. Marcar só **Preparado** não deve gerar baixa. Marque **Usado**, confira a conversão e confirme. Reabra e confirme que não é possível descontar novamente. Confira também uma falha de salvamento e duas janelas editando a mesma lista.
