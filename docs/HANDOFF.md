# Handoff: pgrewal.co UX work

As of 2026-11-15. Items marked **(unverified)** were reported but not confirmed.

The committed README is the template's boilerplate. The review report with finding IDs (1–11, M1–M3) is `docs/ux-review-pgrewal.co.md`.

## Current state

| Where | What |
|---|---|
| `main` | Production on Vercel. Contains none of the UX work. |
| `ux-fixes` (pushed) | `b9d6eb1`: review findings 1–11, theme follows the OS. `e0b9702`: follow-ups (tennis videos pause under reduced motion, nav tap targets, mountain image `sizes`). |
| `ux-fixes` (uncommitted) | Tailwind 4.0.0-alpha.13 → 4.3.5 (19 class renames, palette pins). Light/dark toggle (`components/theme-toggle.tsx`, ThemeProvider in `app/layout.tsx`). /hobbies fixes: tennis clips re-encoded to 8-bit H.264; a clip opens in a full-screen portal dialog with a 44px close button; the photo tile no longer stays scaled behind its lightbox; tiles use `motion-safe`/`motion-reduce`; the photo lightbox close button is 44px with an `aria-label`. |
| Final verification of the uncommitted work | A multi-checker run was started. **(unverified: whether it finished and what it found)** |

Puneet checked the local build and was happy with it.

## Review findings

| ID | Status |
|---|---|
| 1–11 | Applied. #1 became light and dark themes instead of always-dark. #3, #5 and #7 were adjusted so they work in both themes. |
| M1: one shared lightbox | Not built. Videos now have their own portal dialog, photos a custom lightbox and notes a morph lightbox, so the behaviours still differ. **(unverified: whether mountain tiles still scale in place)** |
| M2: next step on the home page | Not built. Decided: links to /live and /projects, plus **both** email and LinkedIn links in the footer. |
| M3: stable Tailwind | Upgrade done but uncommitted. `tailwind.config.js` and `tailwind.config.ts` are still in the repo and are no longer read; deleting them was part of M3. |

## Decisions and why

- **Keep each site's brand.** Change structure, spacing and usability only. Colours and fonts change only to restore values that were intended but never compiled.
- **Theme tokens live in `@theme` in `app/global.css`.** Light values match the light-mode classes the site already used. Dark values come from the old `tailwind.config.ts`.
- **Class-based dark mode via next-themes.** `@custom-variant dark (&:where(.dark, .dark *))` is in the CSS. The theme follows the OS until the visitor picks one.
- **Upgraded Tailwind instead of a PostCSS workaround.** The alpha hardcodes `dark:` to the OS media query and can't follow a class.
- **Global CSS rules go in `@layer base`.** Unlayered rules override utilities such as `border-neutral-800`.
- **emerald/amber 400–600 are pinned to hex.** Tailwind 4's OKLCH palette shifted the /live status pills.
- **`drop-shadow-md/lg` on captions and icons now render.** They were invalid CSS in the alpha and showed nothing. The new look was accepted.
- **Tennis clips are 8-bit H.264 High, 1080p60.** Safari and iOS can't play 10-bit. SSIM is 0.996 and file sizes are within 3% of the originals.
- **Workflow.** Work happens on a branch and is checked on a Vercel preview before Puneet merges to `main`. Fixes are approved by ID. Don't commit, push to `main` or merge unless asked.

## Open questions

- The toggle only switches light ↔ dark. Once clicked, there's no way back to "follow the OS" without clearing storage. Is that acceptable?
- M2 needs Puneet's email address, his LinkedIn URL, and the wording of the home-page links.
- Impeccable created `.claude/agents/`, `.claude/skills/impeccable/`, `.impeccable/` and its hook in `.claude/settings.local.json`, all untracked. Should these be committed or added to `.gitignore`?
- Should `ux-review-pgrewal.co.md` be committed?

## Asked for but not built

- M1 shared lightbox, M2 home next step, and deleting the two leftover `tailwind.config.*` files.
- The Impeccable UI pass (below).

## Known risks

- **No real iPhone test yet.** The video playback fix, the toggle and both dialogs were tested in desktop Safari's engine only.
- **Enlarged mountain view is still soft below 768px wide.**
- **React versions may not match.** `package.json` lists `react` 18.2.0 and `@types/react` 18, but Next 15.5.7 reportedly bundles React 19.2 at runtime. **(unverified)**
- **Folder name casing.** Locally the folder is `public/mountains`, but git and production use `public/Mountains`, which the code uses. Mountain images 404 on local servers only. Rename it locally in two steps; don't commit a rename.
- **`.claude/launch.json` is modified** with scratch configs (ports 3011 and 3012) pointing at `/private/tmp`. Revert it before committing.
- **Ports.** Port 3000 is often used by another project, so run this one on a different port. Servers on 3001, 3011 and 3012 may still be running. **(unverified)**
- **The Impeccable hook runs after every UI edit** and has its own style opinions that can push against the existing brand.

## Next step

1. Read the final verification results and fix anything real.
2. Commit the uncommitted work as three commits (Tailwind upgrade, toggle, /hobbies fixes), leaving `launch.json` out. Push `ux-fixes`.
3. Puneet checks the Vercel preview on his iPhone, then merges to `main`.

### Then: Impeccable UI pass (on a new branch from `main`)

- [ ] `/impeccable init`, which writes `PRODUCT.md`
- [ ] `/impeccable document`, which writes `DESIGN.md`. It must capture both themes.
- [ ] Baseline: `npx impeccable detect http://localhost:<port>`
- [ ] Run `critique` and `audit` one page at a time, starting with `/` and `/projects`
- [ ] Apply only the findings Puneet approves, keeping the brand in `DESIGN.md`
- [ ] Run the ux-laws `check` mode for regressions, then rerun the detector against the baseline
- [ ] Check every route at 375px and 1280px in light and dark, then use a Vercel preview and let Puneet merge
