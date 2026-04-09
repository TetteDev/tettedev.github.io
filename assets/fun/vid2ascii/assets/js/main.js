"use strict";

const fontFamilyInput = document.getElementById('fontFamily');
const fontIndicator   = document.getElementById('fontIndicator');

function isFontAvailable(name) {
  const canvas    = new OffscreenCanvas(200, 20);
  const ctx       = canvas.getContext('2d');
  const testStr   = 'mmmmmmmmmmmlllliii';
  ctx.font        = '12px monospace';
  const fallbackW = ctx.measureText(testStr).width;
  ctx.font        = `12px "${name}", monospace`;
  return ctx.measureText(testStr).width !== fallbackW;
};

fontFamilyInput.addEventListener('input', () => {
  const name = fontFamilyInput.value.trim();
  const ok   = name.length > 0 && isFontAvailable(name);
  fontIndicator.textContent = ok ? '\u2713' : '\u2717';
  fontIndicator.className   = `font-indicator ${ok ? 'font-ok' : 'font-err'}`;
});

// ── DOM ───────────────────────────────────────────────────────────────────────
const dropZone     = document.getElementById('dropZone');
const dropLabel    = document.getElementById('dropLabel');
const fileInput    = document.getElementById('fileInput');
const convertBtn   = document.getElementById('convertBtn');
const abortBtn     = document.getElementById('abortBtn');
const statusText   = document.getElementById('statusText');
const progressBar  = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const downloadArea = document.getElementById('downloadArea');
const previewPanel = document.getElementById('previewPanel');
const previewCanvas= document.getElementById('previewCanvas');
const audioWarning = document.getElementById('audioWarning');

let selectedFile = null;
let abortRequested = false;

abortBtn.addEventListener('click', () => { abortRequested = true; });

// ── File selection ────────────────────────────────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { if (e.target.files[0]) selectFile(e.target.files[0]); });
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
});

function selectFile(file) {
  selectedFile = file;
  dropZone.classList.add('has-file');
  dropLabel.textContent = `Selected: ${file.name}`;
  convertBtn.disabled = false;
  statusText.textContent = 'Ready to convert.';
  downloadArea.innerHTML = '';
  if (file.type.startsWith('image/')) {
    const fpsInput = document.getElementById('outputFps');
    fpsInput.placeholder = 'N/A (image)';
  } else {
    probeFps(file);
  }
}

function probeFps(file) {
  const fpsInput = document.getElementById('outputFps');
  fpsInput.placeholder = 'Detecting…';

  const vid = document.createElement('video');
  vid.src         = URL.createObjectURL(file);
  vid.muted       = true;
  vid.playsInline = true;
  vid.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;top:0;left:0;';
  document.body.appendChild(vid);

  const FPS_PROBE_SAMPLES = 30;
  const times   = [];

  function onFrame(now, metadata) {
    times.push(metadata.mediaTime);
    if (times.length < FPS_PROBE_SAMPLES + 1) {
      vid.requestVideoFrameCallback(onFrame);
    } else {
      vid.pause();
      URL.revokeObjectURL(vid.src);
      vid.remove();
      const intervals = [];
      for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      const fps = Math.round(1 / avg);
      fpsInput.placeholder = `Source: ${fps} FPS`;
    }
  }

  vid.addEventListener('loadedmetadata', () => {
    vid.play().then(() => vid.requestVideoFrameCallback(onFrame)).catch(() => {
      URL.revokeObjectURL(vid.src);
      vid.remove();
      fpsInput.placeholder = 'Same as source';
    });
  }, { once: true });

  vid.addEventListener('error', () => {
    URL.revokeObjectURL(vid.src);
    vid.remove();
    fpsInput.placeholder = 'Same as source';
  }, { once: true });
}

// ── Build per-character alpha mask LUT ───────────────────────────────────────
// Returns Float32Array of shape [nChars][ch][cw], plus measured cw/ch.
function buildCharMaskLUT(fontSize, fontFamily, asciiChars) {
  const fontStr = `${fontSize}px "${fontFamily}", Courier, monospace`;

  // Measure char cell dimensions
  const probe = new OffscreenCanvas(64, 64);
  const pctx  = probe.getContext('2d');
  pctx.font   = fontStr;
  const m        = pctx.measureText('A', true);
  const cw       = Math.max(1, Math.ceil(m.width));
  const ascent   = Math.ceil(m.actualBoundingBoxAscent)  || Math.ceil(fontSize * 0.8);
  const descent  = Math.ceil(m.actualBoundingBoxDescent) || Math.ceil(fontSize * 0.2);
  const ch       = Math.max(1, ascent + descent);

  const n   = asciiChars.length;
  const lut = new Float32Array(n * ch * cw);

  for (let i = 0; i < n; i++) {
    const mc   = new OffscreenCanvas(cw, ch);
    const mctx = mc.getContext('2d');
    mctx.fillStyle = 'black';
    mctx.fillRect(0, 0, cw, ch);
    mctx.fillStyle = 'white';
    mctx.font      = fontStr;
    mctx.fillText(asciiChars[i], 0, ascent);
    const px  = mctx.getImageData(0, 0, cw, ch, undefined, true).data;
    const off = i * ch * cw;
    for (let p = 0; p < cw * ch; p++) {
      lut[off + p] = px[p * 4] / 255;  // red channel suffices (grayscale mask)
    }
  }

  return { lut, cw, ch };
}

