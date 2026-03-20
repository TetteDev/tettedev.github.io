(function () {
/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-typography.js
 *  Typography Web Components
 *
 *  Elements: fa-h1 · fa-h2 · fa-h3 · fa-p · fa-span
 *            fa-label · fa-blockquote · fa-code
 *
 *  Requires: fa-design-system.css loaded in the document.
 * ============================================================
 */

/* ─────────────────────────────────────────────────────────────
   SHARED HELPERS
   ───────────────────────────────────────────────────────────── */

/** Base font stack — mirrors the design-system token */
const FA_FONT = `'Source Sans 3', 'Segoe UI', 'Frutiger', Arial, sans-serif`;
const FA_MONO = `'Consolas', 'Cascadia Code', 'Courier New', monospace`;

/** Common CSS reset + font injection for every shadow root */
const FA_TYPE_BASE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :host {
    font-family: ${FA_FONT};
    color: var(--fa-text-dark, #1A3A4A);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;


/* ═══════════════════════════════════════════════════════════════
   1.  FA-H1
   Hero / display heading. Gradient text with a subtle glow and
   an optional decorative underline shimmer.

   Attributes:
     gradient  — (boolean) enables the aqua→sky gradient text fill (default on)
     glow      — (boolean) adds a blue text-shadow glow (default on)
     underline — (boolean) renders the iridescent shimmer underline

   Usage:
     <fa-h1>Connected Experiences</fa-h1>
     <fa-h1 gradient glow underline>Welcome</fa-h1>
   ═══════════════════════════════════════════════════════════════ */
class FAH1 extends HTMLElement {
  static get observedAttributes() { return ['gradient', 'glow', 'underline']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const gradient  = this.getAttribute('gradient')  !== 'false';
    const glow      = this.getAttribute('glow')      !== 'false';
    const underline = this.hasAttribute('underline');

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: block; }

        h1 {
          position: relative;
          display: inline-block;
          width: 100%;
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.15;

          ${gradient ? `
          background: linear-gradient(
            135deg,
            #0032DB 0%,
            #0689E4 30%,
            #3AC8F5 55%,
            #1A9DE0 75%,
            #0050C8 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          ` : `color: var(--fa-text-dark, #1A3A4A);`}

          ${glow && !gradient ? `
          text-shadow:
            0 0 22px rgba(6,137,228,0.45),
            0 2px 4px rgba(0,0,0,0.15);
          ` : ''}

          ${glow && gradient ? `
          filter: drop-shadow(0 0 10px rgba(6,137,228,0.38));
          ` : ''}
        }

        ${underline ? `
        /* Iridescent shimmer underline */
        h1::after {
          content: '';
          display: block;
          margin-top: 10px;
          height: 3px;
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            rgba(6,137,228,0.20)  0%,
            rgba(6,137,228,0.90) 20%,
            rgba(58,200,245,1)   45%,
            rgba(124,179,66,0.80) 68%,
            rgba(251,185,5,0.40)  85%,
            transparent 100%
          );
        }` : ''}
      </style>
      <h1 part="h1"><slot></slot></h1>
    `;
  }
}
customElements.define('fa-h1', FAH1);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-H2
   Section heading. Glossy text with a coloured left-bar accent.

   Attributes:
     accent — blue (default) | green | amber | none
     bar    — (boolean) shows the coloured left-border accent bar (default on)

   Usage:
     <fa-h2 accent="green">Discover New Possibilities</fa-h2>
   ═══════════════════════════════════════════════════════════════ */
class FAH2 extends HTMLElement {
  static get observedAttributes() { return ['accent', 'bar']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const accent = this.getAttribute('accent') || 'blue';
    const bar    = this.getAttribute('bar')    !== 'false';

    const accentGrads = {
      blue:  `linear-gradient(180deg, #0689E4 0%, #0032DB 100%)`,
      green: `linear-gradient(180deg, #7CB342 0%, #4a9a0e 100%)`,
      amber: `linear-gradient(180deg, #FBB905 0%, #D55E0F 100%)`,
      none:  `transparent`,
    };
    const textColors = {
      blue:  `#0A4A7A`,
      green: `#1E4D00`,
      amber: `#5A3000`,
      none:  `var(--fa-text-dark, #1A3A4A)`,
    };
    const glows = {
      blue:  `0 1px 16px rgba(6,137,228,0.22), 0 2px 6px rgba(0,0,0,0.10)`,
      green: `0 1px 16px rgba(124,179,66,0.20), 0 2px 6px rgba(0,0,0,0.10)`,
      amber: `0 1px 16px rgba(251,185,5,0.22),  0 2px 6px rgba(0,0,0,0.10)`,
      none:  `0 1px 4px rgba(0,0,0,0.08)`,
    };

    const g   = accentGrads[accent] || accentGrads.blue;
    const tc  = textColors[accent]  || textColors.blue;
    const gl  = glows[accent]       || glows.blue;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: block; }

        .wrapper {
          display: flex;
          align-items: stretch;
          gap: 14px;
        }

        ${bar ? `
        .bar {
          flex-shrink: 0;
          width: 4px;
          border-radius: 9999px;
          background: ${g};
          box-shadow: 0 0 8px rgba(6,137,228,0.40);
        }` : ''}

        h2 {
          font-size: clamp(1.35rem, 3vw, 1.875rem);
          font-weight: 600;
          letter-spacing: -0.018em;
          line-height: 1.25;
          color: ${tc};
          text-shadow: ${gl};
          padding: 2px 0;
        }
      </style>
      <div class="wrapper" part="wrapper">
        ${bar ? `<div class="bar" part="bar"></div>` : ''}
        <h2 part="h2"><slot></slot></h2>
      </div>
    `;
  }
}
customElements.define('fa-h2', FAH2);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-H3
   Sub-section heading. Smaller, clean, with an optional dot
   prefix and a faint underline rule.

   Attributes:
     dot       — (boolean) shows a coloured bullet dot prefix
     divider   — (boolean) shows a hairline rule below
     accent    — blue (default) | green | amber | none

   Usage:
     <fa-h3 dot>Designed for the way you live</fa-h3>
   ═══════════════════════════════════════════════════════════════ */
class FAH3 extends HTMLElement {
  static get observedAttributes() { return ['dot', 'divider', 'accent']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const dot     = this.hasAttribute('dot');
    const divider = this.hasAttribute('divider');
    const accent  = this.getAttribute('accent') || 'blue';

    const dotColors = {
      blue:  `radial-gradient(circle, #5cc8f5 0%, #0689E4 100%)`,
      green: `radial-gradient(circle, #a8d96a 0%, #7CB342 100%)`,
      amber: `radial-gradient(circle, #fdd96a 0%, #FBB905 100%)`,
      none:  `transparent`,
    };
    const dotGlows = {
      blue:  `0 0 6px rgba(6,137,228,0.60)`,
      green: `0 0 6px rgba(124,179,66,0.55)`,
      amber: `0 0 6px rgba(251,185,5,0.60)`,
      none:  `none`,
    };

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: block; }

        .wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: ${divider ? '10px' : '0'};
          ${divider ? `border-bottom: 1px solid rgba(6,137,228,0.18);` : ''}
        }

        ${dot ? `
        .dot {
          flex-shrink: 0;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: ${dotColors[accent] || dotColors.blue};
          box-shadow: ${dotGlows[accent]  || dotGlows.blue};
        }` : ''}

        h3 {
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.35;
          color: var(--fa-text-mid, #2E5E72);
        }
      </style>
      <div class="wrapper" part="wrapper">
        ${dot ? `<span class="dot" part="dot" aria-hidden="true"></span>` : ''}
        <h3 part="h3"><slot></slot></h3>
      </div>
    `;
  }
}
customElements.define('fa-h3', FAH3);


/* ═══════════════════════════════════════════════════════════════
   4.  FA-P
   Body paragraph with careful rhythm and optional lead (intro)
   or small/caption sizes.

   Attributes:
     size   — base (default) | lead | sm | xs
     muted  — (boolean) uses --fa-text-light colour
     max    — CSS length for max-width (e.g. "60ch"); improves
              readability of long-form copy

   Usage:
     <fa-p size="lead">Source Sans Pro embodies…</fa-p>
     <fa-p muted max="60ch">Caption text here.</fa-p>
   ═══════════════════════════════════════════════════════════════ */
class FAP extends HTMLElement {
  static get observedAttributes() { return ['size', 'muted', 'max']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const size  = this.getAttribute('size') || 'base';
    const muted = this.hasAttribute('muted');
    const max   = this.getAttribute('max')  || '';

    const sizeMap = {
      xs:   { fs: '0.75rem',  lh: '1.55', fw: '400' },
      sm:   { fs: '0.875rem', lh: '1.65', fw: '400' },
      base: { fs: '1rem',     lh: '1.70', fw: '400' },
      lead: { fs: '1.125rem', lh: '1.75', fw: '300' },
    };
    const s = sizeMap[size] || sizeMap.base;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: block; }

        p {
          font-size: ${s.fs};
          font-weight: ${s.fw};
          line-height: ${s.lh};
          color: ${muted ? 'var(--fa-text-light, #5F8FA3)' : 'var(--fa-text-dark, #1A3A4A)'};
          ${max ? `max-width: ${max};` : ''}
        }

        /* Link styling inside paragraphs */
        ::slotted(a) {
          color: var(--fa-blue-sky, #0689E4);
          text-decoration: underline;
          text-decoration-color: rgba(6,137,228,0.40);
          text-underline-offset: 3px;
          transition: color 150ms ease, text-decoration-color 150ms ease;
        }
        ::slotted(a:hover) {
          color: var(--fa-blue-deep, #0032DB);
          text-decoration-color: rgba(0,50,219,0.70);
        }

        /* Strong / bold */
        ::slotted(strong), ::slotted(b) {
          font-weight: 700;
          color: var(--fa-text-dark, #1A3A4A);
        }

        /* Italic / em */
        ::slotted(em), ::slotted(i) {
          font-style: italic;
          color: var(--fa-text-mid, #2E5E72);
        }
      </style>
      <p part="p"><slot></slot></p>
    `;
  }
}
customElements.define('fa-p', FAP);


/* ═══════════════════════════════════════════════════════════════
   5.  FA-SPAN
   Inline text wrapper with optional glass-pill highlight,
   gradient tint, or emphasis styles.

   Attributes:
     variant — plain (default) | highlight | pill | gradient
     accent  — blue (default) | green | amber

   Usage:
     <fa-span variant="pill" accent="green">Online</fa-span>
     <fa-span variant="gradient">Aero</fa-span>
   ═══════════════════════════════════════════════════════════════ */
class FASpan extends HTMLElement {
  static get observedAttributes() { return ['variant', 'accent']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const v      = this.getAttribute('variant') || 'plain';
    const accent = this.getAttribute('accent')  || 'blue';

    const pillBg = {
      blue:  `linear-gradient(135deg, rgba(180,225,255,0.72) 0%, rgba(100,185,240,0.42) 100%)`,
      green: `linear-gradient(135deg, rgba(195,240,158,0.70) 0%, rgba(140,200,90,0.38)  100%)`,
      amber: `linear-gradient(135deg, rgba(255,238,160,0.72) 0%, rgba(251,185,5,0.36)   100%)`,
    };
    const pillBorder = {
      blue:  `rgba(6,137,228,0.40)`,
      green: `rgba(124,179,66,0.35)`,
      amber: `rgba(251,185,5,0.45)`,
    };
    const gradText = {
      blue:  `linear-gradient(135deg, #0032DB 0%, #3AC8F5 60%, #0689E4 100%)`,
      green: `linear-gradient(135deg, #4a9a0e 0%, #7CB342 55%, #B8D67A 100%)`,
      amber: `linear-gradient(135deg, #D55E0F 0%, #FBB905 60%, #F5A623 100%)`,
    };

    let styles = '';
    switch (v) {
      case 'highlight':
        styles = `
          background: ${pillBg[accent] || pillBg.blue};
          padding: 0.1em 0.5em;
          border-radius: 4px;
          border-bottom: 1px solid ${pillBorder[accent] || pillBorder.blue};
        `;
        break;
      case 'pill':
        styles = `
          display: inline-flex;
          align-items: center;
          background: ${pillBg[accent] || pillBg.blue};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid ${pillBorder[accent] || pillBorder.blue};
          border-radius: 9999px;
          padding: 0.15em 0.65em;
          font-size: 0.88em;
          font-weight: 600;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.70), 0 1px 4px rgba(0,50,120,0.12);
        `;
        break;
      case 'gradient':
        styles = `
          background: ${gradText[accent] || gradText.blue};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        `;
        break;
      default:
        styles = ``;
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: inline; }
        span {
          font-family: ${FA_FONT};
          -webkit-font-smoothing: antialiased;
          ${styles}
        }
      </style>
      <span part="span"><slot></slot></span>
    `;
  }
}
customElements.define('fa-span', FASpan);


/* ═══════════════════════════════════════════════════════════════
   6.  FA-LABEL
   Form / UI label. Glossy frosted glass pill with an optional
   colour dot indicator and icon slot.

   Attributes:
     for     — mirrors the HTML for= attribute (set on inner <label>)
     accent  — blue (default) | green | amber | none
     size    — sm | md (default) | lg
     dot     — (boolean) prepends a coloured status dot

   Usage:
     <fa-label for="email-input">Email Address</fa-label>
     <fa-label dot accent="green">Status</fa-label>
   ═══════════════════════════════════════════════════════════════ */
class FALabel extends HTMLElement {
  static get observedAttributes() { return ['for', 'accent', 'size', 'dot']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const forAttr = this.getAttribute('for')    || '';
    const accent  = this.getAttribute('accent') || 'none';
    const size    = this.getAttribute('size')   || 'md';
    const dot     = this.hasAttribute('dot');

    const sizeMap = { sm: '0.78rem', md: '0.9rem', lg: '1rem' };
    const fs = sizeMap[size] || sizeMap.md;

    const dotColors = {
      blue:  `radial-gradient(circle, #5cc8f5 0%, #0689E4 100%)`,
      green: `radial-gradient(circle, #a8d96a 0%, #7CB342 100%)`,
      amber: `radial-gradient(circle, #fdd96a 0%, #FBB905 100%)`,
      none:  `#8aabb8`,
    };
    const dotGlows = {
      blue:  `0 0 5px rgba(6,137,228,0.55)`,
      green: `0 0 5px rgba(124,179,66,0.50)`,
      amber: `0 0 5px rgba(251,185,5,0.55)`,
      none:  `none`,
    };

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: inline-block; }

        label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: ${fs};
          font-weight: 600;
          color: var(--fa-text-mid, #2E5E72);
          cursor: ${forAttr ? 'pointer' : 'default'};
          user-select: none;
          letter-spacing: 0.01em;
        }

        ${dot ? `
        .dot {
          display: inline-block;
          flex-shrink: 0;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: ${dotColors[accent] || dotColors.none};
          box-shadow: ${dotGlows[accent]  || dotGlows.none};
        }` : ''}

        .icon-slot {
          display: contents;
        }
      </style>
      <label part="label" ${forAttr ? `for="${forAttr}"` : ''}>
        <span class="icon-slot"><slot name="icon"></slot></span>
        ${dot ? `<span class="dot" part="dot" aria-hidden="true"></span>` : ''}
        <slot></slot>
      </label>
    `;
  }
}
customElements.define('fa-label', FALabel);


/* ═══════════════════════════════════════════════════════════════
   7.  FA-BLOCKQUOTE
   Large pull-quote panel. Frosted glass with a thick gradient
   left-border, quotation mark watermark, and optional citation.

   Attributes:
     accent — blue (default) | green | amber
     cite   — citation text / source name

   Slots:
     (default) — the quote text
     cite      — citation (alternative to the attribute)

   Usage:
     <fa-blockquote cite="— Steve Jobs" accent="blue">
       Design is not just what it looks like and feels like.
       Design is how it works.
     </fa-blockquote>
   ═══════════════════════════════════════════════════════════════ */
class FABlockquote extends HTMLElement {
  static get observedAttributes() { return ['accent', 'cite']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const accent = this.getAttribute('accent') || 'blue';
    const cite   = this.getAttribute('cite')   || '';

    const borderGrads = {
      blue:  `linear-gradient(180deg, #5cc8f5 0%, #0689E4 50%, #0032DB 100%)`,
      green: `linear-gradient(180deg, #a8d96a 0%, #7CB342 50%, #4a9a0e 100%)`,
      amber: `linear-gradient(180deg, #fdd96a 0%, #FBB905 50%, #D55E0F 100%)`,
    };
    const bgGlows = {
      blue:  `rgba(6,137,228,0.08)`,
      green: `rgba(124,179,66,0.07)`,
      amber: `rgba(251,185,5,0.09)`,
    };
    const markColors = {
      blue:  `rgba(6,137,228,0.10)`,
      green: `rgba(124,179,66,0.09)`,
      amber: `rgba(251,185,5,0.11)`,
    };
    const citeColors = {
      blue:  `var(--fa-blue-sky, #0689E4)`,
      green: `var(--fa-green-grass, #7CB342)`,
      amber: `var(--fa-amber, #FBB905)`,
    };

    const bgrad = borderGrads[accent] || borderGrads.blue;
    const bglow = bgGlows[accent]     || bgGlows.blue;
    const mclr  = markColors[accent]  || markColors.blue;
    const cclr  = citeColors[accent]  || citeColors.blue;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_TYPE_BASE}
        :host { display: block; }

        blockquote {
          position: relative;
          display: block;
          padding: 28px 28px 22px 36px;
          border-radius: 16px;
          overflow: hidden;

          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.62) 0%,
            rgba(255,255,255,0.28) 55%,
            ${bglow} 100%
          );
          backdrop-filter: blur(14px) saturate(1.6);
          -webkit-backdrop-filter: blur(14px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.65);
          border-left: none;
          box-shadow:
            0 2px 8px rgba(0,50,100,0.12),
            0 6px 24px rgba(0,80,180,0.09),
            inset 0 1px 0 rgba(255,255,255,0.72);
        }

        /* Coloured left bar */
        blockquote::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 4px;
          background: ${bgrad};
          border-radius: 4px 0 0 4px;
        }

        /* Giant decorative quotation mark watermark */
        blockquote::after {
          content: '"';
          position: absolute;
          top: -18px; right: 18px;
          font-size: 9rem;
          font-weight: 900;
          line-height: 1;
          color: ${mclr};
          pointer-events: none;
          user-select: none;
          font-family: Georgia, 'Times New Roman', serif;
        }

        /* Top gloss sheen */
        .gloss {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 44%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.46) 0%,
            rgba(255,255,255,0.02) 100%
          );
          pointer-events: none;
          border-radius: 16px 16px 0 0;
        }

        .text {
          position: relative;
          z-index: 1;
          font-size: 1.08rem;
          font-weight: 400;
          font-style: italic;
          line-height: 1.78;
          color: var(--fa-text-dark, #1A3A4A);
        }

        .cite {
          display: block;
          margin-top: 14px;
          font-size: 0.85rem;
          font-style: normal;
          font-weight: 600;
          color: ${cclr};
          letter-spacing: 0.01em;
          position: relative;
          z-index: 1;
        }
      </style>

      <blockquote part="blockquote">
        <div class="gloss" aria-hidden="true"></div>
        <div class="text" part="text">
          <slot></slot>
        </div>
        ${cite ? `<cite class="cite" part="cite">${cite}</cite>` : ''}
        <slot name="cite"></slot>
      </blockquote>
    `;
  }
}
customElements.define('fa-blockquote', FABlockquote);


/* ═══════════════════════════════════════════════════════════════
   8.  FA-CODE
   Inline and block code display. Two modes:

   Inline mode  — a glossy glass pill used mid-sentence.
   Block  mode  — a dark frosted terminal panel with a toolbar,
                  syntax-coloured gradient wallpaper, and line
                  numbers. Pure CSS — no syntax highlighting lib.

   Attributes:
     block    — (boolean) render as a multi-line code block
     lang     — language label shown in the toolbar (e.g. "CSS")
     filename — filename shown in the toolbar (e.g. "styles.css")

   Usage:
     Inline: Use <fa-code>border-radius</fa-code> for rounded corners.
     Block:
       <fa-code block lang="JS" filename="app.js">
         const greeting = 'Hello, Aero!';
         console.log(greeting);
       </fa-code>
   ═══════════════════════════════════════════════════════════════ */
class FACode extends HTMLElement {
  static get observedAttributes() { return ['block', 'lang', 'filename']; }
  constructor() { super(); this.attachShadow({ mode: 'open' }); this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const isBlock  = this.hasAttribute('block');
    const lang     = this.getAttribute('lang')     || '';
    const filename = this.getAttribute('filename') || '';

    if (!isBlock) {
      /* ── INLINE ── */
      this.shadowRoot.innerHTML = `
        <style>
          ${FA_TYPE_BASE}
          :host { display: inline; }

          code {
            display: inline;
            font-family: ${FA_MONO};
            font-size: 0.88em;
            font-weight: 400;
            color: var(--fa-blue-deep, #0032DB);
            background: linear-gradient(135deg,
              rgba(180,225,255,0.65) 0%,
              rgba(210,240,255,0.42) 100%
            );
            border: 1px solid rgba(6,137,228,0.28);
            border-radius: 5px;
            padding: 0.12em 0.45em;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.72),
              0 1px 4px rgba(0,50,120,0.10);
            white-space: nowrap;
          }
        </style>
        <code part="code"><slot></slot></code>
      `;
    } else {
      /* ── BLOCK ── */
      const label = filename || (lang ? `code.${lang.toLowerCase()}` : '');

      /* Toolbar traffic-light dots */
      const dots = `
        <span class="dot dot-red"   aria-hidden="true"></span>
        <span class="dot dot-amber" aria-hidden="true"></span>
        <span class="dot dot-green" aria-hidden="true"></span>
      `;

      this.shadowRoot.innerHTML = `
        <style>
          ${FA_TYPE_BASE}
          :host { display: block; }

          .panel {
            position: relative;
            border-radius: 16px;
            overflow: hidden;
            background: linear-gradient(
              160deg,
              #0e1e2e 0%,
              #112233 45%,
              #0d1e2c 100%
            );
            border: 1px solid rgba(6,137,228,0.30);
            box-shadow:
              0 4px 16px rgba(0,20,60,0.45),
              0 8px 32px rgba(0,50,140,0.28),
              inset 0 1px 0 rgba(255,255,255,0.08);
          }

          /* Faint aurora glow inside the panel */
          .panel::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 60%;
            background: radial-gradient(
              ellipse at 30% 0%,
              rgba(6,137,228,0.12) 0%,
              transparent 65%
            );
            pointer-events: none;
            z-index: 0;
          }

          /* ── Toolbar ── */
          .toolbar {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: linear-gradient(180deg,
              rgba(255,255,255,0.07) 0%,
              rgba(255,255,255,0.02) 100%
            );
            border-bottom: 1px solid rgba(6,137,228,0.18);
          }

          .dots-group { display: flex; gap: 6px; align-items: center; }

          .dot {
            width: 12px; height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .dot-red   { background: radial-gradient(circle at 38% 35%, #ff8080 0%, #e03030 100%); }
          .dot-amber { background: radial-gradient(circle at 38% 35%, #ffe080 0%, #e0a020 100%); }
          .dot-green { background: radial-gradient(circle at 38% 35%, #90ef90 0%, #30a030 100%); }

          .file-label {
            flex: 1;
            text-align: center;
            font-family: ${FA_MONO};
            font-size: 0.78rem;
            color: rgba(168,214,240,0.70);
            letter-spacing: 0.03em;
            pointer-events: none;
          }

          .lang-badge {
            font-family: ${FA_FONT};
            font-size: 0.72rem;
            font-weight: 700;
            color: rgba(6,137,228,0.90);
            background: rgba(6,137,228,0.12);
            border: 1px solid rgba(6,137,228,0.25);
            border-radius: 4px;
            padding: 1px 7px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          /* ── Code area ── */
          .code-wrap {
            position: relative;
            z-index: 1;
            overflow-x: auto;
            padding: 20px 22px 22px;
          }

          pre {
            font-family: ${FA_MONO};
            font-size: 0.88rem;
            line-height: 1.65;
            color: #c8e6fa;
            tab-size: 2;
            white-space: pre;
            margin: 0;
          }

          /* Custom scrollbar in dark panel */
          .code-wrap::-webkit-scrollbar       { height: 6px; }
          .code-wrap::-webkit-scrollbar-track { background: rgba(0,30,60,0.50); }
          .code-wrap::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, #1a9de0, #0678c1);
            border-radius: 6px;
          }
        </style>

        <div class="panel" part="panel">
          <div class="toolbar" part="toolbar">
            <span class="dots-group">${dots}</span>
            ${label ? `<span class="file-label" part="file-label">${label}</span>` : '<span class="file-label"></span>'}
            ${lang  ? `<span class="lang-badge" part="lang-badge">${lang}</span>`  : ''}
          </div>
          <div class="code-wrap">
            <pre part="pre"><slot></slot></pre>
          </div>
        </div>
      `;
    }
  }
}
customElements.define('fa-code', FACode);
})();
