# Design System Master File (Brand-Accurate)

> **LOGIC:** When building a specific page, first check `design-system/open-mushaf/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Open Mushaf  
**Brand intent:** Modern, calm, distraction-free Qur’an reading & study.  
**Source of truth:** `constants/Colors.ts`, `components/ThemedText.tsx`, `assets/svgs/islamic-mark.svg`, `app.json`.

---

## Brand Core

### Positioning

- **Promise:** Fast, offline-first Mushaf reading with thoughtful study tools (tafseer, search, ورد).
- **Personality:** Calm, respectful, scholarly, modern.
- **Visual metaphor:** Heritage materials (ivory/sepia paper) + contemporary clarity (clean spacing, strong hierarchy).

### Logo usage

- **Primary mark:** `assets/svgs/islamic-mark.svg` (evergreen fill with sand stroke).
- **Do:** Use on splash, about, store listing, and app icon surfaces.
- **Don’t:** Introduce competing accent colors (blue/cyan/red) for primary actions—evergreen is the signature.

---

## Global Rules

### Color Palette (Light / Dark)

These values match the shipped palette in `constants/Colors.ts`.

#### Light theme tokens

| Token | Hex | Usage |
|------|-----|-------|
| `primary` | `#1E5243` | Primary actions, active states |
| `primaryLight` | `#62A49B` | Subtle emphasis, charts, focus rings |
| `secondary` | `#C2B280` | Secondary accents, borders, chips |
| `background` | `#FAF8F6` | App background |
| `card` | `#FFFFFF` | Surfaces/cards |
| `ivory` | `#F9F6EF` | Soft sections (reader UI, panels) |
| `text` | `#1B1B1B` | Primary text |
| `icon` | `#6D6D6D` | Icons |
| `danger` | `#C62828` | Destructive actions |
| `dangerLight` | `#FFCDD2` | Destructive secondary surfaces |

#### Dark theme tokens

| Token | Hex | Usage |
|------|-----|-------|
| `primary` | `#1E5243` | Primary actions, active states |
| `primaryLight` | `#62A49B` | Subtle emphasis |
| `secondary` | `#A0A07E` | Secondary accents, borders |
| `background` | `#121212` | App background |
| `card` | `#1E1E1E` | Surfaces/cards |
| `ivory` | `#2E2E2E` | Soft sections (reader UI, panels) |
| `text` | `#EDEDED` | Primary text |
| `icon` | `#A0A0A0` | Icons |
| `danger` | `#EF5350` | Destructive actions |
| `dangerLight` | `#E57373` | Destructive secondary surfaces |

#### Color rules (non-negotiable)

- **Primary CTA = evergreen** (`primary`). No default “blue” CTAs.
- **Sand/gold is secondary**: use for borders, chips, subtle highlights—not for dominant buttons.
- **Reader modes** (sepia/high-contrast) are *reading preferences*, not global brand overrides.

### Typography

These are the app’s current fonts (see `components/ThemedText.tsx` + `package.json`).

- **UI / navigation / settings:** Tajawal (400/500/700)
- **Long-form Arabic reading / tafseer blocks (when appropriate):** Amiri (serif, classical tone)

#### Type roles

- **Title (screen titles, key numbers):** Tajawal Bold
- **Body UI (lists, labels, settings):** Tajawal Regular/Medium
- **Long Arabic paragraphs (tafseer, explanations):** Amiri Regular (increase line-height)

### Spacing & shape

- **Base radius:** 12 (cards), 10 (inputs), 8 (buttons).
- **Gaps:** Prefer 8/12/16/24/32 rhythm.

### Motion

- **Duration:** 150–250ms for color/opacity, 200–300ms for position/height.
- **Respect:** `prefers-reduced-motion`.
- **Avoid:** hover transforms that shift layout (especially on web).

---

## Component Specs (Platform-agnostic)

### Buttons

- **Primary:** background `primary`, text `#FFFFFF`
- **Secondary (filled):** background `secondary`, text `#1B1B1B` (light) / `#121212` (dark)
- **Outlined:** transparent background, border `primary` or `secondary`
- **Disabled:** reduce contrast but keep readable

**Rule:** No component may ship with a hardcoded default “blue” button.

### Links

- **Link color:** use `primary` (or `primaryLight` when needed), not arbitrary blue.
- **Hover/press:** opacity change only (no scale).

### Cards / surfaces

- **Card:** `card` background, subtle shadow/elevation, generous padding.
- **Reader panel:** `ivory` background for “paper” feel (light mode).

### Inputs

- **Border:** `secondary` when idle, `primary` when focused.
- **Placeholder:** `secondary`.

---

## Anti-patterns (Do NOT Use)

- ❌ Primary CTAs in blue/cyan/red (brand signature is evergreen).
- ❌ Emoji icons in UI (use a consistent SVG set).
- ❌ Low-contrast text on ivory/sepia surfaces.
- ❌ Hover effects that move/layout-shift components.

---

## Pre-Delivery Checklist

- [ ] Primary buttons/links use `primary` (`#1E5243`) — no “default blue”
- [ ] Sand/gold used as secondary accent only
- [ ] Typography roles applied (Tajawal UI, Amiri long-form)
- [ ] Light/dark contrast maintained (4.5:1 minimum for body text)
- [ ] Focus states visible (web + keyboard)
- [ ] Motion respects reduced-motion
