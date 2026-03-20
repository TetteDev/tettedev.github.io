(function () {
/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-layout.js
 *  Layout Web Components
 *
 *  Elements: fa-body · fa-div · fa-section · fa-header
 *            fa-nav  · fa-footer · fa-sidebar
 *
 *  Requires: fa-design-system.css loaded in the document.
 *  CSS custom properties (--fa-*) inherit across shadow
 *  boundaries automatically — no extra imports needed here.
 * ============================================================
 */

/* ─────────────────────────────────────────────────────────────
   SHARED KEYFRAMES
   Injected into every shadow root that needs animation.
   (Keyframe rules do NOT inherit across shadow boundaries.)
   ───────────────────────────────────────────────────────────── */

const _FA_KF = `
  @keyframes fa-float {
    0%, 100% { transform: translateY(0)     scale(1);     }
    50%       { transform: translateY(-16px) scale(1.025); }
  }
  @keyframes fa-float-slow {
    0%, 100% { transform: translateY(0)    scale(1);    }
    50%       { transform: translateY(-10px) scale(1.02); }
  }
  @keyframes fa-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

window["FA_KF"] = typeof window["FA_KF"] === "undefined" ? _FA_KF : window["FA_KF"];


/* ═══════════════════════════════════════════════════════════════
   1.  FA-BODY
   Full-page wrapper. Applies the sky gradient backdrop, ambient
   bokeh blobs, font stack, and resets html/body margins.

   Usage:
     <fa-body>
       <fa-header>…</fa-header>
       <main>…</main>
       <fa-footer>…</fa-footer>
     </fa-body>
   ═══════════════════════════════════════════════════════════════ */
class FABody extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    /* Reset host document so <fa-body> can fill the viewport */
    if (!document.head.querySelector('[data-fa-reset]')) {
      const s = document.createElement('style');
      s.dataset.faReset = '';
      s.textContent = `html,body{margin:0;padding:0;min-height:100%;background:#c9e8f7;}`;
      document.head.appendChild(s);
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}

        :host {
          display: block;
          min-height: 100vh;
          font-family: var(--fa-font-family, 'Source Sans 3', 'Segoe UI', Arial, sans-serif);
          color: var(--fa-text-dark, #1A3A4A);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(
            --fa-grad-sky,
            linear-gradient(160deg, #c9e8f7 0%, #dff2e4 35%, #b8daf5 65%, #d4eef8 100%)
          );
          position: relative;
          overflow-x: hidden;
        }

        /* ── Ambient bokeh blob layer ────────────────── */
        .blobs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(72px);
          will-change: transform;
          animation: fa-float var(--_d, 12s) ease-in-out infinite;
          animation-delay: var(--_del, 0s);
        }

        .b1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle at 40% 40%, rgba(6,137,228,0.30) 0%, transparent 62%);
          top: -200px; left: -140px;
          --_d: 13s;
        }
        .b2 {
          width: 480px; height: 480px;
          background: radial-gradient(circle at 60% 60%, rgba(124,179,66,0.24) 0%, transparent 62%);
          top: 36%; right: -160px;
          --_d: 16s; --_del: -5s;
        }
        .b3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle at 50% 50%, rgba(251,185,5,0.18) 0%, transparent 62%);
          bottom: 6%; left: 22%;
          --_d: 19s; --_del: -9s;
        }
        .b4 {
          width: 320px; height: 320px;
          background: radial-gradient(circle at 40% 60%, rgba(58,159,213,0.20) 0%, transparent 62%);
          bottom: 28%; right: 8%;
          --_d: 22s; --_del: -14s;
        }

        /* ── Main content layer ──────────────────────── */
        .content {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      </style>

      <div class="blobs" aria-hidden="true">
        <div class="blob b1"></div>
        <div class="blob b2"></div>
        <div class="blob b3"></div>
        <div class="blob b4"></div>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('fa-body', FABody);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-DIV
   Generic glass/glossy container. The workhorse layout box.

   Attributes:
     variant  — glass (default) | glossy | blue | green | amber | solid | bare
     pad      — none | sm | md (default) | lg | xl
     radius   — sm | md (default) | lg | xl | pill
     hover    — (boolean) adds a subtle lift on :hover

   Usage:
     <fa-div variant="glass" pad="lg">…</fa-div>
     <fa-div variant="glossy" hover>…</fa-div>
   ═══════════════════════════════════════════════════════════════ */
class FADiv extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'pad', 'radius', 'hover'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant = this.getAttribute('variant') || 'glass';
    const pad     = this.getAttribute('pad')     || 'md';
    const radius  = this.getAttribute('radius')  || 'md';
    const hover   = this.hasAttribute('hover');

    /* ─ Padding map ─ */
    const padMap = {
      none: '0',
      sm:   '12px',
      md:   '24px',
      lg:   '32px',
      xl:   '48px',
    };

    /* ─ Radius map ─ */
    const radMap = {
      sm:   '6px',
      md:   '12px',
      lg:   '20px',
      xl:   '32px',
      pill: '9999px',
    };

    /* ─ Per-variant background gradient ─ */
    const bgMap = {
      glass:  `linear-gradient(145deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.28) 55%, rgba(200,235,255,0.22) 100%)`,
      glossy: `linear-gradient(180deg, #eaf7ff 0%, #cde9f8 48.5%, #aed5f0 49%, #cae5f7 100%)`,
      blue:   `linear-gradient(145deg, rgba(180,225,255,0.60) 0%, rgba(100,185,240,0.26) 55%, rgba(6,137,228,0.14) 100%)`,
      green:  `linear-gradient(145deg, rgba(205,242,168,0.58) 0%, rgba(148,208,95,0.24) 55%, rgba(100,175,50,0.14) 100%)`,
      amber:  `linear-gradient(145deg, rgba(255,238,160,0.62) 0%, rgba(251,185,5,0.22)  55%, rgba(213,152,10,0.14) 100%)`,
      solid:  `linear-gradient(145deg, rgba(58,159,213,0.22) 0%, rgba(6,137,228,0.10) 100%)`,
      bare:   `transparent`,
    };

    /* ─ Per-variant border ─ */
    const borderMap = {
      glass:  `1px solid rgba(255,255,255,0.65)`,
      glossy: `1px solid rgba(255,255,255,0.88)`,
      blue:   `1px solid rgba(6,137,228,0.35)`,
      green:  `1px solid rgba(124,179,66,0.30)`,
      amber:  `1px solid rgba(251,185,5,0.40)`,
      solid:  `1px solid rgba(6,137,228,0.28)`,
      bare:   `none`,
    };

    /* ─ Per-variant box-shadow ─ */
    const shadowMap = {
      glass:  `0 2px 6px rgba(0,50,100,0.13), 0 4px 18px rgba(0,80,180,0.09), inset 0 1px 0 rgba(255,255,255,0.72)`,
      glossy: `0 4px 14px rgba(0,60,140,0.18), 0 8px 30px rgba(0,80,200,0.11), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
      blue:   `0 2px 8px rgba(0,80,180,0.14), 0 4px 20px rgba(6,137,228,0.10), inset 0 1px 0 rgba(255,255,255,0.55)`,
      green:  `0 2px 8px rgba(60,130,30,0.12), 0 4px 20px rgba(100,175,50,0.09), inset 0 1px 0 rgba(255,255,255,0.55)`,
      amber:  `0 2px 8px rgba(180,130,0,0.14), 0 4px 20px rgba(251,185,5,0.12),  inset 0 1px 0 rgba(255,255,255,0.60)`,
      solid:  `0 2px 8px rgba(0,80,180,0.14),  inset 0 1px 0 rgba(255,255,255,0.50)`,
      bare:   `none`,
    };

    const v   = bgMap[variant]    ? variant : 'glass';
    const r   = radMap[radius]    ? radius  : 'md';
    const p   = padMap[pad]       ? pad     : 'md';
    const useBlur  = (v !== 'glossy' && v !== 'bare');
    const useGloss = (v !== 'bare');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .panel {
          position: relative;
          border-radius: ${radMap[r]};
          overflow: hidden;
          background: ${bgMap[v]};
          ${useBlur ? `backdrop-filter: blur(14px) saturate(1.6);
          -webkit-backdrop-filter: blur(14px) saturate(1.6);` : ''}
          border: ${borderMap[v]};
          box-shadow: ${shadowMap[v]};
          transition: box-shadow 220ms ease, transform 220ms ease;
        }

        ${useGloss ? `
        /* Top-half gloss sheen — the signature FA highlight */
        .panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          border-radius: ${radMap[r]} ${radMap[r]} 0 0;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.44) 0%,
            rgba(255,255,255,0.02) 100%
          );
          pointer-events: none;
          z-index: 0;
        }` : ''}

        .inner {
          position: relative;
          z-index: 1;
          padding: ${padMap[p]};
        }

        ${hover ? `
        .panel:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,50,120,0.20),
                      0 16px 48px rgba(0,80,200,0.14),
                      inset 0 1px 0 rgba(255,255,255,0.82);
        }
        :host { cursor: pointer; }` : ''}
      </style>

      <div class="panel" part="panel">
        <div class="inner" part="inner">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
customElements.define('fa-div', FADiv);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-SECTION
   Semantic section wrapper. Glass pane with a coloured accent
   stripe on top and an optional labelled heading.

   Attributes:
     title  — text shown as a section heading (optional)
     accent — blue (default) | green | amber | none

   Usage:
     <fa-section title="Cloud Features" accent="blue">…</fa-section>
   ═══════════════════════════════════════════════════════════════ */
class FASection extends HTMLElement {
  static get observedAttributes() { return ['title', 'accent']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const title  = this.getAttribute('title')  || '';
    const accent = this.getAttribute('accent') || 'blue';

    const accentGrads = {
      blue:  `linear-gradient(90deg, #0689E4 0%, #3A9FD5 100%)`,
      green: `linear-gradient(90deg, #7CB342 0%, #B8D67A 100%)`,
      amber: `linear-gradient(90deg, #FBB905 0%, #F5A623 100%)`,
      none:  `transparent`,
    };
    const dotGlows = {
      blue:  `0 0 8px rgba(6,137,228,0.65)`,
      green: `0 0 8px rgba(124,179,66,0.55)`,
      amber: `0 0 8px rgba(251,185,5,0.65)`,
      none:  `none`,
    };

    const grad = accentGrads[accent] || accentGrads.blue;
    const glow = dotGlows[accent]    || dotGlows.blue;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        section {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.64) 0%,
            rgba(255,255,255,0.26) 55%,
            rgba(200,235,255,0.20) 100%
          );
          backdrop-filter: blur(16px) saturate(1.7);
          -webkit-backdrop-filter: blur(16px) saturate(1.7);
          border: 1px solid rgba(255,255,255,0.68);
          box-shadow:
            0 4px 14px rgba(0,50,120,0.14),
            0 10px 36px rgba(0,80,200,0.10),
            inset 0 1px 0 rgba(255,255,255,0.78);
        }

        /* Top-half gloss sheen */
        section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 44%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.48) 0%,
            rgba(255,255,255,0.02) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Coloured accent stripe */
        .accent-bar {
          height: 3px;
          background: ${grad};
          flex-shrink: 0;
        }

        .inner {
          position: relative;
          z-index: 1;
          padding: 32px;
        }

        /* Optional title row */
        .section-title {
          font-family: var(--fa-font-family, 'Source Sans 3', sans-serif);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--fa-text-dark, #1A3A4A);
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.01em;
        }

        /* Glowing dot beside title */
        .title-dot {
          display: inline-block;
          width: 9px; height: 9px;
          border-radius: 50%;
          background: ${grad};
          box-shadow: ${glow};
          flex-shrink: 0;
        }
      </style>

      <section>
        ${accent !== 'none' ? `<div class="accent-bar"></div>` : ''}
        <div class="inner">
          ${title ? `
            <div class="section-title">
              <span class="title-dot"></span>
              ${title}
            </div>` : ''}
          <slot></slot>
        </div>
      </section>
    `;
  }
}
customElements.define('fa-section', FASection);


/* ═══════════════════════════════════════════════════════════════
   4.  FA-HEADER
   Sticky frosted Aero glass top bar. The Vista window-chrome
   look applied to a page header.

   Slots:
     brand   — logo, wordmark, or app title
     nav     — navigation component (e.g. <fa-nav>)
     actions — right-side actions (buttons, user avatar, etc.)

   Attributes:
     sticky  — "false" to disable sticky positioning (default: true)
     height  — CSS length, default "64px"

   Usage:
     <fa-header>
       <span slot="brand">AeroApp</span>
       <fa-nav slot="nav">…</fa-nav>
       <fa-button slot="actions">Sign in</fa-button>
     </fa-header>
   ═══════════════════════════════════════════════════════════════ */
class FAHeader extends HTMLElement {
  static get observedAttributes() { return ['sticky', 'height']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const sticky = this.getAttribute('sticky') !== 'false';
    const height = this.getAttribute('height') || '64px';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          ${sticky ? 'position: sticky; top: 0;' : 'position: relative;'}
          z-index: 500;
        }

        header {
          position: relative;
          display: flex;
          align-items: center;
          height: ${height};
          padding: 0 32px;
          gap: 24px;

          /* ── Frosted Aero chrome ── */
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.90) 0%,
            rgba(212,240,255,0.76) 100%
          );
          backdrop-filter: blur(22px) saturate(1.9);
          -webkit-backdrop-filter: blur(22px) saturate(1.9);
          border-bottom: 1px solid rgba(255,255,255,0.72);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.95),
            0 2px 20px rgba(0,80,180,0.14),
            0 1px 4px  rgba(0,50,100,0.10);
        }

        /* Upper gloss highlight band */
        header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 48%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.58) 0%,
            rgba(255,255,255,0.04) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Bottom iridescent shimmer line */
        header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1.5px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(6,137,228,0.55) 18%,
            rgba(100,200,255,0.70) 40%,
            rgba(124,179,66,0.50) 68%,
            transparent 100%
          );
          z-index: 0;
        }

        .brand, .nav-zone, .actions {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
        }
        .brand   { flex-shrink: 0; }
        .nav-zone { flex: 1; }
        .actions { flex-shrink: 0; gap: 8px; }

        /* Default brand text style for simple text nodes */
        ::slotted([slot="brand"]) {
          font-family: var(--fa-font-family, 'Source Sans 3', sans-serif);
          font-size: 1.18rem;
          font-weight: 700;
          color: var(--fa-text-dark, #1A3A4A);
          text-decoration: none;
          white-space: nowrap;
          letter-spacing: -0.02em;
        }
      </style>

      <header part="header">
        <div class="brand">
          <slot name="brand"></slot>
        </div>
        <div class="nav-zone">
          <slot name="nav"></slot>
        </div>
        <div class="actions">
          <slot name="actions"></slot>
        </div>
      </header>
    `;
  }
}
customElements.define('fa-header', FAHeader);