// ── ASCII frame renderer ──────────────────────────────────────────────────────
// Reads srcCtx (already scaled to asciiW×asciiH), writes to outCtx.
// Uses ImageData typed-array math — no per-char fillText calls.
function renderAsciiFrame(srcCtx, outCtx, grayscale, asciiChars, charInfo) {
  const { lut, cw, ch } = charInfo;
  const nChars = asciiChars.length;
  const scale  = (nChars - 1) / 255;

  const sw = srcCtx.canvas.width;
  const sh = srcCtx.canvas.height;
  const ow = sw * cw;
  const oh = sh * ch;

  const srcPx  = srcCtx.getImageData(0, 0, sw, sh, undefined, true).data;
  const outImg = outCtx.createImageData(ow, oh);
  const out    = outImg.data;

  // Pre-fill alpha channel
  for (let i = 3; i < out.length; i += 4) out[i] = 255;

  for (let row = 0; row < sh; row++) {
    for (let col = 0; col < sw; col++) {
      const si = (row * sw + col) * 4;
      const r  = srcPx[si];
      const g  = srcPx[si + 1];
      const b  = srcPx[si + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const idx  = Math.min(Math.floor(gray * scale), nChars - 1);

      const fr = grayscale ? 255 : r;
      const fg = grayscale ? 255 : g;
      const fb = grayscale ? 255 : b;

      const maskBase = idx * ch * cw;
      const dstRowPx = row * ch * ow;
      const dstColPx = col * cw;

      for (let cy = 0; cy < ch; cy++) {
        const dstBase  = (dstRowPx + cy * ow + dstColPx) * 4;
        const maskRow  = maskBase + cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          const mask = lut[maskRow + cx];
          if (mask > 0) {
            const oi     = dstBase + cx * 4;
            out[oi]     = (fr * mask + 0.5) | 0;
            out[oi + 1] = (fg * mask + 0.5) | 0;
            out[oi + 2] = (fb * mask + 0.5) | 0;
          }
        }
      }
    }
  }

  outCtx.putImageData(outImg, 0, 0);
}

// ── Main conversion ───────────────────────────────────────────────────────────
convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  convertBtn.disabled  = true;
  abortBtn.style.display = 'inline-block';
  abortRequested = false;
  downloadArea.innerHTML = '';
  audioWarning.style.display = 'none';
  progressBar.style.display  = 'block';
  progressFill.style.width   = '0%';
  statusText.textContent      = 'Initializing…';

  const settings = {
    asciiWidth : Math.max(1, parseInt(document.getElementById('asciiWidth').value) || 120),
    fontSize   : Math.max(6, parseInt(document.getElementById('fontSize').value)   || 10),
    fontFamily : document.getElementById('fontFamily').value.trim() || 'Courier New',
    asciiChars : document.getElementById('asciiChars').value || ' .:-=+*#%@',
    grayscale  : document.getElementById('grayscale').checked,
    keepAudio  : document.getElementById('keepAudio').checked,
    outputFps  : parseInt(document.getElementById('outputFps').value) || null,
  };
  settings.asciiChars = settings.asciiChars.split('').reverse().join('');

  try {
    if (selectedFile.type.startsWith('image/')) {
      await convertImage(selectedFile, settings);
    } else {
      const { url, mimeType } = await runConversion(selectedFile, settings);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const a   = document.createElement('a');
      a.href      = url;
      a.download  = `ascii_output.${ext}`;
      a.className = 'download-btn';
      a.textContent = `Download ascii_output.${ext}`;
      downloadArea.appendChild(a);
      statusText.textContent = 'Done!';
      showPlayer(url);
    }
  } catch (err) {
    if (err.message === 'aborted') {
      statusText.textContent = 'Conversion aborted.';
    } else {
      statusText.textContent = `Error: ${err.message}`;
      console.error(err);
    }
  }

  abortBtn.style.display = 'none';
  convertBtn.disabled = false;
});

