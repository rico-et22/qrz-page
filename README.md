# SO8KP QRZ.com Bio Page

Modern, responsive, and aesthetic front page for the **SO8KP** amateur radio station on [QRZ.com](https://www.qrz.com/db/SO8KP).

Designed to reflect the portfolio aesthetic of [kamilpawlak.com](https://kamilpawlak.com) while strictly adhering to QRZ's CKEditor sanitizer and MySQL database limitations.

---

## Features

- **Portfolio-Inspired Hero**: Cyan-to-sky gradient card (`linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)`) with callsign badges, avatar, and quick links.
- **Top Metadata Bar**: Callsigns, QTH (*Łąka near Rzeszów, Poland*), ITU/CQ zones, and slashed-zero locator `KO10BC`.
- **Responsive Grids**: Clean white cards with `#e2e8f0` borders for QSL logging platforms, clubs/affiliations, station hardware, and award galleries.
- **Clickable High-Res Photos**: All shack photos and contest certificates open in a new tab when clicked.
- **Zero 4-byte Emojis**: Custom Apple Color Emoji 100×100 PNGs hosted on QRZ to prevent MySQL truncation.

---

## Project Structure

```text
├── qrz-page.html       # Source HTML snippet for the QRZ biography
├── server.js           # Zero-dependency local dev server with asset proxy
├── build.js            # Build & validation script (checks MySQL safety + pbcopy)
├── package.json        # Project scripts & metadata
├── dist/
│   └── qrz-page.html   # Production-ready output bundle
├── emoji_*.png         # 100x100 Apple Color Emoji transparent PNG assets
└── README.md           # Documentation
```

---

## Development Workflow

### 1. Run Local Dev Server
```bash
pnpm dev # or npm run dev
```
- Opens on `http://localhost:3000`.
- Serves local emoji PNGs directly from disk.
- Proxies all `/hampages/so8kp/*` photos and diplomas live from QRZ.com.

### 2. Build for Production
```bash
pnpm build # or npm run build
```
- Validates the HTML (asserts zero 4-byte UTF-8 characters).
- Writes the bundle to `dist/qrz-page.html`.
- **Automatically copies the output to your macOS clipboard (`pbcopy`)**.

### 3. Deploy to QRZ.com
1. Go to **QRZ.com &rarr; Edit SO8KP &rarr; Add/Edit Biography**.
2. Click **Source** on CKEditor.
3. Paste (`Cmd + V`) and click **Save**.

---

## Critical QRZ.com Platform Constraints

1. **MySQL 3-byte UTF-8 (`utf8` vs `utf8mb4`)**:
   QRZ's database silently truncates any biography at the first 4-byte UTF-8 character (which includes all standard emojis like 📍, 🇵🇱, 👋, 📻). All emojis MUST be embedded as inline `<img>` tags (`/hampages/so8kp/emoji_*.png`).
2. **Inline CSS Only**:
   QRZ's CKEditor strips body `<style>` tags during sanitization. All styling must be written as inline `style="..."` attributes.
3. **No Quotes in `style="..."`**:
   Never use double quotes (`"`) or `&quot;` inside `style="..."` attributes, as CKEditor's attribute tokenizer will prematurely close the attribute.
4. **On-Site Asset Hosting**:
   All image assets must reside on `/hampages/so8kp/[filename]` per QRZ site policies.

---

## License

MIT © [Kamil Pawlak (SO8KP)](https://kamilpawlak.com)
