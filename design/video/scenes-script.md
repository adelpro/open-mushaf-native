# Intro Video — Production Script

Everything needed to regenerate the intro videos for open-mushaf-native.
Renderer: HyperFrames CLI (`npx hyperframes`), fully local, no paid services.

## Files

- `intro-landscape.mp4` — 1920×1080, 52 s, final render
- `intro-vertical.mp4` — 1080×1920 (9:16), 52 s, final render
- `composition-landscape.html` — the live composition source (landscape)
- `composition-vertical.html` — the live composition source (vertical)

The compositions are self-contained apart from `assets/` (fonts + screenshots listed below). Put the HTML files in a HyperFrames project (`npx hyperframes init intro --example blank`), copy `assets/` beside them, and open/render directly.

## Fonts (all local TTFs in `assets/`)

- **Tajawal** 400/500/700 — body, chips, subtitles (matches the app, `constants/fontNames.ts`)
- **Amiri Bold** — display headings only
- **Noto Naskh Arabic** — Quran-text accents
- Source for Amiri: `github.com/aliftype/amiri` release 1.002; Tajawal: `google/fonts` repo `ofl/tajawal/`

## Brand palette

| role | value |
| --- | --- |
| primary (green) | `#1E5243` |
| accent (gold) | `#C2B280` |
| card ivory | `#F9F6EF` |
| page bg | `#FAF8F6` |
| text dark | `#1B1B1B` |
| text muted | `#5F6B65` |

## Scene map (52 s total, 9 scenes)

| # | start | dur | scene | screenshot source |
| --- | --- | --- | --- | --- |
| 1 | 0 | 6 | Logo cold open — icon pops (back.out), then title + one-line subtitle | `assets/icon-large.png` |
| 2 | 6 | 5 | Welcome — "أهلاً بك" + subtitle | — |
| 3 | 11 | 7 | Reader — page swiping, preloading | `screenshots/main-screen.png` |
| 4 | 18 | 7 | Top menu — sura name, part, wird progress, quick nav | 800×450 top-menu shot |
| 5 | 25 | 6 | Tafseer — long-press shows chosen tafseer; easy switching | `screenshots/tafseer-popup.png` |
| 6 | 31 | 5 | Search — one word or advanced options, results with verses | `screenshots/search-screen.png` (wide contain card) |
| 7 | 36 | 5 | Quick jump — sura / page / āya | `screenshots/navigation-screen.png` |
| 8 | 41 | 6 | Wird + statistics — 7/30/90-day stats, daily rate, chart | `reading-statistics` shot (portrait contain card) |
| 9 | 47 | 5 | Close — logo, "ابدأ وردك اليوم", repo link, platforms, version 6.0.1, QR to this repo | `assets/icon-large.png` + generated QR |

## Scene copy (verbatim, both orientations)

- s1 subtitle: **اقرأ المصحف بسحبة واحدة، وتفاسير وورد وإحصائيات في تطبيق واحد.**
- s2 title: أهلاً بك — subtitle: **فتح المصحف في جيبك، بكل ما تحتاجه للقراءة اليومية.**
- s3 head التنقل بلمسة، chip قلّب واقرأ، desc: **اسحب وقلب الصفحة، والصفحة التالية محملة مسبقاً فتستمر في القراءة.**
- s4 head القائمة العلوية، chip الورد تحت عينك، desc: **شاهد اسم السورة والجزء ورقم صفيحة، وبها تقدمك في الورد وبحث ونقل مباشر.**
- s5 head التفسير، chip تفسير يتبع تفضيلك، desc: **اضغط على الصفحة، يفتح التفسير المختار؛ وبدّل بين التفاسير وقتما بغ.**
- s6 head البحث، chip اكتب واقري، desc: **اكتب الكلمة، تطلع لك الآيات معنونة عند تقدم البحث؛ ولمن يريد زيادة، خيارات البحث المتقدم.**
- s7 head التنقل، chip قفز لوجهتك، desc: **حدد السورة أو الصفحة أو الآية، ينقلك إليها التطبيق.**
- s8 head الورد اليومي والإحصائيات، chip ما قرأته يتحسبها، desc: **سجّل ما قريته؛ يحسب لك الأجزاء والمعدل، ويظهر لك تقدمك على مدى الأسبوع والشهر.**
- s9 heading: **ابدأ وردك اليوم**، QR caption: امسح للمستودع

## Motion spec

- One paused GSAP timeline at `window.__timelines["main"]`; scene wrapper fades handled by clip windows.
- Eases only: `power3.out` (softOut aliases `softInOut` for fades), `back.out(1.4)` for chip/QR pops; the drift tween is the only `ease:"none"`.
- 3D phones: scenes with device shots use a `.stage3d` wrapper (`perspective: 1600px`), phone enters `rotateY(-24°) rotateX(4°)` settling to `rotateY(-13°) rotateX(3°)`, drifts ~2° over the hold; glass sheen gradient sweeps once; radial floor shadow under the device. Wide/portrait screenshots (search, statistics) use `.device-wide` contain cards so nothing is cropped.
- Phase-in per feature scene: device cover beat +0.2s → heading +0.6s → desc +1.0s → chip +1.5s.

## Build loop

```bash
npx hyperframes lint
npm run check          # lint + layout/contrast runtime audit (WCAG AA)
npx hyperframes snapshot --at 2.5,8.5,14.5,21.5,28,33.5,38.5,44,49.5
npm run render
```

Software-GL note: expect roughly 2m20s per 52 s 1080p render on Linux without chrome-headless-shell ("screenshot capture · software gpu" line in the log).
