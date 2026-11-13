import { ESLint } from 'eslint';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Reproduce the type-aware rules from the supplied report without disabling
// rules in the normal repository configuration. This is not the hosted scan.
const files = [
  'app/(tabs)/(more)/downloads.tsx',
  'components/downloads/**/*.ts',
  'components/downloads/**/*.tsx',
  'components/Tafseer.tsx',
  'components/tafseer/**/*.ts',
  'components/tafseer/**/*.tsx',
  'components/SelectRiwaya.tsx',
  'components/TafseerPopup.tsx',
  'constants/pngCdn.ts',
  'constants/TafseerCdn.ts',
  'constants/riwayas.ts',
  'hooks/useMushafDownload.ts',
  'hooks/useTafseerDownload.ts',
  'hooks/useTafseerContent.ts',
  'hooks/useTafseerData.ts',
  'utils/pages.ts',
  'utils/riwayaHelper.ts',
  'utils/downloads/downloads.native.ts',
  'utils/downloads/downloads.web.ts',
  'utils/downloads/coordinator.ts',
];

const eslint = new ESLint({
  overrideConfig: {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/require-await': 'error',
    },
  },
});
const results = await eslint.lintFiles(files);
const formatter = await eslint.loadFormatter('stylish');
const output = formatter.format(results);
if (output) process.stdout.write(output);
assert.equal(
  results.reduce(
    (count, result) => count + result.errorCount + result.warningCount,
    0,
  ),
  0,
  'The supplied type-aware rules must pass for all affected files',
);

const reportedObjects = new Set([
  'RIWAYA_TO_ASSET_DIRECTORY',
  'RIWAYA_ARABIC_LABEL',
  'TAFSEER_ARABIC_LABEL',
  'RIWAYA_PAGE_COUNTS',
  'RIWAYA_SIZE_ESTIMATE_BYTES',
  'RIWAYA_OPTIONS',
  'RETRY_DELAY_MS',
  'cache',
  'progressMap',
  'currentProgress',
  'byRiwaya',
  'byTafseer',
  'results',
  'Colors',
]);
function nonCommentLines(source) {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.JSX,
    source.text,
  );
  const lines = new Set();
  for (
    let token = scanner.scan();
    token !== ts.SyntaxKind.EndOfFileToken;
    token = scanner.scan()
  ) {
    if (token <= ts.SyntaxKind.ConflictMarkerTrivia) continue;
    const start = source.getLineAndCharacterOfPosition(
      scanner.getTokenPos(),
    ).line;
    const end = source.getLineAndCharacterOfPosition(
      scanner.getTextPos() - 1,
    ).line;
    for (let line = start; line <= end; line++) lines.add(line);
  }
  return lines;
}

for (const result of results) {
  const text = readFileSync(result.filePath, 'utf8');
  const source = ts.createSourceFile(
    result.filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  const codeLines = nonCommentLines(source);
  const visit = (node) => {
    if (
      ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression)
    ) {
      assert(
        !reportedObjects.has(node.expression.text),
        `${result.filePath}: runtime indexing of ${node.expression.text} reintroduces a reported sink`,
      );
    }
    if (ts.isFunctionLike(node) && node.body) {
      const name = node.name?.getText(source);
      const isTafseerAnonymous =
        /(?:Tafseer\.tsx|TafseerView\.tsx|useTafseerData\.ts)$/.test(
          result.filePath,
        ) && !name;
      if (name === 'DownloadsScreen' || isTafseerAnonymous) {
        const start = source.getLineAndCharacterOfPosition(
          node.getStart(source),
        ).line;
        const end = source.getLineAndCharacterOfPosition(node.end - 1).line;
        const count = [...codeLines].filter(
          (line) => line >= start && line <= end,
        ).length;
        assert(
          count <= 50,
          `${result.filePath}: ${name ?? 'anonymous'} exceeds 50 code lines (${count})`,
        );
      }
      if (
        name === 'releaseMushafPageUri' &&
        result.filePath.endsWith('downloads.native.ts')
      ) {
        assert(
          ts.isBlock(node.body) && node.body.statements.length > 0,
          'Native cleanup must explicitly document its no-op contract',
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (
    result.filePath
      .replaceAll('\\', '/')
      .endsWith('app/(tabs)/(more)/downloads.tsx')
  ) {
    assert(
      codeLines.size <= 500,
      `Downloads route exceeds 500 code lines (${codeLines.size})`,
    );
    console.log(
      `Downloads route: ${codeLines.size} non-comment code lines; DownloadsScreen and tafseer callbacks <= 50.`,
    );
  }
}
console.log(
  `Codacy report checks passed for ${results.length} files: typed rules, reported object-access patterns, and complexity limits.`,
);
console.log(
  'HTML safety and async failure/cancellation behavior are verified by the regression tests; hosted Codacy results require a separate scan.',
);
