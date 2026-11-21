# Matrix redesign: build spec

For Claude Code, working in the `PuneetGrewal/portfolio` repo (pgrewal.co).
Base: `main` at `f334e2e` ("Add the Math4Me Parent Portal to Projects", 2026-11-17).
Stack as found: Next.js 15.5.7 App Router, Tailwind 4.3.5, pnpm. `package.json` lists React 18.2, but the App Router runs Next's bundled React 19.2.

The whole change was built and browser-tested in a sandbox copy of the repo. Appendix A is that change as a patch. Your job is to apply it, run the checks in section 7, and report. Sections 3, 4 and 6 explain what the patch does so you can repair or redo any part by hand.

## 1. What to build

- **One theme.** Black background, green monospace text on every page. The light/dark toggle is removed.
- **First load of a visit.** Falling green digits fill the screen, then every piece of text on the page shows as random digits and resolves into the real text, top to bottom. About 1.9 seconds in total.
- **Every later page** (navigation or reload in the same tab). No rain. The page content decodes in about 0.5 seconds. Nav and footer stay still.
- **Images and video.** Each one is wiped in behind a green scan line when it scrolls into view, then shows in full colour exactly as today.
- **Content does not change.** Same text, links, images, PDFs and routes.
- **Without JavaScript, or with reduced motion on**, the site is the static matrix theme with nothing hidden and nothing moving.

Puneet approved the look from a Claude Design canvas named "Portfolio matrix redesign" (he has the link; it is private).

## 2. Rules

1. **Content is frozen.** Do not edit any copy, data array, link, file name, image or PDF. A photo caption in `app/hobbies/page.tsx` reads "Coastal Rennaisance"; leave it unless Puneet says to fix it.
2. **Branch workflow, from `docs/HANDOFF.md`.** Work on a new branch `matrix-redesign` cut from `main`. Do not commit, push or merge unless Puneet asks. Never push to `main`. He checks a Vercel preview, then merges himself.
3. **Run the dev server on a port other than 3000.** Another project often holds 3000.
4. **Leave these alone:** `public/` (git has `public/Mountains`; the local folder may be `public/mountains`, do not rename or commit that), `.claude/launch.json`, `docs/HANDOFF.md`, `lib/notes.ts`, `scripts/`.
5. **No new dependencies.** One is removed: `next-themes`.
6. **Section 3 is the brand now.** If the Impeccable hook proposes restyles that contradict it, do not apply them.
7. **Before you start,** run `git status --short`. If any file listed in section 6 has uncommitted changes, stop and ask Puneet.

## 3. The look

All colours are Tailwind theme tokens in `app/global.css`, so `text-phosphor`, `border-line-strong`, `bg-card` and so on work as utilities.

| Token | Value | Used for |
|---|---|---|
| `background` | `#030806` | page |
| `card` | `#07130c` | cards, window frames, the cover over unrevealed media |
| `foreground` | `#c6f4d2` | body text (pale mint; pure green is tiring in paragraphs) |
| `muted-foreground` | `#7dbf93` | nav, tags, footer, secondary text |
| `phosphor` | `#00ff41` | headings, links, current nav item, buttons, focus rings |
| `phosphor-dim` | `#17a046` | prompt glyphs, link underlines, unresolved digits |
| `phosphor-hot` | `#eafff0` | the leading digit of a decode, rain heads, photo captions |
| `border` | `#143522` | card and frame borders |
| `line-strong` | `#1e5a36` | tag borders, window-bar dots |
| `ink` | `#021207` | text on a phosphor background |
| `warn` | `#ffb224` | the "Launching soon" pill |

Type: Geist Mono everywhere (`--font-mono`, already loaded by the layout). Body 15px / 1.7. Geist Sans is no longer imported.

| Element | Rule |
|---|---|
| Corners and shadows | Square corners. No drop shadows; the only glow is green. |
| Nav | Muted text; hover turns phosphor with a glow. The current page is inverse video (phosphor block, ink text) via `aria-current="page"`. |
| Page title (`h1`) | Class `mx-title`: phosphor with a glow, a `> ` prompt before and a blinking block cursor after. Both are CSS generated content. |
| Section heading (`h2` for Personal, Coursework, Tennis, Photography, Hiking, note subjects) | Class `mx-section`: phosphor with a `## ` prefix. The site names on `/live` are `h2` too and do not get it. |
| Links in copy | Phosphor, underline in `phosphor-dim` that brightens on hover. |
| Buttons | The shadcn `outline` variant: 1px phosphor border, phosphor text, inverse on hover. 44px tall on phones, 32px from 640px. |
| Tags | 1px `line-strong` border, muted text. 12px on `/projects`, 11px on `/live`. |
| Project cards | One per row at every width. Title and year on one line, then tags, description, button. |
| Media | 1px border; hover turns the border phosphor with a glow (this replaces the old hover scale). Live screenshots and the resume sit in a window frame: a 36px bar with three square dots and a centred label. |
| 404 | Same theme; the bouncing P letters use the greens. This page was not in the mockup. |
| Background | Faint horizontal scan lines on `html`. |

## 4. How the effects work

Four pieces, and no page knows about any of them:

| Piece | Where | Job |
|---|---|---|
| Boot script | inline, first thing in `<body>`, `app/layout.tsx` | Runs before the first paint. Sets `data-mx-wait` on `<html>` so nothing readable shows before the effect starts. |
| Controller | `components/matrix/controller.tsx`, mounted once in the layout | Plays the intro, the page decode and the media reveals. |
| Styles | bottom of `app/global.css` | The holds, the rain overlay, decode colours, media cover and scan line, title and section decorations. |
| Markers | attributes and classes in the pages | Tell the controller and styles what is what (table below). |

| Marker | Set by | Meaning |
|---|---|---|
| `html[data-mx-wait="intro"]` | boot script | First load of a visit: black screen with a blinking cursor until the rain takes over. |
| `html[data-mx-wait="page"]` | boot script | Later load: page content hidden until its decode starts. |
| `html[data-mx-js]` | controller | Controller is running. Media covers only exist under this. |
| `[data-mx-page]` | layout | Wrapper around `{children}`: the part that decodes on later pages. |
| `[data-mx-media]` (`="slow"` for tall images) | pages | A wrapper whose direct `img` or `video` child gets the scan-line reveal. |
| `[data-mx-in]` | controller | That media wrapper has been revealed. |
| `[data-mx-skip]` | pages, optional | Text inside is never decoded. Not used yet. |
| `.mx-title`, `.mx-section` | pages | Heading decorations (section 3). |
| `sessionStorage["mx-intro"]` | controller | The intro has played in this tab. |
| `window` event `mx:replay` | footer button | Play the intro again. |

### Intro timeline (`INTRO_MS = 1900`)

| At | What happens |
|---|---|
| before paint | Boot script sets the hold. CSS paints black. |
| 0 (controller mounts) | Rain overlay added, hold removed, `<main>` made `inert`. Text is scrambled underneath once fonts are ready (35% at the latest). |
| 40% | Overlay starts a 24% fade. |
| 45% | Text starts resolving, top of the page first. Media reveals start. |
| 70% | Overlay removed. |
| about 100% | Last text resolves. `inert` removed. Done. |
| 120% | Hard stop, whatever state things are in. |

The page decode (`PAGE_MS = 500`) is the same text routine on `[data-mx-page]` only, with no overlay.

### Rules the text decode follows, and why

Do not "simplify" these; each one fixes a real failure.

1. **It edits text nodes in place and restores them exactly.** It adds, removes and moves no elements. React only writes a text node whose value it changes, so it never notices. This is what keeps the content untouched and the server HTML the only source.
2. **Only letters and digits are swapped.** Spaces and punctuation stay, so every line breaks where the real text breaks.
3. **The character right after a hyphen keeps its real value.** "co-op" may wrap after the hyphen, "12-34" may not.
4. **Every node is line-checked.** Line positions and widths are measured before and after the first scramble. A node whose lines moved is put back and simply does not animate.
5. **Colours come from the CSS Custom Highlight API** (`::highlight(mx-rest)`, `::highlight(mx-head)`), so no spans are needed. Browsers without it show the digits in the text's own colour.
6. **The decoding region is `inert` while it runs.** Screen readers never read digits and a tap cannot land on a moving target. Any `pointerdown`, `keydown`, `wheel` or `touchmove` during the intro ends it at once.
7. **A node the controller did not last write is dropped,** never overwritten.
8. **The intro is a module-level singleton,** not tied to an effect, so React's dev-mode double effect cannot start it twice. Only one decode runs at a time; a second would read the first one's digits as real text.
9. **Hidden text is skipped** (`aria-hidden`, `.sr-only`, hover captions at opacity 0).

### Rules the media reveal follows

1. **The image is never clipped or hidden.** A cover (`::before`) sits over it and is wiped away. Clipping the image itself made Chromium stop loading lazy images further down the page.
2. **Reveal waits for 15% in view and for the image to load,** with a 3 second fallback.
3. **Covers exist only under `html[data-mx-js]`,** so nothing stays covered without JavaScript.

### Other states

| State | Behaviour |
|---|---|
| JavaScript off | Boot script never runs. Everything visible, static theme. |
| `prefers-reduced-motion: reduce` | Boot script sets no hold. No rain, no digits, no covers, cursor does not blink. "replay intro" still plays if clicked, since that is an explicit request. |
| Script error or very slow load | The boot script lifts either hold after 4 seconds on its own. |
| Route change mid-intro | The intro ends at once and the new page gets a normal page decode. |

To tune: `INTRO_MS`, `PAGE_MS` and `GLYPHS` at the top of `controller.tsx`. The timeline fractions are in `startIntro`.

## 5. Build steps

Run from the repo root. Save this file in the repo as `docs/MATRIX_REDESIGN.md` first (as a file, not by pasting its text, since it carries a patch).

```bash
git switch main
git log -1 --format='%h %s'   # f334e2e, or a later commit on main
git switch -c matrix-redesign
git status --short            # rule 7: stop if a file from section 6 shows up here

# 1. Five files have stray trailing spaces. Strip them so the patch matches
#    whether or not an editor trimmed this document.
perl -pi -e 's/[ \t]+$//' app/hobbies/page.tsx app/projects/page.tsx \
  components/footer.tsx components/mountains.tsx components/photoitem.tsx

# 2. Pull the patch out of Appendix A and apply it.
awk '/^```diff$/{on=1;next} /^```$/{on=0} on' docs/MATRIX_REDESIGN.md > /tmp/matrix-redesign.patch
git apply --check /tmp/matrix-redesign.patch
git apply /tmp/matrix-redesign.patch

# 3. Drop the theme package and build.
pnpm remove next-themes
pnpm build
```

Expected after step 3: `git status --short` lists 20 modified files, 2 deleted, and two untracked entries (`components/matrix/` and this file). The build compiles with no type errors and prerenders 14 static pages.

