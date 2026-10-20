# Prontuário, PDF e sinais vitais — 09/10/2026

Consolida as atualizações do prontuário médico e exame clínico sobre a branch de
conferência do banco clínico. O formulário conserva a estrutura e o estilo
anteriores; as perguntas novas seguem os mesmos controles e classes visuais.

## Prontuário médico

- Medicação atual: Sim/Não e campo condicional para nomes, doses e frequência.
- Campos opcionais de médico responsável e mudanças de saúde desde a consulta.
- Respostas ausentes permanecem ausentes; valores zero e respostas negativas
  continuam distintos. Campos desconhecidos de versões anteriores são preservados.
- Salvar Prontuário Médico e Salvar PDF guardam respostas, documento cronológico e
  PDF completo no registro do paciente. Salvar PDF mantém o formulário aberto.
- A aba Arquivos mostra os PDFs junto da galeria existente, com abrir/imprimir e
  baixar. O destino real é patient.files no armazenamento do navegador; o caminho
  exibido no explorador de configurações não equivale a uma pasta física Windows.
- Impressão usa PDF A4 paginado, fontes incorporadas, fundo branco, marca d'água,
  assinatura e carimbo conforme layout. Reimpressão da anamnese usa a versão
  arquivada das respostas, identidade, data e configuração do documento.
- A gravação utiliza bloqueio entre abas e restauração compensatória quando uma
  escrita falha. Isso não oferece atomicidade contra encerramento do navegador;
  outros editores legados ainda não compartilham o mesmo bloqueio.

## Exame clínico

O bloco extraoral que continha Observações de Uso de Substâncias / Tabagismo
Severo passa a conter frequência cardíaca (BPM), pressão sistólica x diastólica
(mmHg), temperatura corpórea (°C), oximetria SpO₂ (%) e glicemia capilar (mg/dL).
As três últimas medidas ficam após a pressão. O botão Salvar Exame Extraoral
grava os valores, incluídos no relatório e no texto preparado para compartilhar.
Nenhuma mensagem é enviada automaticamente. As observações legadas permanecem
nos dados e relatórios; não são reinterpretadas como sinais vitais.

## Validação e limites

TypeScript, build completo e 140 testes Node aprovados. Fluxos dos componentes
verificados em navegador isolado: medicação condicional, salvar/reabrir PDF,
integridade byte a byte após armazenamento, sinais vitais após recarga e limpeza.
PDF salvo lido como documento real de sete páginas A4. Instaladores e execução
das novas telas no Windows dependem da conferência no computador do usuário.

Estas alterações não integram as telas ao controle de acesso da API de
conferência. Dados clínicos e arquivos continuam no navegador, sujeitos ao limite
de armazenamento e dependentes do backup. A revisão de todas as telas e
impressões permanece em andamento. Não representa conclusão da segurança IAM.
