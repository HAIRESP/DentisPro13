import { readFileSync, statSync } from 'node:fs';
import { inspectClinicalBackup, stageClinicalBackup } from '../server/clinicalMigration.mjs';

const help = `Uso (Node 24):
  node scripts/stage-clinical-data.mjs --source <backup.json>
  node scripts/stage-clinical-data.mjs --source <backup.json> --create <novo.sqlite>

Sem --create: somente confere o JSON, sem gravar arquivos.
Com --create: gera uma cópia de conferência em um arquivo NOVO.
A pasta de destino precisa existir. Banco existente nunca é sobrescrito.
Não ativa o banco na aplicação, não importa contas e não altera o navegador.
Execute no computador servidor; não compartilhe o arquivo SQLite na rede.`;

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') console.log(help);
  else {
    const options = new Map();
    for (let i = 0; i < args.length; i += 2) {
      if (!['--source', '--create'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || options.has(args[i])) {
        throw new Error(help);
      }
      options.set(args[i], args[i + 1]);
    }
    if (!options.has('--source')) throw new Error(help);
    const info = statSync(options.get('--source'));
    if (!info.isFile() || info.size > 256 * 1024 * 1024) throw new Error('Selecione um arquivo JSON de até 256 MiB.');
    const bytes = readFileSync(options.get('--source'));
    const summary = options.has('--create')
      ? stageClinicalBackup(bytes, options.get('--create'))
      : inspectClinicalBackup(bytes).summary;
    console.log(JSON.stringify({ mode: options.has('--create') ? 'created_staging_database' : 'validation_only', ...summary }, null, 2));
  }
} catch (error) {
  // Do not print paths (possibly patient names), SQL statements or source data on filesystem errors.
  const message = error?.code === 'EEXIST' ? 'O destino já existe. Escolha um arquivo novo; nada foi sobrescrito.'
    : error?.code ? `Não foi possível concluir a operação (${error.code}). Verifique o arquivo, a pasta e as permissões.`
    : error instanceof Error ? error.message : 'Não foi possível concluir a conferência.';
  console.error(message);
  process.exitCode = 1;
}