Use pnpm; the repo's lockfile is `pnpm-lock.yaml`. If pnpm is not installed, stop and ask rather than switching to npm.

If `git apply --check` fails, `main` has moved or the patch was altered in transit. Run `git apply --reject /tmp/matrix-redesign.patch`, then finish each `.rej` hunk by hand and delete the `.rej` files. If most hunks reject, stop and tell Puneet rather than guessing.

Then run section 7 and report: the build result, each check row as pass or fail, and anything you changed beyond the patch. Do not commit until Puneet says so.

## 6. What changes, file by file

| File | Change |
|---|---|
| `app/global.css` | Theme tokens replaced with the matrix palette; the `.dark` overrides and the pinned emerald/amber values are gone. Body is mono 15px/1.7. Selection colour. Live cards lose the rise-in animation and gain the hover glow. The effect layer is added at the bottom. |
| `app/layout.tsx` | Geist Sans and `ThemeProvider` removed. `viewport` export (theme colour). Boot script. `<div data-mx-page>` around `{children}`. `<MatrixController />` after `<main>`. |
| `components/matrix/controller.tsx` | New. All effect logic. |
| `components/matrix/replay-intro.tsx` | New. Footer button that fires `mx:replay`. |
| `components/nav.tsx` | Now a client component: `aria-current` on the active link, new colours. Theme toggle removed. |
| `components/footer.tsx` | Colours, 13px, the "replay intro" item. |
| `components/theme-provider.tsx`, `components/theme-toggle.tsx` | Deleted. |
| `components/ui/button.tsx` | Square. `outline` variant is the phosphor button. |
| `components/ui/card.tsx` | Square, no shadow. |
| `app/page.tsx` | `mx-title` on the `h1`; link colours. |
| `app/projects/page.tsx` | A local `ProjectCard` renders both lists, one card per row. The two data arrays are byte-for-byte the same apart from a type annotation. |
| `app/live/page.tsx` | Class changes only, plus `data-mx-media` on the screenshot wrapper. The unused `--i` style is removed. |
| `app/resume/page.tsx` | The page image sits in a window frame (label taken from `resumeFile`) with `data-mx-media="slow"`. Buttons use the shared look. |
| `app/hobbies/page.tsx`, `app/notes/page.tsx`, `app/not-found.tsx` | Heading and colour classes. |
| `components/photoitem.tsx`, `components/mountains.tsx`, `components/videoitem.tsx` | Border and hover glow in place of the hover scale; `data-mx-media`; caption colours. Click and lightbox behaviour unchanged. |
| `components/noteitem.tsx` | Thumbnail frame, `data-mx-media`, text colours, default button in the lightbox. |
| `components/bouncing-ps.tsx` | Palette is the greens. |
| `package.json`, `pnpm-lock.yaml` | `next-themes` removed by the command in section 5, not by the patch. |

Untouched: every content array and string, `lib/notes.ts`, `public/`, `scripts/`, `docs/`, and `components/ui/{badge,command,dialog,input,label,popover}.tsx`.

## 7. Checks

Run all of these against a production build (`pnpm build`, then `pnpm start -p 3001`) unless a row says otherwise. A throwaway Playwright script kept outside the repo is the quickest way to do rows 2 to 13; do not add Playwright to `package.json`. The Vercel analytics scripts return 404 locally; that is expected.

| # | Check | Passes when |
|---|---|---|
| 1 | `pnpm build` | Compiles, no type errors, 14 static pages. |
| 2 | First load of `/` in a new tab | Black, then rain, then green digits that resolve top to bottom. Finished about 2 seconds after the page starts loading. At no point is readable text shown before the rain. |
| 3 | Layout during the intro | Sample `getBoundingClientRect()` of every `main p, h1, h2, a, li` on each animation frame. Every frame matches the final frame. |
| 4 | Text integrity, all six routes | After a decode, `document.querySelector('main').innerText` equals the same page's text with JavaScript disabled. Test each route reached by a nav click and by reload. |
| 5 | State after the intro | No `data-mx-wait` on `<html>`. `main.inert` is false. No `.mx-rain` element. `CSS.highlights.size` is 0. `sessionStorage['mx-intro']` is `'1'`. |
| 6 | Reload in the same tab | No rain. Page content decodes in about half a second. Nav and footer do not change. |
| 7 | Nav clicks | New page decodes; the inverse block moves to the clicked item; the new page's readable text never shows before its digits. Three fast clicks in a row still end with correct text. |
| 8 | Skip | A click, key press or scroll during the intro ends it within a frame, with real text, and links work at once. |
| 9 | Replay | "replay intro" in the footer plays the intro again from any page, including while a page decode is running. Text is intact after. |
| 10 | Media | On `/live`, `/resume`, `/hobbies`, `/notes` each image and video stays covered until it is in view, then wipes in once behind the scan line. At 390px wide, scroll `/notes` to the bottom fast: all 14 thumbnails load and reveal. |
| 11 | Reduced motion (emulate it) | No rain, no digits, no covers, cursor does not blink. Everything is visible at first paint. |
| 12 | JavaScript disabled | All text and media visible in the matrix theme. |
| 13 | Slow load (delay the JS chunks about a second) | Black screen with a blinking cursor, then the intro. Never readable text followed by digits. |
| 14 | Lightboxes | Photo lightbox opens and closes. Video dialog closes on Esc. Mountain tile enlarges and closes. Note preview opens and closes on Esc. |
| 15 | Dev mode (`pnpm dev -p 3001`) | No hydration warnings in the console. The intro plays exactly once per first load. |
| 16 | 390px wide, every route | No horizontal scroll. Nav wraps to two rows. Nav links and buttons are at least 44px tall. |
| 17 | Real browsers, by Puneet on the Vercel preview | iPhone Safari, desktop Safari and Firefox: the intro plays, text ends correct, images reveal. If the digits are not dim green in one of them, that is the highlight fallback and is acceptable; anything broken is not. |

Rows 1 to 16 passed in the sandbox in headless Chromium at 1280x800 and 390x844, on a build made by following section 5 from a fresh checkout. The only console errors were the Vercel analytics requests failing locally. Row 17 has not been run anywhere.

## 8. Not tested

- Safari (macOS or iOS) and Firefox. The patch uses the Custom Highlight API (Chrome 105, Safari 17.2, Firefox 140), `inert`, `checkVisibility` (guarded) and CSS alt text on generated content (declared with a fallback). All are feature-detected or degrade, but none has been seen running outside Chromium.
- A real phone. Timing and smoothness on a slow device are unknown.
- Lighthouse. On a first visit the black hold and rain delay the first readable paint by design, so first-visit LCP will read later than today.
- The Vercel preview build itself.

## 9. Out of scope

- Any content edit, including the caption typo in rule 1.
- The open items in `docs/HANDOFF.md` (shared lightbox, home-page next step, footer email and LinkedIn links).
- The README, which is still the template's.

## Appendix A: the patch

Against `main` at `f334e2e`, after step 1 of section 5. 22 files, 1067 insertions, 340 deletions.

