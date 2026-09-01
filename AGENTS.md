# Agent Guidelines for QRZ Page (SO8KP)

This document outlines architectural rules, technical constraints, and developer practices for any AI agent modifying this repository.

---

## 1. Core Architecture & Workflow

- **Single Source of Truth**: The main source code is [qrz-page.html](file:///Users/kamil/www/qrz-page/qrz-page.html).
- **Two-Environment Workflow**:
  - **Dev**: Run `pnpm dev` (`node server.js`). `server.js` serves [qrz-page.html](file:///Users/kamil/www/qrz-page/qrz-page.html) directly, serving local `emoji_*.png` files from disk and proxying `/hampages/so8kp/*` photo assets from `https://cdn-bio.qrz.com/p/so8kp/*`.
  - **Build**: Run `pnpm build` (`node build.js`). It validates MySQL UTF-8 safety, writes [dist/qrz-page.html](file:///Users/kamil/www/qrz-page/dist/qrz-page.html), and executes `pbcopy` on macOS.

---

## 2. Hard Technical Constraints (QRZ.com Sanitizer & MySQL)

Failure to follow these rules will cause QRZ.com to truncate or break the entire biography:

### ⚠️ RULE 1: ZERO 4-byte UTF-8 Unicode Characters
- **The Issue**: QRZ.com's database uses MySQL `utf8` (3-byte UTF-8, `utf8mb3`), NOT `utf8mb4`.
- **The Consequence**: The instant MySQL encounters a 4-byte UTF-8 character (including all standard emojis: `📍`, `🇵🇱`, `🇪🇺`, `👋`, `💻`, `🎓`, `📻`), MySQL **silently truncates the entire biography** at that character and drops the rest of the page.
- **The Solution**: 
  - **NEVER** insert raw emojis in text or `alt="..."` attributes.
  - Use hosted Apple emoji PNG images: `<img src="/hampages/so8kp/emoji_[name].png" alt="[Plain Text]" style="..." />`.
  - All Polish diacritics (`ą`, `ć`, `ę`, `ł`, `ń`, `ó`, `ś`, `ź`, `ż`) are 2-byte UTF-8 and are 100% safe.
  - Standard ASCII symbols like `•`, `↗`, `★` (1-3 bytes) are 100% safe.

### ⚠️ RULE 2: 100% Inline CSS — No `<style>` Blocks
- **The Issue**: QRZ's CKEditor runs in body-only mode and strips `<style>` blocks on save.
- **The Solution**: Every layout, typography, color, border, and shadow rule must be an inline `style="..."` attribute directly on the element.

### ⚠️ RULE 3: No Double Quotes or `&quot;` inside `style="..."`
- **The Issue**: CKEditor's attribute parser decodes `&quot;` into literal `"`, which prematurely terminates `style="..."` attributes and corrupts the tag.
- **The Solution**: Use single quotes `'` or omit quotes where possible (e.g. `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;`).

### ⚠️ RULE 4: No Uncolonized CSS Declarations
- **The Issue**: Accidentally placing Tailwind classes like `tracking-tight;` in `style="..."` breaks CKEditor's `CKEDITOR.tools.parseCssText()`.
- **The Solution**: Always verify that all inline CSS declarations strictly follow `property: value;`.

### ⚠️ RULE 5: Asset URL Convention & Filename Sanitization
- Use root-relative paths for all assets: `/hampages/so8kp/[filename]`.
- Do not use `https://cdn-bio.qrz.com/...` directly (returns HTTP 403 Forbidden).
- **Filename Sanitization on Upload**: QRZ's image manager sanitizes filenames upon upload, converting hyphens (`-`) to underscores (`_`) (e.g. `pzk-polska.png` becomes `pzk_polska.png`). Always use underscores instead of hyphens for asset filenames to ensure they match what QRZ CDN serves.

---

## 3. Design Language & Grid Rules

- **Design Reference**: Based on [kamilpawlak.com](https://kamilpawlak.com).
- **Surfaces & Borders**: Cards must use `#ffffff` background with `1px solid #e2e8f0`, `border-radius: 12px` to `16px`, and subtle shadows `0 1px 3px rgba(0, 0, 0, 0.05)`.
- **Grids & Full-Row Alignment**:
  - Always give direct grid children `display: flex; flex-direction: column; height: 100%; box-sizing: border-box;`.
  - Never wrap grid children in un-flexed `<a>` containers. Place `<a>` as the direct grid item with flex properties.
- **Certificates & Diplomas**:
  - Use standardized `aspect-ratio` on image tags (`4 / 3` for landscape diplomas, `1 / 1.44` for portrait A4 certificates) with `object-fit: cover;`.
  - Bottom captions must use `margin-top: auto;` to ensure pixel-perfect bottom edge alignment across rows.
- **No AI Badges**: Do not add unnecessary category pills (like `Hardware`, `QSL Info`, `Achievements`). Keep it clean and developer-authentic.

---

## 4. Verification Checklist Before Committing

Always run:
1. `pnpm build` (must exit code 0 with 0 four-byte characters).
2. Check that all direct grid children have matching height/flex behaviors.
3. Test locally on `http://localhost:3000` via `pnpm dev`.
