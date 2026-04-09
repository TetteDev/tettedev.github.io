"use strict";

let lut, cw, ch, nChars;

// TODO: very wip, not much work is offloaded to web workers so no point to use it yet

self.onmessage = function (e) {
  const msg = e.data;

  if (msg.type === 'init') {
    lut    = msg.lut;   // float32Array, structured-cloned
    cw     = msg.cw;
    ch     = msg.ch;
    nChars = msg.nChars;
    return;
  }

  if (msg.type === 'render') {
    const { srcStrip, sw, stripRows, startRow, ow, scale, grayscale } = msg;
    const src = new Uint8ClampedArray(srcStrip);
    const out = new Uint8ClampedArray(ow * stripRows * ch * 4);

    for (let i = 3; i < out.length; i += 4) out[i] = 255;

    for (let row = 0; row < stripRows; row++) {
      for (let col = 0; col < sw; col++) {
        const si   = (row * sw + col) * 4;
        const r    = src[si];
        const g    = src[si + 1];
        const b    = src[si + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const idx  = Math.min(Math.floor(gray * scale), nChars - 1);
        const fr   = grayscale ? 255 : r;
        const fg   = grayscale ? 255 : g;
        const fb   = grayscale ? 255 : b;

        const maskBase = idx * ch * cw;
        const dstRowPx = row * ch * ow;
        const dstColPx = col * cw;

        for (let cy = 0; cy < ch; cy++) {
          const dstBase = (dstRowPx + cy * ow + dstColPx) * 4;
          const maskRow = maskBase + cy * cw;
          for (let cx = 0; cx < cw; cx++) {
            const mask = lut[maskRow + cx];
            if (mask > 0) {
              const oi    = dstBase + cx * 4;
              out[oi]     = (fr * mask + 0.5) | 0;
              out[oi + 1] = (fg * mask + 0.5) | 0;
              out[oi + 2] = (fb * mask + 0.5) | 0;
            }
          }
        }
      }
    }

    self.postMessage({ startRow, outStrip: out.buffer }, [out.buffer]);
  }
};
