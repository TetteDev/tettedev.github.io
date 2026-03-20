(function () {
/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-data-display.js
 *  Data Display Web Components
 *
 *  Elements: fa-card · fa-badge · fa-progress
 *            fa-tooltip · fa-tag
 *
 *  Requires: fa-design-system.css loaded in the document.
 * ============================================================
 */

const _FA_FONT = `'Source Sans 3', 'Segoe UI', 'Frutiger', Arial, sans-serif`;
window["FA_FONT"] = typeof window["FA_FONT"] === 'undefined' ? _FA_FONT : window["FA_FONT"];

/* ─────────────────────────────────────────────────────────────
   SHARED KEYFRAMES
   ───────────────────────────────────────────────────────────── */
const _FA_KF = `
  @keyframes fa-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes fa-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fa-slide-down {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fa-pulse-glow {
    0%, 100% { box-shadow: var(--_glow-base); }
    50%       { box-shadow: var(--_glow-peak); }
  }
  @keyframes fa-shine-sweep {
    0%   { transform: translateX(-100%); }
    60%  { transform: translateX(300%); }
    100% { transform: translateX(300%); }
  }
  @keyframes fa-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

window["FA_KF"] = typeof window["FA_KF"] === 'undefined' ? _FA_KF : window["FA_KF"];
/* ═══════════════════════════════════════════════════════════════
   1.  FA-CARD
   Versatile glass card component. The workhorse data container.
   Supports header/body/footer slots, hover elevation, coloured
   accent bars, optional imagery, and glass/glossy variants.

   Attributes:
     variant    — glass (default) | glossy | flat | bordered
     accent     — none (default) | blue | green | amber | top | left
     hover      — (boolean) enables lift + glow on hover
     padding    — none | sm | md (default) | lg | xl
     radius     — sm | md (default) | lg | xl
     clickable  — (boolean) shows pointer cursor + hover state

   Slots:
     header  — fixed-height header zone
     image   — top image / hero slot
     (default) — main card body
     footer  — footer zone (actions, timestamps, etc.)

   Usage:
     <fa-card hover>
       <h3 slot="header">Feature Title</h3>
       <p>Card content goes here.</p>
       <div slot="footer">Actions</div>
     </fa-card>
   ═══════════════════════════════════════════════════════════════ */
class FACard extends HTMLElement {
  static get observedAttributes() {
    return ['variant','accent','hover','padding','radius','clickable'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant   = this.getAttribute('variant')   || 'glass';
    const accent    = this.getAttribute('accent')    || 'none';
    const hover     = this.hasAttribute('hover');
    const clickable = this.hasAttribute('clickable');
    const padding   = this.getAttribute('padding')   || 'md';
    const radius    = this.getAttribute('radius')    || 'md';

    const padMap = {
      none: '0',
      sm:   '12px',
      md:   '20px',
      lg:   '28px',
      xl:   '36px',
    };
    const radMap = {
      sm: '10px',
      md: '16px',
      lg: '22px',
      xl: '32px',
    };

    const p = padMap[padding] || padMap.md;
    const r = radMap[radius]  || radMap.md;

    /* ── Variant styles ── */
    const variantBg = {
      glass: `linear-gradient(
        145deg,
        rgba(255,255,255,0.68) 0%,
        rgba(255,255,255,0.32) 55%,
        rgba(200,235,255,0.24) 100%
      )`,
      glossy: `linear-gradient(
        180deg,
        #eaf7ff 0%,
        #cde9f8 48.5%,
        #aed5f0 49%,
        #cae5f7 100%
      )`,
      flat: `rgba(255,255,255,0.90)`,
      bordered: `rgba(255,255,255,0.82)`,
    };
    const variantBorder = {
      glass:    `1px solid rgba(255,255,255,0.68)`,
      glossy:   `1px solid rgba(255,255,255,0.88)`,
      flat:     `1px solid rgba(6,137,228,0.20)`,
      bordered: `2px solid rgba(6,137,228,0.35)`,
    };
    const variantShadow = {
      glass: `0 2px 8px rgba(0,50,100,0.12),
              0 6px 24px rgba(0,80,180,0.09),
              inset 0 1.5px 0 rgba(255,255,255,0.75)`,
      glossy: `0 4px 16px rgba(0,60,140,0.18),
               0 10px 36px rgba(0,80,200,0.12),
               inset 0 2px 0 rgba(255,255,255,0.95)`,
      flat: `0 1px 3px rgba(0,50,100,0.08)`,
      bordered: `0 2px 12px rgba(0,80,180,0.12)`,
    };
    const variantBlur = {
      glass:    true,
      glossy:   false,
      flat:     false,
      bordered: false,
    };

    const v  = variant in variantBg ? variant : 'glass';
    const bg = variantBg[v];
    const bd = variantBorder[v];
    const sh = variantShadow[v];
    const blur = variantBlur[v];

    /* ── Accent bar colours ── */
    const accentGrads = {
      blue:  `linear-gradient(90deg, #0689E4 0%, #3A9FD5 100%)`,
      green: `linear-gradient(90deg, #7CB342 0%, #B8D67A 100%)`,
      amber: `linear-gradient(90deg, #FBB905 0%, #F5A623 100%)`,
      top:   `linear-gradient(90deg, #0689E4 0%, #7CB342 50%, #FBB905 100%)`,
      left:  `linear-gradient(180deg, #0689E4 0%, #7CB342 50%, #FBB905 100%)`,
      none:  `transparent`,
    };
    const acGrad = accentGrads[accent] || accentGrads.none;
    const showAccent = accent !== 'none';
    const acDir  = accent === 'left' ? 'left' : 'top';

    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          font-family: ${window["FA_FONT"]};
          -webkit-font-smoothing: antialiased;
        }

        .card {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: ${r};
          overflow: hidden;
          background: ${bg};
          border: ${bd};
          box-shadow: ${sh};
          ${blur ? `
          backdrop-filter: blur(14px) saturate(1.6);
          -webkit-backdrop-filter: blur(14px) saturate(1.6);
          ` : ''}
          transition:
            box-shadow  220ms ease,
            transform   220ms cubic-bezier(0.34,1.56,0.64,1);
          ${clickable || hover ? 'cursor: pointer;' : ''}
        }

        /* ── Gloss sheen ── */
        ${v === 'glass' || v === 'glossy' ? `
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 44%;
          background: linear-gradient(180deg,
            rgba(255,255,255,${v === 'glossy' ? '0.50' : '0.46'}) 0%,
            rgba(255,255,255,0.02) 100%
          );
          pointer-events: none;
          z-index: 0;
          border-radius: ${r} ${r} 50% 50%;
        }` : ''}

        /* ── Accent bar ── */
        ${showAccent ? `
        .accent-bar {
          flex-shrink: 0;
          ${acDir === 'top'
            ? `height: 4px; width: 100%; background: ${acGrad};`
            : `width: 4px; height: 100%; position: absolute; top: 0; bottom: 0; left: 0; background: ${acGrad}; border-radius: ${r} 0 0 ${r};`
          }
          z-index: 2;
        }` : ''}

        /* ── Hover elevation ── */
        ${hover || clickable ? `
        .card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 8px 24px rgba(0,50,120,0.20),
            0 16px 48px rgba(0,80,200,0.14),
            inset 0 2px 0 rgba(255,255,255,0.85);
        }` : ''}

        /* ── Header zone ── */
        .header {
          position: relative;
          z-index: 1;
          padding: ${p} ${p} ${p === '0' ? '0' : `calc(${p} * 0.75)`};
          ${accent === 'left' ? `margin-left: 4px;` : ''}
        }
        ::slotted([slot="header"]) {
          font-size: 1.12rem;
          font-weight: 600;
          color: var(--fa-text-dark, #1A3A4A);
          line-height: 1.3;
        }

        /* ── Image zone ── */
        .image-zone {
          position: relative;
          z-index: 1;
          overflow: hidden;
          flex-shrink: 0;
        }
        ::slotted([slot="image"]) {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        /* ── Body zone ── */
        .body {
          position: relative;
          z-index: 1;
          flex: 1;
          padding: ${p};
          ${accent === 'left' ? `margin-left: 4px;` : ''}
        }

        /* ── Footer zone ── */
        .footer {
          position: relative;
          z-index: 1;
          padding: ${p === '0' ? '0' : `calc(${p} * 0.75)`} ${p} ${p};
          border-top: 1px solid rgba(6,137,228,0.12);
          background: rgba(6,137,228,0.03);
          ${accent === 'left' ? `margin-left: 4px;` : ''}
        }
        ::slotted([slot="footer"]) {
          font-size: 0.85rem;
          color: var(--fa-text-mid, #2E5E72);
        }
      </style>

      <div class="card" part="card">
        ${showAccent && acDir === 'left' ? `<div class="accent-bar" part="accent"></div>` : ''}
        ${showAccent && acDir === 'top'  ? `<div class="accent-bar" part="accent"></div>` : ''}
        <div class="header" part="header">
          <slot name="header"></slot>
        </div>
        <div class="image-zone" part="image">
          <slot name="image"></slot>
        </div>
        <div class="body" part="body">
          <slot></slot>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
customElements.define('fa-card', FACard);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-BADGE
   Glossy pill badge for status, counts, labels. Small, inline,
   vibrant. Features the Vista-era orb gradient split.

   Attributes:
     variant  — primary (default) | secondary | success | warning | danger | info | ghost
     size     — xs | sm (default) | md | lg
     pulse    — (boolean) ambient glow pulse
     dot      — (boolean) shows a glowing dot prefix
     pill     — (boolean) preserves pill shape even with no text (icon-only)

   Usage:
     <fa-badge variant="success">Online</fa-badge>
     <fa-badge variant="primary" pulse>3</fa-badge>
     <fa-badge variant="warning" dot>Pending</fa-badge>
   ═══════════════════════════════════════════════════════════════ */
class FABadge extends HTMLElement {
  static get observedAttributes() {
    return ['variant','size','pulse','dot','pill'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size    = this.getAttribute('size')    || 'sm';
    const pulse   = this.hasAttribute('pulse');
    const dot     = this.hasAttribute('dot');
    const pill    = this.hasAttribute('pill');

    const sizeMap = {
      xs: { h: '18px', px: '7px',  fs: '0.68rem', gap: '3px', dotD: '5px' },
      sm: { h: '22px', px: '9px',  fs: '0.78rem', gap: '4px', dotD: '6px' },
      md: { h: '26px', px: '12px', fs: '0.86rem', gap: '5px', dotD: '7px' },
      lg: { h: '32px', px: '16px', fs: '0.95rem', gap: '6px', dotD: '8px' },
    };
    const s = sizeMap[size] || sizeMap.sm;

    const variants = {
      primary: {
        bg:     `linear-gradient(180deg, #6ed4f7 0%, #22a8e8 47%, #0678c1 49%, #0e98d8 100%)`,
        border: `rgba(4,96,178,0.65)`,
        text:   `#ffffff`,
        shadow: `0 1px 4px rgba(0,60,140,0.28), inset 0 1px 0 rgba(255,255,255,0.48)`,
        glowB:  `0 0 6px rgba(6,137,228,0.38)`,
        glowP:  `0 0 14px rgba(6,137,228,0.68)`,
        dot:    `radial-gradient(circle, #9ee5ff 0%, #22a8e8 100%)`,
        dotGlow:`0 0 6px rgba(6,137,228,0.70)`,
      },
      secondary: {
        bg:     `linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(220,242,255,0.72) 100%)`,
        border: `rgba(6,137,228,0.32)`,
        text:   `var(--fa-text-mid, #2E5E72)`,
        shadow: `0 1px 3px rgba(0,50,100,0.12), inset 0 1px 0 rgba(255,255,255,0.85)`,
        glowB:  `0 0 5px rgba(6,137,228,0.20)`,
        glowP:  `0 0 12px rgba(6,137,228,0.42)`,
        dot:    `radial-gradient(circle, #c8e8f5 0%, #0689E4 100%)`,
        dotGlow:`0 0 5px rgba(6,137,228,0.55)`,
      },
      success: {
        bg:     `linear-gradient(180deg, #acdb6e 0%, #72b830 47%, #4a9a0e 49%, #5aac1e 100%)`,
        border: `rgba(40,110,10,0.60)`,
        text:   `#ffffff`,
        shadow: `0 1px 4px rgba(40,100,10,0.26), inset 0 1px 0 rgba(255,255,255,0.45)`,
        glowB:  `0 0 6px rgba(124,179,66,0.38)`,
        glowP:  `0 0 14px rgba(124,179,66,0.68)`,
        dot:    `radial-gradient(circle, #d4f5a0 0%, #5aac1e 100%)`,
        dotGlow:`0 0 6px rgba(124,179,66,0.65)`,
      },
      warning: {
        bg:     `linear-gradient(180deg, #fde070 0%, #fbbe20 47%, #d9980a 49%, #e8a812 100%)`,
        border: `rgba(160,100,0,0.55)`,
        text:   `#3a2000`,
        shadow: `0 1px 4px rgba(160,100,0,0.24), inset 0 1px 0 rgba(255,255,255,0.52)`,
        glowB:  `0 0 6px rgba(251,185,5,0.42)`,
        glowP:  `0 0 14px rgba(251,185,5,0.72)`,
        dot:    `radial-gradient(circle, #fff4c0 0%, #e8a812 100%)`,
        dotGlow:`0 0 6px rgba(251,185,5,0.68)`,
      },
      danger: {
        bg:     `linear-gradient(180deg, #f07a5a 0%, #d84820 47%, #b83010 49%, #cc3c18 100%)`,
        border: `rgba(140,30,0,0.60)`,
        text:   `#ffffff`,
        shadow: `0 1px 4px rgba(150,30,0,0.26), inset 0 1px 0 rgba(255,255,255,0.42)`,
        glowB:  `0 0 6px rgba(213,94,15,0.40)`,
        glowP:  `0 0 14px rgba(213,94,15,0.70)`,
        dot:    `radial-gradient(circle, #ffc0a8 0%, #cc3c18 100%)`,
        dotGlow:`0 0 6px rgba(213,94,15,0.68)`,
      },
      info: {
        bg:     `linear-gradient(180deg, #a0dcf5 0%, #3a9fd5 47%, #058ac0 49%, #1a9de0 100%)`,
        border: `rgba(5,100,160,0.60)`,
        text:   `#ffffff`,
        shadow: `0 1px 4px rgba(0,80,140,0.26), inset 0 1px 0 rgba(255,255,255,0.48)`,
        glowB:  `0 0 6px rgba(58,159,213,0.38)`,
        glowP:  `0 0 14px rgba(58,159,213,0.70)`,
        dot:    `radial-gradient(circle, #d0f0ff 0%, #1a9de0 100%)`,
        dotGlow:`0 0 6px rgba(58,159,213,0.65)`,
      },
      ghost: {
        bg:     `transparent`,
        border: `rgba(6,137,228,0.38)`,
        text:   `var(--fa-blue-sky, #0689E4)`,
        shadow: `none`,
        glowB:  `none`,
        glowP:  `0 0 10px rgba(6,137,228,0.35)`,
        dot:    `radial-gradient(circle, #9ee5ff 0%, #0689E4 100%)`,
        dotGlow:`0 0 5px rgba(6,137,228,0.60)`,
      },
    };
    const v = variants[variant] || variants.primary;

    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}
        :host {
          display: inline-block;
          font-family: ${window["FA_FONT"]};
          -webkit-font-smoothing: antialiased;
          vertical-align: middle;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: ${s.gap};
          height: ${s.h};
          padding: 0 ${s.px};
          ${pill ? `min-width: ${s.h};` : ''}
          border-radius: 9999px;
          background: ${v.bg};
          border: 1px solid ${v.border};
          box-shadow: ${v.shadow};
          font-size: ${s.fs};
          font-weight: 700;
          color: ${v.text};
          line-height: 1;
          letter-spacing: 0.02em;
          white-space: nowrap;
          user-select: none;
          transition: box-shadow 180ms ease, transform 140ms ease;

          /* Pulse vars */
          --_glow-base: ${v.glowB};
          --_glow-peak: ${v.glowP};
          ${pulse ? `animation: fa-pulse-glow 2s ease-in-out infinite;` : ''}
        }

        /* ── Gloss sheen on top half ── */
        ${variant !== 'ghost' ? `
        .badge::before {
          content: '';
          position: absolute;
          inset: 0 2px;
          height: 52%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.48) 0%,
            rgba(255,255,255,0.05) 100%
          );
          border-radius: 9999px 9999px 0 0;
          pointer-events: none;
        }` : ''}

        .content {
          position: relative;
          z-index: 1;
        }

        ${dot ? `
        .dot {
          flex-shrink: 0;
          width: ${s.dotD};
          height: ${s.dotD};
          border-radius: 50%;
          background: ${v.dot};
          box-shadow: ${v.dotGlow};
          position: relative;
          z-index: 1;
        }` : ''}
      </style>

      <span class="badge" part="badge">
        ${dot ? `<span class="dot" part="dot" aria-hidden="true"></span>` : ''}
        <span class="content" part="content">
          <slot></slot>
        </span>
      </span>
    `;
  }
}
customElements.define('fa-badge', FABadge);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-PROGRESS
   Animated glass progress bar with a glowing, glossy fill and
   an optional animated shine sweep (like Vista's progress bars).

   Attributes:
     value      — 0–100 number, current progress
     max        — max value (default 100)
     variant    — blue (default) | green | amber | multi
     size       — sm | md (default) | lg
     indeterminate — (boolean) infinite loading animation
     label      — text shown above bar (e.g. "Uploading…")
     show-value — (boolean) displays percentage inside bar

   Usage:
     <fa-progress value="65" label="Upload progress"></fa-progress>
     <fa-progress indeterminate variant="blue"></fa-progress>
   ═══════════════════════════════════════════════════════════════ */
class FAProgress extends HTMLElement {
  static get observedAttributes() {
    return ['value','max','variant','size','indeterminate','label','show-value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const value         = parseFloat(this.getAttribute('value') || '0');
    const max           = parseFloat(this.getAttribute('max')   || '100');
    const variant       = this.getAttribute('variant') || 'blue';
    const size          = this.getAttribute('size')    || 'md';
    const indeterminate = this.hasAttribute('indeterminate');
    const label         = this.getAttribute('label')   || '';
    const showValue     = this.hasAttribute('show-value');

    const pct = indeterminate ? 100 : Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeMap = {
      sm: { h: '8px',  radius: '6px',  shimH: '8px'  },
      md: { h: '14px', radius: '10px', shimH: '14px' },
      lg: { h: '20px', radius: '14px', shimH: '20px' },
    };
    const s = sizeMap[size] || sizeMap.md;

    const fillGrads = {
      blue: `linear-gradient(180deg, #6ed4f7 0%, #22a8e8 47%, #0678c1 49%, #0e98d8 100%)`,
      green:`linear-gradient(180deg, #acdb6e 0%, #72b830 47%, #4a9a0e 49%, #5aac1e 100%)`,
      amber:`linear-gradient(180deg, #fde070 0%, #fbbe20 47%, #d9980a 49%, #e8a812 100%)`,
      multi:`linear-gradient(90deg, #0689E4 0%, #7CB342 50%, #FBB905 100%)`,
    };
    const fillGlows = {
      blue: `0 0 10px rgba(6,137,228,0.55)`,
      green:`0 0 10px rgba(124,179,66,0.52)`,
      amber:`0 0 10px rgba(251,185,5,0.58)`,
      multi:`0 0 12px rgba(6,137,228,0.48)`,
    };
    const fg = fillGrads[variant] || fillGrads.blue;
    const gl = fillGlows[variant] || fillGlows.blue;

    /* Indeterminate slide animation */
    const indetAnim = indeterminate
      ? `
      @keyframes fa-progress-slide {
        0%  { left: -40%; width: 40%; }
        50% { left: 30%;  width: 60%; }
        100%{ left: 110%; width: 30%; }
      }
      .fill { animation: fa-progress-slide 1.8s cubic-bezier(0.65,0,0.35,1) infinite; }
      `
      : '';

    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}
        ${indetAnim}

        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          font-family: ${window["FA_FONT"]};
          -webkit-font-smoothing: antialiased;
        }

        /* ── Label above bar ── */
        .label-zone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--fa-text-mid, #2E5E72);
        }

        .label-text { flex: 1; }
        .pct-text {
          font-variant-numeric: tabular-nums;
          color: var(--fa-text-light, #5F8FA3);
          font-size: 0.80rem;
        }

        /* ── Track (outer shell) ── */
        .track {
          position: relative;
          height: ${s.h};
          border-radius: ${s.radius};
          overflow: hidden;
          background: linear-gradient(
            160deg,
            rgba(235,248,255,0.88) 0%,
            rgba(255,255,255,0.70) 55%,
            rgba(215,238,255,0.62) 100%
          );
          backdrop-filter: blur(10px) saturate(1.5);
          -webkit-backdrop-filter: blur(10px) saturate(1.5);
          border: 1px solid rgba(140,200,240,0.45);
          box-shadow:
            inset 0 2px 4px rgba(0,50,120,0.10),
            0 1px 0 rgba(255,255,255,0.90);
        }

        /* ── Fill bar ── */
        .fill {
          position: absolute;
          top: 0; bottom: 0;
          ${indeterminate ? `left: -40%; width: 40%;` : `left: 0; width: ${pct}%;`}
          background: ${fg};
          box-shadow: ${gl};
          border-radius: ${s.radius};
          overflow: hidden;
          transition: ${indeterminate ? 'none' : 'width 280ms cubic-bezier(0.25,0.46,0.45,0.94)'};
        }

        /* ── Gloss sheen on fill ── */
        .fill::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 52%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.58) 0%,
            rgba(255,255,255,0.05) 100%
          );
          border-radius: ${s.radius} ${s.radius} 0 0;
          pointer-events: none;
        }

        /* ── Animated shine sweep (Vista-style) ── */
        ${!indeterminate && pct > 0 && pct < 100 ? `
        .fill::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          left: 0;
          width: 50%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.65) 50%,
            transparent 100%
          );
          animation: fa-shine-sweep 2.4s ease-in-out infinite;
          pointer-events: none;
        }` : ''}

        /* ── In-bar value text ── */
        ${showValue && !indeterminate ? `
        .in-bar-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.70rem;
          font-weight: 700;
          color: ${pct > 50 ? '#fff' : 'var(--fa-text-dark, #1A3A4A)'};
          text-shadow: ${pct > 50 ? '0 1px 2px rgba(0,0,0,0.35)' : 'none'};
          z-index: 2;
          pointer-events: none;
          font-variant-numeric: tabular-nums;
        }` : ''}
      </style>

      ${label || showValue ? `
        <div class="label-zone" part="label-zone">
          <span class="label-text" part="label">${label}</span>
          ${showValue && !indeterminate ? `<span class="pct-text" part="pct">${Math.round(pct)}%</span>` : ''}
        </div>` : ''}

      <div class="track" part="track" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}">
        <div class="fill" part="fill"></div>
        ${showValue && !indeterminate ? `<div class="in-bar-value" part="in-bar-value">${Math.round(pct)}%</div>` : ''}
      </div>
    `;
  }
}
customElements.define('fa-progress', FAProgress);


/* ═══════════════════════════════════════════════════════════════
   4.  FA-TOOLTIP
   Floating frosted-dark glass tooltip. Similar to the modern
   macOS/iOS tooltip aesthetic but with Aero glass influence.
   Can be positioned around a trigger element automatically.

   Attributes:
     content   — tooltip text
     position  — top (default) | bottom | left | right
     delay     — show delay in ms (default 300)
     variant   — dark (default) | light

   Slots:
     (default) — trigger element (the thing you hover/focus)

   Usage:
     <fa-tooltip content="Click to copy">
       <fa-button>Copy</fa-button>
     </fa-tooltip>
   ═══════════════════════════════════════════════════════════════ */
class FATooltip extends HTMLElement {
  static get observedAttributes() {
    return ['content','position','delay','variant'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._visible   = false;
    this._timeout   = null;
    this._render();
  }

  connectedCallback() { this._attachListeners(); }
  disconnectedCallback() { this._detachListeners(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const content  = this.getAttribute('content')  || '';
    const position = this.getAttribute('position') || 'top';
    const variant  = this.getAttribute('variant')  || 'dark';

    const isDark = variant === 'dark';

    const tipBg = isDark
      ? `linear-gradient(180deg, rgba(20,50,80,0.94) 0%, rgba(10,30,55,0.96) 100%)`
      : `linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(240,250,255,0.96) 100%)`;
    const tipBorder = isDark
      ? `rgba(6,137,228,0.30)`
      : `rgba(6,137,228,0.35)`;
    const tipColor  = isDark ? `#e8f4fb` : `var(--fa-text-dark, #1A3A4A)`;
    const tipShadow = isDark
      ? `0 4px 16px rgba(0,30,80,0.40), 0 8px 32px rgba(0,50,120,0.28)`
      : `0 4px 16px rgba(0,80,180,0.16), 0 8px 32px rgba(0,50,100,0.12)`;
    const arrowColor = isDark ? `rgba(10,30,55,0.96)` : `rgba(240,250,255,0.96)`;

    /* Arrow positioning per side */
    const arrowMap = {
      top:    `top: 100%; left: 50%; transform: translateX(-50%); border-top-color: ${arrowColor};`,
      bottom: `bottom: 100%; left: 50%; transform: translateX(-50%); border-bottom-color: ${arrowColor};`,
      left:   `left: 100%; top: 50%; transform: translateY(-50%); border-left-color: ${arrowColor};`,
      right:  `right: 100%; top: 50%; transform: translateY(-50%); border-right-color: ${arrowColor};`,
    };
    const tipPosMap = {
      top:    `bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px);`,
      bottom: `top: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(-4px);`,
      left:   `right: calc(100% + 8px); top: 50%; transform: translateY(-50%) translateX(4px);`,
      right:  `left: calc(100% + 8px); top: 50%; transform: translateY(-50%) translateX(-4px);`,
    };
    const tipPosMapVisible = {
      top:    `bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(0);`,
      bottom: `top: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(0);`,
      left:   `right: calc(100% + 8px); top: 50%; transform: translateY(-50%) translateX(0);`,
      right:  `left: calc(100% + 8px); top: 50%; transform: translateY(-50%) translateX(0);`,
    };

    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: inline-block;
          position: relative;
          font-family: ${window["FA_FONT"]};
          -webkit-font-smoothing: antialiased;
        }

        /* ── Trigger zone ── */
        .trigger {
          display: inline-block;
        }

        /* ── Tooltip bubble ── */
        .tooltip {
          position: absolute;
          ${tipPosMap[position] || tipPosMap.top}
          background: ${tipBg};
          backdrop-filter: blur(12px) saturate(1.5);
          -webkit-backdrop-filter: blur(12px) saturate(1.5);
          border: 1px solid ${tipBorder};
          border-radius: 8px;
          padding: 6px 11px;
          font-size: 0.76rem;
          font-weight: 500;
          color: ${tipColor};
          white-space: nowrap;
          box-shadow: ${tipShadow};
          pointer-events: none;
          opacity: 0;
          z-index: 9999;
          transition: opacity 160ms ease, transform 160ms ease;
        }

        /* Arrow */
        .tooltip::after {
          content: '';
          position: absolute;
          ${arrowMap[position] || arrowMap.top}
          border: 5px solid transparent;
        }

        /* ── Visible state ── */
        .tooltip.visible {
          opacity: 1;
          ${tipPosMapVisible[position] || tipPosMapVisible.top}
        }
      </style>

      <div class="trigger" part="trigger">
        <slot></slot>
      </div>
      <div class="tooltip" part="tooltip" role="tooltip">${content}</div>
    `;
  }

  _attachListeners() {
    this._show = this._show.bind(this);
    this._hide = this._hide.bind(this);
    this.addEventListener('mouseenter', this._show);
    this.addEventListener('mouseleave', this._hide);
    this.addEventListener('focusin',    this._show);
    this.addEventListener('focusout',   this._hide);
  }

  _detachListeners() {
    this.removeEventListener('mouseenter', this._show);
    this.removeEventListener('mouseleave', this._hide);
    this.removeEventListener('focusin',    this._show);
    this.removeEventListener('focusout',   this._hide);
  }

  _show() {
    const delay = parseInt(this.getAttribute('delay') || '300');
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      const tip = this.shadowRoot.querySelector('.tooltip');
      if (tip) tip.classList.add('visible');
      this._visible = true;
    }, delay);
  }

  _hide() {
    clearTimeout(this._timeout);
    const tip = this.shadowRoot.querySelector('.tooltip');
    if (tip) tip.classList.remove('visible');
    this._visible = false;
  }
}
customElements.define('fa-tooltip', FATooltip);


/* ═══════════════════════════════════════════════════════════════
   5.  FA-TAG
   Detachable glass pill tag. Perfect for filters, keywords,
   categories. Optional × close button.

   Attributes:
     variant    — blue (default) | green | amber | neutral
     size       — sm (default) | md | lg
     removable  — (boolean) shows a close × button
     disabled   — (boolean)

   Events:
     fa-remove  — fired when × is clicked

   Usage:
     <fa-tag variant="blue" removable>JavaScript</fa-tag>
     <fa-tag variant="green">Verified</fa-tag>
   ═══════════════════════════════════════════════════════════════ */
class FATag extends HTMLElement {
  static get observedAttributes() {
    return ['variant','size','removable','disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant   = this.getAttribute('variant')  || 'blue';
    const size      = this.getAttribute('size')     || 'sm';
    const removable = this.hasAttribute('removable');
    const disabled  = this.hasAttribute('disabled');

    const sizeMap = {
      sm: { h: '24px', px: '10px', fs: '0.78rem', gap: '5px', btnSize: '16px' },
      md: { h: '28px', px: '12px', fs: '0.86rem', gap: '6px', btnSize: '18px' },
      lg: { h: '32px', px: '15px', fs: '0.92rem', gap: '7px', btnSize: '20px' },
    };
    const s = sizeMap[size] || sizeMap.sm;

    const variants = {
      blue: {
        bg:     `linear-gradient(135deg, rgba(180,225,255,0.70) 0%, rgba(110,190,245,0.42) 100%)`,
        border: `rgba(6,137,228,0.40)`,
        text:   `#0A4A7A`,
      },
      green: {
        bg:     `linear-gradient(135deg, rgba(200,242,162,0.68) 0%, rgba(145,205,90,0.40) 100%)`,
        border: `rgba(124,179,66,0.38)`,
        text:   `#1e4d00`,
      },
      amber: {
        bg:     `linear-gradient(135deg, rgba(255,238,160,0.70) 0%, rgba(251,185,5,0.38) 100%)`,
        border: `rgba(251,185,5,0.45)`,
        text:   `#5a3000`,
      },
      neutral: {
        bg:     `linear-gradient(135deg, rgba(220,235,248,0.72) 0%, rgba(200,225,242,0.45) 100%)`,
        border: `rgba(120,160,190,0.35)`,
        text:   `var(--fa-text-mid, #2E5E72)`,
      },
    };
    const v = variants[variant] || variants.blue;

    this.shadowRoot.innerHTML = `
      <style>
        ${window["FA_KF"]}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: inline-block;
          font-family: ${window["FA_FONT"]};
          -webkit-font-smoothing: antialiased;
          opacity: ${disabled ? '0.50' : '1'};
          pointer-events: ${disabled ? 'none' : 'auto'};
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: ${s.gap};
          height: ${s.h};
          padding: 0 ${s.px};
          border-radius: 9999px;
          background: ${v.bg};
          backdrop-filter: blur(8px) saturate(1.5);
          -webkit-backdrop-filter: blur(8px) saturate(1.5);
          border: 1px solid ${v.border};
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.72),
            0 1px 6px rgba(0,50,120,0.10);
          font-size: ${s.fs};
          font-weight: 600;
          color: ${v.text};
          line-height: 1;
          white-space: nowrap;
          user-select: none;
          transition: box-shadow 160ms ease, transform 140ms ease;
        }

        .content {
          flex: 1;
        }

        /* ── Remove button ── */
        ${removable ? `
        .remove-btn {
          flex-shrink: 0;
          width: ${s.btnSize};
          height: ${s.btnSize};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          border: none;
          cursor: pointer;
          outline: none;
          padding: 0; margin: 0;
          color: ${v.text};
          transition: background 120ms ease, transform 120ms ease;
          font-size: 0.70rem;
          font-weight: 700;
          line-height: 1;
        }
        .remove-btn:hover {
          background: rgba(0,0,0,0.14);
          transform: scale(1.12);
        }
        .remove-btn:active {
          transform: scale(0.92);
        }
        .remove-btn:focus-visible {
          box-shadow: 0 0 0 2px ${v.border};
        }
        ` : ''}
      </style>

      <span class="tag" part="tag">
        <span class="content" part="content">
          <slot></slot>
        </span>
        ${removable ? `
          <button class="remove-btn" part="remove-btn" aria-label="Remove tag">×</button>
        ` : ''}
      </span>
    `;

    /* Wire the remove button */
    if (removable) {
      const btn = this.shadowRoot.querySelector('.remove-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dispatchEvent(new CustomEvent('fa-remove', {
            bubbles: true, composed: true,
          }));
        });
      }
    }
  }
}
customElements.define('fa-tag', FATag);
})();
