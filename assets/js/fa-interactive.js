(function () {
/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-interactive.js
 *  Interactive Web Components
 *
 *  Elements: fa-button · fa-a · fa-icon-btn
 *
 *  Requires: fa-design-system.css loaded in the document.
 * ============================================================
 */

const FA_FONT = `'Source Sans 3', 'Segoe UI', 'Frutiger', Arial, sans-serif`;

/* ─────────────────────────────────────────────────────────────
   SHARED KEYFRAMES  (injected into every shadow root)
   ───────────────────────────────────────────────────────────── */
const FA_KF = `
  @keyframes fa-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fa-ripple {
    from { transform: scale(0); opacity: 0.55; }
    to   { transform: scale(3.5); opacity: 0; }
  }
  @keyframes fa-pulse-glow {
    0%, 100% { box-shadow: var(--_glow-base); }
    50%       { box-shadow: var(--_glow-peak); }
  }
`;

/* ─────────────────────────────────────────────────────────────
   VARIANT TOKENS
   One source of truth for colours shared across all three
   interactive elements.
   ───────────────────────────────────────────────────────────── */
const VARIANTS = {
  primary: {
    /* Iconic Vista aqua orb gradient — split at ~49% */
    bg:          `linear-gradient(180deg, #6ed4f7 0%, #22a8e8 47%, #0678c1 49%, #0e98d8 100%)`,
    bgHover:     `linear-gradient(180deg, #8ee0ff 0%, #38baf8 47%, #0e8fd6 49%, #18aae8 100%)`,
    bgActive:    `linear-gradient(180deg, #1a9de0 0%, #0672b8 47%, #054e90 49%, #0678c1 100%)`,
    border:      `rgba(4, 96, 178, 0.70)`,
    borderHover: `rgba(4, 108, 200, 0.80)`,
    text:        `#ffffff`,
    textShadow:  `0 1px 2px rgba(0, 50, 130, 0.45)`,
    shadow:      `0 2px 6px rgba(0,60,140,0.32), 0 5px 18px rgba(0,80,200,0.22),
                  inset 0 1.5px 0 rgba(255,255,255,0.52), inset 0 -1px 0 rgba(0,50,130,0.28)`,
    shadowHover: `0 4px 12px rgba(0,80,200,0.40), 0 8px 28px rgba(0,80,200,0.28),
                  inset 0 1.5px 0 rgba(255,255,255,0.60)`,
    shadowActive:`0 1px 3px rgba(0,60,140,0.38), inset 0 2px 5px rgba(0,50,130,0.30)`,
    glowBase:    `0 0 8px  rgba(6,137,228,0.42), 0 4px 14px rgba(0,80,200,0.28)`,
    glowPeak:    `0 0 20px rgba(6,137,228,0.68), 0 6px 22px rgba(0,80,200,0.40)`,
    focusRing:   `0 0 0 3px rgba(6,137,228,0.50), 0 0 0 1px rgba(6,137,228,0.90)`,
  },
  secondary: {
    bg:          `linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(210,240,255,0.62) 100%)`,
    bgHover:     `linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(220,245,255,0.80) 100%)`,
    bgActive:    `linear-gradient(180deg, rgba(200,235,255,0.72) 0%, rgba(180,220,248,0.85) 100%)`,
    border:      `rgba(6,137,228,0.32)`,
    borderHover: `rgba(6,137,228,0.55)`,
    text:        `var(--fa-text-mid, #2E5E72)`,
    textShadow:  `none`,
    shadow:      `0 1px 4px rgba(0,50,100,0.12), 0 3px 12px rgba(0,80,180,0.08),
                  inset 0 1.5px 0 rgba(255,255,255,0.88), inset 0 -1px 0 rgba(0,80,180,0.10)`,
    shadowHover: `0 3px 10px rgba(0,80,180,0.18), 0 6px 22px rgba(0,80,200,0.12),
                  inset 0 1.5px 0 rgba(255,255,255,0.95)`,
    shadowActive:`0 1px 3px rgba(0,60,140,0.20), inset 0 2px 5px rgba(0,50,130,0.14)`,
    glowBase:    `0 0 6px  rgba(6,137,228,0.22)`,
    glowPeak:    `0 0 14px rgba(6,137,228,0.40)`,
    focusRing:   `0 0 0 3px rgba(6,137,228,0.40), 0 0 0 1px rgba(6,137,228,0.80)`,
  },
  success: {
    bg:          `linear-gradient(180deg, #acdb6e 0%, #72b830 47%, #4a9a0e 49%, #5aac1e 100%)`,
    bgHover:     `linear-gradient(180deg, #c4e888 0%, #88c848 47%, #5aac1e 49%, #68be2a 100%)`,
    bgActive:    `linear-gradient(180deg, #5aac1e 0%, #3e8808 47%, #2a6600 49%, #3a7a0e 100%)`,
    border:      `rgba(40,110,10,0.65)`,
    borderHover: `rgba(50,130,15,0.75)`,
    text:        `#ffffff`,
    textShadow:  `0 1px 2px rgba(20,80,0,0.45)`,
    shadow:      `0 2px 6px rgba(40,100,10,0.30), 0 5px 18px rgba(70,150,20,0.20),
                  inset 0 1.5px 0 rgba(255,255,255,0.50), inset 0 -1px 0 rgba(30,90,0,0.28)`,
    shadowHover: `0 4px 12px rgba(50,130,20,0.38), 0 8px 28px rgba(70,150,20,0.24),
                  inset 0 1.5px 0 rgba(255,255,255,0.55)`,
    shadowActive:`0 1px 3px rgba(30,100,5,0.38), inset 0 2px 5px rgba(20,80,0,0.30)`,
    glowBase:    `0 0 8px  rgba(124,179,66,0.42)`,
    glowPeak:    `0 0 20px rgba(124,179,66,0.68)`,
    focusRing:   `0 0 0 3px rgba(124,179,66,0.50), 0 0 0 1px rgba(100,160,30,0.90)`,
  },
  warning: {
    bg:          `linear-gradient(180deg, #fde070 0%, #fbbe20 47%, #d9980a 49%, #e8a812 100%)`,
    bgHover:     `linear-gradient(180deg, #fee888 0%, #fdd040 47%, #e8a812 49%, #f2b820 100%)`,
    bgActive:    `linear-gradient(180deg, #e8a812 0%, #c08000 47%, #9a6000 49%, #b07000 100%)`,
    border:      `rgba(160,100,0,0.60)`,
    borderHover: `rgba(180,120,0,0.70)`,
    text:        `#3a2000`,
    textShadow:  `0 1px 1px rgba(255,220,100,0.50)`,
    shadow:      `0 2px 6px rgba(160,100,0,0.28), 0 5px 18px rgba(200,140,0,0.18),
                  inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(140,80,0,0.28)`,
    shadowHover: `0 4px 12px rgba(180,120,0,0.36), 0 8px 28px rgba(200,140,0,0.22),
                  inset 0 1.5px 0 rgba(255,255,255,0.62)`,
    shadowActive:`0 1px 3px rgba(140,80,0,0.36), inset 0 2px 5px rgba(120,60,0,0.30)`,
    glowBase:    `0 0 8px  rgba(251,185,5,0.48)`,
    glowPeak:    `0 0 20px rgba(251,185,5,0.75)`,
    focusRing:   `0 0 0 3px rgba(251,185,5,0.55), 0 0 0 1px rgba(200,140,0,0.90)`,
  },
  danger: {
    bg:          `linear-gradient(180deg, #f07a5a 0%, #d84820 47%, #b83010 49%, #cc3c18 100%)`,
    bgHover:     `linear-gradient(180deg, #f89070 0%, #e85e30 47%, #cc3c18 49%, #e04820 100%)`,
    bgActive:    `linear-gradient(180deg, #cc3c18 0%, #a02808 47%, #801800 49%, #962000 100%)`,
    border:      `rgba(140,30,0,0.65)`,
    borderHover: `rgba(160,40,0,0.75)`,
    text:        `#ffffff`,
    textShadow:  `0 1px 2px rgba(100,0,0,0.50)`,
    shadow:      `0 2px 6px rgba(150,30,0,0.30), 0 5px 18px rgba(200,60,0,0.20),
                  inset 0 1.5px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(120,20,0,0.30)`,
    shadowHover: `0 4px 12px rgba(180,40,0,0.38), 0 8px 28px rgba(200,60,0,0.24),
                  inset 0 1.5px 0 rgba(255,255,255,0.52)`,
    shadowActive:`0 1px 3px rgba(140,20,0,0.40), inset 0 2px 5px rgba(100,10,0,0.32)`,
    glowBase:    `0 0 8px  rgba(213,94,15,0.45)`,
    glowPeak:    `0 0 20px rgba(213,94,15,0.70)`,
    focusRing:   `0 0 0 3px rgba(213,94,15,0.50), 0 0 0 1px rgba(180,40,0,0.90)`,
  },
  ghost: {
    bg:          `transparent`,
    bgHover:     `rgba(6,137,228,0.10)`,
    bgActive:    `rgba(6,137,228,0.18)`,
    border:      `rgba(6,137,228,0.38)`,
    borderHover: `rgba(6,137,228,0.58)`,
    text:        `var(--fa-blue-sky, #0689E4)`,
    textShadow:  `none`,
    shadow:      `none`,
    shadowHover: `0 2px 10px rgba(6,137,228,0.18)`,
    shadowActive:`inset 0 1px 4px rgba(6,137,228,0.20)`,
    glowBase:    `none`,
    glowPeak:    `0 0 12px rgba(6,137,228,0.35)`,
    focusRing:   `0 0 0 3px rgba(6,137,228,0.40), 0 0 0 1px rgba(6,137,228,0.80)`,
  },
};

/* ═══════════════════════════════════════════════════════════════
   1.  FA-BUTTON
   The flagship Frutiger Aero glossy orb button.
   Authentically replicates the Vista/Win7 upper-gloss / lower-
   base gradient split at ~49%, plus an inset top-bevel and
   bottom-shadow that creates the iconic 3-D bubble look.

   Attributes:
     variant  — primary (default) | secondary | success | warning | danger | ghost
     size     — sm | md (default) | lg | xl
     disabled — (boolean)
     loading  — (boolean) replaces content with a spinning ring
     full     — (boolean) width: 100%
     pulse    — (boolean) ambient glow pulse animation
     type     — button (default) | submit | reset  (forwarded to inner <button>)

   Slots:
     icon-left  — icon before label
     (default)  — button label text
     icon-right — icon after label

   Usage:
     <fa-button>Click Me</fa-button>
     <fa-button variant="success" size="lg">Save Changes</fa-button>
     <fa-button variant="primary" loading>Processing…</fa-button>
   ═══════════════════════════════════════════════════════════════ */
class FAButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'full', 'pulse', 'type'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  /* Forward click to the inner button so that form submission etc. works */
  connectedCallback() {
    this.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
        e.stopImmediatePropagation();
        return;
      }
    });
  }

  _render() {
    const variantKey = this.getAttribute('variant') || 'primary';
    const size       = this.getAttribute('size')     || 'md';
    const disabled   = this.hasAttribute('disabled');
    const loading    = this.hasAttribute('loading');
    const full       = this.hasAttribute('full');
    const pulse      = this.hasAttribute('pulse') && !disabled && !loading;
    const type       = this.getAttribute('type')    || 'button';

    const v = VARIANTS[variantKey] || VARIANTS.primary;

    /* ── Size map ── */
    const sizeMap = {
      sm: { h: '30px', px: '14px', fs: '0.82rem', gap: '5px',  radius: '8px',  iconSize: '13px', spinSize: '14px' },
      md: { h: '38px', px: '22px', fs: '0.92rem', gap: '7px',  radius: '10px', iconSize: '15px', spinSize: '17px' },
      lg: { h: '46px', px: '30px', fs: '1.02rem', gap: '8px',  radius: '12px', iconSize: '17px', spinSize: '20px' },
      xl: { h: '56px', px: '38px', fs: '1.12rem', gap: '10px', radius: '14px', iconSize: '20px', spinSize: '23px' },
    };
    const s = sizeMap[size] || sizeMap.md;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}

        :host {
          display: ${full ? 'block' : 'inline-block'};
          ${full ? 'width: 100%;' : ''}
        }

        button {
          /* Layout */
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: ${s.gap};
          width: ${full ? '100%' : 'auto'};
          height: ${s.h};
          padding: 0 ${s.px};
          overflow: hidden;

          /* Typography */
          font-family: ${FA_FONT};
          font-size: ${s.fs};
          font-weight: 600;
          letter-spacing: 0.01em;
          color: ${v.text};
          text-shadow: ${v.textShadow};
          white-space: nowrap;
          text-decoration: none;
          line-height: 1;

          /* Appearance */
          background: ${v.bg};
          border-radius: ${s.radius};
          border: 1px solid ${v.border};
          box-shadow: ${v.shadow};
          cursor: ${disabled || loading ? 'not-allowed' : 'pointer'};
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          opacity: ${disabled ? '0.55' : '1'};

          /* Transition */
          transition:
            background 160ms ease,
            box-shadow  160ms ease,
            transform   120ms cubic-bezier(0.34,1.56,0.64,1),
            border-color 160ms ease,
            opacity     160ms ease;

          /* Pulse animation CSS vars */
          --_glow-base: ${v.glowBase};
          --_glow-peak: ${v.glowPeak};
          ${pulse ? `animation: fa-pulse-glow 2.4s ease-in-out infinite;` : ''}
        }

        /* ── Top-half gloss sheen (the signature Vista split) ── */
        button::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 52%;
          border-radius: ${s.radius} ${s.radius} 50% 50% / ${s.radius} ${s.radius} 8px 8px;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.58) 0%,
            rgba(255,255,255,0.06) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* ── Hover ── */
        button:not(:disabled):hover {
          background: ${v.bgHover};
          border-color: ${v.borderHover};
          box-shadow: ${v.shadowHover};
          transform: translateY(-1.5px);
        }

        /* ── Active / pressed ── */
        button:not(:disabled):active {
          background: ${v.bgActive};
          box-shadow: ${v.shadowActive};
          transform: translateY(1px) scale(0.985);
          transition-duration: 60ms;
        }

        /* ── Focus ring ── */
        button:focus-visible {
          box-shadow: ${v.focusRing};
        }

        /* ── Icon slots ── */
        .icon-left, .icon-right {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        ::slotted([slot="icon-left"]),
        ::slotted([slot="icon-right"]) {
          width: ${s.iconSize};
          height: ${s.iconSize};
          display: block;
        }

        /* ── Label ── */
        .label {
          position: relative;
          z-index: 1;
          display: ${loading ? 'none' : 'inline'};
        }

        /* ── Loading spinner ── */
        .spinner {
          display: ${loading ? 'block' : 'none'};
          position: relative;
          z-index: 1;
          width: ${s.spinSize};
          height: ${s.spinSize};
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.30);
          border-top-color: rgba(255,255,255,0.92);
          animation: fa-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* ── Ripple container ── */
        .ripple-wrap {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.38);
          transform: scale(0);
          animation: fa-ripple 0.55s ease-out forwards;
          pointer-events: none;
        }
      </style>

      <button
        part="button"
        type="${type}"
        ${disabled || loading ? 'disabled' : ''}
        aria-disabled="${disabled || loading}"
        aria-busy="${loading}"
      >
        <div class="ripple-wrap" part="ripple-wrap"></div>
        <span class="icon-left"><slot name="icon-left"></slot></span>
        <span class="spinner" aria-hidden="true"></span>
        <span class="label"><slot></slot></span>
        <span class="icon-right"><slot name="icon-right"></slot></span>
      </button>
    `;

    /* ── Ripple effect ── */
    const btn  = this.shadowRoot.querySelector('button');
    const wrap = this.shadowRoot.querySelector('.ripple-wrap');

    btn.addEventListener('pointerdown', (e) => {
      if (disabled || loading) return;
      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const size   = Math.max(rect.width, rect.height) * 1.4;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${x - size / 2}px; top: ${y - size / 2}px;
      `;
      wrap.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }
}
customElements.define('fa-button', FAButton);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-A
   Styled anchor / hyperlink. Four visual variants to cover
   every usage context: inline text links, pill badge links,
   ghost button links, and nav-bar links.

   Attributes:
     href     — URL (forwarded to inner <a>)
     target   — _self (default) | _blank | _parent | _top
     rel      — relationship (default: "noopener noreferrer" for _blank)
     variant  — text (default) | pill | button | nav
     accent   — blue (default) | green | amber
     external — (boolean) appends an ↗ icon and sets target=_blank

   Usage:
     <fa-a href="/about">Read more</fa-a>
     <fa-a href="https://example.com" external>Visit Site</fa-a>
     <fa-a href="/download" variant="button" accent="green">Download</fa-a>
   ═══════════════════════════════════════════════════════════════ */
