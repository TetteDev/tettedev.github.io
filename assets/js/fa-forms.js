/**
 * ============================================================
 *  FRUTIGER AERO CUSTOM ELEMENTS — fa-forms.js
 *  Form Web Components
 *
 *  Elements: fa-input · fa-textarea · fa-select
 *            fa-checkbox · fa-radio
 *
 *  Requires: fa-design-system.css loaded in the document.
 * ============================================================
 */

const FA_FONT = `'Source Sans 3', 'Segoe UI', 'Frutiger', Arial, sans-serif`;
const FA_MONO = `'Consolas', 'Cascadia Code', 'Courier New', monospace`;

/* ─────────────────────────────────────────────────────────────
   SHARED KEYFRAMES
   ───────────────────────────────────────────────────────────── */
const FA_KF = `
  @keyframes fa-float-label {
    from { transform: translateY(0)   scale(1);    opacity: 0.75; }
    to   { transform: translateY(-22px) scale(0.82); opacity: 1; }
  }
  @keyframes fa-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fa-check-draw {
    from { stroke-dashoffset: 22; }
    to   { stroke-dashoffset: 0;  }
  }
  @keyframes fa-ripple-check {
    from { transform: scale(0.6); opacity: 0.55; }
    to   { transform: scale(2.2); opacity: 0; }
  }
  @keyframes fa-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

/* ─────────────────────────────────────────────────────────────
   SHARED: field wrapper + label float base styles
   ───────────────────────────────────────────────────────────── */
const FA_FIELD_BASE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    font-family: ${FA_FONT};
    -webkit-font-smoothing: antialiased;
  }

  /* ── Outer wrapper ── */
  .field {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  /* ── Label above field ── */
  .field-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--fa-text-mid, #2E5E72);
    letter-spacing: 0.01em;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .required-star {
    color: #d84820;
    font-size: 0.80rem;
    line-height: 1;
  }

  /* ── Helper / error text ── */
  .helper {
    font-size: 0.78rem;
    color: var(--fa-text-light, #5F8FA3);
    line-height: 1.4;
    animation: fa-fade-in 180ms ease forwards;
  }
  .helper.error {
    color: #d84820;
  }
  .helper.success {
    color: #3a8800;
  }
`;

/* ─────────────────────────────────────────────────────────────
   SHARED: the glass inset control shell used by input/textarea/select
   ───────────────────────────────────────────────────────────── */
const FA_CONTROL_SHELL = `
  /* ── Control shell (the visible frosted-inset box) ── */
  .control-shell {
    position: relative;
    display: flex;
    align-items: stretch;
    border-radius: 10px;
    overflow: hidden;
    background: linear-gradient(
      160deg,
      rgba(235,248,255,0.82) 0%,
      rgba(255,255,255,0.68) 55%,
      rgba(215,238,255,0.60) 100%
    );
    backdrop-filter: blur(12px) saturate(1.5);
    -webkit-backdrop-filter: blur(12px) saturate(1.5);
    border: 1px solid rgba(140,200,240,0.45);
    box-shadow:
      inset 0 2px 6px rgba(0,50,120,0.10),
      inset 0 1px 2px rgba(0,80,160,0.07),
      0 1px 0 rgba(255,255,255,0.90);
    transition:
      border-color 180ms ease,
      box-shadow   180ms ease,
      background   180ms ease;
  }

  /* Focus state */
  .control-shell.focused {
    border-color: rgba(6,137,228,0.70);
    box-shadow:
      inset 0 2px 6px rgba(0,50,120,0.10),
      0 0 0 3px rgba(6,137,228,0.22),
      0 0 0 1px rgba(6,137,228,0.55),
      0 1px 0 rgba(255,255,255,0.90);
    background: linear-gradient(
      160deg,
      rgba(240,250,255,0.90) 0%,
      rgba(255,255,255,0.82) 55%,
      rgba(220,242,255,0.72) 100%
    );
  }

  /* Error state */
  .control-shell.error {
    border-color: rgba(216,72,32,0.55);
    box-shadow:
      inset 0 2px 6px rgba(160,30,0,0.08),
      0 0 0 3px rgba(216,72,32,0.15),
      0 0 0 1px rgba(216,72,32,0.45);
  }

  /* Success state */
  .control-shell.success {
    border-color: rgba(100,175,50,0.55);
    box-shadow:
      inset 0 2px 6px rgba(50,130,0,0.07),
      0 0 0 3px rgba(100,175,50,0.14),
      0 0 0 1px rgba(100,175,50,0.42);
  }

  /* Disabled state */
  .control-shell.disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: rgba(220,235,248,0.50);
    border-color: rgba(140,190,220,0.28);
    box-shadow: none;
  }
`;

