# Salvamento dos painéis clínicos

Cada painel conserva uma data própria: Ficha Diagnóstica e Avaliação de Dor,
Odontograma Interativo, Exame Extraoral e Exame Intraoral. Salvar um painel não
muda as datas nem os registros atuais dos outros. A data escolhida é usada na
evolução e no PDF; o momento de arquivamento é registrado separadamente.

Na ficha de dor, a faixa logo abaixo do título mostra somente a data do exame.
Nome, ficha, telefone, endereço, sexo e nascimento foram removidos dessa faixa.
O PDF mantém a identificação do paciente para vincular o documento ao prontuário.

## Como arquivar

- Dor: Salvar Ficha Diagnóstica.
- Extraoral: Salvar Exame Extraoral.
- Intraoral: Salvar Exame Intraoral.
- Odontograma: Cronologia → Salvar no Histórico.

Cada confirmação cria uma entrada no Histórico de Evoluções Clínicas e um PDF
na Galeria do Prontuário. Preserva versões anteriores, fotografias e outras
evoluções. O odontograma em PDF inclui um desenho vetorial e detalhes por dente.
A galeria mostra fotos, radiografias e PDFs, com abrir/imprimir e baixar.
O título longo Galeria Unificada do Prontuário (Fotos e Radiografias) foi
abreviado para Galeria do Prontuário.

Autosaves e alterações em tempo real continuam como rascunhos atuais. Não
geram um PDF por tecla ou por face pintada. Use os comandos de salvamento acima
para arquivar uma versão final no histórico. Novos cliques durante a geração
do PDF são bloqueados. Falha de imagem do layout, geração ou armazenamento é
exibida; não é anunciado sucesso sem PDF/evolução. O salvamento dos quatro
grupos de dados tem bloqueio entre abas e restauração compensatória. Não é
atomicidade contra desligamento do computador e os editores legados continuam
sujeitos aos seus limites existentes de concorrência.

## Voz no Chrome

A captura verifica suporte local, disponibilidade de pt-BR e preparação do
pacote de idioma quando o navegador oferece esse recurso. Mostra estados de
preparação, solicitação de microfone, captura e erros específicos de idioma,
permissão ou dispositivo. Fechar a janela encerra a captura e bloqueia eventos
atrasados; preparação pendente não liga o microfone depois de fechar. Não usa
reconhecimento remoto como alternativa.
O texto transcrito permanece no campo Transcrição do comando clínico; Enviar
apenas interpreta. Somente o botão Aplicar ou a palavra isolada Aplicar,
reconhecida como resultado final, confirmam um comando clínico válido.

## Validação e instalação conjunta

157 testes Node, verificação de tipos e build completos aprovados. Rotina com
AppProvider e DomainProviders reais em navegador isolado: quatro datas distintas,
quatro evoluções renderizadas no histórico, quatro PDFs persistentes na galeria,
reabertura e recarga, cabeçalho de dor, cronologia do odontograma. PDFs renderizados
para conferir layout. Captura/idioma e confirmação por Aplicar testados por
eventos simulados; microfone real e instalador Windows ainda exigem conferência.

O pacote conjunto incorpora as mudanças de transcrição e confirmação preparadas
após o primeiro pacote de voz. Não requer instalações intermediárias. Dados e
anexos continuam no navegador; não cria uma pasta física de PDFs nem conclui
a integração das telas ao IAM da cópia de conferência.
