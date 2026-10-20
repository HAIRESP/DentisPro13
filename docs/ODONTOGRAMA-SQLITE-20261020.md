# Odontograma SQLite — etapa 14F

O uso normal do odontograma passa a gravar no servidor local, em `DENTISPRO_DATA_DIR/odontogram.sqlite` (diretório padrão `.dentispro-data`). `DENTISPRO_ODONTOGRAM_CLINIC_DB` permite indicar outro arquivo. O diretório deve existir. O banco de contas e o banco clínico de conferência não são migrados.

## Fluxo

1. Entrar com conta de dentista e abrir o paciente em Exame Clínico.
2. No primeiro acesso, conferir nome e nascimento e confirmar o vínculo ao SQLite. São enviados somente identificador, nome e nascimento. Identidades divergentes com o mesmo identificador são recusadas; não há substituição silenciosa.
3. Escolher preparar uma cópia do odontograma atual do navegador ou abrir avaliação vazia. Nada é gravado como avaliação nessa escolha. O histórico antigo do navegador permanece preservado e não é importado automaticamente.
4. Salvar a avaliação. Odontograma, histórico, PDF, evolução, autoria e chave de repetição são gravados numa transação. Falha desfaz a transação; repetição confirmada não duplica documentos. Conflitos de versão exigem reabrir o paciente antes de editar.
5. Reabrir o paciente e conferir a avaliação e seus PDFs/evoluções na seção de arquivos do servidor no próprio odontograma.

Não há autorização individual por paciente no modo normal; dentistas autenticados da mesma instalação acessam os pacientes vinculados. Administrador e recepção continuam sem permissão clínica nessa rota. Contas, configurações e sessões preservam suas regras. O autor vem da sessão do servidor, e não do profissional selecionado na tela. A avaliação mantém UID e nome do autor. O histórico do servidor é protegido contra atualização/exclusão pelas rotas e gatilhos; isso não equivale a proteção contra alguém com controle do computador/arquivo SQLite.

## Conferência antiga

`DENTISPRO_ODONTOGRAM_MODE=review`, junto com `DENTISPRO_ODONTOGRAM_DB` e `DENTISPRO_CLINICAL_REVIEW_DB`, mantém o fluxo anterior com autorização por paciente. Esse modo não é usado pelo novo iniciador normal. Os bancos de conferência permanecem separados. Não apague os arquivos antigos.

## Backups e limites

Encerre o servidor antes de copiar o diretório de dados inteiro. A exportação JSON do navegador não inclui o SQLite do servidor. O backup de instalação preserva fontes/build; não substitui o backup periódico do banco em uso.

Os outros módulos continuam nas fontes de dados anteriores. Os PDFs e evoluções SQLite estão disponíveis dentro do odontograma; a galeria geral e a evolução clínica local ainda não agregam automaticamente esses arquivos do servidor. Não foi implantada sincronização geral de pacientes entre computadores nem migração integral do prontuário.

## Referência de procedimentos

O anexo `parametros_procedimento_odontologico(1).xltx` foi comparado com o anterior: todos os arquivos internos e células são iguais. A tabela de referência da etapa 14E contém os mesmos 22 parâmetros e permanece válida. Exemplos não preenchem prontuários. As ambiguidades da descrição “E” e da linha de orientações pós-operatórias continuam sinalizadas, sem inventar conteúdo.

## Validação

TypeScript, build Vite/esbuild e 244 testes aprovados, zero falhas e zero testes omitidos. Incluem login real e rotas HTTP, vínculo, gravação e leitura, PDF, autoria, reinício, repetição, conflito, rollback e encerramento de sessão. A conferência visual e de impressão no navegador do usuário permanece necessária. O aviso de tamanho do bundle do Vite continua presente.