/* ─────────────────────────────────────────────────────────────
   COLOUR ACCENT HELPERS
   ───────────────────────────────────────────────────────────── */
const ACCENT_COLORS = {
  blue:  { check: '#0689E4', glow: 'rgba(6,137,228,0.50)', bg: `linear-gradient(135deg,#5cc8f5 0%,#0689E4 48%,#0678c1 49%,#0a8fd6 100%)`, ring: 'rgba(6,137,228,0.28)', ripple: 'rgba(6,137,228,0.30)' },
  green: { check: '#5aac1e', glow: 'rgba(90,172,30,0.50)',  bg: `linear-gradient(135deg,#a8d96a 0%,#6eb832 48%,#4a9a0e 49%,#5aac1e 100%)`, ring: 'rgba(100,175,50,0.28)', ripple: 'rgba(100,175,50,0.30)' },
  amber: { check: '#e0a500', glow: 'rgba(224,165,0,0.50)',  bg: `linear-gradient(135deg,#fde070 0%,#f9bc18 48%,#d9980a 49%,#e8a812 100%)`, ring: 'rgba(251,185,5,0.30)',  ripple: 'rgba(251,185,5,0.32)' },
};


/* ═══════════════════════════════════════════════════════════════
   1.  FA-INPUT
   Single-line text field with a frosted-glass inset appearance,
   floating label, optional prefix/suffix icon slots, and
   validation state display.

   Attributes:
     type        — text (default) | email | password | number | search | tel | url
     name        — forwarded to inner <input>
     value       — controlled value
     placeholder — placeholder text (used as floating label too)
     label       — visible label above the field
     required    — (boolean)
     disabled    — (boolean)
     readonly    — (boolean)
     state       — "" (default) | error | success
     helper      — helper / error message text below field
     maxlength   — forwarded to inner <input>
     autocomplete— forwarded to inner <input>

   Slots:
     prefix  — icon/text before the input (e.g. search icon)
     suffix  — icon/text after the input  (e.g. eye toggle, unit label)

   Usage:
     <fa-input label="Email Address" type="email" required></fa-input>
     <fa-input label="Password" type="password" state="error" helper="Too short"></fa-input>
   ═══════════════════════════════════════════════════════════════ */
