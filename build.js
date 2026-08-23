const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcFile = path.join(__dirname, 'qrz-page.html');
const distDir = path.join(__dirname, 'dist');
const distFile = path.join(distDir, 'qrz-page.html');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

let content = fs.readFileSync(srcFile, 'utf8');

// 1. Verify that there are NO 4-byte UTF-8 emojis (which break MySQL utf8)
const fourByteChars = [];
for (const ch of content) {
  if (Buffer.byteLength(ch, 'utf8') > 3) {
    fourByteChars.push(ch);
  }
}

if (fourByteChars.length > 0) {
  console.error(`❌ Build Error: Found ${fourByteChars.length} 4-byte UTF-8 characters:`, fourByteChars);
  process.exit(1);
}

// 2. Write production bundle
fs.writeFileSync(distFile, content.trim() + '\n', 'utf8');

console.log(`\n✅ QRZ Page Build Succeeded!`);
console.log(`📦 Output: ${distFile}`);
console.log(`📏 Size: ${Buffer.byteLength(content, 'utf8')} bytes`);

// 3. Automatically copy to clipboard on macOS if pbcopy is available
try {
  execSync(`pbcopy < "${distFile}"`);
  console.log(`📋 Copied to clipboard! Ready to paste into QRZ CKEditor Source.`);
} catch (e) {
  // Ignored if pbcopy not available
}
console.log('');