```diff
diff --git a/app/global.css b/app/global.css
index 45d24b8..a591d5f 100644
--- a/app/global.css
+++ b/app/global.css
@@ -1,59 +1,55 @@
 @import 'tailwindcss';
 
-/* dark: classes follow a .dark class on <html>. next-themes sets it before the
-   page paints, from the visitor's choice or, by default, their OS setting. */
+/* The site has one theme now and nothing sets .dark. The variant stays so a
+   stray dark: class does nothing instead of following the visitor's OS. */
 @custom-variant dark (&:where(.dark, .dark *));
 
-/* Colours for the shadcn/ui classes (bg-background, text-muted-foreground, …).
-   @theme holds the light values and .dark below swaps in the dark ones. */
+/* One theme. Colours for the shadcn/ui classes (bg-background, bg-card,
+   text-muted-foreground, ...) plus the matrix-only names (text-phosphor,
+   border-line-strong, ...). */
 @theme {
-  --color-background: #ffffff;
-  --color-foreground: #171717;
-  --color-card: #ffffff;
-  --color-card-foreground: #171717;
-  --color-primary: #4c97f8;
-  --color-primary-foreground: #ffffff;
-  --color-secondary: #0fa295;
-  --color-secondary-foreground: #ffffff;
-  --color-muted-foreground: #525252;
-  --color-accent: #f5f5f5;
-  --color-accent-foreground: #171717;
-  --color-border: #e5e5e5;
-  --color-input: #d4d4d4;
-  --color-ring: #737373;
-
-  /* Tailwind 4 moved its palette to OKLCH, which shifts these a little. Pinned
-     to the values the /live status pills were designed with. */
-  --color-emerald-400: #34d399;
-  --color-emerald-500: #10b981;
-  --color-emerald-600: #059669;
-  --color-amber-400: #fbbf24;
-  --color-amber-500: #f59e0b;
-  --color-amber-600: #d97706;
-}
-
-.dark {
-  color-scheme: dark;
-  --color-background: #111111;
-  --color-foreground: #fefefe;
-  --color-card: #1c1c1c;
-  --color-card-foreground: #e0e0e0;
-  --color-muted-foreground: #a3a3a3;
-  --color-accent: #1c1c1c;
-  --color-accent-foreground: #fefefe;
-  --color-border: #444444;
-  --color-input: #444444;
-  --color-ring: #a3a3a3;
+  --color-background: #030806;
+  --color-foreground: #c6f4d2;
+  --color-card: #07130c;
+  --color-card-foreground: #c6f4d2;
+  --color-primary: #00ff41;
+  --color-primary-foreground: #021207;
+  --color-secondary: #07130c;
+  --color-secondary-foreground: #7dbf93;
+  --color-muted-foreground: #7dbf93;
+  --color-accent: #00ff41;
+  --color-accent-foreground: #021207;
+  --color-border: #143522;
+  --color-input: #1e5a36;
+  --color-ring: #00ff41;
+
+  --color-phosphor: #00ff41;
+  --color-phosphor-dim: #17a046;
+  --color-phosphor-hot: #eafff0;
+  --color-line-strong: #1e5a36;
+  --color-ink: #021207;
+  --color-warn: #ffb224;
+
+  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo,
+    Consolas, monospace;
 }
 
 /* In the base layer so utilities such as border-neutral-800 still win. */
 @layer base {
   html {
-    color-scheme: light;
+    color-scheme: dark;
+    /* Faint scan lines over the whole viewport. */
+    background-image: repeating-linear-gradient(
+      to bottom,
+      rgb(0 255 65 / 0.03) 0 1px,
+      transparent 1px 4px
+    );
   }
 
   body {
-    font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
+    font-family: var(--font-mono);
+    font-size: 15px;
+    line-height: 1.7;
   }
 
   *,
@@ -64,8 +60,8 @@
 }
 
 ::selection {
-  background-color: #47a3f3;
-  color: #fefefe;
+  background-color: var(--color-phosphor);
+  color: var(--color-ink);
 }
 
 :root {
@@ -206,25 +202,9 @@ table {
   text-wrap: balance;
 }
 
-/* Live sites: each card rises in on load, and hovering pans its screenshot
-   from the top of the page to the bottom. Return trip is quicker than the
-   trip down, so leaving the card doesn't make you wait. */
-@keyframes site-rise {
-  from {
-    opacity: 0;
-    transform: translateY(16px);
-  }
-  to {
-    opacity: 1;
-    transform: none;
-  }
-}
-
-.site-card {
-  animation: site-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
-  animation-delay: calc(var(--i, 0) * 90ms);
-}
-
+/* Live sites: hovering a card pans its screenshot from the top of the page to
+   the bottom. Return trip is quicker than the trip down, so leaving the card
+   doesn't make you wait. */
 .site-shot img {
   object-position: 50% 0%;
   transition: object-position 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
@@ -238,19 +218,233 @@ table {
   transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
 }
 
+.site-card:hover .site-frame,
 .site-card:has(a:focus-visible) .site-frame {
-  outline: 2px solid currentColor;
+  border-color: var(--color-phosphor);
+  box-shadow: 0 0 28px rgb(0 255 65 / 0.2);
+}
+
+.site-card:has(a:focus-visible) .site-frame {
+  outline: 2px solid var(--color-phosphor);
   outline-offset: 4px;
 }
 
 @media (prefers-reduced-motion: reduce) {
-  .site-card {
-    animation: none;
-  }
-
   .site-shot img,
   .site-card:hover .site-shot img {
     object-position: 50% 0%;
     transition: none;
   }
 }
+
+/* ---------------------------------------------------------------------------
+   Matrix effect layer. components/matrix/controller.tsx drives all of it.
+   --------------------------------------------------------------------------- */
+
+/* Holds set by the inline boot script in app/layout.tsx before the first
+   paint, and lifted by the controller (or by the script's own 4s failsafe).
+   "intro": first load of a visit, black screen until the rain takes over.
+   "page": later loads, page content hidden until the quick decode starts. */
+html[data-mx-wait='intro']::before {
+  content: '';
+  position: fixed;
+  inset: 0;
+  z-index: 9998;
+  background: var(--color-background);
+}
+
+/* A cursor in the corner, so a slow connection shows a terminal waiting and
+   not a dead screen. */
+html[data-mx-wait='intro']::after {
+  content: '';
+  position: fixed;
+  top: 24px;
+  left: 24px;
+  z-index: 9998;
+  width: 9px;
+  height: 18px;
+  background: var(--color-phosphor);
+  animation: mx-blink 1.1s steps(1, end) infinite;
+}
+
+html[data-mx-wait='page'] [data-mx-page] {
+  visibility: hidden;
+}
+
+/* The rain. Opaque so the page underneath can be scrambled unseen, then it
+   fades and the digits left behind resolve into the real text. */
+.mx-rain {
+  position: fixed;
+  inset: 0;
+  z-index: 9999;
+  background: var(--color-background);
+  pointer-events: none;
+  transition: opacity var(--mx-fade, 456ms) ease-out;
+}
+
+.mx-rain[data-replay] {
+  animation: mx-rain-in 0.15s ease-out backwards;
+}
+
+.mx-rain[data-fading] {
+  opacity: 0;
+}
+
+.mx-rain canvas {
+  display: block;
+  width: 100%;
+  height: 100%;
+}
+
+@keyframes mx-rain-in {
+  from {
+    opacity: 0;
+  }
+}
+
+/* Decode colours. The controller swaps characters inside the real text nodes
+   and marks the unresolved run and the leading character with the CSS Custom
+   Highlight API, so no markup is added. Browsers without it show the digits
+   in the text's own colour. */
+::highlight(mx-rest) {
+  color: var(--color-phosphor-dim);
+}
+
+::highlight(mx-head) {
+  color: var(--color-phosphor-hot);
+  text-shadow: 0 0 8px var(--color-phosphor);
+}
+
+/* Media: a wrapper marked data-mx-media is covered until the controller adds
+   data-mx-in, then the cover is wiped away top to bottom behind a scan line.
+   The image itself is never clipped or hidden: browsers skip loading a lazy
+   image they consider invisible. The cover only exists once the controller is
+   running (data-mx-js), so nothing stays covered without JavaScript. */
+[data-mx-media] {
+  position: relative;
+  overflow: hidden;
+}
+
+[data-mx-media]::before,
+[data-mx-media]::after {
+  content: '';
+  position: absolute;
+  display: none;
+  pointer-events: none;
+}
+
+html[data-mx-js] [data-mx-media]::before,
+html[data-mx-js] [data-mx-media]::after {
+  display: block;
+}
+
+[data-mx-media]::before {
+  inset: 0;
+  z-index: 1;
+  background: var(--color-card);
+}
+
+[data-mx-media]::after {
+  inset: 0 0 auto;
+  z-index: 2;
+  height: 2px;
+  background: var(--color-phosphor);
+  box-shadow: 0 0 12px 2px rgb(0 255 65 / 0.8);
+  opacity: 0;
+}
+
+[data-mx-media][data-mx-in]::before {
+  animation: mx-uncover var(--mx-scan, 0.9s) cubic-bezier(0.3, 0.6, 0.3, 1)
+    forwards;
+}
+
+[data-mx-media][data-mx-in]::after {
+  animation: mx-scan var(--mx-scan, 0.9s) cubic-bezier(0.3, 0.6, 0.3, 1) both;
+}
+
+[data-mx-media='slow'] {
+  --mx-scan: 1.1s;
+}
+
+@keyframes mx-uncover {
+  from {
+    clip-path: inset(0 0 0 0);
+  }
+  to {
+    clip-path: inset(100% 0 0 0);
+  }
+}
+
+@keyframes mx-scan {
+  0% {
+    top: 0;
+    opacity: 0;
+  }
+  8%,
+  92% {
+    opacity: 1;
+  }
+  100% {
+    top: 100%;
+    opacity: 0;
+  }
+}
+
+/* Page titles get a prompt and a block cursor, section headings a "##".
+   Generated content, so it is never part of the text that gets decoded; the
+   empty alt text keeps screen readers from announcing it. */
+.mx-title {
+  color: var(--color-phosphor);
+  text-shadow: 0 0 14px rgb(0 255 65 / 0.45);
+}
+
+.mx-title::before {
+  content: '> ';
+  content: '> ' / '';
+  color: var(--color-phosphor-dim);
+  text-shadow: none;
+}
+
+.mx-title::after {
+  content: '';
+  display: inline-block;
+  width: 0.6em;
+  height: 1.05em;
+  margin-left: 8px;
+  vertical-align: text-bottom;
+  background: var(--color-phosphor);
+  box-shadow: 0 0 10px rgb(0 255 65 / 0.7);
+  animation: mx-blink 1.1s steps(1, end) infinite;
+}
+
+.mx-section {
+  color: var(--color-phosphor);
+}
+
+.mx-section::before {
+  content: '## ';
+  content: '## ' / '';
+  color: var(--color-phosphor-dim);
+}
+
+@keyframes mx-blink {
+  0%,
+  49% {
+    opacity: 1;
+  }
+  50%,
+  100% {
+    opacity: 0;
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  html[data-mx-js] [data-mx-media]::before,
+  html[data-mx-js] [data-mx-media]::after {
+    display: none;
+  }
+
+  .mx-title::after {
+    animation: none;
+  }
+}
diff --git a/app/hobbies/page.tsx b/app/hobbies/page.tsx
index 30b9138..3f7979d 100644
--- a/app/hobbies/page.tsx
+++ b/app/hobbies/page.tsx
@@ -24,11 +24,11 @@ export const metadata = {
 export default function Hobbies() {
   return (
     <section>
-      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Hobbies</h1>
+      <h1 className="mx-title font-semibold text-2xl mb-8">My Hobbies</h1>
 
       {/* Tennis Section */}
       <section className="mb-10">
-        <h2 className="font-semibold text-xl mb-4 tracking-tighter">Tennis</h2>
+        <h2 className="mx-section font-semibold text-xl mb-4">Tennis</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <VideoItem
             src="/videos/tennis1.mp4"
@@ -43,7 +43,7 @@ export default function Hobbies() {
 
       {/* Photography Section */}
       <section className="mb-10">
-        <h2 className="font-semibold text-xl mb-4 tracking-tighter">Photography</h2>
+        <h2 className="mx-section font-semibold text-xl mb-4">Photography</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {photos.map((photo, index) => (
             <PhotoItem key={index} photo={photo} />
@@ -53,7 +53,7 @@ export default function Hobbies() {
 
       {/* Hiking Section */}
       <section className="mb-10">
-        <h2 className="font-semibold text-xl mb-4 tracking-tighter">Hiking</h2>
+        <h2 className="mx-section font-semibold text-xl mb-4">Hiking</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {mountains.map((mountain, index) => (
             <MountainItem key={index} mountain={mountain} />
diff --git a/app/layout.tsx b/app/layout.tsx
index 687d121..e515978 100644
--- a/app/layout.tsx
+++ b/app/layout.tsx
@@ -1,12 +1,11 @@
 import './global.css'
-import type { Metadata } from 'next'
-import { GeistSans } from 'geist/font/sans'
+import type { Metadata, Viewport } from 'next'
 import { GeistMono } from 'geist/font/mono'
 import { Navbar } from '@/components/nav'
 import { Analytics } from '@vercel/analytics/react'
 import { SpeedInsights } from '@vercel/speed-insights/next'
 import Footer from '@/components/footer'
-import { ThemeProvider } from '@/components/theme-provider'
+import { MatrixController } from '@/components/matrix/controller'
 import { baseUrl } from './sitemap'
 
 export const metadata: Metadata = {
@@ -37,6 +36,19 @@ export const metadata: Metadata = {
   },
 }
 
+export const viewport: Viewport = {
+  themeColor: '#030806',
+  colorScheme: 'dark',
+}
+
+// Runs before the first paint, ahead of React. On the first load of a visit it
+// holds a black screen until the intro takes over; on later loads it keeps the
+// page content hidden until the quick decode starts. The matching CSS is in
+// global.css. Visitors who ask for reduced motion get neither, and both holds
+// lift after 4s whatever happens, so a script error can never leave a blank
+// page.
+const boot = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var s;try{s=sessionStorage.getItem('mx-intro')}catch(e){s='1'}d.setAttribute('data-mx-wait',s?'page':'intro');setTimeout(function(){d.removeAttribute('data-mx-wait')},4000)}catch(e){}})()`
+
 const cx = (...classes) => classes.filter(Boolean).join(' ')
 
 export default function RootLayout({
@@ -44,34 +56,29 @@ export default function RootLayout({
 }: {
   children: React.ReactNode
 }) {
-  // suppressHydrationWarning: next-themes sets the theme class and
-  // color-scheme on <html> before React hydrates, so they differ from the
-  // server HTML on purpose.
+  // suppressHydrationWarning: the boot script sets data-mx-wait on <html>
+  // before React hydrates, so it differs from the server HTML on purpose.
   return (
     <html
       lang="en"
       suppressHydrationWarning
       className={cx(
         'bg-background text-foreground', // Using the colors defined in your global.css
-        GeistSans.variable,
         GeistMono.variable
       )}
     >
       <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
-        <ThemeProvider
-          attribute="class"
-          defaultTheme="system"
-          enableSystem
-          disableTransitionOnChange
-        >
-          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
-            <Navbar />
-            {children}
-            <Footer />
-            <Analytics />
-            <SpeedInsights />
-          </main>
-        </ThemeProvider>
+        <script dangerouslySetInnerHTML={{ __html: boot }} />
+        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
+          <Navbar />
+          {/* The part that changes from page to page. Later pages decode
+              only this, not the nav or footer. */}
+          <div data-mx-page>{children}</div>
+          <Footer />
+          <Analytics />
+          <SpeedInsights />
+        </main>
+        <MatrixController />
       </body>
     </html>
   )
diff --git a/app/live/page.tsx b/app/live/page.tsx
index cdc41cf..ca131b9 100644
--- a/app/live/page.tsx
+++ b/app/live/page.tsx
@@ -74,18 +74,18 @@ const scrollDuration = (height: number) =>
 function Status({ status }: { status: Site["status"] }) {
   if (status === "preview") {
     return (
-      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
-        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
+      <span className="inline-flex items-center gap-1.5 border border-warn/35 bg-warn/10 px-2 py-px text-xs font-medium leading-5 text-warn">
+        <span className="h-1.5 w-1.5 rounded-full bg-warn" />
         Launching soon
       </span>
     );
   }
 
   return (
-    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
+    <span className="inline-flex items-center gap-1.5 border border-line-strong bg-phosphor/10 px-2 py-px text-xs font-medium leading-5 text-phosphor">
       <span className="relative flex h-1.5 w-1.5">
-        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
-        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
+        <span className="absolute inline-flex h-full w-full rounded-full bg-phosphor opacity-75 motion-safe:animate-ping" />
+        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-phosphor" />
       </span>
       Live
     </span>
@@ -94,25 +94,22 @@ function Status({ status }: { status: Site["status"] }) {
 
 function SiteCard({ site, index }: { site: Site; index: number }) {
   return (
-    <article
-      className="site-card group relative"
-      style={{ "--i": index } as CSSProperties}
-    >
-      <div className="site-frame overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-xs transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
-        <div className="flex h-9 items-center gap-3 border-b border-neutral-200 px-3.5 dark:border-neutral-800">
+    <article className="site-card group relative">
+      <div className="site-frame overflow-hidden border border-border bg-card transition-[border-color,box-shadow] duration-300">
+        <div className="flex h-9 items-center gap-3 border-b border-border px-3.5">
           <span className="flex shrink-0 gap-1.5" aria-hidden>
-            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
-            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
-            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
+            <span className="h-2.5 w-2.5 bg-line-strong" />
+            <span className="h-2.5 w-2.5 bg-line-strong" />
+            <span className="h-2.5 w-2.5 bg-line-strong" />
           </span>
-          <span className="flex-1 truncate text-center font-mono text-xs text-neutral-500">
+          <span className="flex-1 truncate text-center font-mono text-xs text-muted-foreground">
             {site.host}
           </span>
           {/* Balances the dots so the address stays centred. */}
           <span className="w-[42px] shrink-0" aria-hidden />
         </div>
 
-        <div className="site-shot aspect-[16/10] overflow-hidden bg-white">
+        <div data-mx-media className="site-shot aspect-[16/10] overflow-hidden bg-background">
           <img
             src={site.screenshot.src}
             alt={`The ${site.name} home page`}
@@ -136,17 +133,17 @@ function SiteCard({ site, index }: { site: Site; index: number }) {
           alt=""
           width={44}
           height={44}
-          className="h-11 w-11 shrink-0 rounded-xl ring-1 ring-black/10 dark:ring-white/10"
+          className="h-11 w-11 shrink-0 border border-border"
         />
 
         <div className="min-w-0 flex-1">
           <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
-            <h2 className="text-lg font-semibold tracking-tight">
+            <h2 className="text-lg font-semibold">
               <a
                 href={site.url}
                 target="_blank"
                 rel="noopener noreferrer"
-                className="outline-hidden"
+                className="text-phosphor outline-hidden group-hover:[text-shadow:0_0_12px_rgb(0_255_65/0.6)]"
               >
                 {site.name}
                 {site.status === "preview" && (
@@ -158,16 +155,16 @@ function SiteCard({ site, index }: { site: Site; index: number }) {
             </h2>
             <Status status={site.status} />
           </div>
-          <p className="mt-0.5 text-sm text-neutral-500">{site.category}</p>
+          <p className="mt-0.5 text-sm text-muted-foreground">{site.category}</p>
         </div>
 
         <ArrowUpRight
           aria-hidden
-          className="mt-1 h-5 w-5 shrink-0 text-neutral-400 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
+          className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-phosphor"
         />
       </div>
 
-      <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
+      <p className="mt-4 text-sm leading-[1.65]">
         {site.description}
       </p>
 
@@ -175,7 +172,7 @@ function SiteCard({ site, index }: { site: Site; index: number }) {
         {site.tags.map((tag) => (
           <li
             key={tag}
-            className="rounded-full border border-neutral-200 px-2.5 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
+            className="border border-line-strong px-2.5 py-px font-mono text-[11px] leading-[18px] text-muted-foreground"
           >
             {tag}
           </li>
@@ -188,9 +185,9 @@ function SiteCard({ site, index }: { site: Site; index: number }) {
 export default function Live() {
   return (
     <section>
-      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Live Sites</h1>
+      <h1 className="mx-title font-semibold text-2xl mb-8">Live Sites</h1>
 
-      <p className="mb-12 text-neutral-600 dark:text-neutral-400">
+      <p className="mb-12 text-muted-foreground">
         {`Sites I've built that are running in production, plus one about to launch.`}
       </p>
 
diff --git a/app/not-found.tsx b/app/not-found.tsx
index 6a91613..6dd9e99 100644
--- a/app/not-found.tsx
+++ b/app/not-found.tsx
@@ -6,9 +6,9 @@ export default function NotFound() {
     <section className="relative">
       <BouncingPs />
 
-      <p className="mb-2 text-8xl font-bold tracking-tighter">404</p>
+      <p className="mb-2 text-8xl font-bold text-phosphor">404</p>
 
-      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
+      <h1 className="mx-title mb-8 text-2xl font-semibold">
         Nothing here.
       </h1>
 
@@ -16,7 +16,7 @@ export default function NotFound() {
 
       <Link
         href="/"
-        className="inline-flex items-center gap-1 underline decoration-neutral-400 underline-offset-4 transition-colors hover:decoration-neutral-800 dark:decoration-neutral-600 dark:hover:decoration-neutral-200"
+        className="inline-flex items-center gap-1 text-phosphor underline decoration-phosphor-dim underline-offset-4 transition-colors hover:decoration-phosphor"
       >
         Take me home →
       </Link>
diff --git a/app/notes/page.tsx b/app/notes/page.tsx
index ab94c37..0b1f829 100644
--- a/app/notes/page.tsx
+++ b/app/notes/page.tsx
@@ -11,21 +11,21 @@ export default function Notes() {
 
   return (
     <section>
-      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Notes</h1>
+      <h1 className="mx-title font-semibold text-2xl mb-8">Notes</h1>
 
-      <p className="mb-8 text-neutral-600 dark:text-neutral-400">
+      <p className="mb-8 text-muted-foreground">
         {`Handwritten notes I've made during my time teaching at Math4Me. Notes are free to use and distribute.`}
       </p>
 
       {groups.length === 0 ? (
-        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-neutral-600 dark:text-neutral-400">
+        <div className="border border-dashed border-line-strong p-8 text-center text-muted-foreground">
           No notes posted yet — check back soon.
         </div>
       ) : (
         groups.map((group) => (
           <div key={group.subject ?? 'other'}>
             {group.subject && (
-              <h2 className="font-semibold text-xl mb-8 tracking-tighter">
+              <h2 className="mx-section font-semibold text-xl mb-8">
                 {group.subject}
               </h2>
             )}
diff --git a/app/page.tsx b/app/page.tsx
index f8ad2c0..a027b9a 100644
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -1,12 +1,12 @@
 import Link from "next/link";
 
 const link =
-  "underline underline-offset-2 decoration-neutral-400 hover:decoration-neutral-900 dark:hover:decoration-neutral-100";
+  "text-phosphor underline underline-offset-[3px] decoration-phosphor-dim hover:decoration-phosphor hover:[text-shadow:0_0_10px_rgb(0_255_65/0.5)]";
 
 export default function Page() {
   return (
     <section>
-      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
+      <h1 className="mx-title mb-8 text-2xl font-semibold">
         Hi, I'm Puneet
       </h1>
       <p className="mb-4">
diff --git a/app/projects/page.tsx b/app/projects/page.tsx
index e40da32..a1b5d6d 100644
--- a/app/projects/page.tsx
+++ b/app/projects/page.tsx
@@ -1,11 +1,4 @@
-import {
-  Card,
-  CardContent,
-  CardDescription,
-  CardHeader,
-  CardTitle,
-  CardFooter,
-} from "@/components/ui/card";
+import { Card, CardTitle } from "@/components/ui/card";
 import Link from "next/link";
 import {
   GitHubLogoIcon,
@@ -19,8 +12,69 @@ export const metadata = {
   description: "Look at some of my projects.",
 };
 
+type Project = {
+  id: number;
+  title: string;
+  date?: string;
+  github?: string;
+  description: string;
+  tags: string[];
+};
+
+// One card per row: at this column width, two columns of monospace text leave
+// about 27 characters a line.
+function ProjectCard({ project }: { project: Project }) {
+  return (
+    <Card className="flex flex-col gap-4 p-6">
+      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
+        <CardTitle className="text-base leading-6 tracking-normal text-phosphor">
+          {project.title}
+        </CardTitle>
+        {project.date && (
+          <div className="flex items-center text-[13px] leading-6 text-muted-foreground">
+            <CalendarIcon className="h-3.5 w-3.5 mr-2" />
+            <span>{project.date}</span>
+          </div>
+        )}
+      </div>
+
+      <div className="flex flex-wrap gap-2 w-full">
+        {project.tags.map((tag, index) => (
+          <Badge
+            key={index}
+            variant="outline"
+            className="rounded-none border-line-strong px-2 py-px text-xs font-normal leading-5 text-muted-foreground"
+          >
+            {tag}
+          </Badge>
+        ))}
+      </div>
+
+      <p
+        dangerouslySetInnerHTML={{ __html: project.description }}
+        className="text-sm leading-[1.65]"
+      />
+
+      {project.github && (
+        <div className="flex flex-wrap gap-2 w-full">
+          <Button variant="outline" size="sm" asChild className="h-11 min-w-11 sm:h-8 sm:min-w-0">
+            <Link
+              href={project.github}
+              target="_blank"
+              rel="noopener noreferrer"
+            >
+              <GitHubLogoIcon />
+              Source Code
+            </Link>
+          </Button>
+        </div>
+      )}
+    </Card>
+  );
+}
+
 export default function Projects() {
-  const personalProjects = [
+  const personalProjects: Project[] = [
     {
       id: 2,
       title: "Math4Me Parent Portal",
@@ -50,7 +104,7 @@ export default function Projects() {
     },
   ];
 
-  const courseworkProjects = [
+  const courseworkProjects: Project[] = [
     {
       id: 1,
       title: "Database Systems",
@@ -72,101 +126,17 @@ export default function Projects() {
   return (
     <section>
       <h1 className="sr-only">Projects</h1>
-      <h2 className="font-semibold text-2xl mb-8 tracking-tighter">Personal</h2>
-      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
+      <h2 className="mx-section font-semibold text-2xl mb-8">Personal</h2>
+      <div className="flex flex-col gap-6 mb-8">
         {personalProjects.map((project) => (
-          <Card key={project.id} className="flex flex-col shadow-md">
-            <CardHeader>
-              <CardTitle>{project.title}</CardTitle>
-              <CardDescription className="flex flex-col gap-2">
-                <div className="flex items-center text-neutral-600 dark:text-neutral-400">
-                  <CalendarIcon className="h-4 w-4 mr-2" />
-                  <span>{project.date}</span>
-                </div>
-
-                <div className="flex flex-wrap gap-2 w-full">
-                  {project.tags.map((tag, index) => (
-                    <Badge
-                      key={index}
-                      variant="secondary"
-                      className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800"
-                    >
-                      {tag}
-                    </Badge>
-                  ))}
-                </div>
-              </CardDescription>
-            </CardHeader>
-            <CardContent>
-              <p
-                dangerouslySetInnerHTML={{ __html: project.description }}
-                className="text-sm text-muted-foreground"
-              />
-            </CardContent>
-            <CardFooter className="mt-auto flex flex-col gap-4">
-              <div className="flex flex-wrap gap-2 w-full">
-                {project.github && (
-                  <Button variant="outline" size="sm" asChild className="h-11 min-w-11 sm:h-8 sm:min-w-0 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200">
-                    <Link
-                      href={project.github}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                    >
-                      <GitHubLogoIcon />
-                      Source Code
-                    </Link>
-                  </Button>
-                )}
-              </div>
-            </CardFooter>
-          </Card>
+          <ProjectCard key={project.id} project={project} />
         ))}
       </div>
 
-      <h2 className="font-semibold text-2xl mb-8 tracking-tighter">
-        Coursework
-      </h2>
-      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
+      <h2 className="mx-section font-semibold text-2xl mb-8">Coursework</h2>
+      <div className="flex flex-col gap-6 mb-8">
         {courseworkProjects.map((project) => (
-          <Card key={project.id} className="flex flex-col h-full shadow-md">
-            <CardHeader>
-              <CardTitle>{project.title}</CardTitle>
-
-              <CardDescription className="flex flex-wrap gap-2 w-full">
-                {project.tags.map((tag, index) => (
-                  <Badge
-                    key={index}
-                    variant="secondary"
-                    className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800"
-                  >
-                    {tag}
-                  </Badge>
-                ))}
-              </CardDescription>
-            </CardHeader>
-            <CardContent className="grow">
-              <p
-                dangerouslySetInnerHTML={{ __html: project.description }}
-                className="text-sm text-muted-foreground"
-              />
-            </CardContent>
-            <CardFooter className="mt-auto flex flex-col gap-4">
-              <div className="flex flex-wrap gap-2 w-full">
-                {project.github && (
-                  <Button variant="outline" size="sm" asChild className="h-11 min-w-11 sm:h-8 sm:min-w-0 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200">
-                    <Link
-                      href={project.github}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                    >
-                      <GitHubLogoIcon />
-                      Source Code
-                    </Link>
-                  </Button>
-                )}
-              </div>
-            </CardFooter>
-          </Card>
+          <ProjectCard key={project.id} project={project} />
         ))}
       </div>
     </section>
diff --git a/app/resume/page.tsx b/app/resume/page.tsx
index 02fe37b..bcb69bc 100644
--- a/app/resume/page.tsx
+++ b/app/resume/page.tsx
@@ -18,13 +18,12 @@ export const metadata = {
   description: "My resume, viewable here or downloadable as a PDF.",
 };
 
-const actionButton =
-  "h-11 min-w-11 sm:h-8 sm:min-w-0 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200";
+const actionButton = "h-11 min-w-11 sm:h-8 sm:min-w-0";
 
 export default function Resume() {
   return (
     <section>
-      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Resume</h1>
+      <h1 className="mx-title font-semibold text-2xl mb-8">Resume</h1>
 
       <div className="mb-8 flex flex-wrap gap-2">
         <Button variant="outline" size="sm" asChild className={actionButton}>
@@ -45,16 +44,36 @@ export default function Resume() {
       {/* Pulled wider than the page's text column, which is too narrow to read
           a letter-size page in. The viewport-relative width stays centred. */}
       <div className="relative left-1/2 mb-8 w-[92vw] max-w-3xl -translate-x-1/2">
-        {/* A plain img, not next/image: this is one fixed static page render,
-            so the optimizer buys nothing and costs an image transform per
-            visitor. Width and height are set to reserve the space. */}
-        <img
-          src={resumePage.src}
-          alt="Puneet Grewal's resume"
-          width={resumePage.width}
-          height={resumePage.height}
-          className="h-auto w-full rounded-xl shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800"
-        />
+        <div className="overflow-hidden border border-border bg-card shadow-[0_0_40px_rgb(0_255_65/0.1)]">
+          {/* The same window bar the live-site cards use, naming the file. */}
+          <div
+            aria-hidden
+            className="flex h-9 items-center gap-3 border-b border-border px-3.5"
+          >
+            <span className="flex shrink-0 gap-1.5">
+              <span className="h-2.5 w-2.5 bg-line-strong" />
+              <span className="h-2.5 w-2.5 bg-line-strong" />
+              <span className="h-2.5 w-2.5 bg-line-strong" />
+            </span>
+            <span className="flex-1 truncate text-center text-xs text-muted-foreground">
+              {resumeFile.split("/").pop()}
+            </span>
+            <span className="w-[42px] shrink-0" />
+          </div>
+
+          {/* A plain img, not next/image: this is one fixed static page render,
+              so the optimizer buys nothing and costs an image transform per
+              visitor. Width and height are set to reserve the space. */}
+          <div data-mx-media="slow" className="bg-background">
+            <img
+              src={resumePage.src}
+              alt="Puneet Grewal's resume"
+              width={resumePage.width}
+              height={resumePage.height}
+              className="h-auto w-full"
+            />
+          </div>
+        </div>
       </div>
     </section>
   );
diff --git a/components/bouncing-ps.tsx b/components/bouncing-ps.tsx
index 60ae6f7..25112f8 100644
--- a/components/bouncing-ps.tsx
+++ b/components/bouncing-ps.tsx
@@ -9,10 +9,9 @@ import {
   type PanInfo,
 } from 'motion/react'
 
-// The syntax-highlight palette from global.css, so the 404 uses colours the
-// rest of the site already owns. The last one is the text colour, so it shows
-// on both the light and the dark background.
-const palette = ['#4c97f8', '#f47067', '#0fa295', '#e25a1c', '#6266d1', 'var(--color-foreground)']
+// The matrix greens from global.css, bright to dim, so the 404 uses colours
+// the rest of the site already owns.
+const palette = ['#00ff41', '#eafff0', '#17a046', '#7dbf93', '#1e5a36', 'var(--color-foreground)']
 
 // Pixels per second. Thrown letters ease back down to cruise; stalled ones
 // ease back up to it.
diff --git a/components/footer.tsx b/components/footer.tsx
index fd314d8..4f7d61c 100644
--- a/components/footer.tsx
+++ b/components/footer.tsx
@@ -1,3 +1,5 @@
+import { ReplayIntro } from '@/components/matrix/replay-intro'
+
 function ArrowIcon() {
   return (
     <svg
@@ -18,21 +20,23 @@ function ArrowIcon() {
 export default function Footer() {
   return (
     <footer className="mb-16">
-      <ul className="text-sm mt-8 flex flex-col space-x-0 space-y-2 text-neutral-600 md:flex-row md:space-x-4 md:space-y-0 dark:text-neutral-300">
+      <ul className="text-[13px] mt-8 flex flex-col space-x-0 space-y-2 text-muted-foreground md:flex-row md:space-x-6 md:space-y-0">
         <li>
           <a
-            className="flex min-h-11 items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100 sm:min-h-0"
+            className="flex min-h-11 items-center transition-colors hover:text-phosphor sm:min-h-0"
             rel="noopener noreferrer"
             target="_blank"
             href="https://github.com/PuneetGrewal"
           >
             <ArrowIcon />
-            <p className="ml-2 h-7 leading-6">github</p>
+            <p className="ml-2 h-7 leading-7">github</p>
           </a>
         </li>
-
+        <li>
+          <ReplayIntro />
+        </li>
       </ul>
-      <p className="mt-8 text-neutral-600 dark:text-neutral-300">
+      <p className="mt-8 text-[13px] text-muted-foreground">
         © {new Date().getFullYear()} Puneet Grewal. All rights reserved.
       </p>
     </footer>
diff --git a/components/matrix/controller.tsx b/components/matrix/controller.tsx
new file mode 100644
index 0000000..e11ad7f
--- /dev/null
+++ b/components/matrix/controller.tsx
@@ -0,0 +1,559 @@
+'use client'
+
+import { useEffect, useLayoutEffect } from 'react'
+import { usePathname } from 'next/navigation'
+
+// Runs the matrix effects for the whole site from one place, so no page has to
+// know about them:
+//
+//   first load of a visit   rain, then every piece of text decodes
+//   every later page        a quick decode of the page content
+//   images and video        a scan line wipes each one in as it scrolls into view
+//
+// The text effect swaps characters inside the page's real text nodes and puts
+// them back exactly as they were. It never adds, removes or moves an element,
+// so the server-rendered HTML stays the single source of the content.
+
+/** Length of the whole first-load sequence. */
+const INTRO_MS = 1900
+/** Length of the decode on every later page. */
+const PAGE_MS = 500
+const GLYPHS = '0123456789'
+const SESSION_KEY = 'mx-intro'
+/** Text inside these is left alone. */
+const SKIP =
+  'script,style,noscript,svg,[aria-hidden="true"],[data-mx-skip],.sr-only'
+/** Only letters and digits are swapped. Spaces and punctuation stay, which
+    keeps every line breaking where it does in the real text. */
+const WORD = /[0-9A-Za-z\u00C0-\u024F]/
+
+type Target = {
+  node: Text
+  orig: string
+  /** What we last wrote. If the node holds anything else, someone else has
+      changed it and we let go of it. */
+  last: string
+  start: number
+  dur: number
+  rest: Range | null
+  head: Range | null
+  done: boolean
+}
+
+const useIsoLayoutEffect =
+  typeof window === 'undefined' ? useEffect : useLayoutEffect
+
+function reducedMotion() {
+  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
+}
+
+function scramble(text: string, from: number) {
+  let out = ''
+
+  for (let i = from; i < text.length; i++) {
+    const character = text[i]
+    // A digit straight after a hyphen can't wrap where a letter can
+    // ("co-op" may break after the hyphen, "12-34" may not), so that one
+    // character keeps its real value.
+    out +=
+      WORD.test(character) && text[i - 1] !== '-'
+        ? GLYPHS[(Math.random() * GLYPHS.length) | 0]
+        : character
+  }
+
+  return out
+}
+
+function collect(root: Element) {
+  const nodes: Text[] = []
+  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
+
+  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
+    const text = node as Text
+    const parent = text.parentElement
+
+    if (!parent || !WORD.test(text.data) || parent.closest(SKIP)) continue
+
+    // Hover captions and anything else that isn't showing right now.
+    if (
+      typeof parent.checkVisibility === 'function' &&
+      !parent.checkVisibility({
+        checkOpacity: true,
+        checkVisibilityCSS: true,
+      })
+    ) {
+      continue
+    }
+
+    nodes.push(text)
+  }
+
+  return nodes
+}
+
+/** Where each line of a text node starts and how wide it is. */
+function lineSignature(node: Text) {
+  const range = document.createRange()
+  range.selectNodeContents(node)
+
+  let signature = ''
+  for (const rect of Array.from(range.getClientRects())) {
+    signature += `${Math.round(rect.top)}:${Math.round(rect.width)}|`
+  }
+
+  return signature
+}
+
+/** Scrambles every text node under root and returns the ones to animate. */
+function prepare(root: Element): Target[] {
+  const nodes = collect(root)
+  const before = nodes.map(lineSignature)
+
+  const targets = nodes.map((node) => {
+    const orig = node.data
+    const last = scramble(orig, 0)
+    node.data = last
+
+    return {
+      node,
+      orig,
+      last,
+      start: 0,
+      dur: 0,
+      rest: null,
+      head: null,
+      done: false,
+    } as Target
+  })
+
+  // Monospace digits take the same room as the letters they stand in for, so
+  // nothing should have moved. If a node's lines did move (a fallback font, an
+  // unusual break), it is put back and simply doesn't animate.
+  targets.forEach((target, index) => {
+    if (lineSignature(target.node) !== before[index]) {
+      target.node.data = target.orig
+      target.done = true
+    }
+  })
+
+  return targets.filter((target) => !target.done)
+}
+
+/** Top of the page first: start times follow each node's position. */
+function schedule(targets: Target[], total: number, delay: number) {
+  if (!targets.length) return
+
+  const viewport = window.innerHeight
+  const tops = targets.map((target) => {
+    const range = document.createRange()
+    range.selectNodeContents(target.node)
+    return Math.max(0, Math.min(range.getBoundingClientRect().top, viewport))
+  })
+
+  const first = Math.min(...tops)
+  const span = Math.max(1, Math.max(...tops) - first)
+  const spread = total * 0.5
+
+  targets.forEach((target, index) => {
+    target.start = delay + spread * ((tops[index] - first) / span)
+    target.dur = Math.max(
+      140,
+      Math.min(total - spread, target.orig.length * 5),
+    )
+  })
+}
+
+/** Animates the targets back to their real text. Returns a cancel function
+    that restores everything at once. */
+function run(targets: Target[], onDone: () => void) {
+  const view = window as any
+  const canHighlight =
+    typeof view.Highlight === 'function' && view.CSS && view.CSS.highlights
+  const rest = canHighlight ? new view.Highlight() : null
+  const head = canHighlight ? new view.Highlight() : null
+
+  if (canHighlight) {
+    view.CSS.highlights.set('mx-rest', rest)
+    view.CSS.highlights.set('mx-head', head)
+  }
+
+  let frameId = 0
+  let startedAt = 0
+  let tick = 0
+  let stopped = false
+
+  // Replacing a text node's data collapses any range inside it, so the ranges
+  // are set again after every write.
+  const paint = (target: Target, resolved: number, started: boolean) => {
+    if (!canHighlight) return
+
+    const length = target.node.data.length
+
+    if (!target.rest) {
+      target.rest = document.createRange()
+      rest.add(target.rest)
+    }
+    target.rest.setStart(target.node, Math.min(length, started ? resolved + 1 : 0))
+    target.rest.setEnd(target.node, length)
+
+    if (!started) return
+
+    if (!target.head) {
+      target.head = document.createRange()
+      head.add(target.head)
+    }
+    target.head.setStart(target.node, Math.min(length, resolved))
+    target.head.setEnd(target.node, Math.min(length, resolved + 1))
+  }
+
+  const settle = (target: Target, restore: boolean) => {
+    if (restore && target.node.isConnected && target.node.data === target.last) {
+      target.node.data = target.orig
+    }
+    if (target.rest) rest.delete(target.rest)
+    if (target.head) head.delete(target.head)
+    target.rest = target.head = null
+    target.done = true
+  }
+
+  const end = () => {
+    stopped = true
+    cancelAnimationFrame(frameId)
+    targets.forEach((target) => !target.done && settle(target, true))
+
+    if (canHighlight) {
+      if (view.CSS.highlights.get('mx-rest') === rest) {
+        view.CSS.highlights.delete('mx-rest')
+      }
+      if (view.CSS.highlights.get('mx-head') === head) {
+        view.CSS.highlights.delete('mx-head')
+      }
+    }
+  }
+
+  const frame = (now: number) => {
+    if (stopped) return
+    if (!startedAt) startedAt = now
+
+    const elapsed = now - startedAt
+    let live = 0
+    tick++
+
+    for (const target of targets) {
+      if (target.done) continue
+
+      // Removed from the page, or rewritten by something else: let it go.
+      if (!target.node.isConnected || target.node.data !== target.last) {
+        settle(target, false)
+        continue
+      }
+
+      const progress = (elapsed - target.start) / target.dur
+
+      if (progress >= 1) {
+        settle(target, true)
+        continue
+      }
+
+      live++
+      // Every other frame: about 30 changes a second reads as a flicker,
+      // 60 reads as noise.
+      if (tick % 2) continue
+
+      const resolved =
+        progress <= 0 ? 0 : Math.floor(progress * target.orig.length)
+      target.last =
+        target.orig.slice(0, resolved) + scramble(target.orig, resolved)
+      target.node.data = target.last
+      paint(target, resolved, progress > 0)
+    }
+
+    if (live) {
+      frameId = requestAnimationFrame(frame)
+    } else {
+      end()
+      onDone()
+    }
+  }
+
+  targets.forEach((target) => paint(target, 0, false))
+  frameId = requestAnimationFrame(frame)
+
+  return () => {
+    if (!stopped) end()
+  }
+}
+
+/** Falling digits on a canvas. Returns a stop function. */
+function rain(canvas: HTMLCanvasElement) {
+  const context = canvas.getContext('2d')
+  if (!context) return () => {}
+
+  const ratio = Math.min(window.devicePixelRatio || 1, 2)
+  const width = window.innerWidth
+  const height = window.innerHeight
+  const size = width < 640 ? 14 : 16
+  const columns = Math.ceil(width / size)
+  const rows = Math.ceil(height / size)
+  const styles = getComputedStyle(document.documentElement)
+  const background = styles.getPropertyValue('--color-background').trim()
+  const phosphor = styles.getPropertyValue('--color-phosphor').trim()
+  const hot = styles.getPropertyValue('--color-phosphor-hot').trim()
+
+  canvas.width = width * ratio
+  canvas.height = height * ratio
+  context.scale(ratio, ratio)
+  context.font = `500 ${size}px ${getComputedStyle(document.body).fontFamily}`
+  context.textBaseline = 'top'
+  context.fillStyle = background
+  context.fillRect(0, 0, width, height)
+
+  // Each column is one falling drop: its row, and the digit at its head.
+  const drops = Array.from({ length: columns }, () => ({
+    row: Math.floor(Math.random() * rows * 2) - rows,
+    glyph: '0',
+  }))
+
+  const step = () => {
+    // A translucent wash each step is what leaves the fading trails.
+    context.globalAlpha = 0.14
+    context.fillStyle = background
+    context.fillRect(0, 0, width, height)
+    context.globalAlpha = 1
+
+    drops.forEach((drop, column) => {
+      const x = column * size
+
+      // The previous head becomes part of the trail.
+      context.fillStyle = phosphor
+      context.fillText(drop.glyph, x, drop.row * size)
+
+      drop.row++
+      drop.glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0]
+      context.fillStyle = hot
+      context.fillText(drop.glyph, x, drop.row * size)
+
+      if (drop.row > rows && Math.random() > 0.9) drop.row = -1
+    })
+  }
+
+  // Already raining on the first frame the visitor sees.
+  for (let i = 0; i < 28; i++) step()
+
+  let frameId = 0
+  let tick = 0
+  const frame = () => {
+    if (tick++ % 2 === 0) step()
+    frameId = requestAnimationFrame(frame)
+  }
+  frameId = requestAnimationFrame(frame)
+
+  return () => cancelAnimationFrame(frameId)
+}
+
+let stopMedia = () => {}
+
+/** Reveals each [data-mx-media] wrapper once it is on screen and its image has
+    loaded. Calling it again replaces the previous observer. */
+function observeMedia() {
+  stopMedia()
+  stopMedia = () => {}
+
+  const pending = Array.from(
+    document.querySelectorAll<HTMLElement>('[data-mx-media]:not([data-mx-in])'),
+  )
+  const reveal = (element: HTMLElement) => element.setAttribute('data-mx-in', '')
+
+  if (!pending.length) return
+  if (!('IntersectionObserver' in window)) {
+    pending.forEach(reveal)
+    return
+  }
+
+  const observer = new IntersectionObserver(
+    (entries) => {
+      for (const entry of entries) {
+        if (!entry.isIntersecting) continue
+
+        const element = entry.target as HTMLElement
+        const image = element.querySelector('img')
+        observer.unobserve(element)
+
+        if (!image || image.complete) {
+          reveal(element)
+        } else {
+          const show = () => reveal(element)
+          image.addEventListener('load', show, { once: true })
+          image.addEventListener('error', show, { once: true })
+          // Never leave it hidden behind a slow image.
+          window.setTimeout(show, 3000)
+        }
+      }
+    },
+    { threshold: 0.15 },
+  )
+
+  pending.forEach((element) => observer.observe(element))
+  stopMedia = () => observer.disconnect()
+}
+
+// Only one decode touches the page at a time: a second one would read the
+// first one's digits as the real text.
+let cancelPage = () => {}
+
+function decodePage() {
+  cancelPage()
+
+  const root = document.querySelector<HTMLElement>('[data-mx-page]')
+  if (!root) return
+
+  const targets = prepare(root)
+  schedule(targets, PAGE_MS, 0)
+  root.inert = true
+
+  const release = () => {
+    root.inert = false
+    cancelPage = () => {}
+  }
+  const cancel = run(targets, release)
+
+  cancelPage = () => {
+    cancel()
+    release()
+  }
+}
+
+// The intro runs once and is not tied to a component's effects, so a dev-mode
+// double mount can't start it twice or cut it short.
+let intro: { path: string; finish: () => void } | null = null
+
+function startIntro(path: string, replay = false) {
+  if (intro) return
+  cancelPage()
+
+  const html = document.documentElement
+  const main = document.querySelector('main')
+  if (!main) {
+    html.removeAttribute('data-mx-wait')
+    return
+  }
+
+  try {
+    sessionStorage.setItem(SESSION_KEY, '1')
+  } catch {}
+
+  const overlay = document.createElement('div')
+  const canvas = document.createElement('canvas')
+  overlay.className = 'mx-rain'
+  overlay.setAttribute('aria-hidden', 'true')
+  overlay.style.setProperty('--mx-fade', `${Math.round(INTRO_MS * 0.24)}ms`)
+  if (replay) overlay.setAttribute('data-replay', '')
+  overlay.appendChild(canvas)
+  document.body.appendChild(overlay)
+
+  // The overlay is opaque from its first frame, so the boot script's black
+  // hold underneath can go.
+  html.removeAttribute('data-mx-wait')
+  main.inert = true
+
+  const startedAt = performance.now()
+  const timers: number[] = []
+  const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const
+  let stopRain = rain(canvas)
+  let cancelDecode = () => {}
+  let prepared = false
+  let finished = false
+
+  const removeOverlay = () => {
+    stopRain()
+    stopRain = () => {}
+    overlay.remove()
+  }
+
+  const finish = () => {
+    if (finished) return
+    finished = true
+    timers.forEach((timer) => window.clearTimeout(timer))
+    skipEvents.forEach((name) => window.removeEventListener(name, finish, true))
+    cancelDecode()
+    removeOverlay()
+    main.inert = false
+    observeMedia()
+    intro = null
+  }
+
+  // Scramble under the rain, once the font is in so the line check is fair.
+  const decode = () => {
+    if (prepared || finished) return
+    prepared = true
+
+    const elapsed = performance.now() - startedAt
+    const targets = prepare(main)
+    schedule(targets, INTRO_MS * 0.55, Math.max(0, INTRO_MS * 0.45 - elapsed))
+    cancelDecode = run(targets, finish)
+  }
+
+  const after = (fraction: number, callback: () => void) =>
+    timers.push(window.setTimeout(callback, INTRO_MS * fraction))
+
+  if (replay) {
+    // The page is in view: wait for the overlay to cover it first.
+    after(0.1, decode)
+  } else if (document.fonts && document.fonts.status !== 'loaded') {
+    document.fonts.ready.then(decode)
+    after(0.35, decode)
+  } else {
+    decode()
+  }
+
+  after(0.4, () => overlay.setAttribute('data-fading', ''))
+  after(0.45, observeMedia)
+  after(0.7, removeOverlay)
+  after(1.2, finish)
+
+  skipEvents.forEach((name) =>
+    window.addEventListener(name, finish, { capture: true, passive: true }),
+  )
+
+  intro = { path, finish }
+}
+
+export function MatrixController() {
+  const pathname = usePathname()
+
+  useIsoLayoutEffect(() => {
+    const html = document.documentElement
+    html.setAttribute('data-mx-js', '')
+
+    if (intro) {
+      // Same path: a dev-mode re-run of this effect. New path: the visitor
+      // moved on mid-intro, so end it and treat this as any other page.
+      if (intro.path === pathname) return
+      intro.finish()
+    }
+
+    if (reducedMotion()) {
+      html.removeAttribute('data-mx-wait')
+      return
+    }
+
+    if (html.getAttribute('data-mx-wait') === 'intro') {
+      startIntro(pathname)
+      return
+    }
+
+    html.removeAttribute('data-mx-wait')
+    observeMedia()
+    decodePage()
+
+    return () => cancelPage()
+  }, [pathname])
+
+  useEffect(() => {
+    const replay = () => startIntro(pathname, true)
+    window.addEventListener('mx:replay', replay)
+    return () => window.removeEventListener('mx:replay', replay)
+  }, [pathname])
+
+  return null
+}
diff --git a/components/matrix/replay-intro.tsx b/components/matrix/replay-intro.tsx
new file mode 100644
index 0000000..f29d1db
--- /dev/null
+++ b/components/matrix/replay-intro.tsx
@@ -0,0 +1,17 @@
+'use client'
+
+import { RotateCcw } from 'lucide-react'
+
+/** The intro only plays on the first load of a visit; this plays it again. */
+export function ReplayIntro() {
+  return (
+    <button
+      type="button"
+      onClick={() => window.dispatchEvent(new Event('mx:replay'))}
+      className="flex min-h-11 cursor-pointer items-center transition-colors hover:text-phosphor sm:min-h-0"
+    >
+      <RotateCcw aria-hidden className="h-3.5 w-3.5" />
+      <span className="ml-2 h-7 leading-7">replay intro</span>
+    </button>
+  )
+}
diff --git a/components/mountains.tsx b/components/mountains.tsx
index b18a2cf..fc12397 100644
--- a/components/mountains.tsx
+++ b/components/mountains.tsx
@@ -7,7 +7,7 @@ export function MountainItem({ mountain }) {
   const [isEnlarged, setIsEnlarged] = useState(false);
 
   return (
-    <div className="relative rounded-lg group">
+    <div className="relative group">
       <button
         type="button"
         aria-label={`Enlarge ${mountain.name}`}
@@ -15,16 +15,17 @@ export function MountainItem({ mountain }) {
         className={`
           block w-full text-left
           cursor-pointer
+          border border-border
           transition-all duration-300 transform motion-reduce:transition-none
           origin-center
-          ${isEnlarged ? 'scale-[2.0] z-20' : 'motion-safe:hover:scale-115 rounded-lg'}
+          ${isEnlarged ? 'scale-[2.0] z-20' : 'hover:border-phosphor hover:shadow-[0_0_24px_rgb(0_255_65/0.2)]'}
         `}
         style={{
           position: isEnlarged ? 'relative' : 'static',
         }}
         onClick={() => setIsEnlarged(!isEnlarged)}
       >
-        <div className="relative">
+        <div data-mx-media>
           {/* Dynamically adjust size based on enlarged state. From 768px up,
               sizes is the enlarged width (twice the 276px tile) so it stays
               sharp; below that it's 100vw and the enlarged view is softer. */}
@@ -36,7 +37,6 @@ export function MountainItem({ mountain }) {
             className={`
               object-cover
               ${isEnlarged ? 'w-auto h-auto' : 'w-full h-64'}
-              rounded-lg
               transition-[filter] duration-300
               group-hover:brightness-90
               ${isEnlarged ? 'shadow-xl' : ''}
@@ -57,16 +57,16 @@ export function MountainItem({ mountain }) {
           className={`
             absolute inset-0
             flex flex-col items-center justify-end
-            p-4 bg-gradient-to-t from-black/70 to-transparent
+            p-4 bg-gradient-to-t from-background/90 to-transparent
             transition-opacity duration-300
             ${isEnlarged ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
           `}
         >
-          <p className={`text-white font-semibold drop-shadow-md ${isEnlarged ? 'text-sm' : 'text-lg'}`}>
+          <p className={`text-phosphor-hot font-semibold drop-shadow-md ${isEnlarged ? 'text-sm' : 'text-base'}`}>
             {mountain.name}
           </p>
-          <p className={`text-white drop-shadow-md mt-1 ${isEnlarged ? 'text-[10px]' : 'text-xs'} flex items-center`}>
-            <MountainSnow className="w-6 h-6 text-white mr-2" />
+          <p className={`text-foreground drop-shadow-md mt-1 ${isEnlarged ? 'text-[10px]' : 'text-[13px]'} flex items-center`}>
+            <MountainSnow className="w-5 h-5 mr-2" />
             <span>{mountain.altitude}</span>
           </p>
         </div>
diff --git a/components/nav.tsx b/components/nav.tsx
index c7831ea..b99e9c0 100644
--- a/components/nav.tsx
+++ b/components/nav.tsx
@@ -1,5 +1,7 @@
+'use client'
+
 import Link from 'next/link'
-import { ThemeToggle } from '@/components/theme-toggle'
+import { usePathname } from 'next/navigation'
 
 const navItems = {
   '/': {
@@ -23,8 +25,10 @@ const navItems = {
 }
 
 export function Navbar() {
+  const pathname = usePathname()
+
   return (
-    <aside className="-ml-[8px] mb-16 tracking-tight">
+    <aside className="-ml-[8px] mb-16">
       <div className="lg:sticky lg:top-20">
         <nav
           className="flex flex-row items-start relative px-0 pb-0 md:overflow-auto scroll-pr-6 md:relative"
@@ -32,17 +36,20 @@ export function Navbar() {
         >
           <div className="flex flex-row flex-wrap space-x-0 md:pr-10">
             {Object.entries(navItems).map(([path, { name }]) => {
+              const isCurrent =
+                path === '/' ? pathname === '/' : pathname.startsWith(path)
+
               return (
                 <Link
                   key={path}
                   href={path}
-                  className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative px-2.5 py-2.5 my-0.5 sm:px-2 sm:py-1 sm:m-1"
+                  aria-current={isCurrent ? 'page' : undefined}
+                  className="flex align-middle relative px-2.5 py-2.5 my-0.5 sm:px-2 sm:py-1 sm:m-1 text-muted-foreground transition-colors hover:text-phosphor hover:[text-shadow:0_0_10px_rgb(0_255_65/0.55)] aria-[current=page]:bg-phosphor aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:[text-shadow:none]"
                 >
                   {name}
                 </Link>
               )
             })}
-            <ThemeToggle />
           </div>
         </nav>
       </div>
diff --git a/components/noteitem.tsx b/components/noteitem.tsx
index ff10d77..b4e59e3 100644
--- a/components/noteitem.tsx
+++ b/components/noteitem.tsx
@@ -6,8 +6,7 @@ import { Download, Expand, FileText, X } from 'lucide-react'
 import { Button } from '@/components/ui/button'
 import type { Note } from '@/lib/notes'
 
-const actionButton =
-  'h-11 min-w-11 sm:h-8 sm:min-w-0 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200'
+const actionButton = 'h-11 min-w-11 sm:h-8 sm:min-w-0'
 
 // One spring for the card-to-lightbox morph and back, so opening and closing
 // feel like the same gesture.
@@ -55,7 +54,8 @@ export function NoteItem({ note }: { note: Note }) {
             type="button"
             onClick={open}
             aria-label={`Preview ${note.title}`}
-            className="group relative block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800"
+            data-mx-media
+            className="group relative block w-full cursor-pointer border border-border bg-card transition-[border-color,box-shadow] duration-300 hover:border-phosphor hover:shadow-[0_0_24px_rgb(0_255_65/0.2)]"
             whileHover={{ y: -4 }}
             whileTap={{ scale: 0.985 }}
             transition={morph}
@@ -75,21 +75,21 @@ export function NoteItem({ note }: { note: Note }) {
             </div>
           </motion.button>
         ) : (
-          <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
-            <FileText className="h-8 w-8 text-neutral-500" />
+          <div className="flex aspect-[1/1.414] w-full items-center justify-center border border-dashed border-line-strong">
+            <FileText className="h-8 w-8 text-muted-foreground" />
           </div>
         )}
 
         <div className="mt-3 flex items-start justify-between gap-3">
           <div className="min-w-0">
-            <h3 className="font-medium tracking-tight text-balance">
+            <h3 className="font-medium text-balance">
               {note.title}
             </h3>
-            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
+            <p className="mt-0.5 text-[13px] text-muted-foreground">
               {details.join(' · ')}
             </p>
             {note.description && (
-              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
+              <p className="mt-2 text-sm text-muted-foreground">
                 {note.description}
               </p>
             )}
@@ -147,7 +147,7 @@ export function NoteItem({ note }: { note: Note }) {
                     initial={isFirst ? undefined : { opacity: 0, y: 12 }}
                     animate={isFirst ? undefined : { opacity: 1, y: 0 }}
                     transition={isFirst ? morph : { delay: 0.15 }}
-                    className="relative w-full overflow-hidden rounded-xl bg-white shadow-2xl"
+                    className="relative w-full overflow-hidden bg-white shadow-2xl"
                   >
                     {/* The card's thumbnail scales up first so the morph has
                         something to show, then the full render fades in. */}
@@ -187,7 +187,7 @@ export function NoteItem({ note }: { note: Note }) {
                   variant="outline"
                   size="sm"
                   asChild
-                  className="h-11 sm:h-8 border-white/30 bg-transparent text-white hover:bg-white hover:text-black focus-visible:ring-white"
+                  className="h-11 sm:h-8"
                 >
                   <a href={note.file} download>
                     <Download />
diff --git a/components/photoitem.tsx b/components/photoitem.tsx
index 9675992..774bea6 100644
--- a/components/photoitem.tsx
+++ b/components/photoitem.tsx
@@ -23,7 +23,7 @@ export function PhotoItem({ photo }) {
   };
 
   return (
-    <div className="relative rounded-lg group">
+    <div className="relative group">
       {/* The tile doesn't scale while the lightbox is open: the photo shows
           there, and a 2x empty tile widened the page on phones. */}
       <button
@@ -33,16 +33,16 @@ export function PhotoItem({ photo }) {
         className={`
           block w-full text-left
           cursor-pointer
-          transition-all duration-300 transform motion-reduce:transition-none
-          origin-center
-          ${isEnlarged ? '' : 'motion-safe:hover:scale-115 rounded-lg'}
+          border border-border
+          transition-[border-color,box-shadow] duration-300
+          hover:border-phosphor hover:shadow-[0_0_24px_rgb(0_255_65/0.2)]
         `}
         style={{
           position: isEnlarged ? 'relative' : 'static',
         }}
         onClick={handleClick}
       >
-        <div className="relative">
+        <div data-mx-media>
           {/* Hide the original image when enlarged */}
           <Image
             src={photo.src || "/placeholder.svg"}
@@ -52,8 +52,7 @@ export function PhotoItem({ photo }) {
             className={`
               object-cover
               ${isEnlarged ? 'hidden' : 'w-full h-64'}
-              rounded-lg
-              transition-all duration-300
+              transition-[filter] duration-300
               group-hover:brightness-90
             `}
             sizes="(min-width: 768px) 280px, 100vw"
@@ -70,15 +69,15 @@ export function PhotoItem({ photo }) {
           className={`
             absolute inset-0
             flex flex-col items-center justify-end
-            p-4 bg-gradient-to-t from-black/70 to-transparent
+            p-4 bg-gradient-to-t from-background/90 to-transparent
             transition-opacity duration-300
             ${isEnlarged ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
           `}
         >
-          <p className={`text-white font-semibold drop-shadow-md ${isEnlarged ? 'text-sm' : 'text-lg'}`}>
+          <p className={`text-phosphor-hot font-semibold drop-shadow-md ${isEnlarged ? 'text-sm' : 'text-base'}`}>
             {photo.caption}
           </p>
-          <p className={`text-white drop-shadow-md ${isEnlarged ? 'text-xs' : 'text-sm'}`}>
+          <p className={`text-foreground drop-shadow-md ${isEnlarged ? 'text-xs' : 'text-[13px]'}`}>
             {photo.location}
           </p>
         </div>
@@ -120,14 +119,14 @@ export function PhotoItem({ photo }) {
                   alt={photo.caption}
                   width={3024}
                   height={4032}
-                  className="rounded-lg object-contain max-h-[85vh] h-auto w-auto"
+                  className="object-contain max-h-[85vh] h-auto w-auto"
                 />
 
-                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
-                  <p className="text-white text-lg font-semibold text-center drop-shadow-md">
+                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
+                  <p className="text-phosphor-hot text-base font-semibold text-center drop-shadow-md">
                     {photo.caption}
                   </p>
-                  <p className="text-white text-sm text-center drop-shadow-md">
+                  <p className="text-foreground text-[13px] text-center drop-shadow-md">
                     {photo.location}
                   </p>
                 </div>
diff --git a/components/theme-provider.tsx b/components/theme-provider.tsx
deleted file mode 100644
index dbfeaca..0000000
--- a/components/theme-provider.tsx
+++ /dev/null
@@ -1,11 +0,0 @@
-"use client";
-
-import * as React from "react";
-import { ThemeProvider as NextThemesProvider } from "next-themes";
-
-export function ThemeProvider({
-  children,
-  ...props
-}: React.ComponentProps<typeof NextThemesProvider>) {
-  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
-}
\ No newline at end of file
diff --git a/components/theme-toggle.tsx b/components/theme-toggle.tsx
deleted file mode 100644
index 89ca090..0000000
--- a/components/theme-toggle.tsx
+++ /dev/null
@@ -1,35 +0,0 @@
-'use client'
-
-import { useEffect, useState } from 'react'
-import { useTheme } from 'next-themes'
-import { Moon, Sun } from 'lucide-react'
-
-export function ThemeToggle() {
-  const { resolvedTheme, setTheme } = useTheme()
-
-  // The stored theme can only be read in the browser, so the label waits for
-  // hydration to keep the server and client markup the same. The icon doesn't
-  // wait: the dark: classes pick it from the class next-themes puts on <html>
-  // before the first paint.
-  const [mounted, setMounted] = useState(false)
-  useEffect(() => setMounted(true), [])
-
-  const isDark = resolvedTheme === 'dark'
-  const label = !mounted
-    ? 'Toggle theme'
-    : isDark
-      ? 'Switch to light theme'
-      : 'Switch to dark theme'
-
-  return (
-    <button
-      type="button"
-      onClick={() => setTheme(isDark ? 'light' : 'dark')}
-      aria-label={label}
-      className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center relative cursor-pointer h-11 w-11 my-0.5 sm:h-8 sm:w-8 sm:m-1"
-    >
-      <Moon aria-hidden="true" className="h-4 w-4 dark:hidden" />
-      <Sun aria-hidden="true" className="hidden h-4 w-4 dark:block" />
-    </button>
-  )
-}
diff --git a/components/ui/button.tsx b/components/ui/button.tsx
index 583311e..06e3629 100644
--- a/components/ui/button.tsx
+++ b/components/ui/button.tsx
@@ -5,7 +5,7 @@ import { cva, type VariantProps } from "class-variance-authority"
 import { cn } from "@/lib/utils"
 
 const buttonVariants = cva(
-  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
+  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
   {
     variants: {
       variant: {
@@ -14,7 +14,7 @@ const buttonVariants = cva(
         destructive:
           "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
         outline:
-          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
+          "border border-phosphor bg-transparent text-phosphor hover:bg-phosphor hover:text-ink",
         secondary:
           "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
         ghost: "hover:bg-accent hover:text-accent-foreground",
@@ -22,7 +22,7 @@ const buttonVariants = cva(
       },
       size: {
         default: "h-9 px-4 py-2",
-        sm: "h-8 rounded-md px-3 text-xs",
+        sm: "h-8 px-3 text-xs",
         lg: "h-10 rounded-md px-8",
         icon: "h-9 w-9",
       },
diff --git a/components/ui/card.tsx b/components/ui/card.tsx
index cabfbfc..73c800b 100644
--- a/components/ui/card.tsx
+++ b/components/ui/card.tsx
@@ -9,7 +9,7 @@ const Card = React.forwardRef<
   <div
     ref={ref}
     className={cn(
-      "rounded-xl border bg-card text-card-foreground shadow",
+      "rounded-none border bg-card text-card-foreground",
       className
     )}
     {...props}
diff --git a/components/videoitem.tsx b/components/videoitem.tsx
index 3bf8bf7..bd2caf9 100644
--- a/components/videoitem.tsx
+++ b/components/videoitem.tsx
@@ -53,14 +53,15 @@ export function VideoItem({ src, title }) {
   }, [isEnlarged]);
 
   return (
-    <div className="relative aspect-video rounded-lg group">
+    <div className="relative aspect-video group">
       <button
         ref={tileRef}
         type="button"
         aria-label={`Enlarge ${title}`}
         aria-haspopup="dialog"
         aria-expanded={isEnlarged}
-        className="block w-full text-left cursor-pointer transition-all duration-300 origin-center motion-safe:hover:scale-120 motion-reduce:transition-none"
+        data-mx-media
+        className="block h-full w-full text-left cursor-pointer border border-border transition-[border-color,box-shadow] duration-300 hover:border-phosphor hover:shadow-[0_0_24px_rgb(0_255_65/0.2)]"
         onClick={() => setIsEnlarged(true)}
       >
         <video
@@ -69,7 +70,7 @@ export function VideoItem({ src, title }) {
           muted
           loop
           playsInline
-          className="w-full h-full object-cover rounded-lg transition-[filter] duration-300 group-hover:brightness-90"
+          className="w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-90"
           src={src}
         />
 
@@ -106,7 +107,7 @@ export function VideoItem({ src, title }) {
               loop
               playsInline
               src={src}
-              className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-xl"
+              className="max-h-[85vh] max-w-[90vw] shadow-xl"
             />
           </div>,
           document.body,
```