class FAInput extends HTMLElement {
  static get observedAttributes() {
    return ['type','name','value','placeholder','label','required',
            'disabled','readonly','state','helper','maxlength','autocomplete'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._focused = false;
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  /* Expose value property */
  get value() {
    return this.shadowRoot.querySelector('input')?.value ?? this.getAttribute('value') ?? '';
  }
  set value(v) {
    const input = this.shadowRoot.querySelector('input');
    if (input) input.value = v;
    this.setAttribute('value', v);
  }

  _render() {
    const type        = this.getAttribute('type')         || 'text';
    const name        = this.getAttribute('name')         || '';
    const value       = this.getAttribute('value')        || '';
    const placeholder = this.getAttribute('placeholder')  || '';
    const label       = this.getAttribute('label')        || placeholder || '';
    const required    = this.hasAttribute('required');
    const disabled    = this.hasAttribute('disabled');
    const readonly    = this.hasAttribute('readonly');
    const state       = this.getAttribute('state')        || '';
    const helper      = this.getAttribute('helper')       || '';
    const maxlength   = this.getAttribute('maxlength')    || '';
    const autocomplete= this.getAttribute('autocomplete') || '';

    const shellClass = ['control-shell',
      state === 'error'   ? 'error'   : '',
      state === 'success' ? 'success' : '',
      disabled            ? 'disabled': '',
    ].filter(Boolean).join(' ');

    /* Status icon */
    const statusIcon = state === 'error'
      ? `<svg class="status-icon error-icon" viewBox="0 0 20 20" fill="none">
           <circle cx="10" cy="10" r="9" stroke="#d84820" stroke-width="1.5"/>
           <path d="M10 5.5v5M10 13.5v1" stroke="#d84820" stroke-width="2" stroke-linecap="round"/>
         </svg>`
      : state === 'success'
      ? `<svg class="status-icon success-icon" viewBox="0 0 20 20" fill="none">
           <circle cx="10" cy="10" r="9" stroke="#3a8800" stroke-width="1.5"/>
           <path d="M6 10l3 3 5-5" stroke="#3a8800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`
      : '';

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        ${FA_FIELD_BASE}
        ${FA_CONTROL_SHELL}

        .input-wrap {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 0;
        }

        /* Prefix/suffix zones */
        .prefix-zone, .suffix-zone {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0 10px;
          color: var(--fa-text-light, #5F8FA3);
        }
        ::slotted([slot="prefix"]),
        ::slotted([slot="suffix"]) {
          width: 16px; height: 16px;
          display: block;
          opacity: 0.70;
        }

        /* ── Native input — invisible chrome ── */
        input {
          flex: 1;
          min-width: 0;
          height: 42px;
          padding: 0 12px;
          background: transparent;
          border: none;
          outline: none;
          font-family: ${FA_FONT};
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--fa-text-dark, #1A3A4A);
          line-height: 1;
          caret-color: var(--fa-blue-sky, #0689E4);
        }
        input::placeholder {
          color: rgba(90,140,170,0.55);
          font-style: italic;
        }
        input:disabled { cursor: not-allowed; }

        /* Status icon */
        .status-icon {
          width: 18px; height: 18px;
          flex-shrink: 0;
          margin-right: 10px;
        }
      </style>

      <div class="field" part="field">
        ${label ? `
          <label class="field-label" part="label">
            ${label}${required ? `<span class="required-star" aria-hidden="true">*</span>` : ''}
          </label>` : ''}

        <div class="${shellClass}" part="shell" id="shell">
          <div class="input-wrap">
            <div class="prefix-zone"><slot name="prefix"></slot></div>
            <input
              part="input"
              id="input"
              type="${type}"
              name="${name}"
              value="${value}"
              ${placeholder ? `placeholder="${placeholder}"` : ''}
              ${required    ? 'required'  : ''}
              ${disabled    ? 'disabled'  : ''}
              ${readonly    ? 'readonly'  : ''}
              ${maxlength   ? `maxlength="${maxlength}"` : ''}
              ${autocomplete? `autocomplete="${autocomplete}"` : ''}
              aria-required="${required}"
              aria-invalid="${state === 'error'}"
              aria-describedby="${helper ? 'helper' : ''}"
            />
            ${statusIcon}
            <div class="suffix-zone"><slot name="suffix"></slot></div>
          </div>
        </div>

        ${helper ? `<span class="helper ${state}" part="helper" id="helper" role="${state === 'error' ? 'alert' : 'status'}">${helper}</span>` : ''}
      </div>
    `;

    /* Add focus/blur to toggle shell class */
    const input = this.shadowRoot.querySelector('input');
    const shell = this.shadowRoot.querySelector('#shell');
    if (input && shell) {
      input.addEventListener('focus', () => shell.classList.add('focused'));
      input.addEventListener('blur',  () => shell.classList.remove('focused'));
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('fa-input', {
          detail: { value: input.value }, bubbles: true, composed: true,
        }));
      });
      input.addEventListener('change', () => {
        this.dispatchEvent(new CustomEvent('fa-change', {
          detail: { value: input.value }, bubbles: true, composed: true,
        }));
      });
    }
  }
}
customElements.define('fa-input', FAInput);


/* ═══════════════════════════════════════════════════════════════
   2.  FA-TEXTAREA
   Multi-line frosted glass text area. Inherits the same shell
   and state system as fa-input.

   Attributes:
     name        — forwarded
     value       — initial content
     placeholder — placeholder text
     label       — visible label
     rows        — number of visible rows (default 4)
     required    — (boolean)
     disabled    — (boolean)
     readonly    — (boolean)
     resize      — both (default) | none | vertical | horizontal
     state       — "" | error | success
     helper      — helper text
     maxlength   — forwarded

   Usage:
     <fa-textarea label="Message" rows="5" placeholder="Write something…"></fa-textarea>
   ═══════════════════════════════════════════════════════════════ */
class FATextarea extends HTMLElement {
  static get observedAttributes() {
    return ['name','value','placeholder','label','rows','required',
            'disabled','readonly','resize','state','helper','maxlength'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  get value() {
    return this.shadowRoot.querySelector('textarea')?.value ?? this.getAttribute('value') ?? '';
  }
  set value(v) {
    const ta = this.shadowRoot.querySelector('textarea');
    if (ta) ta.value = v;
  }

  _render() {
    const name        = this.getAttribute('name')        || '';
    const value       = this.getAttribute('value')       || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const label       = this.getAttribute('label')       || placeholder || '';
    const rows        = this.getAttribute('rows')        || '4';
    const required    = this.hasAttribute('required');
    const disabled    = this.hasAttribute('disabled');
    const readonly    = this.hasAttribute('readonly');
    const resize      = this.getAttribute('resize')      || 'vertical';
    const state       = this.getAttribute('state')       || '';
    const helper      = this.getAttribute('helper')      || '';
    const maxlength   = this.getAttribute('maxlength')   || '';

    const shellClass = ['control-shell',
      state === 'error'   ? 'error'   : '',
      state === 'success' ? 'success' : '',
      disabled            ? 'disabled': '',
    ].filter(Boolean).join(' ');

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        ${FA_FIELD_BASE}
        ${FA_CONTROL_SHELL}

        .control-shell {
          align-items: flex-start;
          border-radius: 12px;
        }

        textarea {
          flex: 1;
          min-width: 0;
          width: 100%;
          padding: 12px 14px;
          background: transparent;
          border: none;
          outline: none;
          font-family: ${FA_FONT};
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--fa-text-dark, #1A3A4A);
          line-height: 1.65;
          caret-color: var(--fa-blue-sky, #0689E4);
          resize: ${resize};
          min-height: ${parseInt(rows) * 24 + 24}px;
        }
        textarea::placeholder {
          color: rgba(90,140,170,0.55);
          font-style: italic;
        }
        textarea:disabled { cursor: not-allowed; }

        /* Custom scrollbar inside textarea */
        textarea::-webkit-scrollbar       { width: 6px; }
        textarea::-webkit-scrollbar-track { background: rgba(200,235,255,0.25); border-radius: 6px; }
        textarea::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg,#5cc8f5,#1a9de0);
          border-radius: 6px;
        }

        /* Char counter */
        .counter {
          font-size: 0.72rem;
          color: var(--fa-text-light, #5F8FA3);
          text-align: right;
          padding: 0 4px 4px;
          font-variant-numeric: tabular-nums;
        }
      </style>

      <div class="field" part="field">
        ${label ? `
          <label class="field-label" part="label">
            ${label}${required ? `<span class="required-star" aria-hidden="true">*</span>` : ''}
          </label>` : ''}

        <div class="${shellClass}" part="shell" id="shell">
          <textarea
            part="textarea"
            id="textarea"
            name="${name}"
            rows="${rows}"
            ${placeholder ? `placeholder="${placeholder}"` : ''}
            ${required    ? 'required'  : ''}
            ${disabled    ? 'disabled'  : ''}
            ${readonly    ? 'readonly'  : ''}
            ${maxlength   ? `maxlength="${maxlength}"` : ''}
            aria-required="${required}"
            aria-invalid="${state === 'error'}"
            aria-describedby="${helper ? 'helper' : ''}"
          >${value}</textarea>
          ${maxlength ? `<div class="counter" part="counter" id="counter">0 / ${maxlength}</div>` : ''}
        </div>

        ${helper ? `<span class="helper ${state}" part="helper" id="helper" role="${state === 'error' ? 'alert' : 'status'}">${helper}</span>` : ''}
      </div>
    `;

    const ta      = this.shadowRoot.querySelector('textarea');
    const shell   = this.shadowRoot.querySelector('#shell');
    const counter = this.shadowRoot.querySelector('#counter');

    if (ta && shell) {
      ta.addEventListener('focus', () => shell.classList.add('focused'));
      ta.addEventListener('blur',  () => shell.classList.remove('focused'));
      ta.addEventListener('input', () => {
        if (counter) counter.textContent = `${ta.value.length} / ${maxlength}`;
        this.dispatchEvent(new CustomEvent('fa-input', {
          detail: { value: ta.value }, bubbles: true, composed: true,
        }));
      });
    }
  }
}
customElements.define('fa-textarea', FATextarea);


/* ═══════════════════════════════════════════════════════════════
   3.  FA-SELECT
   Styled dropdown using a native <select> overlaid with a glass
   shell + custom chevron. Keeps full native accessibility and
   OS-native option list.

   Attributes:
     name     — forwarded
     label    — visible label
     value    — pre-selected value (matched to option[value])
     required — (boolean)
     disabled — (boolean)
     state    — "" | error | success
     helper   — helper text
     multiple — (boolean) enables multi-select
     size     — rows visible in multi mode (default 4)

   Slots:
     (default) — <option> and <optgroup> elements

   Usage:
     <fa-select label="Country" name="country">
       <option value="">Choose…</option>
       <option value="us">United States</option>
       <option value="uk">United Kingdom</option>
     </fa-select>
   ═══════════════════════════════════════════════════════════════ */
class FASelect extends HTMLElement {
  static get observedAttributes() {
    return ['name','label','value','required','disabled','state','helper','multiple','size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  connectedCallback() { this._transferOptions(); }
  attributeChangedCallback() { this._render(); }

  get value() { return this.shadowRoot.querySelector('select')?.value ?? ''; }
  set value(v) {
    const sel = this.shadowRoot.querySelector('select');
    if (sel) sel.value = v;
  }

  _transferOptions() {
    /* Move any <option>/<optgroup> children into the shadow select */
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;
    const opts = [...this.children].filter(c =>
      c.tagName === 'OPTION' || c.tagName === 'OPTGROUP'
    );
    opts.forEach(o => select.appendChild(o));
  }

  _render() {
    const name     = this.getAttribute('name')    || '';
    const label    = this.getAttribute('label')   || '';
    const value    = this.getAttribute('value')   || '';
    const required = this.hasAttribute('required');
    const disabled = this.hasAttribute('disabled');
    const multiple = this.hasAttribute('multiple');
    const size     = this.getAttribute('size')    || '4';
    const state    = this.getAttribute('state')   || '';
    const helper   = this.getAttribute('helper')  || '';

    const shellClass = ['control-shell',
      state === 'error'   ? 'error'   : '',
      state === 'success' ? 'success' : '',
      disabled            ? 'disabled': '',
    ].filter(Boolean).join(' ');

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        ${FA_FIELD_BASE}
        ${FA_CONTROL_SHELL}

        .select-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        /* ── Native select — full coverage, transparent ── */
        select {
          width: 100%;
          height: ${multiple ? 'auto' : '42px'};
          ${multiple ? `min-height: ${parseInt(size) * 34}px;` : ''}
          padding: 0 40px 0 14px;
          background: transparent;
          border: none;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          font-family: ${FA_FONT};
          font-size: 0.95rem;
          font-weight: 400;
          color: var(--fa-text-dark, #1A3A4A);
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          line-height: 1;
        }

        select option {
          font-family: ${FA_FONT};
          background: #e8f4fb;
          color: #1A3A4A;
          padding: 6px 12px;
        }
        select option:checked {
          background: linear-gradient(90deg, #c8e8f5 0%, #a0d4f0 100%);
        }

        /* Custom chevron */
        .chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px; height: 18px;
          pointer-events: none;
          color: var(--fa-text-light, #5F8FA3);
          transition: transform 180ms ease;
          flex-shrink: 0;
        }
        .control-shell.focused .chevron {
          transform: translateY(-50%) rotate(180deg);
          color: var(--fa-blue-sky, #0689E4);
        }
      </style>

      <div class="field" part="field">
        ${label ? `
          <label class="field-label" part="label">
            ${label}${required ? `<span class="required-star" aria-hidden="true">*</span>` : ''}
          </label>` : ''}

        <div class="${shellClass}" part="shell" id="shell">
          <div class="select-wrap">
            <select
              part="select"
              id="select"
              name="${name}"
              ${required ? 'required'  : ''}
              ${disabled ? 'disabled'  : ''}
              ${multiple ? 'multiple'  : ''}
              ${multiple ? `size="${size}"` : ''}
              aria-required="${required}"
              aria-invalid="${state === 'error'}"
              aria-describedby="${helper ? 'helper' : ''}"
            >
              <slot></slot>
            </select>
            ${!multiple ? `
              <svg class="chevron" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>` : ''}
          </div>
        </div>

        ${helper ? `<span class="helper ${state}" part="helper" id="helper">${helper}</span>` : ''}
      </div>
    `;

    const select = this.shadowRoot.querySelector('select');
    const shell  = this.shadowRoot.querySelector('#shell');

    /* Transfer light-DOM options */
    ;[...this.children]
      .filter(c => c.tagName === 'OPTION' || c.tagName === 'OPTGROUP')
      .forEach(o => select && select.appendChild(o));

    /* Set pre-selected value */
    if (select && value) select.value = value;

    if (select && shell) {
      select.addEventListener('focus',  () => shell.classList.add('focused'));
      select.addEventListener('blur',   () => shell.classList.remove('focused'));
      select.addEventListener('change', () => {
        this.dispatchEvent(new CustomEvent('fa-change', {
          detail: { value: select.value }, bubbles: true, composed: true,
        }));
      });
    }
  }
}
customElements.define('fa-select', FASelect);


/* ═══════════════════════════════════════════════════════════════
   4.  FA-CHECKBOX
   A glossy orb-style toggle with an animated SVG checkmark,
   ripple effect, and optional label. Designed to feel like the
   Vista/Win7 era checkbox — tactile, slightly 3-D, shiny.

   Attributes:
     name     — forwarded to inner <input type="checkbox">
     value    — forwarded
     checked  — (boolean) initial state
     disabled — (boolean)
     required — (boolean)
     label    — visible label text
     accent   — blue (default) | green | amber
     indeterminate — (boolean) sets the indeterminate state

   Events:
     fa-change  — { checked: Boolean }

   Usage:
     <fa-checkbox label="Enable Aero effects" checked></fa-checkbox>
     <fa-checkbox label="Show desktop gadgets" accent="green"></fa-checkbox>
   ═══════════════════════════════════════════════════════════════ */
class FACheckbox extends HTMLElement {
  static get observedAttributes() {
    return ['name','value','checked','disabled','required','label','accent','indeterminate'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) {
    if (v) this.setAttribute('checked', ''); else this.removeAttribute('checked');
  }

  _render() {
    const name          = this.getAttribute('name')    || '';
    const value         = this.getAttribute('value')   || '';
    const checked       = this.hasAttribute('checked');
    const disabled      = this.hasAttribute('disabled');
    const required      = this.hasAttribute('required');
    const label         = this.getAttribute('label')   || '';
    const accent        = this.getAttribute('accent')  || 'blue';
    const indeterminate = this.hasAttribute('indeterminate');

    const ac = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-block; font-family: ${FA_FONT}; -webkit-font-smoothing: antialiased; }

        .wrapper {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          user-select: none;
          opacity: ${disabled ? '0.52' : '1'};
        }

        /* ── Hidden native checkbox (for form participation) ── */
        input {
          position: absolute;
          width: 1px; height: 1px;
          opacity: 0; margin: 0; padding: 0; border: 0;
          pointer-events: none;
        }

        /* ── Visible orb box ── */
        .box {
          position: relative;
          width: 22px; height: 22px;
          border-radius: 6px;
          flex-shrink: 0;
          background: ${checked || indeterminate
            ? ac.bg
            : `linear-gradient(145deg, rgba(235,248,255,0.88) 0%, rgba(210,238,255,0.65) 100%)`};
          border: 1.5px solid ${checked || indeterminate ? ac.check : 'rgba(120,185,225,0.50)'};
          box-shadow: ${checked || indeterminate
            ? `0 0 0 2px ${ac.ring}, inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px rgba(0,60,140,0.20)`
            : `inset 0 2px 5px rgba(0,50,120,0.10), 0 1px 0 rgba(255,255,255,0.90)`};
          transition:
            background   160ms ease,
            border-color 160ms ease,
            box-shadow   160ms ease;
          overflow: hidden;
        }

        /* Gloss sheen on box */
        .box::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 48%;
          background: linear-gradient(180deg,
            rgba(255,255,255,${checked || indeterminate ? '0.42' : '0.72'}) 0%,
            rgba(255,255,255,0.04) 100%
          );
          border-radius: 5px 5px 0 0;
          pointer-events: none;
          z-index: 1;
          transition: opacity 160ms ease;
        }

        /* ── Checkmark SVG ── */
        .check-svg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        svg { width: 14px; height: 14px; overflow: visible; }
        .check-path {
          stroke: white;
          stroke-width: 2.4;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          stroke-dasharray: 22;
          stroke-dashoffset: ${checked ? '0' : '22'};
          transition: stroke-dashoffset 200ms ease;
        }
        .indeterminate-line {
          stroke: white;
          stroke-width: 2.4;
          stroke-linecap: round;
          fill: none;
          opacity: ${indeterminate && !checked ? '1' : '0'};
          transition: opacity 160ms ease;
        }

        /* ── Ripple ── */
        .ripple-wrap {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: ${ac.ripple};
          transform: scale(0);
          animation: fa-ripple-check 0.42s ease-out forwards;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
        }

        /* ── Label text ── */
        .label-text {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--fa-text-dark, #1A3A4A);
          line-height: 1.4;
        }

        /* ── Hover ── */
        .wrapper:not(.disabled):hover .box {
          border-color: ${ac.check};
          box-shadow: 0 0 0 3px ${ac.ring},
            inset 0 2px 5px rgba(0,50,120,0.08),
            0 1px 0 rgba(255,255,255,0.90);
        }

        /* ── Focus ring on host ── */
        :host(:focus-within) .box {
          box-shadow: 0 0 0 3px ${ac.ring},
            0 0 0 1px ${ac.check} !important;
        }
      </style>

      <label class="wrapper${disabled ? ' disabled' : ''}" part="wrapper">
        <input
          type="checkbox"
          name="${name}"
          value="${value}"
          ${checked       ? 'checked'  : ''}
          ${disabled      ? 'disabled' : ''}
          ${required      ? 'required' : ''}
          aria-label="${label}"
          aria-checked="${indeterminate ? 'mixed' : checked}"
        />
        <span class="box" part="box" aria-hidden="true">
          <span class="ripple-wrap" part="ripple-wrap"></span>
          <span class="check-svg">
            <svg viewBox="0 0 14 14">
              ${indeterminate
                ? `<line class="indeterminate-line" x1="3" y1="7" x2="11" y2="7"/>`
                : `<polyline class="check-path" points="2.5,7 5.5,10 11.5,4"/>`}
            </svg>
          </span>
        </span>
        ${label ? `<span class="label-text" part="label">${label}</span>` : ''}
      </label>
    `;

    const input = this.shadowRoot.querySelector('input');
    const box   = this.shadowRoot.querySelector('.box');
    const wrap  = this.shadowRoot.querySelector('.ripple-wrap');

    if (input) {
      /* Sync indeterminate property */
      input.indeterminate = this.hasAttribute('indeterminate') && !this.hasAttribute('checked');

      input.addEventListener('change', () => {
        if (input.checked) {
          this.setAttribute('checked', '');
        } else {
          this.removeAttribute('checked');
          this.removeAttribute('indeterminate');
        }
        this.dispatchEvent(new CustomEvent('fa-change', {
          detail: { checked: input.checked }, bubbles: true, composed: true,
        }));
      });
    }

    /* Ripple on click */
    if (box && wrap) {
      box.addEventListener('pointerdown', () => {
        if (this.hasAttribute('disabled')) return;
        const r = document.createElement('span');
        r.className = 'ripple';
        wrap.appendChild(r);
        r.addEventListener('animationend', () => r.remove());
      });
    }
  }
}
customElements.define('fa-checkbox', FACheckbox);


/* ═══════════════════════════════════════════════════════════════
   5.  FA-RADIO
   Glossy radio button with the Vista-era concentric ring + orb
   fill design. Groups are formed via the name= attribute exactly
   as with native radios. Supports all the same accent colours.

   Attributes:
     name     — radio group name (forwarded to inner <input>)
     value    — option value
     checked  — (boolean) initial state
     disabled — (boolean)
     required — (boolean)
     label    — visible label text
     accent   — blue (default) | green | amber

   Events:
     fa-change  — { value: String, checked: true }

   Usage:
     <fa-radio name="theme" value="aero"    label="Aero" checked></fa-radio>
     <fa-radio name="theme" value="classic" label="Classic"></fa-radio>
   ═══════════════════════════════════════════════════════════════ */
class FARadio extends HTMLElement {
  static get observedAttributes() {
    return ['name','value','checked','disabled','required','label','accent'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();
  }

  attributeChangedCallback() { this._render(); }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) {
    if (v) this.setAttribute('checked', ''); else this.removeAttribute('checked');
  }

  _render() {
    const name     = this.getAttribute('name')    || '';
    const value    = this.getAttribute('value')   || '';
    const checked  = this.hasAttribute('checked');
    const disabled = this.hasAttribute('disabled');
    const required = this.hasAttribute('required');
    const label    = this.getAttribute('label')   || '';
    const accent   = this.getAttribute('accent')  || 'blue';

    const ac = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;

    this.shadowRoot.innerHTML = `
      <style>
        ${FA_KF}
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-block; font-family: ${FA_FONT}; -webkit-font-smoothing: antialiased; }

        .wrapper {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          user-select: none;
          opacity: ${disabled ? '0.52' : '1'};
        }

        input {
          position: absolute;
          width: 1px; height: 1px;
          opacity: 0; margin: 0; padding: 0; border: 0;
          pointer-events: none;
        }

        /* ── Outer ring ── */
        .ring {
          position: relative;
          width: 22px; height: 22px;
          border-radius: 50%;
          flex-shrink: 0;
          background: ${checked
            ? `linear-gradient(145deg, rgba(235,248,255,0.90) 0%, rgba(210,238,255,0.70) 100%)`
            : `linear-gradient(145deg, rgba(235,248,255,0.88) 0%, rgba(210,238,255,0.65) 100%)`};
          border: 1.5px solid ${checked ? ac.check : 'rgba(120,185,225,0.50)'};
          box-shadow: ${checked
            ? `0 0 0 2px ${ac.ring}, inset 0 2px 5px rgba(0,50,120,0.10), 0 1px 0 rgba(255,255,255,0.90)`
            : `inset 0 2px 5px rgba(0,50,120,0.10), 0 1px 0 rgba(255,255,255,0.90)`};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition:
            background   160ms ease,
            border-color 160ms ease,
            box-shadow   160ms ease;
        }

        /* Gloss sheen on ring */
        .ring::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 48%;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.04) 100%
          );
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }

        /* ── Inner fill orb ── */
        .dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: ${ac.bg};
          box-shadow: 0 0 6px ${ac.glow};
          transform: scale(${checked ? '1' : '0'});
          transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1);
          z-index: 2;
          position: relative;
        }

        /* Gloss on inner dot */
        .dot::before {
          content: '';
          position: absolute;
          top: 1px; left: 2px;
          width: 60%; height: 48%;
          background: rgba(255,255,255,0.55);
          border-radius: 50%;
          pointer-events: none;
        }

        /* ── Ripple ── */
        .ripple-wrap {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: ${ac.ripple};
          transform: scale(0);
          animation: fa-ripple-check 0.42s ease-out forwards;
          width: 200%; height: 200%;
          top: -50%; left: -50%;
        }

        /* ── Label ── */
        .label-text {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--fa-text-dark, #1A3A4A);
          line-height: 1.4;
        }

        /* ── Hover ── */
        .wrapper:not(.disabled):hover .ring {
          border-color: ${ac.check};
          box-shadow: 0 0 0 3px ${ac.ring},
            inset 0 2px 5px rgba(0,50,120,0.08),
            0 1px 0 rgba(255,255,255,0.90);
        }

        /* ── Focus ── */
        :host(:focus-within) .ring {
          box-shadow: 0 0 0 3px ${ac.ring},
            0 0 0 1px ${ac.check} !important;
        }
      </style>

      <label class="wrapper${disabled ? ' disabled' : ''}" part="wrapper">
        <input
          type="radio"
          name="${name}"
          value="${value}"
          ${checked  ? 'checked'  : ''}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
          aria-label="${label}"
          aria-checked="${checked}"
        />
        <span class="ring" part="ring" aria-hidden="true">
          <span class="ripple-wrap" part="ripple-wrap"></span>
          <span class="dot" part="dot"></span>
        </span>
        ${label ? `<span class="label-text" part="label">${label}</span>` : ''}
      </label>
    `;

    const input = this.shadowRoot.querySelector('input');
    const ring  = this.shadowRoot.querySelector('.ring');
    const wrap  = this.shadowRoot.querySelector('.ripple-wrap');

    if (input) {
      input.addEventListener('change', () => {
        /* Uncheck all siblings with same name in the same DOM tree */
        const name = input.name;
        if (name) {
          document.querySelectorAll(`fa-radio[name="${name}"]`).forEach(el => {
            if (el !== this) el.removeAttribute('checked');
          });
          /* Also check shadow peers */
          this.getRootNode().querySelectorAll(`fa-radio[name="${name}"]`).forEach(el => {
            if (el !== this) el.removeAttribute('checked');
          });
        }
        this.setAttribute('checked', '');
        this.dispatchEvent(new CustomEvent('fa-change', {
          detail: { value: input.value, checked: true }, bubbles: true, composed: true,
        }));
      });
    }

    /* Ripple */
    if (ring && wrap) {
      ring.addEventListener('pointerdown', () => {
        if (this.hasAttribute('disabled')) return;
        const r = document.createElement('span');
        r.className = 'ripple';
        wrap.appendChild(r);
        r.addEventListener('animationend', () => r.remove());
      });
    }
  }
}
customElements.define('fa-radio', FARadio);
