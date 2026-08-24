const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // Handle /hampages/ assets (serve locally or proxy from QRZ CDN)
  if (pathname.startsWith("/hampages/")) {
    const parts = pathname.split("/").filter(Boolean); // ['hampages', 'so8kp', 'filename']
    const callsign = parts[1] || "so8kp";
    const filename = parts.slice(2).join("/") || path.basename(pathname);
    const localPath = path.join(__dirname, filename);

    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const ext = path.extname(localPath).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      });
      return fs.createReadStream(localPath).pipe(res);
    } else {
      // Proxy missing images from QRZ.com live CDN
      // QRZ S3 bio CDN is partitioned by the last letter of the callsign (e.g. so8kp -> /p/so8kp/)
      const bucket = callsign.slice(-1).toLowerCase();
      const qrzUrl = `https://cdn-bio.qrz.com/${bucket}/${callsign.toLowerCase()}/${filename}`;
      return https
        .get(
          qrzUrl,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Referer: `https://www.qrz.com/db/${callsign.toUpperCase()}`,
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          },
        )
        .on("error", (err) => {
          console.error(`Failed to proxy asset ${pathname}:`, err.message);
          res.writeHead(404);
          res.end("Not found");
        });
    }
  }

  // Serve main dev page
  if (pathname === "/" || pathname === "/index.html") {
    const bodyContent = fs.existsSync(path.join(__dirname, "qrz-page.html"))
      ? fs.readFileSync(path.join(__dirname, "qrz-page.html"), "utf8")
      : "<h1>qrz-page.html not found</h1>";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SO8KP QRZ Profile (Dev Server)</title>
  <style>
    body {
      margin: 0;
      padding: 30px 12px;
      background-color: #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .dev-banner {
      background: #0f172a;
      color: #94a3b8;
      padding: 8px 16px;
      border-radius: 9999px;
      font-family: -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dev-badge {
      background: #10b981;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="dev-banner">
    <span class="dev-badge">Local Dev</span>
    Editing <code>qrz-page.html</code> • Assets served from local files & QRZ proxy
  </div>
  ${bodyContent}
</body>
</html>`;

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // Serve static files from root
  const filePath = path.join(__dirname, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      ".html": "text/html; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".css": "text/css",
    };
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    return fs.createReadStream(filePath).pipe(res);
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n🚀 QRZ Dev Server running at http://localhost:${PORT}`);
  console.log(`📁 Watching: ${path.join(__dirname, "qrz-page.html")}`);
  console.log(
    `🖼️  Asset routing: local files + QRZ proxy for /hampages/so8kp/*\n`,
  );
});
