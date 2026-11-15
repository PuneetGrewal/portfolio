# UX review: pgrewal.co — all routes (/, /projects, /live, /resume, /hobbies, /notes, 404)

**Stack:** Next.js 15 (App Router), React 18, Tailwind CSS 4.0.0-alpha.13, shadcn/ui (Radix + cva), motion, lucide/radix icons. Colour scheme follows the OS (`prefers-color-scheme` in `global.css`); `tailwind.config.ts` says the intent is always-dark.
**Checked:** code ✔ · rendered 375px ✔ · rendered 1280px ✔ (/projects) · schemes: dark ✔, light ✔ · source: live site + `~/dev/portfolio/portfolio`
**Summary:** The /live and /notes pages are well built. The biggest problem is underneath everything: none of the theme tokens compile under Tailwind v4, so the site's colours depend on the visitor's OS setting, muted text renders full white, and the Geist font is loaded but never used. After that, the main issues are inconsistent page shells (/ and /hobbies), small touch targets, and four different "enlarge" behaviours.

## Rule status

| Law / rule | Status | Finding IDs |
|---|---|---|
| Aesthetic-Usability Effect | Breaks | 1, 10 |
| Law of Similarity | Breaks | 1, 2, M1 |
| Law of Prägnanz | Partial | 2 |
| Law of Proximity / Common Region | Partial | 1 (card borders), 6 |
| Fitts's Law | Breaks (mobile) | 3 |
| Jakob's Law | Partial | 4, M1 |
| Mental Model | Partial | 5 |
| Selective Attention | Partial | 1 (muted text), 9 |
| Chunking / hierarchy | Partial | 6 |
| Contrast (WCAG AA) | Partial | 7 |
| Keyboard & focus | Partial | 1 (ring colour), 4, 11 |
| Doherty Threshold | Partial | 8 |
| Peak-End Rule | Partial | M2 (404 is good; home ends without a next step) |
| Serial Position | Follows | home first in nav, consistent order |
| Motion / reduced motion | Partial | 9 (/live and the 404 already do this right) |
| N/A: Hick's, Choice Overload, Goal-Gradient, Zeigarnik, Postel's, Tesler's, Parkinson's, Working Memory, Cognitive Bias | N/A | no forms, flows or decision points |

## Proposed tweaks

### 1. Theme tokens never compile, so colours follow the OS and muted text is white — High · Aesthetic-Usability, Similarity
**Where:** `app/global.css:1` (no `@theme`/`@config`), `tailwind.config.js` + `tailwind.config.ts` (both ignored by v4), `app/layout.tsx:50`, `app/page.tsx:3`, `app/projects/page.tsx:93,140`, `components/ui/card.tsx:12,50`, `components/ui/button.tsx:8,17`
**Problem:** Tailwind v4 doesn't read `tailwind.config.*` without an `@config` line, and the `--background`/`--muted-foreground` variables the `.js` config points to are never defined. So `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-input` and `ring-ring` generate no CSS.
**Evidence:** In the deployed CSS, all of those classes are missing. With the OS in light mode, the whole site renders white with black text, and in dark mode it's the browser's default dark. Card descriptions on /projects compute to `rgb(255,255,255)`, the same as titles. Card borders are pure white because v4's default border colour is `currentColor`. The body font computes to `ui-sans-serif`, not Geist.
**Change:** These are the brand values already in `tailwind.config.ts`; muted text uses the `neutral-400` grey that /live and /notes already use.
```diff
  @import 'tailwindcss';
+
+ @theme {
+   --color-background: #111111;
+   --color-foreground: #fefefe;
+   --color-card: #1c1c1c;
+   --color-card-foreground: #e0e0e0;
+   --color-primary: #4c97f8;
+   --color-primary-foreground: #ffffff;
+   --color-secondary: #0fa295;
+   --color-secondary-foreground: #ffffff;
+   --color-muted-foreground: #a3a3a3;
+   --color-accent: #1c1c1c;
+   --color-accent-foreground: #fefefe;
+   --color-border: #444444;
+   --color-input: #444444;
+   --color-ring: #a3a3a3;
+ }
+
+ @layer base {
+   html { color-scheme: dark; }
+   body { font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif; }
+   *, ::before, ::after { border-color: var(--color-border); }
+ }
```
These go inside `@layer base` on purpose. Unlayered rules would beat the utilities and override borders like `border-neutral-800` on /live.
Notes: (a) Light-mode visitors will see the dark site from now on. That matches `tailwind.config.ts` ("Don't toggle dark mode anymore"), but confirm it's what you want. (b) `--color-ring` uses the lighter grey rather than the config's `#5f6368`, because `#5f6368` on `#111` is under the 3:1 needed for a visible focus ring. (c) Switching to Geist changes the type slightly everywhere, but it's the font `layout.tsx` already loads. (d) `--color-*` names work on the alpha; removing the two config files is part of M3.

