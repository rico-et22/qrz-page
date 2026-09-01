# SO8KP QRZ.com Bio Page

Modern, responsive, and aesthetic front page for the **SO8KP** amateur radio station on [QRZ.com](https://www.qrz.com/db/SO8KP).

Designed to reflect the portfolio aesthetic of [kamilpawlak.com](https://kamilpawlak.com) while strictly adhering to QRZ's CKEditor sanitizer and MySQL database limitations.

---

## Features

- **Portfolio-Inspired Hero**: Cyan-to-sky gradient card (`linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)`) with callsign badges, avatar, and quick links.
- **Top Metadata Bar**: Callsigns, QTH (_Łąka near Rzeszów, Poland_), ITU/CQ zones, and slashed-zero locator `KO10BC`.
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
- **Local Asset Serving**: Serves local emoji PNGs (`emoji_*.png`) and any other local files/assets directly from disk first.
- **Live QRZ CDN Proxy**: Transparently proxies any remote `/hampages/so8kp/*` photos and diplomas from QRZ's bio CDN with the required `Referer` / `User-Agent` headers.

#### Why the Dev Proxy?

QRZ biographies reference images using root-relative paths (`/hampages/so8kp/[filename]`), which QRZ resolves in production to `https://cdn-bio.qrz.com/p/so8kp/[filename]`. Directly hotlinking the QRZ bio CDN from a local browser fails with HTTP `403 Forbidden` due to QRZ's anti-hotlinking headers. The local proxy in `server.js` fetches remote assets on the fly with the expected headers, allowing pixel-perfect local preview without needing to download all remote images locally.
Therefore, this proxy provides a seamless local development workflow without having to constantly convert image URLs.

---

### 2. How to Upload Photos & Add Them to the Bio

#### Uploading Images to QRZ.com:

1. Log in to [QRZ.com](https://www.qrz.com) and go to **Edit [Callsign] &rarr; Add/Edit Images/Photos** (Image Manager).
2. Upload your image (shack photo, antenna, contest diploma, etc.).
3. ⚠️ **Filename Sanitization Notice**: QRZ automatically converts hyphens (`-`) to underscores (`_`) upon upload (e.g. `icom-7300-setup.jpg` becomes `icom_7300_setup.jpg`). Always verify the exact saved filename.
4. Your uploaded image is accessible via root-relative path: `/hampages/so8kp/[sanitized_filename]`.

#### Best Practice: Work with AI Agents

Once you've uploaded your photos to QRZ, it is strongly recommended to let AI coding agents (configured with [AGENTS.md](file:///Users/kamil/www/qrz-page/AGENTS.md)) integrate them into [qrz-page.html](file:///Users/kamil/www/qrz-page/qrz-page.html).

- **Zero Risk of Truncation**: Agents are instructed never to introduce 4-byte UTF-8 characters (like emojis) that would corrupt the MySQL database.
- **Strict Layout Constraints**: Agents preserve the inline CSS rules, flexbox equal-height grid alignments, and standardized `aspect-ratio` rules (`4 / 3` for diplomas, `1 / 1.44` for portrait certificates).
- Simply provide the agent with the uploaded filename (e.g. _"I uploaded `pzk_award_2026.jpg`, please add it to the Diplomas grid"_).

---

### 3. Build for Production

```bash
pnpm build # or npm run build
```

- Validates the HTML (asserts zero 4-byte UTF-8 characters).
- Writes the bundle to `dist/qrz-page.html`.
- **Automatically copies the output to your macOS clipboard (`pbcopy`)**.

---

### 4. Deploy to QRZ.com

1. Go to **QRZ.com &rarr; Edit SO8KP &rarr; Add/Edit Biography**.
2. Click **Source** on CKEditor toolbar.
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

## Credits & Tooling

- Built and maintained with **Google Antigravity** (powered by **Gemini 3.7 Flash**).

---

## License

MIT © [Kamil Pawlak (SO8KP)](https://kamilpawlak.com)
