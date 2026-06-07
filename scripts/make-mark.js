/*
 * Build a true transparent, tint-able silhouette (assets/brand/mark.png) from
 * the brand logo. The shipped logo_trans.png has an OPAQUE white background, so
 * tinting it fills the whole square. Here we key out the light background:
 * dark teal mark -> opaque white pixels (so tintColor can recolor it), light
 * background -> transparent.
 *
 *   node scripts/make-mark.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---- minimal PNG decode (8-bit, color type 2/6, no interlace) ----
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
function decode(buf) {
  const chunks = [];
  let p = 8;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    chunks.push({ type: buf.toString('ascii', p + 4, p + 8), data: buf.slice(p + 8, p + 8 + len) });
    p += 12 + len;
  }
  const ihdr = chunks.find((c) => c.type === 'IHDR').data;
  const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4);
  const channels = ihdr[9] === 6 ? 4 : ihdr[9] === 2 ? 3 : 1;
  const raw = zlib.inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
      let v = raw[pos++];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) v += paeth(a, b, c);
      out[y * stride + x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

// ---- PNG encode RGBA (color type 6) ----
function crc32(buf) { let c = ~0; for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodeRGBA(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (stride + 1)] = 0; rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride); }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const BRAND = path.join(__dirname, '..', 'assets', 'brand');
const src = decode(fs.readFileSync(path.join(BRAND, 'logo_trans.png')));
const out = Buffer.alloc(src.width * src.height * 4);
const ch = src.channels;
for (let i = 0; i < src.width * src.height; i++) {
  const r = src.data[i * ch], g = src.data[i * ch + 1], b = src.data[i * ch + 2];
  const minCh = Math.min(r, g, b); // ~245 background, ~15 teal mark
  // background (light) -> alpha 0, mark (dark) -> alpha 255, with a soft edge.
  let alpha = (210 - minCh) / 60;
  alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
  out[i * 4] = 255; out[i * 4 + 1] = 255; out[i * 4 + 2] = 255; out[i * 4 + 3] = Math.round(alpha * 255);
}
fs.writeFileSync(path.join(BRAND, 'mark.png'), encodeRGBA(src.width, src.height, out));
console.log('wrote assets/brand/mark.png (transparent, tint-able silhouette)');