class FAA extends HTMLElement {
  static get observedAttributes() {
    return ['href', 'target', 'rel', 'variant', 'accent', 'external'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const href     = this.getAttribute('href')    || '#';
    const external = this.hasAttribute('external');
    const target   = external
      ? (this.getAttribute('target') || '_blank')
      : (this.getAttribute('target') || '_self');
    const rel      = this.getAttribute('rel') ||
                     (target === '_blank' ? 'noopener noreferrer' : '');
    const variant  = this.getAttribute('variant') || 'text';
    const accent   = this.getAttribute('accent')  || 'blue';

    const textColors = {
      blue:  `#0689E4`, green: `#4a9a0e`, amber: `#c07800`,
    };
    const textColorsHover = {
      blue:  `#0032DB`, green: `#2a6600`, amber: `#8a4400`,
    };
    const underlineColors = {
      blue:  `rgba(6,137,228,0.50)`,
      green: `rgba(100,175,50,0.45)`,
      amber: `rgba(200,140,0,0.48)`,
    };
    const pillBg = {
      blue:  `linear-gradient(135deg, rgba(180,225,255,0.70) 0%, rgba(110,190,245,0.40) 100%)`,
      green: `linear-gradient(135deg, rgba(200,242,162,0.68) 0%, rgba(145,205,90,0.38)  100%)`,
      amber: `linear-gradient(135deg, rgba(255,238,160,0.70) 0%, rgba(251,185,5,0.35)   100%)`,
    };
    const pillBorder = {
      blue:  `rgba(6,137,228,0.40)`,
      green: `rgba(124,179,66,0.35)`,
      amber: `rgba(251,185,5,0.45)`,
    };
    const v  = VARIANTS[accent === 'green' ? 'success' : accent === 'amber' ? 'warning' : 'primary'];
    const tc = textColors[accent] || textColors.blue;
    const th = textColorsHover[accent] || textColorsHover.blue;
    const uc = underlineColors[accent] || underlineColors.blue;
    const pb = pillBg[accent]     || pillBg.blue;
    const pbd= pillBorder[accent] || pillBorder.blue;

    /* ── Per-variant anchor styles ── */
    const variantStyles = {
      text: `
        color: ${tc};
        text-decoration: underline;
        text-decoration-color: ${uc};
        text-underline-offset: 3px;
        text-decoration-thickness: 1.5px;
        padding: 0;
        font-weight: 600;
        transition: color 150ms ease, text-decoration-color 150ms ease,
                    text-shadow 150ms ease;
      `,
      pill: `
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 0.18em 0.80em;
        border-radius: 9999px;
        font-size: 0.88em;
        font-weight: 600;
        color: ${tc};
        background: ${pb};
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid ${pbd};
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.72),
          0 1px 6px rgba(0,50,120,0.12);
        text-decoration: none;
        transition: box-shadow 180ms ease, transform 120ms ease, filter 180ms ease;
      `,
      button: `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 20px;
        border-radius: 10px;
        font-size: 0.90rem;
        font-weight: 600;
        color: ${v.text};
        text-shadow: ${v.textShadow};
        background: ${v.bg};
        border: 1px solid ${v.border};
        box-shadow: ${v.shadow};
        text-decoration: none;
        transition: background 160ms ease, box-shadow 160ms ease, transform 120ms cubic-bezier(0.34,1.56,0.64,1);
      `,
      nav: `
        display: inline-flex;
        align-items: center;
        padding: 5px 16px;
        border-radius: 9999px;
        font-size: 0.90rem;
        font-weight: 600;
        color: var(--fa-text-mid, #2E5E72);
        text-decoration: none;
        background: transparent;
        transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
      `,
    };

    const hoverStyles = {
      text:  `color: ${th}; text-decoration-color: ${th}; text-shadow: 0 0 12px ${uc};`,
      pill:  `transform: translateY(-1.5px); filter: brightness(1.06);
               box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.88), 0 4px 14px rgba(0,60,140,0.18);`,
      button:`background: ${v.bgHover}; border-color: ${v.borderHover}; box-shadow: ${v.shadowHover}; transform: translateY(-1.5px);`,
      nav:   `background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(210,240,255,0.68) 100%);
               color: var(--fa-blue-deep, #0032DB);
               box-shadow: 0 1px 6px rgba(0,80,180,0.14), inset 0 1px 0 rgba(255,255,255,0.80);`,
    };

    const VS = variantStyles[variant] || variantStyles.text;
    const HS = hoverStyles[variant]   || hoverStyles.text;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        :host { display: inline; }

        a {
          font-family: ${FA_FONT};
          -webkit-font-smoothing: antialiased;
          cursor: pointer;
          outline: none;
          ${VS}
        }

        /* ── Button variant gloss sheen ── */
        ${variant === 'button' ? `
        a {
          position: relative;
          overflow: hidden;
        }
        a::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 52%;
          border-radius: 10px 10px 50% 50%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.52) 0%,
            rgba(255,255,255,0.05) 100%
          );
          pointer-events: none;
        }
        ` : ''}

        a:hover { ${HS} }

        a:active {
          ${variant === 'button' ? `background: ${v.bgActive}; box-shadow: ${v.shadowActive}; transform: translateY(1px) scale(0.985);` : ''}
          ${variant === 'pill'   ? `transform: scale(0.97); filter: brightness(0.96);` : ''}
        }

        a:focus-visible {
          box-shadow: 0 0 0 3px rgba(6,137,228,0.45), 0 0 0 1px rgba(6,137,228,0.85);
          border-radius: ${variant === 'text' ? '3px' : variant === 'pill' || variant === 'nav' ? '9999px' : '10px'};
          outline: none;
        }

        /* ── External link icon ── */
        .ext-icon {
          display: inline-block;
          vertical-align: middle;
          margin-left: 3px;
          opacity: 0.70;
          font-size: 0.80em;
          line-height: 1;
        }
      </style>

      <a
        part="a"
        href="${href}"
        target="${target}"
        ${rel ? `rel="${rel}"` : ''}
        ${target === '_blank' ? 'aria-label="(opens in new tab)"' : ''}
      >
        <slot></slot>${external ? `<span class="ext-icon" aria-hidden="true">↗</span>` : ''}
      </a>
    `;
  }
}
customElements.define('fa-a', FAA);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-ICON-BTN
   Circular glossy icon button — the iconic Vista-era toolbar orb.
   Ideal for toolbars, FABs (floating action buttons), and
   in-line icon actions.

   Attributes:
     variant   — primary (default) | secondary | success | warning | danger | ghost
     size      — xs | sm | md (default) | lg | xl
     label     — accessible aria-label / tooltip text
     tooltip   — (boolean) shows the label= text as a hover tooltip
     disabled  — (boolean)
     pulse     — (boolean) ambient glow pulse animation
     href      — if set, renders as an <a> instead of <button>
     target    — forwarded to <a> when href is set

   Slots:
     (default) — the icon (SVG, emoji, or text glyph)

   Usage:
     <fa-icon-btn label="Close" variant="danger">✕</fa-icon-btn>
     <fa-icon-btn label="Add"   size="xl" pulse>+</fa-icon-btn>
     <fa-icon-btn label="Share" href="/share">↑</fa-icon-btn>
   ═══════════════════════════════════════════════════════════════ */
class FAIconBtn extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'label', 'tooltip', 'disabled', 'pulse', 'href', 'target'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variantKey = this.getAttribute('variant') || 'primary';
    const size       = this.getAttribute('size')    || 'md';
    const label      = this.getAttribute('label')   || '';
    const tooltip    = this.hasAttribute('tooltip');
    const disabled   = this.hasAttribute('disabled');
    const pulse      = this.hasAttribute('pulse') && !disabled;
    const href       = this.getAttribute('href')   || '';
    const target     = this.getAttribute('target') || (href ? '_self' : '');

    const v = VARIANTS[variantKey] || VARIANTS.primary;

    /* ── Size map (diameter, icon font-size) ── */
    const sizeMap = {
      xs: { d: '28px',  fs: '0.78rem', spinD: '13px' },
      sm: { d: '34px',  fs: '0.92rem', spinD: '15px' },
      md: { d: '42px',  fs: '1.10rem', spinD: '18px' },
      lg: { d: '52px',  fs: '1.35rem', spinD: '22px' },
      xl: { d: '64px',  fs: '1.65rem', spinD: '26px' },
    };
    const s = sizeMap[size] || sizeMap.md;

    /* Determine tag: anchor or button */
    const isLink = Boolean(href);
    const tag    = isLink ? 'a' : 'button';
    const attrs  = isLink
      ? `href="${href}" ${target ? `target="${target}"` : ''} role="button"`
      : `type="button" ${disabled ? 'disabled' : ''}`;
    const ariaLabel = label ? `aria-label="${label}"` : '';

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}

        :host {
          display: inline-block;
          position: relative;
          ${tooltip ? '' : ''}
        }

        ${tag} {
          /* Layout */
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: ${s.d};
          height: ${s.d};
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          text-decoration: none;

          /* Typography */
          font-family: ${FA_FONT};
          font-size: ${s.fs};
          font-weight: 600;
          color: ${v.text};
          text-shadow: ${v.textShadow};
          line-height: 1;

          /* Appearance */
          background: ${v.bg};
          border: 1px solid ${v.border};
          box-shadow: ${v.shadow};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          opacity: ${disabled ? '0.50' : '1'};

          /* Transition */
          transition:
            background  160ms ease,
            box-shadow  160ms ease,
            transform   140ms cubic-bezier(0.34,1.56,0.64,1),
            border-color 160ms ease;

          /* Pulse vars */
          --_glow-base: ${v.glowBase};
          --_glow-peak: ${v.glowPeak};
          ${pulse ? `animation: fa-pulse-glow 2.2s ease-in-out infinite;` : ''}
        }

        /* ── Circular top-half gloss sheen ── */
        ${tag}::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 52%;
          border-radius: 50% 50% 0 0;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.62) 0%,
            rgba(255,255,255,0.06) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* ── Icon wrapper ── */
        .icon {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        ::slotted(*) {
          display: block;
          width: calc(${s.d} * 0.44);
          height: calc(${s.d} * 0.44);
          line-height: 1;
          pointer-events: none;
        }

        /* ── Hover ── */
        ${tag}:not([disabled]):not([aria-disabled="true"]):hover {
          background: ${v.bgHover};
          border-color: ${v.borderHover};
          box-shadow: ${v.shadowHover};
          transform: translateY(-2px) scale(1.06);
        }

        /* ── Active ── */
        ${tag}:not([disabled]):not([aria-disabled="true"]):active {
          background: ${v.bgActive};
          box-shadow: ${v.shadowActive};
          transform: translateY(1px) scale(0.94);
          transition-duration: 60ms;
        }

        /* ── Focus ring ── */
        ${tag}:focus-visible {
          box-shadow: ${v.focusRing};
        }

        /* ── Ripple ── */
        .ripple-wrap {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.40);
          transform: scale(0);
          animation: fa-ripple 0.45s ease-out forwards;
          pointer-events: none;
        }

        /* ── Tooltip ── */
        ${tooltip && label ? `
        .tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: linear-gradient(
            180deg,
            rgba(20,50,80,0.94) 0%,
            rgba(10,30,55,0.96) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #e8f4fb;
          font-family: ${FA_FONT};
          font-size: 0.76rem;
          font-weight: 500;
          white-space: nowrap;
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid rgba(6,137,228,0.30);
          box-shadow: 0 4px 16px rgba(0,30,80,0.40);
          pointer-events: none;
          opacity: 0;
          transition: opacity 160ms ease, transform 160ms ease;
          z-index: 100;
        }
        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%; left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(10,30,55,0.96);
        }
        :host(:hover) .tooltip,
        :host(:focus-within) .tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        ` : ''}
      </style>

      <${tag} part="btn" ${ariaLabel} ${attrs}>
        <div class="ripple-wrap" part="ripple-wrap"></div>
        <span class="icon" part="icon">
          <slot></slot>
        </span>
      </${tag}>
      ${tooltip && label ? `<div class="tooltip" role="tooltip">${label}</div>` : ''}
    `;

    /* ── Wire ripple ── */
    const btn  = this.shadowRoot.querySelector(tag);
    const wrap = this.shadowRoot.querySelector('.ripple-wrap');
    if (btn && wrap) {
      btn.addEventListener('pointerdown', (e) => {
        if (disabled) return;
        const rect   = btn.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const size   = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
          width: ${size}px; height: ${size}px;
          left: ${x - size / 2}px; top: ${y - size / 2}px;
        `;
        wrap.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    }
  }
}
customElements.define('fa-icon-btn', FAIconBtn);
})();
