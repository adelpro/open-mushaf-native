import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(
  root,
  '.expo/codacy-cli/node_modules/@codacy/analysis-cli/dist/index.js',
);
if (!existsSync(cli)) {
  console.error(
    'Codacy Analysis CLI is not installed. Run npm run codacy:install first.',
  );
  process.exit(2);
}

const args = process.argv.slice(2);
const command = args[0];
if (
  ['init', 'update-config', 'analyze'].includes(command) &&
  !args.some(
    (arg) => arg === '--config-file' || arg.startsWith('--config-file='),
  )
) {
  args.push('--config-file', '.expo/codacy-analysis/codacy.config.json');
}
if (command === 'analyze' && !args.includes('--no-log')) args.push('--no-log');
if (
  command === 'analyze' &&
  !args.some((arg) =>
    ['--inspect', '--install-dependencies', '--fail-if-missing'].includes(arg),
  )
) {
  // A skipped analyzer must not look like a successful clean scan.
  args.push('--fail-if-missing');
}

const result = spawnSync(
  process.execPath,
  [cli, '--no-update-notifier', ...args],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      CODACY_GLOBAL_DIR:
        process.env.CODACY_GLOBAL_DIR || join(root, '.expo/codacy-tools'),
    },
  },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 2);
