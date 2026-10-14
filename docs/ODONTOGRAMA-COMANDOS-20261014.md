# Comandos de voz e texto do odontograma

Correção da interpretação e da aplicação de comandos, mantendo as classes
visuais do formulário. A interpretação dos comandos suportados passa a ser local
e determinística, sem enviar a transcrição ao provedor de IA.

## Uso

Abra Preencher por Voz, dite ou digite um comando, confira o resultado e clique
em Aplicar. Somente esse botão grava condições no odontograma. A opção
Interpretar automaticamente ao falar apenas prepara a interpretação ao encerrar
a captura; nunca grava. Enviar também apenas interpreta e mantém a transcrição
para conferência. Frases vagas, negativas, incertas ou ambíguas não modificam condições.

Exemplos:

- Cárie mesial no dente vinte e um.
- Restauração palatina no dente 16.
- Selecionar pré-molares superiores.
- Endodontia satisfatória no dente 46.
- Extração indicada no dente 18.
- Extração realizada no dente 18.
- Anotar no dente 21: sensibilidade relatada.
- Limpar dente 11 (redefine todo o dente, incluindo as notas).

Informe uma condição e um grupo de dentes por comando. Dente pode ser omitido
somente quando há dentes selecionados na tela. Condições de superfície exigem a
face explícita; faces incompatíveis com a anatomia são recusadas. Intervalos não
atravessam quadrantes. “Todas as faces” se adapta à anatomia de cada dente.
Comandos genéricos de canal ou cálculo pedem classificação adicional; planejamento
não é gravado automaticamente como achado existente. Uma negativa, como “não há
cárie no dente 16”, não apaga nem acrescenta lesões; registre uma observação ou
use uma ação explícita após conferir o registro.

Observações são acrescentadas às notas existentes e não pintam lesões. Outras
condições e faces são preservadas. Redefinir para hígido limpa também as chaves
legadas de incisal/palatina, evitando resíduos por fusão de campos no armazenamento.

Versões históricas e modo de leitura bloqueiam comandos. Trocar paciente limpa
seleções, resultado pendente e transcrição; resultados preparados não migram para
outro paciente. Cliques repetidos durante processamento são bloqueados.

## Limites e validação

A gramática cobre comandos explícitos, não linguagem clínica livre irrestrita.
Reconhecimento de áudio continua dependente do navegador, microfone e pacote de
idioma local; a rotina não foi testada com microfone real Windows. A leitura falada
continua sendo retorno do comando, não leitura integral do odontograma.

151 testes Node, tipos e build completos aprovados. Rotina de interface com os
componentes e AppProvider reais em navegador isolado: histórico bloqueado,
confirmação antes de gravação, números falados, negativas, observações sem alterar
lesões, limpeza incisal e persistência após recarga. Classes visuais conferidas
contra a versão anterior. Não muda a origem dos dados nem conclui integração IAM.

## Campo de transcrição

O campo Transcrição do comando clínico recebe resultados parciais e acumulados
da captura de voz, permite revisar o texto e conserva a transcrição ao enviar.
Depois de Enviar, a transcrição permanece visível para mera conferência. Enviar
apenas interpreta o texto; a gravação requer Aplicar, mesmo que Interpretar automaticamente ao falar esteja marcada. Essa opção
prepara a interpretação ao encerrar a fala e nunca grava alterações clínicas. A versão revisada é utilizada na confirmação. Estilo preservado.
Verificado com eventos de reconhecimento simulados e TypeScript.

Pendência para a próxima instalação conjunta: a captura real no Chrome ainda
precisa de verificação do reconhecimento local, disponibilidade do idioma pt-BR,
preparação do pacote e mensagens visíveis de permissão/dispositivo/idioma.
Não confundir esta ligação do campo com a correção da inicialização do microfone.