### 2. / and /hobbies use a different page shell from every other page — Medium · Similarity, Prägnanz
**Where:** `app/page.tsx:3`, `app/hobbies/page.tsx:29,30,34,49,59`
**Problem:** These two pages add their own padding, so their content starts 32px further right and lower than on every other page, and /hobbies uses a larger, bolder title. Moving between pages makes the content jump.
**Evidence:** At 375px the content's left edge is 56px on / and /hobbies but 24px everywhere else, and the title starts 208/224px from the top vs 176px. The /hobbies h1 is 36px/700; the others are 24px/600.
**Change:**
```diff
# app/page.tsx:3
- <section className="bg-background text-foreground p-8">
+ <section>
# app/hobbies/page.tsx
- <div className="min-h-screen px-8 py-12">
-   <h1 className="text-4xl font-bold mb-6">My Hobbies</h1>
+ <section>
+   <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Hobbies</h1>
- <h2 className="text-2xl font-semibold mb-4">Tennis</h2>   (and Photography, Hiking)
+ <h2 className="font-semibold text-xl mb-4 tracking-tighter">Tennis</h2>
- </div>
+ </section>
```

### 3. Touch targets under 44px on mobile — Medium · Fitts's Law
**Where:** `components/nav.tsx:38`, `components/footer.tsx:24`, `app/resume/page.tsx:21-22`, `components/noteitem.tsx:9-10`, `app/projects/page.tsx:99,146`
**Problem:** The nav wraps onto two rows of 32px-tall links, which are easy to mis-tap. The notes download buttons are icon-only at 42×32.
**Evidence:** At 375px: nav links are 32px tall, the footer "github" link is 28px, the outline `sm` buttons are 32px, and the notes download buttons are 42×32.
**Change:** These only grow the hit area on small screens; the desktop look is unchanged.
```diff
# nav.tsx:38
- className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
+ className="transition-colors hover:text-neutral-200 flex items-center relative py-2.5 px-2 m-0.5 sm:py-1 sm:m-1"
# footer.tsx:24
- className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
+ className="flex min-h-11 items-center transition-colors hover:text-neutral-100 sm:min-h-0"
# resume/page.tsx:21-22 and noteitem.tsx:9-10 (shared actionButton constant)
- "hover:bg-white hover:text-black transition-colors duration-200"
+ "h-11 min-w-11 sm:h-8 sm:min-w-0 hover:bg-white hover:text-black transition-colors duration-200"
# projects/page.tsx:99,146 — same classes on the inline Source Code buttons
```
(The `hover:text-neutral-800` light-mode variants go away because of #1.)

### 4. Gallery tiles are clickable `div`s — Medium · Jakob's Law, keyboard
**Where:** `components/photoitem.tsx:31-49`, `components/mountains.tsx:11-29`, `components/videoitem.tsx:10-28`
**Problem:** On /hobbies there are 10 focusable `div`s with no role or name. A screen reader announces nothing useful, and Esc doesn't close the enlarged view.
**Evidence:** 10 `div[tabindex]` with no `role` on /hobbies.
**Change:** Use a real button with a name. This is a minimal fix; M1 is the proper one.
```diff
- <div className={`cursor-pointer …`} style={…} tabIndex={0} onClick={handleClick} onKeyDown={…}>
+ <button type="button" aria-label={`Enlarge ${photo.caption}`} aria-expanded={isEnlarged}
+   className={`block w-full text-left cursor-pointer …`} style={…} onClick={handleClick}>
  …
- </div>
+ </button>
```
Do the same for mountains (`Enlarge ${mountain.name}`) and videos (`Enlarge ${title}`). With a `<button>` the `onKeyDown` handler isn't needed, because Enter and Space work natively.

### 5. Hover effects on things you can't click — Medium · Mental Model, Similarity
**Where:** `app/projects/page.tsx:68,82,121,130`
**Problem:** Tags highlight on hover and whole cards lift on hover, which suggests they're clickable, but only "Source Code" is.
**Change:**
```diff
- className="bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200"
+ className="bg-gray-800 text-white hover:bg-gray-800"
- <Card key={project.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
+ <Card key={project.id} className="flex flex-col shadow-md">
```
(Badge's `secondary` variant has its own hover, so the override pins it.) The alternative is to keep the lift and make the whole card link to GitHub, but that would be a behaviour change.

### 6. /projects has two h1s and no page title; uneven card header — Low · Chunking
**Where:** `app/projects/page.tsx:65,71,116`
**Problem:** "Personal" and "Coursework" are both `h1`, so the page has no top-level title for screen readers or search. The `grid-rows-2` in the date row forces two equal rows, which adds a gap above the tags.
**Change:** No visual change except the tighter date row.
```diff
+ <h1 className="sr-only">Projects</h1>
- <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Personal</h1>
+ <h2 className="font-semibold text-2xl mb-8 tracking-tighter">Personal</h2>
  (same for Coursework)
- <CardDescription className="grid grid-rows-2 gap-2">
+ <CardDescription className="flex flex-col gap-2">
```

### 7. Project dates fail contrast — Low · Contrast
**Where:** `app/projects/page.tsx:72,74`
**Evidence:** `text-gray-500` on the dark background measures 3.88:1 (needs 4.5:1 at 14px).
**Change:**
```diff
- <div className="flex items-center text-gray-600">
-   <CalendarIcon className="h-4 w-4 mr-2" />
-   <span className="text-gray-500">{project.date}</span>
+ <div className="flex items-center text-neutral-400">
+   <CalendarIcon className="h-4 w-4 mr-2" />
+   <span>{project.date}</span>
```

### 8. Every hobby photo is marked `priority` — Medium · Doherty Threshold
**Where:** `components/photoitem.tsx:51-65,121-128`, `components/mountains.tsx:31-45`
**Problem:** `priority` turns off lazy loading and preloads all 8 photos (about 16 MB of originals in `public/`) before the page is usable, including ones far below the fold. Without `sizes`, mobile also gets oversized versions.
**Change:**
```diff
  <Image src={…} alt={…} width={3024} height={4032}
-   priority
+   sizes="(min-width: 768px) 280px, 100vw"
```
Remove `priority` from the enlarged copy too (`photoitem.tsx:127`), because it's only shown after a click.

### 9. Tennis videos autoplay and loop regardless of reduced-motion — Low · Selective Attention, Motion
**Where:** `components/videoitem.tsx:29-41`
**Problem:** Two looping videos sit right under the page title, and visitors who've asked for reduced motion still get them.
**Change:** `motion` is already a dependency.
```diff
+ import { useReducedMotion } from 'motion/react';
  …
+ const reduce = useReducedMotion();
- <video autoPlay muted loop playsInline
+ <video autoPlay={!reduce} muted loop playsInline preload="metadata"
```

### 10. Dead and mistyped classes — Low · Aesthetic-Usability, Occam's Razor
**Where:** `components/footer.tsx:21` (`font-sm` doesn't exist, so the footer text is 16px), `components/nav.tsx:29` (`fade`), `components/videoitem.tsx:36` and `components/mountains.tsx:40` (`transition-filter`), `app/projects/page.tsx:137` (`flex-grow`, renamed `grow` in v4), comments inside class strings (`photoitem.tsx:58`, `mountains.tsx:38`), and unused imports (`app/hobbies/page.tsx:1-3`)
**Change:** `font-sm`→`text-sm` (the footer gets smaller, as intended), drop `fade`, `transition-filter`→`transition-[filter]`, `flex-grow`→`grow`, move the comments out of the template strings, and delete the unused imports.

### 11. 404 letters are keyboard-focusable but hidden from screen readers — Low · Keyboard
**Where:** `components/bouncing-ps.tsx:187`
**Evidence:** 10–14 focusable letters sit inside an `aria-hidden` container (`motion`'s `whileTap` makes them tabbable), so keyboard users tab through all of them before reaching "Take me home".
**Change:**
```diff
  <motion.div
+   tabIndex={-1}
    drag
```

## Major changes (need a separate decision)

### M1. One lightbox for the whole site — Jakob's Law, Similarity
**Why:** There are four enlarge behaviours. Photos open a custom overlay, mountains scale 2× in place, videos scale 4.5× in place (which overflows the screen on mobile, with no close button or Esc), and notes use a morph lightbox with Esc. The shadcn `Dialog` is already in the project and imported, unused, in `hobbies/page.tsx:2`.
**What it involves:** One shared `MediaLightbox` built on `Dialog` (Esc, focus trap, scroll lock, labelled close button, caption), used by the photo, mountain and video tiles. You could keep the notes morph and only align its close behaviour. This touches 3–4 components and removes about 150 lines.
**Trade-off:** You lose the in-place zoom effect and get one predictable behaviour everywhere.

### M2. Give the home page a next step — Peak-End Rule, Fitts's Law
**Why:** The home page is two paragraphs and then the footer, with no link to /live or /projects and no contact other than GitHub.
**What it involves:** Your content: one row of links ("See live sites →", "Projects →") and an email or LinkedIn link in the footer.

### M3. Move off the Tailwind v4 alpha
**Why:** `4.0.0-alpha.13` predates breaking changes in stable v4, and there are two conflicting config files.
**What it involves:** Upgrade `tailwindcss` and `@tailwindcss/postcss` to stable v4, delete both `tailwind.config.*` files (the tokens move to `@theme` in #1), and check the renamed utilities (`shadow-sm`→`shadow-xs`, `outline-none`→`outline-hidden` in the shadcn components). Test every route afterwards.

## Already good
- /live: reduced-motion handled for both the entrance and the screenshot pan, a visible `:focus-visible` frame, the whole card is one stretched link, an `sr-only` "(preview)" label, the first image loads eagerly and the rest lazily, and dimensions are set.
- /notes lightbox: Esc to close, scroll lock with restore, labelled close and download buttons, and a clear empty state.
- The 404 page gives a clear way home and respects reduced motion.
- /resume: the image has reserved dimensions, the actions are clearly labelled, and the image is used instead of an embedded PDF viewer, which avoids the viewer's clutter.
- The nav order is stable on every page, with home first.

## Not verified
- I ran no keyboard walkthrough with a screen reader. The focus findings come from DOM inspection.
- Performance numbers weren't measured; #8 is based on the code and file sizes.

---
**Reply with the IDs to apply** (e.g. "apply 1, 2, 5" or "apply all tweaks"). Major items need an explicit "apply M1".