// ── Image conversion ─────────────────────────────────────────────────────────
async function convertImage(file, settings) {
  const { asciiWidth, fontSize, fontFamily, asciiChars, grayscale } = settings;

  statusText.textContent = 'Building font masks…';
  const charInfo = buildCharMaskLUT(fontSize, fontFamily, asciiChars);
  const { cw, ch } = charInfo;
  const aspectCorrection = cw / ch;

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    img.onload  = resolve;
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = objectUrl;
  });

  const asciiH = Math.max(1, Math.round(asciiWidth * (img.naturalHeight / img.naturalWidth) * aspectCorrection));
  const outW   = asciiWidth * cw;
  const outH   = asciiH    * ch;

  const srcCanvas = new OffscreenCanvas(asciiWidth, asciiH);
  const srcCtx    = srcCanvas.getContext('2d', { willReadFrequently: true });
  srcCtx.drawImage(img, 0, 0, asciiWidth, asciiH);
  URL.revokeObjectURL(objectUrl);

  previewCanvas.width  = outW;
  previewCanvas.height = outH;
  previewPanel.style.display = 'block';
  previewCanvas.style.display = 'block';
  document.getElementById('playerWrap').style.display = 'none';
  document.getElementById('previewTitle').textContent = 'Output Preview';
  const outCtx = previewCanvas.getContext('2d');

  statusText.textContent = 'Rendering…';
  renderAsciiFrame(srcCtx, outCtx, grayscale, asciiChars, charInfo);

  progressFill.style.width = '100%';

  const quality = 1.0; // default for toBlob('image/jpeg'); ignored for PNG
  const blob = await new Promise(resolve => previewCanvas.toBlob(resolve, 'image/png', quality, true));
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href      = url;
  a.download  = 'ascii_output.png';
  a.className = 'download-btn';
  a.textContent = 'Download ascii_output.png';
  downloadArea.appendChild(a);
  statusText.textContent = 'Done!';
}

// ── Output player ────────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

