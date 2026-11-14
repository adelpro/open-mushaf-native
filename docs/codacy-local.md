# Official Codacy analysis locally

The repository can run the official `@codacy/analysis-cli` (pinned to 0.29.1).
The CLI, downloaded analyzers, generated configuration and reports are stored in
the ignored `.expo/` directory. Tool-generated rules are also ignored under
`.codacy/generated/`. Application dependencies are not changed.

```sh
npm run codacy:install
npm run codacy -- init --auto
npm run codacy -- analyze --install-dependencies
```

The last command installs and runs the tools selected by automatic discovery.
Some tools require additional downloads and network access on their first run.
For just the JavaScript/TypeScript checks, complexity metrics and security checks:

```sh
npm run codacy -- analyze --install-dependencies --tool ESLint9 --tool jackson --tool Lizard --tool Semgrep --tool PMD7 --output-format json --output .expo/codacy-analysis/results.json
```

`Semgrep` is the CLI's tool ID for its Opengrep-based security adapter.
An exit code of 1 means findings were reported; check the report and per-tool
status to distinguish findings from incomplete analysis.

## Match the repository's Codacy website rules

Automatic configuration uses locally detected tools and suggested rules. It does
not establish parity with the existing Codacy pull-request configuration.
Authenticate interactively in your own terminal and import the repository rules:

```sh
npm run codacy -- login
npm run codacy -- init --remote gh adelpro open-mushaf-native
npm run codacy -- analyze --install-dependencies --output-format json --output .expo/codacy-analysis/results.json
```

Enter the token only in Codacy's login prompt. Do not put it into a tracked file
or a chat message. Analysis runs locally; these commands do not upload reports.

## Useful commands

```sh
npm run codacy -- --version
npm run codacy -- info
npm run codacy -- analyze --inspect
npm run codacy -- analyze --diff main
```

The existing `npm run check:codacy` is the separate focused regression check for
the pasted 79-item report. `npm run codacy -- analyze` runs the official CLI.

If npm's registry has a DNS problem, retry installation through the npm-compatible
Yarn registry:

```sh
npm run codacy:install -- --registry=https://registry.yarnpkg.com
```

Reference: [Codacy Analysis CLI documentation](https://docs.codacy.com/codacy-analysis-cli/).

## Verified local run

Run the installed, working analyzers with:

```sh
npm run codacy:check
```

The latest verified run reports **zero findings and zero analyzer errors**:
ESLint checked 271 files, Jackson checked 22 JSON files, and Lizard checked
254 files. The report is saved to `.expo/codacy-analysis/local-results.json`.

The previous 63 complexity findings were resolved by separating screen sections,
static content and styles, simplifying validation and download helpers, and
using single props arguments. The analyzer rules and thresholds were unchanged.
Explicit JSX boolean values and named fragments also avoid TSX parsing errors
that merged unrelated functions into the same metric.

This is an incomplete set of the discovered checks: the Opengrep download failed,
and PMD reported 14 diagnostic entries including parser errors. Neither is
included in `codacy:check`. The CLI can exit successfully despite analyzer errors,
so inspect `errors` and per-tool status when running additional tools. Matching
the website's issue list still requires importing its authenticated configuration.
