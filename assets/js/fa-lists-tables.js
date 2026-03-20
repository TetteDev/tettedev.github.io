(function () {
/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-lists-tables.js
 *  List & Table Web Components
 *
 *  Elements: fa-ul · fa-ol · fa-li · fa-table
 *
 *  Requires: fa-design-system.css loaded in the document.
 * ============================================================
 */

const FA_FONT = `'Source Sans 3', 'Segoe UI', 'Frutiger', Arial, sans-serif`;

/* ─────────────────────────────────────────────────────────────
   SHARED KEYFRAMES
   ───────────────────────────────────────────────────────────── */
const FA_KF = `
  @keyframes fa-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes fa-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fa-pulse-glow {
    0%, 100% { box-shadow: var(--_glow-base); }
    50%       { box-shadow: var(--_glow-peak); }
  }
`;


/* ═══════════════════════════════════════════════════════════════
   1.  FA-UL (Unordered List)
   Styled unordered list container with optional glass background.
   Works with <fa-li> children for custom bullet styling.

   Attributes:
     variant    — plain (default) | glass | glossy
     bullet     — orb (default) | disc | square | check | arrow | none
     color      — blue (default) | green | amber | neutral
     spacing    — compact | normal (default) | relaxed
     indent     — (boolean) increases left padding

   Slots:
     (default) — list items (ideally <fa-li> elements)

   Usage:
     <fa-ul bullet="orb" color="blue">
       <fa-li>First item</fa-li>
       <fa-li>Second item</fa-li>
     </fa-ul>
   ═══════════════════════════════════════════════════════════════ */
class FAUL extends HTMLElement {
  static get observedAttributes() {
    return ['variant','bullet','color','spacing','indent'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant = this.getAttribute('variant') || 'plain';
    const bullet  = this.getAttribute('bullet')  || 'orb';
    const color   = this.getAttribute('color')   || 'blue';
    const spacing = this.getAttribute('spacing') || 'normal';
    const indent  = this.hasAttribute('indent');

    const spacingMap = {
      compact: '8px',
      normal:  '14px',
      relaxed: '20px',
    };
    const gap = spacingMap[spacing] || spacingMap.normal;

    const variantStyles = {
      plain: {
        bg:     'transparent',
        border: 'none',
        shadow: 'none',
        blur:   false,
        pad:    '0',
      },
      glass: {
        bg:     `linear-gradient(145deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.28) 100%)`,
        border: `1px solid rgba(255,255,255,0.60)`,
        shadow: `0 2px 8px rgba(0,50,100,0.10), inset 0 1.5px 0 rgba(255,255,255,0.70)`,
        blur:   true,
        pad:    '20px',
      },
      glossy: {
        bg:     `linear-gradient(180deg, #eaf7ff 0%, #cde9f8 48.5%, #aed5f0 49%, #cae5f7 100%)`,
        border: `1px solid rgba(255,255,255,0.88)`,
        shadow: `0 4px 16px rgba(0,60,140,0.16), inset 0 2px 0 rgba(255,255,255,0.92)`,
        blur:   false,
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
          --fa-list-bullet: ${bullet};
          --fa-list-color: ${color};
        }

        .list-container {
          background: ${v.bg};
          border: ${v.border};
          box-shadow: ${v.shadow};
          border-radius: ${v.pad === '0' ? '0' : '14px'};
          padding: ${v.pad};
          ${v.blur ? `
          backdrop-filter: blur(12px) saturate(1.5);
          -webkit-backdrop-filter: blur(12px) saturate(1.5);
          ` : ''}
        }

        ::slotted(fa-li) {
          display: flex;
          margin-bottom: ${gap};
        }
        ::slotted(fa-li:last-child) {
          margin-bottom: 0;
        }
      </style>

      <div class="list-container" part="container">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('fa-ul', FAUL);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-OL (Ordered List)
   Styled ordered list with customizable number styling.
   Works with <fa-li> children which auto-number themselves.

   Attributes:
     variant    — plain (default) | glass | glossy
     style-type — decimal (default) | roman | alpha | orb
     color      — blue (default) | green | amber | neutral
     spacing    — compact | normal (default) | relaxed
     start      — starting number (default 1)
     indent     — (boolean) increases left padding

   Slots:
     (default) — list items (ideally <fa-li> elements)

   Usage:
     <fa-ol style-type="orb" color="green">
       <fa-li>First step</fa-li>
       <fa-li>Second step</fa-li>
     </fa-ol>
   ═══════════════════════════════════════════════════════════════ */
class FAOL extends HTMLElement {
  static get observedAttributes() {
    return ['variant','style-type','color','spacing','start','indent'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const variant   = this.getAttribute('variant')    || 'plain';
    const styleType = this.getAttribute('style-type') || 'decimal';
    const color     = this.getAttribute('color')      || 'blue';
    const spacing   = this.getAttribute('spacing')    || 'normal';
    const start     = parseInt(this.getAttribute('start') || '1');
    const indent    = this.hasAttribute('indent');

    const spacingMap = {
      compact: '8px',
      normal:  '14px',
      relaxed: '20px',
    };
    const gap = spacingMap[spacing] || spacingMap.normal;

    const variantStyles = {
      plain: {
        bg:     'transparent',
        border: 'none',
        shadow: 'none',
        blur:   false,
        pad:    '0',
      },
      glass: {
        bg:     `linear-gradient(145deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.28) 100%)`,
        border: `1px solid rgba(255,255,255,0.60)`,
        shadow: `0 2px 8px rgba(0,50,100,0.10), inset 0 1.5px 0 rgba(255,255,255,0.70)`,
        blur:   true,
        pad:    '20px',
      },
      glossy: {
        bg:     `linear-gradient(180deg, #eaf7ff 0%, #cde9f8 48.5%, #aed5f0 49%, #cae5f7 100%)`,
        border: `1px solid rgba(255,255,255,0.88)`,
        shadow: `0 4px 16px rgba(0,60,140,0.16), inset 0 2px 0 rgba(255,255,255,0.92)`,
        blur:   false,
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
          --fa-list-style-type: ${styleType};
          --fa-list-color: ${color};
          --fa-list-start: ${start};
          counter-reset: fa-ol-counter ${start - 1};
        }

        .list-container {
          background: ${v.bg};
          border: ${v.border};
          box-shadow: ${v.shadow};
          border-radius: ${v.pad === '0' ? '0' : '14px'};
          padding: ${v.pad};
          ${v.blur ? `
          backdrop-filter: blur(12px) saturate(1.5);
          -webkit-backdrop-filter: blur(12px) saturate(1.5);
          ` : ''}
        }

        ::slotted(fa-li) {
          display: flex;
          margin-bottom: ${gap};
          counter-increment: fa-ol-counter;
        }
        ::slotted(fa-li:last-child) {
          margin-bottom: 0;
        }
      </style>

      <div class="list-container" part="container">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('fa-ol', FAOL);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-LI (List Item)
   Enhanced list item with custom bullet/number rendering.
   Reads parent list context to determine styling.

   Attributes:
     highlight — (boolean) glass highlight background
     icon      — custom icon/emoji to override bullet
     value     — override counter value for ordered lists

   Slots:
     (default) — list item content

   Usage:
     <fa-ul>
       <fa-li>Regular item</fa-li>
       <fa-li highlight>Highlighted item</fa-li>
       <fa-li icon="✓">Custom icon item</fa-li>
     </fa-ul>
   ═══════════════════════════════════════════════════════════════ */
class FALI extends HTMLElement {
  static get observedAttributes() {
    return ['highlight','icon','value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  connectedCallback() {
    this._parent = this.closest('fa-ul, fa-ol');
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  _render() {
    const highlight = this.hasAttribute('highlight');
    const icon      = this.getAttribute('icon');
    const value     = this.getAttribute('value');

    const isOrdered = this._parent?.tagName?.toLowerCase() === 'fa-ol';
    const listType  = isOrdered ? 'ordered' : 'unordered';
    
    // Read parent context
    const bullet    = this._parent?.getAttribute('bullet') || 'orb';
    const styleType = this._parent?.getAttribute('style-type') || 'decimal';
    const color     = this._parent?.getAttribute('color') || 'blue';

    // Color palette
    const colorMap = {
      blue:    { main: '#0689E4', light: '#3A9FD5', glow: 'rgba(6,137,228,0.45)' },
      green:   { main: '#7CB342', light: '#B8D67A', glow: 'rgba(124,179,66,0.45)' },
      amber:   { main: '#FBB905', light: '#F5A623', glow: 'rgba(251,185,5,0.45)' },
      neutral: { main: '#5F8FA3', light: '#8AB4C8', glow: 'rgba(95,143,163,0.40)' },
    };
    const c = colorMap[color] || colorMap.blue;

    // Bullet rendering
    let bulletHTML = '';
    if (icon) {
      bulletHTML = `<span class="marker icon-marker">${icon}</span>`;
    } else if (isOrdered) {
      // Ordered list numbering
      if (styleType === 'orb') {
        bulletHTML = `<span class="marker orb-number" part="marker"></span>`;
      } else {
        bulletHTML = `<span class="marker number-marker" part="marker"></span>`;
      }
    } else {
      // Unordered list bullets
      if (bullet === 'orb') {
        bulletHTML = `<span class="marker orb-bullet" part="marker"></span>`;
      } else if (bullet === 'disc') {
        bulletHTML = `<span class="marker disc-bullet" part="marker">●</span>`;
      } else if (bullet === 'square') {
        bulletHTML = `<span class="marker square-bullet" part="marker">■</span>`;
      } else if (bullet === 'check') {
        bulletHTML = `<span class="marker check-bullet" part="marker">✓</span>`;
      } else if (bullet === 'arrow') {
        bulletHTML = `<span class="marker arrow-bullet" part="marker">→</span>`;
      } else if (bullet === 'none') {
        bulletHTML = '';
      }
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-family: ${FA_FONT};
          -webkit-font-smoothing: antialiased;
          line-height: 1.7;
          color: var(--fa-text-dark, #1A3A4A);
          font-size: 0.95rem;
          ${value ? `counter-set: fa-ol-counter ${value};` : ''}
        }

        ${highlight ? `
        :host {
          background: linear-gradient(120deg, rgba(255,255,255,0.55) 0%, rgba(220,242,255,0.38) 100%);
          backdrop-filter: blur(8px) saturate(1.4);
          -webkit-backdrop-filter: blur(8px) saturate(1.4);
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(6,137,228,0.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.70);
        }` : ''}

        /* ── Marker base ── */
        .marker {
          flex-shrink: 0;
          user-select: none;
        }

        /* ── Orb bullet (glowing sphere) ── */
        .orb-bullet {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, ${c.light}, ${c.main});
          box-shadow: 
            0 0 8px ${c.glow},
            inset 0 1px 2px rgba(255,255,255,0.65);
          display: inline-block;
          margin-top: 7px;
        }

        /* ── Orb number (Vista orb with number inside) ── */
        .orb-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(180deg, 
            ${c.light} 0%, 
            ${c.main} 47%, 
            color-mix(in srgb, ${c.main} 85%, black) 49%, 
            ${c.main} 100%
          );
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 
            0 2px 6px ${c.glow},
            inset 0 1.5px 0 rgba(255,255,255,0.55);
          position: relative;
          margin-top: 1px;
        }
        .orb-number::before {
          content: counter(fa-ol-counter, decimal);
        }
        /* Gloss sheen on orb */
        .orb-number::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 55%;
          background: linear-gradient(180deg, rgba(255,255,255,0.48) 0%, transparent 100%);
          border-radius: 50% 50% 0 0;
          pointer-events: none;
        }

        /* ── Number markers (non-orb) ── */
        .number-marker {
          display: inline-flex;
          min-width: 24px;
          font-weight: 700;
          font-size: 0.88rem;
          color: ${c.main};
          margin-top: 1px;
          font-variant-numeric: tabular-nums;
        }
        .number-marker::before {
          content: counter(fa-ol-counter, ${styleType === 'roman' ? 'lower-roman' : styleType === 'alpha' ? 'lower-alpha' : 'decimal'}) '.';
        }

        /* ── Simple bullet shapes ── */
        .disc-bullet,
        .square-bullet,
        .check-bullet,
        .arrow-bullet,
        .icon-marker {
          color: ${c.main};
          font-size: 0.90rem;
          margin-top: 3px;
          font-weight: 600;
        }

        /* ── Content zone ── */
        .content {
          flex: 1;
          min-width: 0;
        }

        ::slotted(*) {
          margin: 0;
        }
      </style>

      ${bulletHTML}
      <div class="content" part="content">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('fa-li', FALI);


/* ═══════════════════════════════════════════════════════════════
   4.  FA-TABLE
   Glass-morphic data table with frosted header, striped rows,
   hover highlighting, and optional sorting indicators.

   Attributes:
     variant     — glass (default) | glossy | bordered
     striped     — (boolean) alternating row backgrounds
     hover       — (boolean) row hover highlighting
     compact     — (boolean) reduced padding
     bordered    — (boolean) show cell borders
     sticky-header — (boolean) fixed header on scroll

   Slots:
     (default) — expects <table> element with standard HTML table markup

   Usage:
     <fa-table striped hover>
       <table>
         <thead>
           <tr><th>Name</th><th>Status</th><th>Value</th></tr>
         </thead>
         <tbody>
           <tr><td>Item 1</td><td>Active</td><td>100</td></tr>
           <tr><td>Item 2</td><td>Pending</td><td>250</td></tr>
         </tbody>
       </table>
     </fa-table>
   ═══════════════════════════════════════════════════════════════ */
class FATable extends HTMLElement {
  static get observedAttributes() {
    return ['variant','striped','hover','compact','bordered','sticky-header'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onSlotChange = () => this._styleTable();
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
    this._styleTable();
  }

  _variantShell(variant) {
    const map = {
      glass: {
        bg:     `linear-gradient(145deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.32) 100%)`,
        border: `1px solid rgba(255,255,255,0.65)`,
        shadow: `0 2px 12px rgba(0,50,120,0.12), inset 0 1.5px 0 rgba(255,255,255,0.75)`,
        blur:   true,
      },
      glossy: {
        bg:     `linear-gradient(180deg, #eaf7ff 0%, #cde9f8 48.5%, #aed5f0 49%, #cae5f7 100%)`,
        border: `1px solid rgba(255,255,255,0.88)`,
        shadow: `0 4px 16px rgba(0,60,140,0.18), inset 0 2px 0 rgba(255,255,255,0.92)`,
        blur:   false,
      },
      bordered: {
        bg:     `rgba(255,255,255,0.92)`,
        border: `2px solid rgba(6,137,228,0.32)`,
        shadow: `0 2px 8px rgba(0,80,180,0.10)`,
        blur:   false,
      },
    };
    return map[variant] || map.glass;
  }

  _variantTable(variant) {
    const map = {
      glass: {
        headerBg:    `linear-gradient(180deg, rgba(6,137,228,0.18) 0%, rgba(6,137,228,0.08) 100%)`,
        headerText:  `var(--fa-text-dark, #1A3A4A)`,
        headerBorder:`rgba(6,137,228,0.28)`,
      },
      glossy: {
        headerBg:    `linear-gradient(180deg, #c5e9ff 0%, #a5d5f5 48%, #7ab8e8 49%, #92c8f0 100%)`,
        headerText:  `#003C66`,
        headerBorder:`rgba(6,137,228,0.35)`,
      },
      bordered: {
        headerBg:    `linear-gradient(135deg, rgba(6,137,228,0.12) 0%, rgba(58,159,213,0.08) 100%)`,
        headerText:  `var(--fa-text-dark, #1A3A4A)`,
        headerBorder:`rgba(6,137,228,0.30)`,
      },
    };
    return map[variant] || map.glass;
  }

  _render() {
    const variant = this.getAttribute('variant') || 'glass';
    const s = this._variantShell(variant);

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        :host {
          display: block;
          font-family: ${FA_FONT};
          -webkit-font-smoothing: antialiased;
          overflow-x: auto;
          border-radius: 14px;
          background: ${s.bg};
          border: ${s.border};
          box-shadow: ${s.shadow};
          ${s.blur ? `
          backdrop-filter: blur(14px) saturate(1.6);
          -webkit-backdrop-filter: blur(14px) saturate(1.6);
          ` : ''}
        }

        /* base reset for the slotted table element itself */
        ::slotted(table) {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
          color: var(--fa-text-dark, #1A3A4A);
          font-size: 0.90rem;
        }
      </style>
      <slot></slot>
    `;

    const slot = this.shadowRoot.querySelector('slot');
    slot.removeEventListener('slotchange', this._onSlotChange);
    slot.addEventListener('slotchange', this._onSlotChange);
    // Style any already-assigned table (e.g. on attributeChangedCallback)
    this._styleTable();
  }

  _styleTable() {
    const slot = this.shadowRoot.querySelector('slot');
    if (!slot) return;
    const table = slot.assignedElements().find(el => el.tagName === 'TABLE');
    if (!table) return;

    const variant      = this.getAttribute('variant') || 'glass';
    const striped      = this.hasAttribute('striped');
    const hover        = this.hasAttribute('hover');
    const compact      = this.hasAttribute('compact');
    const bordered     = this.hasAttribute('bordered');
    const stickyHeader = this.hasAttribute('sticky-header');

    const cellPadding   = compact ? '8px 12px'  : '12px 16px';
    const headerPadding = compact ? '10px 12px' : '14px 16px';
    const v = this._variantTable(variant);

    // Remove any previously injected style so re-renders are clean
    const old = table.querySelector('style[data-fa-table]');
    if (old) old.remove();

    const style = document.createElement('style');
    style.setAttribute('data-fa-table', '');
    style.textContent = `
      table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        color: var(--fa-text-dark, #1A3A4A);
        font-size: 0.90rem;
        font-family: ${FA_FONT};
        -webkit-font-smoothing: antialiased;
      }
      thead th {
        background: ${v.headerBg};
        color: ${v.headerText};
        font-weight: 700;
        text-align: left;
        padding: ${headerPadding};
        border-bottom: 2px solid ${v.headerBorder};
        font-family: ${FA_FONT};
        ${stickyHeader ? `
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: blur(12px) saturate(1.5);
        -webkit-backdrop-filter: blur(12px) saturate(1.5);
        ` : ''}
      }
      tbody td {
        padding: ${cellPadding};
        ${bordered ? `border: 1px solid rgba(6,137,228,0.15);` : ''}
      }
      ${bordered ? `
      thead th { border-right: 1px solid rgba(6,137,228,0.20); }
      thead th:last-child { border-right: none; }
      ` : ''}
      ${striped ? `
      tbody tr:nth-child(even) { background: rgba(6,137,228,0.04); }
      ` : ''}
      ${hover ? `
      tbody tr:hover { background: rgba(6,137,228,0.10); transition: background 140ms ease; }
      ` : ''}
    `;
    // Prepend inside the table so it scopes to table descendants
    table.prepend(style);
  }
}
customElements.define('fa-table', FATable);
})();
