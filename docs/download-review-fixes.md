# Download review fixes

Reviewed the current Open Mushaf implementation against the supplied requirements. The original CodeRabbit comment bodies and IDs were not available: the connected GitHub API returned HTTP 403. The numbering below identifies **20 independently validated code findings**, not verified CodeRabbit thread IDs. No review threads were marked resolved.

| #   | Validated issue and resolution                                                                                                                                                                                                                                                          | Main files                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Partial mushaf downloads previously resolved successfully. Permanent page failures now reject and publish error progress; only a complete run records completion.                                                                                                                       | hooks/useMushafDownload.ts                                                                                        |
| 2   | Cancellation previously returned normally, allowing success notifications and downloaded badges. Cancelled starts now reject with AbortError, and callers suppress success/error notifications for cancellation.                                                                        | hooks/useMushafDownload.ts; hooks/useTafseerDownload.ts; components/SelectRiwaya.tsx; downloads screen/controller |
| 3   | Controllers were instance-local. A synchronous module-level lease now coordinates both resource kinds across all hook instances.                                                                                                                                                        | utils/downloads/coordinator.ts; both download hooks                                                               |
| 4   | Another hook instance could not cancel an active download. All consumers now cancel the shared controller; the lease remains held until work and cleanup settle.                                                                                                                        | coordinator.ts; both download hooks                                                                               |
| 5   | Mushaf cache probing ran outside cleanup. Probes now run inside try/finally, support cancellation, and release the lease on failure.                                                                                                                                                    | hooks/useMushafDownload.ts                                                                                        |
| 6   | An already-cached tafseer returned before controller cleanup. Cached returns now run through finally and subsequent starts remain usable.                                                                                                                                               | hooks/useTafseerDownload.ts                                                                                       |
| 7   | Retry delays ignored cancellation and used a browser-specific DOMException constructor. Retry waits now abort immediately and use a portable Error named AbortError.                                                                                                                    | coordinator.ts; hooks/useMushafDownload.ts                                                                        |
| 8   | Invalid concurrency could start zero workers and falsely succeed. Concurrency must be an integer from 1 through 32.                                                                                                                                                                     | hooks/useMushafDownload.ts                                                                                        |
| 9   | Persistence could return zero bytes while the download reported success. Failed/zero-byte persistence now rejects in both the storage layer and hooks. Completion atoms are owned by the hooks.                                                                                         | both platform implementations; both hooks; callers                                                                |
| 10  | Native writes exposed final filenames before writes completed. Writes now use unique staging files, verify their contents and byte lengths, and keep a backup until replacement succeeds. Failed replacement restores the previous file.                                                | utils/downloads/downloads.native.ts                                                                               |
| 11  | Existence or raw entry counts treated corrupt/partial/extra files as downloaded pages. PNG signatures, chunks, checksums, and terminal data are validated; counts inspect only valid expected page numbers.                                                                             | validation.ts; both platform implementations                                                                      |
| 12  | Tafseer HTML/error bodies, malformed JSON, wrong schemas and valid-but-incomplete arrays could become cache hits. Reads and writes validate row structure and expected full dataset lengths (6236, or 506 for nozool-wahidy).                                                           | validation.ts; both platform implementations; components/Tafseer.tsx                                              |
| 13  | JavaScript string length undercounted Arabic file sizes. Persistence reports UTF-8 byte length and native commits verify the actual file size.                                                                                                                                          | validation.ts; both platform implementations                                                                      |
| 14  | Web persistence stored the whole underlying ArrayBuffer, ignoring typed-array offsets. Writes now copy only the supplied byte view.                                                                                                                                                     | utils/downloads/downloads.web.ts                                                                                  |
| 15  | Web cache writes were not verified or cancelled safely. Cache writes now require storage availability, read back and verify data, and remove newly committed entries on cancellation/verification failure.                                                                              | utils/downloads/downloads.web.ts                                                                                  |
| 16  | Stale tafseer operations could replace a newer tab's data, error or loading state. Effect cleanup invalidates old operations and aborts fetches; aya/surah changes filter existing data without refetching whole files.                                                                 | components/Tafseer.tsx                                                                                            |
| 17  | Optional caching errors could turn successful online tafseer reads into errors. Rendering now succeeds independently of best-effort persistence; missing/unavailable image caches continue to fall back to the PNG CDN.                                                                 | components/Tafseer.tsx; hooks/usePageAsset.ts                                                                     |
| 18  | An object URL resolving after effect cleanup leaked. Late URLs are now released immediately, and active URLs are released during cleanup.                                                                                                                                               | hooks/usePageAsset.ts                                                                                             |
| 19  | The public entrypoint eagerly imported both platforms, pulling native filesystem modules into web. Metro now selects the platform implementation through an extensionless import, with a TypeScript/non-Metro fallback.                                                                 | utils/downloads/index.ts; utils/downloads/downloads.ts                                                            |
| 20  | Large tafseers exceeded the original CDN's per-file hosting limit. The default now uses pinned raw GitHub URLs, retaining the environment override and normalizing its trailing slashes. Live HEAD checks returned HTTP 200 and Access-Control-Allow-Origin: * for muyassar and tabary. | constants/TafseerCdn.ts                                                                                           |

