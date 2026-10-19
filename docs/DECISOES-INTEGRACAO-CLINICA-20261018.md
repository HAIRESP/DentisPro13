# Decisoes da integracao clinica — DentisPro13

Branch de integracao: integracao-clinica-20261018
Base preservada: consolidacao-local-20261018, commit b2be574
Revisao remota: origin/fix/clinical-forms-pdf-20261009, commit 703ea17

## Estado
Merge em andamento, ainda nao concluido. Inicialmente 15 conflitos; quatro resolvidos (package.json, package-lock.json, DentalDocumentManager.tsx e ImageGalleryWithEditor.tsx); onze pendentes. Aprovacao funcional depende de testes e revisao.

## Odontograma
- O estado atual dos dentes permanece editavel entre consultas e tratamentos, conservando as alteracoes acumuladas.
- Mudancas de tratamento nao geram automaticamente PDF de avaliacao.
- Cada avaliacao formal confirmada cria um snapshot integral, uma evolucao e um PDF historico correspondente.
- Avaliacoes e PDFs anteriores nao devem ser sobrescritos.
- Consultar avaliacao antiga nao pode alterar o odontograma vigente. Restauracao requer confirmacao explicita.
- Evitar duplicacao entre saveClinicalPanel e saveOdontogramSnapshot.

## Documentos e TCLE
- Preservar o TCLE anterior e manter separado o documento posterior ao tratamento.
- O TCLE anterior devera comportar no minimo tres propostas de tratamento, com nome e descricao; os campos adicionais, cuidados, riscos e vantagens serao implementados posteriormente.
- Preservar os rascunhos editaveis e arquivar PDFs com versoes e cronologia decrescente por paciente.
- Manter o layout atual, assinatura, carimbo e regras de impressao.

## Persistencia e seguranca
- O servidor sera a fonte definitiva dos documentos clinicos, utilizando SQLite e repositorio privado de PDFs.
- A API validara sessao, vinculo profissional, paciente e permissao em cada leitura e escrita.
- PDFs devem ser abertos mediante requisicao autenticada; nao usar data URLs persistentes como armazenamento definitivo.
- Nao ativar a base de conferencia staged_not_active diretamente.
- Preservar autenticacao local, auditoria, backups e remocao de Firebase e drizzle-kit.

## Integracao
- Preservar nomenclatura local das funcoes quando possivel.
- Unificar os mecanismos de salvamento clinico antes de concluir AppContext.tsx.
- Nao usar resolucao automatica indiscriminada, nem alterar o estilo visual do software.
- Resolver conflitos restantes, verificar testes, lint, build e auditoria antes de criar commit de merge.

## Nomenclatura definitiva de PDFs
- Padrao: Nome_do_Documento_INICIAIS_YYYYMMDD_HHMM.pdf
- Iniciais do paciente sem particulas como de, da, do, dos e das.
- Data e hora locais do momento efetivo do salvamento, distintas da data clinica do exame.
- Nome sugerido automaticamente, podendo ser editado antes do download ou arquivamento.
- Identificador interno unico e historico preservado sem sobrescrita, mesmo em salvamentos no mesmo minuto.
- Preferir nova funcao formatClinicalPdfFilename, sem alterar o comportamento legado de formatSafeFilename.