function showPlayer(blobUrl) {
  const vid      = document.getElementById('outputVideo');
  const playerWrap = document.getElementById('playerWrap');
  const playBtn  = document.getElementById('playBtn');
  const muteBtn  = document.getElementById('muteBtn');
  const volSlider= document.getElementById('volSlider');
  const seekWrap = document.getElementById('seekWrap');
  const seekFill = document.getElementById('seekFill');
  const seekThumb= document.getElementById('seekThumb');
  const timeCur  = document.getElementById('timeCurrent');
  const timeDur  = document.getElementById('timeDuration');
  const fsBtn    = document.getElementById('fsBtn');

  previewCanvas.style.display = 'none';
  playerWrap.style.display    = 'block';
  document.getElementById('previewTitle').textContent = 'Output Preview';

  vid.src = blobUrl;
  vid.load();

  vid.addEventListener('loadedmetadata', () => {
    timeDur.textContent = formatTime(vid.duration);
  });

  vid.addEventListener('timeupdate', () => {
    const pct = vid.duration ? (vid.currentTime / vid.duration) * 100 : 0;
    seekFill.style.width       = `${pct}%`;
    seekThumb.style.left       = `${pct}%`;
    timeCur.textContent        = formatTime(vid.currentTime);
  });

  vid.addEventListener('play',  () => { playBtn.innerHTML = '&#9646;&#9646;'; });
  vid.addEventListener('pause', () => { playBtn.innerHTML = '&#9654;'; });
  vid.addEventListener('ended', () => { playBtn.innerHTML = '&#9654;'; });

  playBtn.onclick = () => { vid.paused ? vid.play() : vid.pause(); };
  vid.addEventListener('click', () => { vid.paused ? vid.play() : vid.pause(); });

  muteBtn.onclick = () => {
    vid.muted = !vid.muted;
    muteBtn.innerHTML = vid.muted ? '&#128263;' : '&#128264;';
    volSlider.value   = vid.muted ? 0 : vid.volume;
  };

  volSlider.oninput = () => {
    vid.volume  = parseFloat(volSlider.value);
    vid.muted   = vid.volume === 0;
    muteBtn.innerHTML = vid.muted ? '&#128263;' : '&#128264;';
  };

  // Seek bar — click and drag
  let seeking = false;
  function applySeek(e) {
    const rect = seekWrap.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pct * vid.duration;
  }
  seekWrap.addEventListener('mousedown',  e => { seeking = true; applySeek(e); });
  document.addEventListener('mousemove',  e => { if (seeking) applySeek(e); });
  document.addEventListener('mouseup',    () => { seeking = false; });
  seekWrap.addEventListener('touchstart', e => { seeking = true;  applySeek(e.touches[0]); }, { passive: true });
  document.addEventListener('touchmove',  e => { if (seeking) applySeek(e.touches[0]); }, { passive: true });
  document.addEventListener('touchend',   () => { seeking = false; });

  fsBtn.onclick = () => {
    const wrap = document.querySelector('.player-wrap');
    if (!document.fullscreenElement) {
      wrap.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };
}

async function runConversion(file, settings) {
  const { asciiWidth, fontSize, fontFamily, asciiChars, grayscale, keepAudio, outputFps } = settings;

  // Build LUT (once per conversion — recomputed if font/chars changed)
  statusText.textContent = 'Building font masks…';
  const charInfo = buildCharMaskLUT(fontSize, fontFamily, asciiChars);
  const { cw, ch } = charInfo;

  // Aspect correction: char cells are taller than wide, so we scale height down accordingly
  const aspectCorrection = cw / ch;

  // Create and load the video element
  const video         = document.createElement('video');
  video.src           = URL.createObjectURL(file);
  video.muted         = true;   // silences local output; captureStream() still carries audio
  video.playsInline   = true;
  video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;top:0;left:0;';
  document.body.appendChild(video);

  await new Promise((resolve, reject) => {
    video.addEventListener('loadedmetadata', resolve, { once: true });
    video.addEventListener('error', () => reject(new Error('Failed to load video.')), { once: true });
  });

  const vw     = video.videoWidth;
  const vh     = video.videoHeight;
  const asciiH = Math.max(1, Math.round(asciiWidth * (vh / vw) * aspectCorrection));
  const outW   = asciiWidth * cw;
  const outH   = asciiH    * ch;

  // Source canvas: small, pixel-sampled per frame
  const srcCanvas = new OffscreenCanvas(asciiWidth, asciiH);
  const srcCtx    = srcCanvas.getContext('2d', { willReadFrequently: true });

  // Output canvas: full resolution ASCII render (also shown as preview)
  previewCanvas.width  = outW;
  previewCanvas.height = outH;
  previewPanel.style.display = 'block';
  const outCtx = previewCanvas.getContext('2d');

  // Determine supported MIME type
  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

  // Build the MediaRecorder stream: canvas video + optional audio
  const canvasStream = previewCanvas.captureStream(0); // 0 = we call requestFrame() manually

  if (keepAudio) {
    try {
      const srcStream  = video.captureStream();
      const audioTrack = srcStream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      } else {
        audioWarning.style.display = 'block';
      }
    } catch (e) {
      console.warn('Audio capture failed:', e);
      audioWarning.style.display = 'block';
    }
  }

  const videoBitsPerSecond = 16_000_000;
  const audioBitsPerSecond = keepAudio ? 192_000 : 0;
  const recorder = new MediaRecorder(canvasStream, { 
    mimeType, 
    videoBitsPerSecond: videoBitsPerSecond, 
    audioBitsPerSecond: audioBitsPerSecond 
});
  const chunks   = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  // Check for requestVideoFrameCallback support
  if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
    video.remove();
    throw new Error('Your browser does not support requestVideoFrameCallback. Please use Chrome or Edge.');
  }

  recorder.start();
  video.play();
  statusText.textContent = 'Converting…';

  await new Promise(resolve => {
    const canvasVideoTrack = canvasStream.getVideoTracks()[0];
    const minFrameInterval = outputFps ? 1 / outputFps : 0;
    let lastCapturedTime   = -Infinity;

    function onFrame(now, metadata) {
      const mediaTime = metadata.mediaTime;
      const elapsed   = mediaTime - lastCapturedTime;

      if (elapsed >= minFrameInterval) {
        lastCapturedTime = mediaTime;
        srcCtx.drawImage(video, 0, 0, asciiWidth, asciiH);
        renderAsciiFrame(srcCtx, outCtx, grayscale, asciiChars, charInfo);

        if (canvasVideoTrack && canvasVideoTrack.requestFrame) {
          canvasVideoTrack.requestFrame();
        }
      }

      const progress = video.duration > 0 ? video.currentTime / video.duration : 0;
      progressFill.style.width   = `${Math.round(progress * 100)}%`;
      statusText.textContent     = `Converting… ${Math.round(progress * 100)}%`;

      const done = video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.05);
      if (abortRequested) {
        recorder.stop();
        reject(new Error('aborted'));
        // TODO: reset everything to allow new conversion without page reload
      } else if (!done) {
        video.requestVideoFrameCallback(onFrame);
      } else {
        recorder.stop();
        resolve();
      }
    }

    video.requestVideoFrameCallback(onFrame);
  });

  // Wait for recorder to flush
  await new Promise(r => recorder.addEventListener('stop', r, { once: true }));

  URL.revokeObjectURL(video.src);
  video.remove();

  progressFill.style.width = '100%';
  return { url: URL.createObjectURL(new Blob(chunks, { type: mimeType })), mimeType };
}