Additional consistency fixes: downloaded flags reconcile against validated storage and the current lifecycle, so failed/cancelled runs are not promoted by a size refresh. Refreshes reject stale snapshots, observe lifecycle changes instead of every progress tick, and show downloads started by other instances. Native deletion failures propagate. Web removal uses browser confirmation because the installed React Native Web Alert.alert implementation is a no-op. The section accessibility label now matches its expanded state.

## Regression coverage

Added 31 regression cases in:

- hooks/**tests**/downloads.regression.test.ts
- utils/downloads/**tests**/native.test.ts
- utils/downloads/**tests**/web.test.ts

Coverage includes cancellation during probing, response consumption, persistence and retry backoff; concurrent starts across instances/resource kinds; partial failure; lease cleanup; zero-byte/unavailable/quota failures; staging write/move/truncation failures; preservation and restoration of existing files; invalid cache entries; complete dataset validation; UTF-8 byte sizes; typed-array views; PNG corruption; and failed deletion.

Native filesystem and browser Cache API unit tests use controlled implementations. They do not replace device/browser end-to-end tests.

## Validation and limits

Final results on the combined workspace:

| Check                                               | Executed result                              |
| --------------------------------------------------- | -------------------------------------------- |
| TypeScript: tsc --noEmit                            | Passed                                       |
| Repository ESLint: eslint . --max-warnings=0        | Passed                                       |
| Full Vitest suite with TZ=UTC                       | 135 passed across 15 files                   |
| Full Vitest suite with TZ=Africa/Cairo              | 134 passed, 1 unrelated DST assertion failed |
| Web production export                               | Passed                                       |
| Android production export including Hermes bytecode | Passed                                       |
| git diff --check                                    | Passed                                       |
| Live CDN HEAD checks (muyassar, tabary)             | HTTP 200, browser CORS enabled               |

Temporary export/check logs live under the ignored .expo directory. Exports were written to .expo/review-web and .expo/review-android.

- TypeScript, repository-wide ESLint, unit tests and Web/Android production exports were exercised.
- Tests pass under TZ=UTC. Under Africa/Cairo, the unrelated readingChart daysAgo test fails because it assumes each local calendar day spans exactly 86400000 milliseconds across DST. The date implementation/test was left outside this download fix.
- The initial test/Hermes runs hit Windows sandbox temporary-directory permission errors. Re-running with TEMP and TMP under .expo/test-tmp avoided those errors.
- An Android 12 device and the development app were detected. The development client timed out obtaining the Metro manifest, so on-device UI, native download/persistence, cancellation and offline-reading behavior are **not verified**. The temporary Metro servers and ADB forwards were removed.
- A production Web export does not establish an interactive browser/offline-service-worker end-to-end pass; that check was not executed.
- All ten shipped tafseer datasets were checked against the validator. A legacy numeric surah metadata typo in nozool-wahidy is preserved; validation checks structure/completeness rather than rewriting source content.
- Concurrent changes appeared in the shared workspace (download card/controller/style extraction, metadata helpers and HTML sanitation). Those edits were preserved. They were not introduced as part of this download lifecycle patch.

## Changed-file scope

Lifecycle: hooks/useMushafDownload.ts, hooks/useTafseerDownload.ts, utils/downloads/coordinator.ts.

Storage and module boundary: utils/downloads/downloads.native.ts, utils/downloads/downloads.web.ts, utils/downloads/downloads.ts, utils/downloads/index.ts, utils/downloads/validation.ts.

Reading and presentation: components/Tafseer.tsx, components/SelectRiwaya.tsx, hooks/usePageAsset.ts, app/(tabs)/(more)/downloads.tsx, and the concurrently extracted components/downloads/useDownloadsScreen.ts.

Hosting: constants/TafseerCdn.ts. Regression files are listed above.
