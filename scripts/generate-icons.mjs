// Generates icon-192.png and icon-512.png with zero dependencies.
// Renders the Voyage mark: pine rounded square + glacier mountain + swiss-red dot.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT = new URL('../public/', import.meta.url);
mkdirSync(OUT, { recursive: true });

function hex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
const PINE_A = hex('#1E2D4E');
const PINE_B = hex('#131C32');
const MINT_A = hex('#8AB2FB');
const MINT_B = hex('#4C82EC');
const SNOW = hex('#E6ECF5');
const RED = hex('#E4322B');

function lerp(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// signed distance helpers in 0..1 space
function render(size) {
  const px = new Uint8Array(size * size * 4);
  const r = size; // working in pixels
  const radius = size * 0.25;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded-rect mask
      const dx = Math.max(radius - x, x - (size - radius), 0);
      const dy = Math.max(radius - y, y - (size - radius), 0);
      const inside = Math.hypot(dx, dy) <= radius;
      if (!inside) {
        px[i + 3] = 0;
        continue;
      }
      // background gradient (diagonal)
      const t = (x + y) / (2 * size);
      let [cr, cg, cb] = lerp(PINE_A, PINE_B, t);

      // normalized coords
      const nx = x / size;
      const ny = y / size;

      // mountain: main peak triangle
      // peak apex around (0.41,0.34), base y ~0.72, spread
      const baseY = 0.72;
      const apexX = 0.41;
      const apexY = 0.34;
      if (ny <= baseY && ny >= apexY) {
        const prog = (ny - apexY) / (baseY - apexY); // 0 at apex,1 at base
        const halfW = prog * 0.34;
        if (nx >= apexX - halfW && nx <= apexX + halfW * 1.25) {
          const tm = (ny - apexY) / (baseY - apexY);
          [cr, cg, cb] = lerp(MINT_A, MINT_B, tm);
          // snow cap near apex
          if (prog < 0.28 && Math.abs(nx - apexX) < halfW * 0.9) {
            [cr, cg, cb] = SNOW;
          }
        }
      }
      // second smaller peak to the right
      const apex2X = 0.62;
      const apex2Y = 0.46;
      if (ny <= baseY && ny >= apex2Y) {
        const prog = (ny - apex2Y) / (baseY - apex2Y);
        const halfW = prog * 0.24;
        if (nx >= apex2X - halfW && nx <= apex2X + halfW) {
          [cr, cg, cb] = lerp(MINT_A, MINT_B, prog * 0.6);
        }
      }

      // swiss-red sun/dot top-right
      const ddx = nx - 0.72;
      const ddy = ny - 0.26;
      if (ddx * ddx + ddy * ddy <= 0.0036) {
        [cr, cg, cb] = RED;
      }

      px[i] = cr;
      px[i + 1] = cg;
      px[i + 2] = cb;
      px[i + 3] = 255;
    }
  }
  return px;
}

// ---- minimal PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // raw with filter byte per row
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const px = render(size);
  const png = encodePNG(size, px);
  writeFileSync(new URL(`icon-${size}.png`, OUT), png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}