/* ═══════════════════════════════════════════════════════════════
   5.  FA-NAV
   Horizontal navigation strip. Drop <a> tags (or anything)
   directly as children — they're styled automatically.

   Attributes:
     variant — bar (default) | pills | ghost

   Usage:
     <fa-nav>
       <a href="/" class="active">Home</a>
       <a href="/about">About</a>
       <a href="/blog">Blog</a>
     </fa-nav>
   ═══════════════════════════════════════════════════════════════ */
class FANav extends HTMLElement {
  static get observedAttributes() { return ['variant']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const v = this.getAttribute('variant') || 'bar';

    /* ─ Wrapper background per variant ─ */
    const wrapBg = {
      bar: `
        background: linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(210,240,255,0.65) 100%);
        backdrop-filter: blur(16px) saturate(1.7);
        -webkit-backdrop-filter: blur(16px) saturate(1.7);
        border: 1px solid rgba(255,255,255,0.65);
        border-radius: 9999px;
        padding: 4px 6px;
        box-shadow: 0 1px 8px rgba(0,50,120,0.12), inset 0 1px 0 rgba(255,255,255,0.80);
      `,
      pills: `background: transparent; padding: 0 2px;`,
      ghost: `
        background: rgba(255,255,255,0.28);
        backdrop-filter: blur(10px) saturate(1.5);
        -webkit-backdrop-filter: blur(10px) saturate(1.5);
        border: 1px solid rgba(255,255,255,0.48);
        border-radius: 16px;
        padding: 4px 6px;
        box-shadow: 0 1px 6px rgba(0,50,120,0.08), inset 0 1px 0 rgba(255,255,255,0.55);
      `,
    };

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        nav {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          ${wrapBg[v] || wrapBg.bar}
        }

        /* ─ Default item style ─ */
        ::slotted(a),
        ::slotted(button) {
          display: inline-flex;
          align-items: center;
          padding: 6px 18px;
          border-radius: 9999px;
          font-family: var(--fa-font-family, 'Source Sans 3', sans-serif);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--fa-text-mid, #2E5E72);
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease;
          outline: none;
        }

        /* ─ Hover ─ */
        ::slotted(a:hover),
        ::slotted(button:hover) {
          background: linear-gradient(180deg,
            rgba(255,255,255,0.88) 0%,
            rgba(210,240,255,0.68) 100%
          );
          color: var(--fa-blue-deep, #0032DB);
          box-shadow: 0 1px 6px rgba(0,80,180,0.16), inset 0 1px 0 rgba(255,255,255,0.80);
        }

        /* ─ Active / current ─ */
        ::slotted(a.active),
        ::slotted(a[aria-current="page"]),
        ::slotted(button.active) {
          background: linear-gradient(180deg,
            #5cc8f5 0%,
            #1a9de0 48%,
            #0678c1 49%,
            #0a8fd6 100%
          );
          color: #fff;
          box-shadow:
            0 2px 8px rgba(0,80,180,0.32),
            inset 0 1px 0 rgba(255,255,255,0.45);
          text-shadow: 0 1px 2px rgba(0,40,100,0.30);
        }

        /* ─ Focus ring ─ */
        ::slotted(a:focus-visible),
        ::slotted(button:focus-visible) {
          box-shadow: 0 0 0 3px rgba(6,137,228,0.45), 0 0 0 1px rgba(6,137,228,0.80);
        }
      </style>

      <nav part="nav">
        <slot></slot>
      </nav>
    `;
  }
}
customElements.define('fa-nav', FANav);


/* ═══════════════════════════════════════════════════════════════
   6.  FA-FOOTER
   Glass footer with a three-zone layout: logo · links · copyright.
   Falls back gracefully to a single default slot if no named
   slots are provided.

   Slots:
     logo  — brand mark / wordmark
     links — footer navigation links
     copy  — copyright / legal text
     (default) — free-form content occupying the full width

   Usage:
     <fa-footer>
       <span slot="logo">AeroApp</span>
       <a slot="links" href="/">Home</a>
       <a slot="links" href="/privacy">Privacy</a>
       <span slot="copy">© 2026 AeroApp</span>
     </fa-footer>
   ═══════════════════════════════════════════════════════════════ */
class FAFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: auto;
        }

        footer {
          position: relative;
          overflow: hidden;
          padding: 32px 32px 24px;
          background: linear-gradient(
            180deg,
            rgba(202,232,248,0.80) 0%,
            rgba(180,218,242,0.92) 100%
          );
          backdrop-filter: blur(18px) saturate(1.7);
          -webkit-backdrop-filter: blur(18px) saturate(1.7);
          border-top: 1px solid rgba(255,255,255,0.68);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.84),
            0 -2px 20px rgba(0,60,140,0.10);
        }

        /* Top gloss sheen */
        footer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.44) 0%,
            rgba(255,255,255,0.02) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Top accent line */
        footer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1.5px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(6,137,228,0.55) 18%,
            rgba(100,200,255,0.68) 45%,
            rgba(124,179,66,0.48) 70%,
            transparent 100%
          );
          z-index: 1;
        }

        .grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 24px;
        }

        .logo-zone  { display: flex; align-items: center; }
        .links-zone { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px 8px; }
        .copy-zone  { display: flex; align-items: center; }

        .default-zone {
          position: relative;
          z-index: 1;
        }

        /* Link styling */
        ::slotted(a) {
          font-family: var(--fa-font-family, 'Source Sans 3', sans-serif);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--fa-text-mid, #2E5E72);
          text-decoration: none;
          padding: 3px 10px;
          border-radius: 9999px;
          transition: color 160ms ease, background 160ms ease;
        }
        ::slotted(a:hover) {
          color: var(--fa-blue-sky, #0689E4);
          background: rgba(6,137,228,0.09);
        }

        /* Text styling */
        ::slotted(span),
        ::slotted(p) {
          font-family: var(--fa-font-family, 'Source Sans 3', sans-serif);
          font-size: 0.82rem;
          color: var(--fa-text-light, #5F8FA3);
        }

        /* Logo / brand text */
        ::slotted([slot="logo"]) {
          font-family: var(--fa-font-family, 'Source Sans 3', sans-serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--fa-text-dark, #1A3A4A);
          letter-spacing: -0.01em;
        }

        @media (max-width: 600px) {
          .grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
          }
          .logo-zone, .links-zone, .copy-zone {
            justify-content: center;
          }
        }
      </style>

      <footer part="footer">
        <div class="grid">
          <div class="logo-zone">
            <slot name="logo"></slot>
          </div>
          <div class="links-zone">
            <slot name="links"></slot>
          </div>
          <div class="copy-zone">
            <slot name="copy"></slot>
          </div>
        </div>
        <div class="default-zone">
          <slot></slot>
        </div>
      </footer>
    `;
  }
}
customElements.define('fa-footer', FAFooter);


/* ═══════════════════════════════════════════════════════════════
   7.  FA-SIDEBAR
   Glassmorphic side panel. Works in both flow layout (inside a
   flex row) and as a fixed overlay.

   Attributes:
     side        — left (default) | right
     width       — CSS length, default "280px"
     fixed       — (boolean) enables fixed positioning
     collapsible — (boolean) adds a collapse toggle button

   Usage:
     <div style="display:flex; min-height:100vh;">
       <fa-sidebar collapsible>
         <p>Sidebar content</p>
       </fa-sidebar>
       <main>…</main>
     </div>
   ═══════════════════════════════════════════════════════════════ */
class FASidebar extends HTMLElement {
  static get observedAttributes() {
    return ['side', 'width', 'fixed', 'collapsible', 'collapsed'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const side        = this.getAttribute('side')  || 'left';
    const width       = this.getAttribute('width') || '280px';
    const isFixed     = this.hasAttribute('fixed');
    const collapsed   = this.hasAttribute('collapsed');
    const collapsible = this.hasAttribute('collapsible');

    /* Direction of gloss sheen depends on side */
    const glossDir    = side === 'right' ? '270deg' : '90deg';
    const borderSide  = side === 'right' ? 'left' : 'right';
    const shadowSide  = side === 'right'
      ? '-4px 0 28px rgba(0,60,140,0.13), inset -1px 0 0 rgba(255,255,255,0.65)'
      : '4px 0 28px rgba(0,60,140,0.13),  inset  1px 0 0 rgba(255,255,255,0.65)';
    const togglePos   = side === 'right' ? 'left: -20px;' : 'right: -20px;';

    /* Toggle icon direction flips based on collapsed state + side */
    const toggleIcon = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="${collapsed ? (side === 'right' ? '15 18 9 12 15 6' : '9 18 15 12 9 6') : (side === 'right' ? '9 18 15 12 9 6' : '15 18 9 12 15 6')}"></polyline>
      </svg>`;

    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}

        :host {
          display: block;
          width: ${collapsed ? '0' : width};
          min-width: ${collapsed ? '0' : 'unset'};
          flex-shrink: 0;
          overflow: hidden;
          transition: width 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          ${isFixed ? `position: fixed; top: 0; ${side}: 0; height: 100vh; z-index: 400;` : ''}
        }

        aside {
          position: relative;
          width: ${width};
          height: 100%;
          min-height: 100%;
          overflow: hidden;
          overflow-y: auto;

          background: linear-gradient(
            ${glossDir},
            rgba(235,248,255,0.82) 0%,
            rgba(255,255,255,0.62) 55%,
            rgba(220,240,255,0.52) 100%
          );
          backdrop-filter: blur(18px) saturate(1.7);
          -webkit-backdrop-filter: blur(18px) saturate(1.7);
          border-${borderSide}: 1px solid rgba(255,255,255,0.68);
          box-shadow: ${shadowSide};
        }

        /* Vertical gloss stripe along the bright edge */
        aside::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          ${side === 'right' ? 'right: 0;' : 'left: 0;'}
          width: 38%;
          background: linear-gradient(
            ${glossDir},
            rgba(255,255,255,0.46) 0%,
            rgba(255,255,255,0.02) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        .inner {
          position: relative;
          z-index: 1;
          padding: 24px 18px;
        }

        /* Custom scrollbar */
        aside::-webkit-scrollbar       { width: 6px; }
        aside::-webkit-scrollbar-track { background: rgba(200,235,255,0.28); }
        aside::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #5cc8f5, #1a9de0);
          border-radius: 6px;
        }

        /* ── Collapse toggle button ── */
        .toggle-btn {
          position: absolute;
          top: 24px;
          ${togglePos}
          width: 28px; height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #5cc8f5 0%, #0a8fd6 100%);
          border: 1px solid rgba(255,255,255,0.65);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,80,180,0.28);
          cursor: pointer;
          color: #fff;
          z-index: 10;
          transition: transform 180ms ease, box-shadow 180ms ease;
          outline: none;
        }
        .toggle-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 4px 14px rgba(0,80,180,0.38);
        }
        .toggle-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(6,137,228,0.45), 0 0 0 1px rgba(6,137,228,0.80);
        }
        .toggle-btn svg { width: 13px; height: 13px; }
      </style>

      <aside part="aside">
        ${collapsible ? `
          <button class="toggle-btn" part="toggle" aria-label="${collapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
            ${toggleIcon}
          </button>` : ''}
        <div class="inner" part="inner">
          <slot></slot>
        </div>
      </aside>
    `;

    /* Wire the toggle button after render */
    const btn = this.shadowRoot.querySelector('.toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.hasAttribute('collapsed')) {
          this.removeAttribute('collapsed');
        } else {
          this.setAttribute('collapsed', '');
        }
      });
    }
  }
}
customElements.define('fa-sidebar', FASidebar);
})();
