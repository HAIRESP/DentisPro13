# Banco clínico — etapa 1: cópia de conferência

Esta etapa cria um banco SQLite novo a partir do JSON exportado pelo DentisPro.
**Ainda não conecta as telas ao banco nem habilita uso compartilhado na rede.**
O navegador continua sendo a origem ativa. Nenhuma restauração, baixa de estoque,
alteração de senha ou mudança no banco de contas é executada.

## Organização implementada

| Estrutura | Conteúdo |
| --- | --- |
| `patient_records` | Um prontuário por paciente: cadastro, anamnese, consultas, receitas, evolução, planos, pagamentos, documentos vinculados, exames, odontogramas e imagens incorporadas nesses registros. |
| `procedure_catalog` | Um registro por código TUSS, com todos os campos originais: textos, características, figuras, preços e materiais. Não cria uma tabela física por procedimento. |
| `procedure_snapshots` | Cópia dos itens de tratamento e dos atendimentos, independente de futuras alterações do catálogo. A cópia adicional do catálogo é da data da importação, não uma reconstrução da versão histórica. |
| `clinic_data` | Estoque, configurações, campos adicionais e registros sem vínculo com paciente. |
| `migration` | JSON original byte a byte, SHA-256, data, contagens e estado `staged_not_active`. |
| `migration_events` | Registro técnico da importação; não substitui auditoria clínica. |
| `patient_access` | Estrutura inicialmente vazia, reservada para a próxima etapa. Não há API clínica nem concessão automática de acesso. |

As contas continuam no banco de contas existente. Não há importação de senhas ou
sessões para o mecanismo de autenticação. Campos legados presentes no JSON original
são preservados no arquivo de conferência; trate-o como material confidencial.

Os anexos incorporados como `data:` permanecem junto ao prontuário nesta etapa.
Referências `https:`, `file:` e `blob:` são preservadas, mas seus arquivos não são
buscados. A contagem de referências é indicativa: não inspeciona HTML, não verifica
arquivos e não comprova disponibilidade offline. Nenhum conteúdo HTML é executado.
Documentos, guias e comissões sem identificador do paciente são preservados para
vinculação manual; o programa não tenta adivinhar o paciente pelo nome.

## Conferência no Windows, somente no D:

Use Node 24 e o código desta branch de revisão. Antes, faça o backup externo dos
dados atuais. Exporte o JSON pela função **Exportar JSON** do DentisPro no navegador
que contém os dados corretos. Não use a função de restaurar/importar do aplicativo.
Guarde o JSON em uma pasta local protegida no D:. Não envie dados reais ao GitHub.

O exemplo usa uma pasta nova `D:\DentisPro\conferencia` e um arquivo escolhido por
você. Execute o script a partir da pasta do código revisado; não é necessário mover
a instalação atual para executar esta etapa.

```powershell
New-Item -ItemType Directory -Force D:\DentisPro\conferencia

# Ajuste este caminho para o JSON exportado no seu computador.
$backupDentisPro = 'D:\DentisPro\conferencia\backup-exportado.json'

# Primeiro: validação somente. Não cria nem modifica banco.
node scripts/stage-clinical-data.mjs --source $backupDentisPro

# Depois da conferência das contagens: cria APENAS uma cópia de avaliação.
node scripts/stage-clinical-data.mjs --source $backupDentisPro --create 'D:\DentisPro\conferencia\clinico-conferencia-01.sqlite'
```

O destino precisa ser novo. Se já existir, a operação falha sem sobrescrever.
Importações repetidas devem usar outro nome; não apague a conferência anterior
para contornar um erro. Erros de referência ou IDs duplicados interrompem a
importação; corrija a origem após investigar, sem excluir prontuários para passar.
O limite de entrada é 256 MiB. Nenhum comando baixa arquivos externos.

O relatório mostra contagens e avisos, sem nomes, conteúdo clínico ou senhas.
Confira especialmente `missingSections`, `unlinkedDocuments`,
`unlinkedInsuranceGuides`, `unlinkedCommissions`, `missingCatalogReferences` e
`mediaReferences`. Campos ausentes em backups antigos não são inventados.
Uma importação bem-sucedida significa que a cópia passou pelas verificações
estruturais; ainda é necessária a conferência clínica dos registros e anexos.

## Limites de segurança e próximos passos

- Este SQLite ainda não é criptografado. `0600` restringe criação em sistemas POSIX;
  no Windows é necessário configurar permissões NTFS da pasta e a proteção do
  disco/backup. Não colocar em pasta pública ou compartilhamento de arquivos.
- Não apontar o servidor ativo para esta cópia. Não trocar `DENTISPRO_DATA_DIR`
  nesta etapa: isso também mudaria onde o sistema procura o banco de contas.
- A próxima etapa deve implementar autenticação e autorização clínica no servidor,
  vínculo profissional-conta, concessão/revogação por paciente e auditoria de acesso.
  Administrador não deve receber acesso clínico automaticamente. A tabela vazia de
  permissões, isoladamente, não implementa esses controles.
- Em seguida, conectar as telas às APIs, tratar edições simultâneas e realizar a
  transição com uma exportação final após suspender edições. Esta cópia não recebe
  mudanças realizadas posteriormente no navegador.
- Integrar os anexos ao armazenamento protegido e ao backup completo, verificar os
  vínculos e testar restauração em outro diretório antes de ativar o banco.
- Só depois configurar serviço Windows, HTTPS na rede local e backups externos.
  Computadores clientes devem acessar o servidor HTTP(S), nunca abrir diretamente
  o arquivo SQLite por SMB/pasta compartilhada.

## Validação de desenvolvimento

```powershell
node --test tests/clinicalMigration.test.mjs
```

A suíte usa apenas dados fictícios. Cobre preservação do arquivo original e dos
anexos incorporados, persistência após reabertura, separação do catálogo/histórico,
referências inválidas, IDs duplicados, arquivos existentes, rollback, referências
externas, compatibilidade com guias legadas e o comando de conferência sem escrita.
