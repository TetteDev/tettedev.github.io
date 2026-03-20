(function () {
/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-media-utility.js
 *  Media & Utility Web Components
 *
 *  Elements: fa-img · fa-figure · fa-hr
 *            fa-divider · fa-spacer
 *
 *  Requires: fa-design-system.css loaded in the document.
 * ============================================================
 */

const FA_FONT = `'Source Sans 3', 'Segoe UI', 'Frutiger', Arial, sans-serif`;

/* ─────────────────────────────────────────────────────────────
   SHARED KEYFRAMES
   ───────────────────────────────────────────────────────────── */
const FA_KF = `
  @keyframes fa-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fa-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fa-pulse-glow {
    0%, 100% { box-shadow: var(--_glow-base); }
    50%       { box-shadow: var(--_glow-peak); }
  }
  @keyframes fa-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fa-skeleton-pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
`;


/* ═══════════════════════════════════════════════════════════════
   1.  FA-IMG
   Enhanced image component with glass captions, loading states,
   optional zoom, rounded corners, and aspect ratio control.

   Attributes:
     src        — image source URL (required)
     alt        — alt text for accessibility
     caption    — text shown in glass overlay at bottom
     aspect     — square | video | wide | portrait | auto (default)
     radius     — none | sm | md (default) | lg | xl | round
     fit        — cover (default) | contain | fill | none
     loading    — eager | lazy (default)
     zoom       — (boolean) enables click-to-zoom effect
     skeleton   — (boolean) shows loading skeleton before image loads

   Events:
     fa-loaded  — fired when image loads successfully
     fa-error   — fired when image fails to load

   Usage:
     <fa-img 
       src="photo.jpg" 
       alt="Beautiful landscape" 
       caption="Sunset over mountains"
       aspect="wide"
       radius="lg">
     </fa-img>
   ═══════════════════════════════════════════════════════════════ */
class FAImg extends HTMLElement {
  static get observedAttributes() {
    return ['src','alt','caption','aspect','radius','fit','loading','zoom','skeleton'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._loaded = false;
    this._error  = false;
    this._render();
  }

  connectedCallback() {
    this._setupImage();
  }

  attributeChangedCallback(name) {
    if (name === 'src' && this._loaded) {
      this._loaded = false;
      this._error  = false;
    }
    this._render();
    if (name === 'src') this._setupImage();
  }

  _render() {
    const src      = this.getAttribute('src')     || '';
    const alt      = this.getAttribute('alt')     || '';
    const caption  = this.getAttribute('caption') || '';
    const aspect   = this.getAttribute('aspect')  || 'auto';
    const radius   = this.getAttribute('radius')  || 'md';
    const fit      = this.getAttribute('fit')     || 'cover';
    const loading  = this.getAttribute('loading') || 'lazy';
    const zoom     = this.hasAttribute('zoom');
    const skeleton = this.hasAttribute('skeleton');

    const aspectMap = {
      square:   '1 / 1',
      video:    '16 / 9',
      wide:     '21 / 9',
      portrait: '3 / 4',
      auto:     'auto',
    };
    const aspectValue = aspectMap[aspect] || aspectMap.auto;

    const radiusMap = {
      none: '0',
      sm:   '8px',
      md:   '14px',
      lg:   '20px',
      xl:   '28px',
      round:'50%',
    };
    const r = radiusMap[radius] || radiusMap.md;

    const showSkeleton = skeleton && !this._loaded && !this._error;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          font-family: ${FA_FONT};
          -webkit-font-smoothing: antialiased;
          position: relative;
        }

        .img-container {
          position: relative;
          width: 100%;
          ${aspectValue !== 'auto' ? `aspect-ratio: ${aspectValue};` : ''}
          border-radius: ${r};
          overflow: hidden;
          background: linear-gradient(145deg, rgba(220,240,255,0.45) 0%, rgba(200,230,250,0.32) 100%);
          box-shadow: 
            0 2px 12px rgba(0,50,120,0.12),
            inset 0 1px 0 rgba(255,255,255,0.65);
          ${zoom ? 'cursor: zoom-in;' : ''}
        }

        /* ── Loading skeleton ── */
        ${showSkeleton ? `
        .skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(200,230,250,0.60) 0%,
            rgba(220,245,255,0.90) 50%,
            rgba(200,230,250,0.60) 100%
          );
          background-size: 200% 100%;
          animation: fa-shimmer 2s ease-in-out infinite;
          z-index: 1;
        }
        .skeleton::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border: 3px solid rgba(6,137,228,0.30);
          border-top-color: rgba(6,137,228,0.75);
          border-radius: 50%;
          animation: fa-spin 0.8s linear infinite;
        }
        ` : ''}

        /* ── Image element ── */
        .img {
          width: 100%;
          height: 100%;
          object-fit: ${fit};
          display: block;
          border-radius: inherit;
          transition: transform 280ms cubic-bezier(0.34,1.56,0.64,1), opacity 220ms ease;
          ${!this._loaded ? 'opacity: 0;' : 'opacity: 1;'}
        }

        ${zoom ? `
        .img-container:hover .img {
          transform: scale(1.05);
        }
        ` : ''}

        /* ── Glass caption overlay ── */
        ${caption ? `
        .caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(
            180deg,
            rgba(10,40,80,0.02) 0%,
            rgba(10,40,80,0.82) 100%
          );
          backdrop-filter: blur(10px) saturate(1.5);
          -webkit-backdrop-filter: blur(10px) saturate(1.5);
          padding: 12px 16px;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 500;
          line-height: 1.4;
          text-shadow: 0 1px 3px rgba(0,0,0,0.45);
          border-top: 1px solid rgba(255,255,255,0.18);
          border-bottom-left-radius: ${r};
          border-bottom-right-radius: ${r};
          z-index: 2;
        }
        ` : ''}

        /* ── Error state ── */
        ${this._error ? `
        .error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(145deg, rgba(255,220,220,0.50) 0%, rgba(255,200,200,0.35) 100%);
          color: var(--fa-text-mid, #2E5E72);
          font-size: 0.85rem;
          padding: 20px;
          text-align: center;
          z-index: 3;
        }
        .error-icon {
          font-size: 2rem;
          opacity: 0.60;
        }
        ` : ''}
      </style>

      <div class="img-container" part="container">
        ${showSkeleton ? `<div class="skeleton" part="skeleton"></div>` : ''}
        <img 
          class="img" 
          part="img"
          src="${src}" 
          alt="${alt}"
          loading="${loading}"
          ${!this._loaded ? 'style="opacity: 0;"' : ''}
        />
        ${caption ? `<div class="caption" part="caption">${caption}</div>` : ''}
        ${this._error ? `
          <div class="error" part="error">
            <div class="error-icon">⚠️</div>
            <div>Failed to load image</div>
          </div>
        ` : ''}
      </div>
    `;

    // Re-setup image events after render
    this._setupImage();
  }

  _setupImage() {
    const img = this.shadowRoot?.querySelector('.img');
    if (!img) return;

    img.addEventListener('load', () => {
      this._loaded = true;
      this._error  = false;
      this._render();
      this.dispatchEvent(new CustomEvent('fa-loaded', { 
        bubbles: true, 
        composed: true,
        detail: { src: this.getAttribute('src') }
      }));
    }, { once: true });

    img.addEventListener('error', () => {
      this._loaded = false;
      this._error  = true;
      this._render();
      this.dispatchEvent(new CustomEvent('fa-error', { 
        bubbles: true, 
        composed: true,
        detail: { src: this.getAttribute('src') }
      }));
    }, { once: true });

    // Zoom click handler
    if (this.hasAttribute('zoom')) {
      const container = this.shadowRoot.querySelector('.img-container');
      container?.addEventListener('click', () => {
        // Simple implementation: open in new tab
        // In production, you'd implement a proper lightbox
        window.open(this.getAttribute('src'), '_blank');
      });
    }
  }
}
customElements.define('fa-img', FAImg);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-FIGURE
   Figure container with optional glass caption card, perfect for
   images with detailed descriptions.

   Attributes:
     variant    — plain (default) | glass | card
     caption-position — below (default) | overlay | floating
     radius     — sm | md (default) | lg | xl

   Slots:
     (default) — image or media content
     caption   — figure caption content (figcaption)

   Usage:
     <fa-figure variant="glass">
       <fa-img src="photo.jpg" alt="Landscape"></fa-img>
       <div slot="caption">A beautiful mountain vista at sunset.</div>
     </fa-figure>
   ═══════════════════════════════════════════════════════════════ */
class FAFigure extends HTMLElement {
  static get observedAttributes() {
    return ['variant','caption-position','radius'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant  = this.getAttribute('variant') || 'plain';
    const captionPos = this.getAttribute('caption-position') || 'below';
    const radius   = this.getAttribute('radius') || 'md';

    const radiusMap = {
      sm: '10px',
      md: '16px',
      lg: '22px',
      xl: '32px',
    };
    const r = radiusMap[radius] || radiusMap.md;

    const variantStyles = {
      plain: {
        bg:     'transparent',
        border: 'none',
        shadow: 'none',
        pad:    '0',
      },
      glass: {
        bg:     `linear-gradient(145deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.28) 100%)`,
        border: `1px solid rgba(255,255,255,0.65)`,
        shadow: `0 2px 12px rgba(0,50,120,0.12), inset 0 1.5px 0 rgba(255,255,255,0.72)`,
        pad:    '16px',
      },
      card: {
        bg:     `linear-gradient(180deg, #eaf7ff 0%, #cde9f8 48.5%, #aed5f0 49%, #cae5f7 100%)`,
        border: `1px solid rgba(255,255,255,0.88)`,
        shadow: `0 4px 16px rgba(0,60,140,0.18), inset 0 2px 0 rgba(255,255,255,0.92)`,
        pad:    '20px',
      },
    };
    const v = variantStyles[variant] || variantStyles.plain;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          font-family: ${FA_FONT};
          -webkit-font-smoothing: antialiased;
        }

        .figure {
          position: relative;
          background: ${v.bg};
          border: ${v.border};
          box-shadow: ${v.shadow};
          border-radius: ${r};
          padding: ${v.pad};
          ${variant === 'glass' ? `
          backdrop-filter: blur(12px) saturate(1.5);
          -webkit-backdrop-filter: blur(12px) saturate(1.5);
          ` : ''}
        }

        .media {
          ${captionPos === 'overlay' || captionPos === 'floating' ? 'position: relative;' : ''}
        }

        /* ── Caption styles ── */
        .caption {
          ${captionPos === 'below' ? 'margin-top: 12px;' : ''}
          ${captionPos === 'overlay' ? `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(180deg, transparent 0%, rgba(10,40,80,0.88) 100%);
            backdrop-filter: blur(10px) saturate(1.5);
            -webkit-backdrop-filter: blur(10px) saturate(1.5);
            padding: 14px 16px;
            color: #ffffff;
            border-top: 1px solid rgba(255,255,255,0.20);
          ` : ''}
          ${captionPos === 'floating' ? `
            position: absolute;
            bottom: 12px;
            left: 12px;
            right: 12px;
            background: linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.60) 100%);
            backdrop-filter: blur(12px) saturate(1.6);
            -webkit-backdrop-filter: blur(12px) saturate(1.6);
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.85);
            box-shadow: 0 4px 16px rgba(0,40,100,0.20), inset 0 1px 0 rgba(255,255,255,0.90);
            color: var(--fa-text-dark, #1A3A4A);
          ` : ''}
          font-size: 0.88rem;
          line-height: 1.5;
          ${captionPos === 'below' ? `color: var(--fa-text-mid, #2E5E72);` : ''}
        }

        ::slotted([slot="caption"]) {
          margin: 0;
        }
      </style>

      <figure class="figure" part="figure">
        <div class="media" part="media">
          <slot></slot>
          ${captionPos !== 'below' ? `
            <div class="caption" part="caption">
              <slot name="caption"></slot>
            </div>
          ` : ''}
        </div>
        ${captionPos === 'below' ? `
          <figcaption class="caption" part="caption">
            <slot name="caption"></slot>
          </figcaption>
        ` : ''}
      </figure>
    `;
  }
}
customElements.define('fa-figure', FAFigure);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-HR
   Horizontal rule with iridescent gradient styling, orb accents,
   and various decorative styles.

   Attributes:
     variant    — gradient (default) | solid | dotted | dashed | orb | double
     color      — blue (default) | green | amber | multi | neutral
     thickness  — xs | sm | md (default) | lg | xl
     spacing    — compact | normal (default) | relaxed
     glow       — (boolean) adds ambient glow effect

   Usage:
     <fa-hr variant="gradient" color="multi"></fa-hr>
     <fa-hr variant="orb" color="blue" glow></fa-hr>
   ═══════════════════════════════════════════════════════════════ */
class FAHR extends HTMLElement {
  static get observedAttributes() {
    return ['variant','color','thickness','spacing','glow'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant   = this.getAttribute('variant')   || 'gradient';
    const color     = this.getAttribute('color')     || 'blue';
    const thickness = this.getAttribute('thickness') || 'md';
    const spacing   = this.getAttribute('spacing')   || 'normal';
    const glow      = this.hasAttribute('glow');

    const thicknessMap = {
      xs: '1px',
      sm: '2px',
      md: '3px',
      lg: '5px',
      xl: '8px',
    };
    const h = thicknessMap[thickness] || thicknessMap.md;

    const spacingMap = {
      compact: '16px',
      normal:  '32px',
      relaxed: '48px',
    };
    const gap = spacingMap[spacing] || spacingMap.normal;

    const colorGrads = {
      blue:    `linear-gradient(90deg, transparent 0%, #0689E4 50%, transparent 100%)`,
      green:   `linear-gradient(90deg, transparent 0%, #7CB342 50%, transparent 100%)`,
      amber:   `linear-gradient(90deg, transparent 0%, #FBB905 50%, transparent 100%)`,
      multi:   `linear-gradient(90deg, transparent 0%, #0689E4 25%, #7CB342 50%, #FBB905 75%, transparent 100%)`,
      neutral: `linear-gradient(90deg, transparent 0%, rgba(6,137,228,0.35) 50%, transparent 100%)`,
    };
    const grad = colorGrads[color] || colorGrads.blue;

    const solidColors = {
      blue:    '#0689E4',
      green:   '#7CB342',
      amber:   '#FBB905',
      multi:   '#0689E4',
      neutral: 'rgba(6,137,228,0.35)',
    };
    const solid = solidColors[color] || solidColors.blue;

    const glowColors = {
      blue:    '0 0 12px rgba(6,137,228,0.50)',
      green:   '0 0 12px rgba(124,179,66,0.50)',
      amber:   '0 0 12px rgba(251,185,5,0.55)',
      multi:   '0 0 16px rgba(6,137,228,0.45)',
      neutral: '0 0 10px rgba(6,137,228,0.35)',
    };
    const glowShadow = glowColors[color] || glowColors.blue;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          margin: ${gap} 0;
          font-family: ${FA_FONT};
        }

        .hr {
          position: relative;
          width: 100%;
          height: ${h};
          border: none;
          ${variant === 'gradient' ? `background: ${grad};` : ''}
          ${variant === 'solid' ? `background: ${solid};` : ''}
          ${variant === 'dotted' ? `
            border-top: ${h} dotted ${solid};
            background: transparent;
            height: 0;
          ` : ''}
          ${variant === 'dashed' ? `
            border-top: ${h} dashed ${solid};
            background: transparent;
            height: 0;
          ` : ''}
          ${variant === 'double' ? `
            border-top: ${h} double ${solid};
            background: transparent;
            height: calc(${h} * 3);
          ` : ''}
          ${glow && variant !== 'orb' ? `box-shadow: ${glowShadow};` : ''}
          border-radius: 9999px;
        }

        /* ── Orb variant (central glowing sphere) ── */
        ${variant === 'orb' ? `
        .hr {
          background: ${grad};
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hr::after {
          content: '';
          width: calc(${h} * 4);
          height: calc(${h} * 4);
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            color-mix(in srgb, ${solid} 120%, white),
            ${solid}
          );
          box-shadow: 
            ${glow ? glowShadow : `0 0 8px ${solid}40`},
            inset 0 1px 2px rgba(255,255,255,0.60);
        }
        ` : ''}
      </style>

      <hr class="hr" part="hr" role="separator" />
    `;
  }
}
customElements.define('fa-hr', FAHR);


/* ═══════════════════════════════════════════════════════════════
   4.  FA-DIVIDER
   Flexible content divider with text, icons, and decorative styles.
   More versatile than fa-hr with label support.

   Attributes:
     variant    — line (default) | gradient | dotted | orb
     color      — blue (default) | green | amber | multi | neutral
     align      — left | center (default) | right
     spacing    — compact | normal (default) | relaxed
     glow       — (boolean) adds glow effect

   Slots:
     (default) — optional label/icon in center of divider

   Usage:
     <fa-divider color="blue">Section Title</fa-divider>
     <fa-divider variant="orb" color="multi"></fa-divider>
   ═══════════════════════════════════════════════════════════════ */
class FADivider extends HTMLElement {
  static get observedAttributes() {
    return ['variant','color','align','spacing','glow'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant = this.getAttribute('variant') || 'line';
    const color   = this.getAttribute('color')   || 'blue';
    const align   = this.getAttribute('align')   || 'center';
    const spacing = this.getAttribute('spacing') || 'normal';
    const glow    = this.hasAttribute('glow');

    const spacingMap = {
      compact: '16px',
      normal:  '32px',
      relaxed: '48px',
    };
    const gap = spacingMap[spacing] || spacingMap.normal;

    const colorGrads = {
      blue:    `linear-gradient(90deg, transparent 0%, rgba(6,137,228,0.35) 50%, transparent 100%)`,
      green:   `linear-gradient(90deg, transparent 0%, rgba(124,179,66,0.35) 50%, transparent 100%)`,
      amber:   `linear-gradient(90deg, transparent 0%, rgba(251,185,5,0.35) 50%, transparent 100%)`,
      multi:   `linear-gradient(90deg, transparent 0%, #0689E4 25%, #7CB342 50%, #FBB905 75%, transparent 100%)`,
      neutral: `linear-gradient(90deg, transparent 0%, rgba(100,150,180,0.25) 50%, transparent 100%)`,
    };
    const grad = colorGrads[color] || colorGrads.blue;

    const solidColors = {
      blue:    'rgba(6,137,228,0.35)',
      green:   'rgba(124,179,66,0.35)',
      amber:   'rgba(251,185,5,0.35)',
      multi:   'rgba(6,137,228,0.35)',
      neutral: 'rgba(100,150,180,0.25)',
    };
    const solid = solidColors[color] || solidColors.blue;

    const textColors = {
      blue:    '#0689E4',
      green:   '#7CB342',
      amber:   '#FBB905',
      multi:   '#0689E4',
      neutral: 'var(--fa-text-mid, #2E5E72)',
    };
    const textColor = textColors[color] || textColors.blue;

    const justifyMap = {
      left:   'flex-start',
      center: 'center',
      right:  'flex-end',
    };
    const justify = justifyMap[align] || justifyMap.center;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          margin: ${gap} 0;
          font-family: ${FA_FONT};
        }

        .divider {
          display: flex;
          align-items: center;
          justify-content: ${justify};
          gap: 16px;
          width: 100%;
        }

        .line {
          flex: 1;
          height: ${variant === 'dotted' ? '0' : '2px'};
          ${variant === 'gradient' || variant === 'line' ? `background: ${grad};` : ''}
          ${variant === 'dotted' ? `border-top: 2px dotted ${solid};` : ''}
          ${variant === 'orb' ? `
            background: ${grad};
            position: relative;
            height: 2px;
          ` : ''}
          border-radius: 9999px;
        }

        /* ── Orb decoration ── */
        ${variant === 'orb' ? `
        .line::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, ${textColor}dd, ${textColor});
          box-shadow: 
            ${glow ? `0 0 12px ${textColor}70` : `0 0 6px ${textColor}40`},
            inset 0 1px 2px rgba(255,255,255,0.65);
        }
        ` : ''}

        .label {
          flex-shrink: 0;
          font-size: 0.85rem;
          font-weight: 600;
          color: ${textColor};
          text-transform: uppercase;
          letter-spacing: 0.06em;
          user-select: none;
        }

        ::slotted(*) {
          margin: 0;
        }

        /* ── Single line when no label ── */
        .divider:not(.has-label) .line:first-child {
          flex: 1;
        }
      </style>

      <div class="divider" part="divider">
        ${align === 'left' || align === 'center' ? '<div class="line" part="line"></div>' : ''}
        <div class="label" part="label">
          <slot></slot>
        </div>
        ${align === 'right' || align === 'center' ? '<div class="line" part="line"></div>' : ''}
      </div>
    `;

    // Check if slot has content
    const slot = this.shadowRoot.querySelector('slot');
    const hasContent = slot?.assignedNodes().length > 0;
    const divider = this.shadowRoot.querySelector('.divider');
    if (!hasContent && divider) {
      divider.classList.add('has-label');
      // If no label, show full-width line
      this.shadowRoot.innerHTML = `
        <style>
          ${FA_KF}
          *, *::before, *::after { box-sizing: border-box; margin: 0; }
          :host {
            display: block;
            margin: ${gap} 0;
            font-family: ${FA_FONT};
          }
          .line {
            width: 100%;
            height: ${variant === 'dotted' ? '0' : '2px'};
            ${variant === 'gradient' || variant === 'line' ? `background: ${grad};` : ''}
            ${variant === 'dotted' ? `border-top: 2px dotted ${solid};` : ''}
            ${variant === 'orb' ? `background: ${grad}; position: relative;` : ''}
            border-radius: 9999px;
          }
          ${variant === 'orb' ? `
          .line::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, ${textColor}dd, ${textColor});
            box-shadow: 
              ${glow ? `0 0 12px ${textColor}70` : `0 0 6px ${textColor}40`},
              inset 0 1px 2px rgba(255,255,255,0.65);
          }
          ` : ''}
        </style>
        <div class="line" part="line"></div>
      `;
    }
  }

  connectedCallback() {
    // Re-render when slot content changes
    this.shadowRoot?.querySelector('slot')?.addEventListener('slotchange', () => {
      this._render();
    });
  }
}
customElements.define('fa-divider', FADivider);


/* ═══════════════════════════════════════════════════════════════
   5.  FA-SPACER
   Vertical spacing utility component. Provides consistent spacing
   between sections with optional decorative elements.

   Attributes:
     size       — xs | sm | md (default) | lg | xl | 2xl | 3xl
     variant    — blank (default) | dotted | gradient
     color      — blue (default) | green | amber | neutral

   Usage:
     <fa-spacer size="lg"></fa-spacer>
     <fa-spacer size="md" variant="dotted" color="blue"></fa-spacer>
   ═══════════════════════════════════════════════════════════════ */
class FASpacer extends HTMLElement {
  static get observedAttributes() {
    return ['size','variant','color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const size    = this.getAttribute('size')    || 'md';
    const variant = this.getAttribute('variant') || 'blank';
    const color   = this.getAttribute('color')   || 'blue';

    const sizeMap = {
      xs:  '8px',
      sm:  '16px',
      md:  '32px',
      lg:  '48px',
      xl:  '64px',
      '2xl': '96px',
      '3xl': '128px',
    };
    const h = sizeMap[size] || sizeMap.md;

    const colorMap = {
      blue:    'rgba(6,137,228,0.20)',
      green:   'rgba(124,179,66,0.20)',
      amber:   'rgba(251,185,5,0.20)',
      neutral: 'rgba(100,150,180,0.15)',
    };
    const c = colorMap[color] || colorMap.blue;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          height: ${h};
          font-family: ${FA_FONT};
          ${variant === 'dotted' ? `
            background-image: radial-gradient(circle, ${c} 1px, transparent 1px);
            background-size: 8px 8px;
            background-position: center;
          ` : ''}
          ${variant === 'gradient' ? `
            background: linear-gradient(180deg, transparent 0%, ${c} 50%, transparent 100%);
          ` : ''}
        }
      </style>
    `;
  }
}
customElements.define('fa-spacer', FASpacer);
})();
