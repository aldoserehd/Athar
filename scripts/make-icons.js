/*
 * Generates app icon / splash / favicon from the brand logo.
 *
 *  - icon.png          full-bleed, opaque (iOS forbids transparency): the
 *                      white mark on the logo's own teal, corners filled.
 *  - adaptive-icon.png Android foreground (same art; bg color set in app.json).
 *  - splash.png        the mark centered on the brand teal.
 *  - favicon.png       small web icon.
 *
 * Pure Node (no native deps): reads the source PNGs, samples the logo's teal,
 * and composites with a minimal PNG decoder/encoder. Run:
 *   node scripts/make-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BRAND = path.join(__dirname, '..', 'assets', 'brand');
const OUT = path.join(__dirname, '..', 'assets');

// ---------- minimal PNG decode (truecolor/alpha, 8-bit, non-interlaced) ----------
function readChunks(buf) {
  let p = 8;
  const chunks = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.slice(p + 8, p + 8 + len);
    chunks.push({ type, data });
    p += 12 + len;
  }
  return chunks;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  const chunks = readChunks(buf);
  const ihdr = chunks.find((c) => c.type === 'IHDR').data;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const colorType = ihdr[9];
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data));
  const raw = zlib.inflateSync(idat);
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const row = raw.slice(pos, pos + stride);
    pos += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) v += paeth(a, b, c);
      out[y * stride + x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

// ---------- PNG encode (RGB, opaque) ----------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePngRGB(width, height, rgb) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- helpers ----------
function sampleBg(img) {
  // Sample an opaque pixel near the top-center (inside the rounded square).
  const x = Math.floor(img.width / 2);
  const y = Math.floor(img.height * 0.12);
  const i = (y * img.width + x) * img.channels;
  return [img.data[i], img.data[i + 1], img.data[i + 2]];
}

// Nearest-neighbour composite of `src` (with alpha) onto an RGB canvas filled
// with `bg`, scaling the source to `scale` of the canvas, centered.
function compose(size, bg, src, scale) {
  const canvas = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    canvas[i * 3] = bg[0];
    canvas[i * 3 + 1] = bg[1];
    canvas[i * 3 + 2] = bg[2];
  }
  const draw = Math.round(size * scale);
  const off = Math.round((size - draw) / 2);
  const ch = src.channels;
  for (let y = 0; y < draw; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y / draw) * src.height));
    for (let x = 0; x < draw; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x / draw) * src.width));
      const si = (sy * src.width + sx) * ch;
      const a = ch === 4 ? src.data[si + 3] / 255 : 1;
      if (a === 0) continue;
      const dx = off + x,
        dy = off + y;
      if (dx < 0 || dy < 0 || dx >= size || dy >= size) continue;
      const di = (dy * size + dx) * 3;
      for (let k = 0; k < 3; k++) {
        canvas[di + k] = Math.round(src.data[si + k] * a + canvas[di + k] * (1 - a));
      }
    }
  }
  return canvas;
}

const blue = decodePng(fs.readFileSync(path.join(BRAND, 'logo_blue.png')));
const trans = decodePng(fs.readFileSync(path.join(BRAND, 'logo_trans.png')));
const teal = sampleBg(blue);
const hex = '#' + teal.map((c) => c.toString(16).padStart(2, '0')).join('');
console.log('sampled brand teal:', hex);

// icon + adaptive foreground: full-bleed logo on its own teal.
const icon = compose(1024, teal, blue, 1.0);
fs.writeFileSync(path.join(OUT, 'icon.png'), encodePngRGB(1024, 1024, icon));
fs.writeFileSync(path.join(OUT, 'adaptive-icon.png'), encodePngRGB(1024, 1024, icon));

// Extract just the white mark from logo_blue as an RGBA glyph (alpha keyed on
// brightness: white mark -> opaque, teal field -> transparent). This avoids the
// logo's rounded-square border showing as notches when placed on a flat field.
function extractWhiteMark(img) {
  const out = Buffer.alloc(img.width * img.height * 4);
  const ch = img.channels;
  for (let i = 0; i < img.width * img.height; i++) {
    const r = img.data[i * ch];
    const g = img.data[i * ch + 1];
    const b = img.data[i * ch + 2];
    const srcA = ch === 4 ? img.data[i * ch + 3] : 255;
    const minCh = Math.min(r, g, b); // high for white, low for teal
    let a = (minCh - 70) / 150;
    a = a < 0 ? 0 : a > 1 ? 1 : a;
    a = a * (srcA / 255);
    out[i * 4] = 255;
    out[i * 4 + 1] = 255;
    out[i * 4 + 2] = 255;
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return { width: img.width, height: img.height, channels: 4, data: out };
}

// splash: clean white mark centered on the brand teal.
const mark = extractWhiteMark(blue);
const splash = compose(1284, teal, mark, 0.5);
fs.writeFileSync(path.join(OUT, 'splash.png'), encodePngRGB(1284, 1284, splash));

// favicon
const fav = compose(48, teal, blue, 1.0);
fs.writeFileSync(path.join(OUT, 'favicon.png'), encodePngRGB(48, 48, fav));

console.log('wrote icon.png, adaptive-icon.png, splash.png, favicon.png');
console.log('TEAL_HEX=' + hex);
