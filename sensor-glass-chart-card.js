const CARD_VERSION = '1.5.1';
// eslint-disable-next-line no-console
console.info(
  `%c SENSOR-GLASS-CHART-CARD %c v${CARD_VERSION} `,
  'color: white; background: #a78bfa; font-weight: 700;',
  'color: #a78bfa; background: white; font-weight: 700;'
);

// Design tokens matched 1:1 against liquid-glass-tile-card-v2 / thermostat-glass-card:
// INK = primary text, SECOND = secondary/subdued text (their convention is
// var(--secondary-text-color, rgba(255,255,255,X)), not color-mix on INK).
const INK = 'var(--primary-text-color, #fff)';
const SECOND = 'var(--secondary-text-color, rgba(255,255,255,0.55))';
// Same palette + order as liquid-glass-tile-card-v2's PALETTE constant, so a
// sensor row and a tile row auto-assigned the same index always match color.
const DEFAULT_COLORS = ['#a78bfa', '#d9b45c', '#5ec6c2', '#7bbf6a', '#5ea8d9', '#e0b84a', '#8a95a5', '#e07bc0'];

const STYLE = `
  :host { display:block; font-family: var(--paper-font-body1_-_font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif); }
  .card { background: color-mix(in oklch, var(--card-background-color, #17181f) var(--bg-pct, 70%), transparent);
    backdrop-filter: var(--lg-backdrop, blur(22px) saturate(180%)); -webkit-backdrop-filter: var(--lg-backdrop, blur(22px) saturate(180%));
    border: 1px solid color-mix(in srgb, ${INK} 12%, transparent); border-radius: var(--lg-radius, 20px);
    padding: 18px 0 0 0; box-sizing: border-box; overflow: hidden; clip-path: inset(0 round var(--lg-radius, 20px));
    box-shadow: 0 20px 40px -20px rgba(0,0,0,0.35), inset 0 1px 0 color-mix(in srgb, ${INK} 10%, transparent); }
  .head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; padding: 0 18px; }
  .title { font-size:14px; font-weight:600; color: ${INK}; opacity:0.85; letter-spacing:0.01em; }
  .icon-box { width:34px; height:34px; flex:none; border-radius:11px; display:flex; align-items:center; justify-content:center;
    color: ${INK};
    border: 1px solid color-mix(in srgb, ${INK} 26%, rgba(255,255,255,0.5));
    background: linear-gradient(155deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.4) 100%);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.28), inset 2px 0 4px rgba(80,200,255,0.28), inset -2px 0 4px rgba(255,90,190,0.25); }
  .icon-box svg { width:18px; height:18px; }
  .value { font-size:34px; font-weight:600; color: ${INK}; letter-spacing:-0.01em; padding: 0 18px; }
  .value .unit { font-size:18px; font-weight:500; color: ${SECOND}; margin-left:2px; }
  .value.hidden { display:none; }
  .legend { display:flex; flex-wrap:wrap; justify-content:center; gap:8px 16px; margin-top:10px; padding: 0 18px; }
  .legend.hidden { display:none; }
  .legend .item { display:flex; align-items:center; gap:6px; cursor:pointer; transition: opacity .2s ease; }
  .legend .dot { width:8px; height:8px; border-radius:50%; flex:none; }
  .legend .name { font-size:12.5px; color: ${SECOND}; font-weight:500; white-space:nowrap; }
  .legend .val { font-size:12.5px; color: ${INK}; font-weight:600; white-space:nowrap; }
  .chart { margin-top:14px; position:relative; }
  .chart svg { display:block; width:100%; height:auto; }
  .chart svg path { transition: opacity .2s ease; }
  .extrema-pill { position:absolute;
    background: linear-gradient(155deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 100%);
    backdrop-filter: blur(6px) saturate(200%); -webkit-backdrop-filter: blur(6px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.55); border-radius: 999px; padding: 3px 10px;
    font-size: 11px; font-weight: 700; color: ${INK}; white-space: nowrap; pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.32), inset 0 1px 1px rgba(255,255,255,0.5);
    opacity: 0; transition: opacity .18s ease; z-index: 2; }
  .extrema-pill.visible { opacity: 1; }
  .empty { font-size:12px; color: ${SECOND}; text-align:center; padding:20px 18px; }

  /* look: solid - a calm, solid panel instead of glass (opt-in, see
     setConfig). No blur, gradients, chromatic inner edges or shadows on
     the panel, icon or pills; legend entries become quiet chips, the one
     isolated line's chip is tinted with its colour. The chart itself
     (lines, flat area fills, full-bleed layout) is data and stays as is.
     Kept last so these rules win over the glass rules above. */
  .card.solid { background: var(--lg-panel-bg, var(--surface, color-mix(in srgb, var(--card-background-color, #1c1f28) 88%, transparent)));
    backdrop-filter: var(--lg-panel-backdrop, none); -webkit-backdrop-filter: var(--lg-panel-backdrop, none);
    border: var(--lg-panel-edge, 1px solid rgba(255,255,255,0.06)); border-radius: var(--lg-radius, 20px);
    padding-top: 16px; box-shadow: var(--lg-panel-shadow, none); }
  .card.solid .head, .card.solid .value, .card.solid .legend { padding: 0 16px; }
  .card.solid .head { align-items: center; }
  .card.solid .title { font-size:15px; font-weight:600; opacity:1; letter-spacing:0; }
  .card.solid .icon-box { width:36px; height:36px; border-radius:50%; border:none; box-shadow:none;
    background: color-mix(in srgb, ${INK} 10%, transparent); color: ${SECOND}; }
  .card.solid .icon-box.tinted { background: color-mix(in srgb, var(--c) 20%, transparent); color: var(--c); }
  .card.solid .icon-box:empty { display:none; }
  .card.solid .value { font-variant-numeric: tabular-nums; }
  .card.solid .legend { gap:8px; margin-top:12px; }
  .card.solid .legend .item { position:relative; gap:8px; min-height:36px; box-sizing:border-box; padding:0 12px;
    background: var(--lg-tile-bg, color-mix(in srgb, ${INK} 8%, transparent));
    border: var(--lg-tile-edge, 1px solid rgba(255,255,255,0.04)); box-shadow: var(--lg-tile-shadow, none); border-radius: calc(var(--lg-radius, 20px) - 4px);
    transition: opacity .2s ease, background .2s ease; }
  /* 36px chips, 44px tap targets: the 8px gaps between wrapped rows
     are split between the chips above and below */
  .card.solid .legend .item::before { content:""; position:absolute; left:0; right:0; top:-4px; bottom:-4px; }
  .card.solid .legend .item.selected { background: color-mix(in srgb, var(--c) 20%, var(--lg-tile-bg, color-mix(in srgb, ${INK} 8%, transparent))); }
  .card.solid .legend .name, .card.solid .legend .val { font-size:13px; }
  .card.solid .legend .val { font-variant-numeric: tabular-nums; }
  .card.solid .extrema-pill { background: var(--surface, color-mix(in srgb, var(--card-background-color, #1c1f28) 88%, transparent));
    backdrop-filter:none; -webkit-backdrop-filter:none; border: 1px solid rgba(255,255,255,0.08);
    box-shadow:none; padding: 3px 10px; font-size:12px; font-weight:600; font-variant-numeric: tabular-nums; }
  .card.solid .empty { font-size:13px; padding:20px 16px; }
  @media (prefers-reduced-motion: reduce) {
    .card.solid .legend .item, .card.solid .chart svg path, .card.solid .extrema-pill { transition:none; }
  }
`;

function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Resamples a raw [ [timestampMs, value], ... ] history series into N
// evenly spaced points across [start, end] via linear interpolation, so
// short recorder gaps/irregular update intervals don't distort the curve.
function resample(history, start, end, n) {
  if (!history.length) return null;
  const sorted = history.slice().sort((a, b) => a[0] - b[0]);
  const out = [];
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const t = start + ((end - start) * i) / (n - 1);
    while (idx < sorted.length - 1 && sorted[idx + 1][0] <= t) idx++;
    const cur = sorted[idx];
    const next = sorted[idx + 1];
    let val;
    if (!next || t <= cur[0]) val = cur[1];
    else {
      const frac = (t - cur[0]) / (next[0] - cur[0]);
      val = cur[1] + (next[1] - cur[1]) * frac;
    }
    out.push(val);
  }
  return out;
}

// Formats a value the way the rest of the ecosystem does (comma decimal,
// sensible precision) without a unit attached.
function fmtVal(v, unit) {
  if (!Number.isFinite(v)) return '–';
  const decimals = unit === '%' ? 1 : (Math.abs(v) < 10 ? 1 : 0);
  return v.toFixed(decimals).replace('.', ',');
}

// Anchors a pill by its edge instead of its center once its point sits too
// close to the left/right border, so it grows inward instead of hanging
// half off the card.
function pillTransform(xFrac) {
  if (xFrac < 0.12) return 'translate(2px, -50%)';
  if (xFrac > 0.88) return 'translate(calc(-100% - 2px), -50%)';
  return 'translate(-50%, -50%)';
}

class SensorGlassChartCard extends HTMLElement {
  setConfig(config) {
    if (!config.rows || !Array.isArray(config.rows) || !config.rows.length) {
      throw new Error('sensor-glass-chart-card: "rows" (array of {entity, name, color}) is required.');
    }
    this._config = config;
    this._lastStates = null;
    this._valueHtml = null;
    this._build();
    // look: solid is opt-in; anything else keeps the glass look untouched.
    // `look: solid|glass` in the config wins; otherwise the theme decides
    // via the CSS variable --lg-look (see _effectiveLook / _checkLook).
    this._solid = this._effectiveLook(config) === 'solid';
    this._applyLook();
    if (config.bg_opacity != null && this._cardEl) {
      this._cardEl.style.setProperty('--bg-pct', Math.max(0, Math.min(100, config.bg_opacity * 100)) + '%');
    }
    this._titleEl.textContent = config.title || '';
    this._iconBoxEl.innerHTML = this._iconSvg(config.icon);
    // setConfig() often runs *before* hass is assigned for the first time,
    // in which case _fetchHistory()'s hass-guard would bail out silently
    // and never get a second chance (the hass setter used to only call
    // _renderValue()). Re-fetch on config changes if hass is already known,
    // otherwise let the hass setter below kick off the first fetch.
    clearTimeout(this._pollTimer);
    this._historyStarted = false;
    if (this._hass) {
      this._historyStarted = true;
      this._fetchHistory();
    }
  }

  set hass(hass) {
    this._hass = hass;
    // Theme switches arrive via hass.themes - only then re-read --lg-look
    // (no getComputedStyle on every hass tick).
    const th = hass && hass.themes;
    const themeSig = th ? th.theme + '|' + th.darkMode : '';
    if (th !== this._themesRef || themeSig !== this._themeSig) {
      this._themesRef = th;
      this._themeSig = themeSig;
      this._scheduleLookCheck();
    }
    // HA calls this on every state change anywhere in the system; only do
    // work when one of this card's own entities actually changed.
    const rows = this._config ? this._config.rows : [];
    const changed = !this._lastStates || rows.some((r, i) => hass.states[r.entity] !== this._lastStates[i]);
    if (changed) {
      this._lastStates = rows.map((r) => hass.states[r.entity]);
      this._renderValue();
    }
    if (!this._historyStarted) {
      this._historyStarted = true;
      this._fetchHistory();
    }
  }

  // Stop polling the recorder while the card isn't on screen (e.g. inside a
  // closed popup or another view) and catch up as soon as it returns.
  connectedCallback() {
    if (!this._onThemeChanged) this._onThemeChanged = () => this._scheduleLookCheck();
    window.addEventListener('lg-theme-changed', this._onThemeChanged);
    this._scheduleLookCheck();
    if (this._hass && this._config && this._historyStarted && !this._pollTimer) this._fetchHistory();
  }

  disconnectedCallback() {
    clearTimeout(this._pollTimer);
    this._pollTimer = null;
    if (this._onThemeChanged) window.removeEventListener('lg-theme-changed', this._onThemeChanged);
    cancelAnimationFrame(this._lookRaf);
  }

  // Effective look: `look: solid|glass` in the config, else the theme's
  // --lg-look variable on this element (quotes tolerated), else glass.
  _effectiveLook(config) {
    const own = config && config.look;
    if (own === 'solid' || own === 'glass') return own;
    let v = '';
    try { v = getComputedStyle(this).getPropertyValue('--lg-look'); } catch (e) { v = ''; }
    v = String(v || '').trim().replace(/^["']+|["']+$/g, '').trim().toLowerCase();
    return v === 'solid' ? 'solid' : 'glass';
  }

  // Re-read the theme now and once more on the next frame (the theme may
  // only apply its variables after this element got connected / hass).
  _scheduleLookCheck() {
    this._checkLook();
    cancelAnimationFrame(this._lookRaf);
    this._lookRaf = requestAnimationFrame(() => this._checkLook());
  }

  _checkLook() {
    const c = this._config;
    if (!c || c.look === 'solid' || c.look === 'glass' || !this._cardEl) return;
    const solid = this._effectiveLook(c) === 'solid';
    if (solid === this._solid) return;
    // Same result as setConfig() with the same config, minus the history
    // re-fetch (the chart itself doesn't depend on the look).
    this._solid = solid;
    this._applyLook();
    this._renderValue();
    if (this._legendItemEls) this._setActive(this._activeIndex);
  }

  // Everything in the DOM that depends on the look.
  _applyLook() {
    const config = this._config;
    const solid = this._isSolid();
    this._cardEl.classList.toggle('solid', solid);
    // The legend is rebuilt for the new config (row colours / chip tint).
    this._legendItemEls = null;
    // Solid: a single-row card's icon is info for that one sensor, so it
    // takes the row colour; with several rows it stays neutral.
    const tint = solid && config.rows.length === 1 ? this._rowColor(config.rows[0], 0) : null;
    this._iconBoxEl.classList.toggle('tinted', !!tint);
    if (tint) this._iconBoxEl.style.setProperty('--c', tint);
    else this._iconBoxEl.style.removeProperty('--c');
    if (!this._iconBoxEl.getAttribute('style')) this._iconBoxEl.removeAttribute('style');
  }

  _noDataHtml() {
    const lang = String((this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || 'en');
    return `<div class="empty">${lang.startsWith('de') ? 'Keine Verlaufsdaten verf\u00fcgbar' : 'No history available'}</div>`;
  }

  getCardSize() { return 4; }

  _isSolid() { return !!this._config && !!this._solid; }

  static getStubConfig() {
    return {
      type: 'custom:sensor-glass-chart-card',
      title: 'Temperaturen',
      icon: 'temperature',
      unit: '°C',
      hours: 12,
      rows: [
        { entity: 'sensor.wohnzimmer_temperatur', name: 'Wohnzimmer' },
        { entity: 'sensor.schlafzimmer_temperatur', name: 'Schlafzimmer' },
      ],
    };
  }

  _iconSvg(kind) {
    // fill uses currentColor so .icon-box's `color: ${INK}` drives it,
    // matching how the ha-icon based icon-boxes in the other cards work.
    if (kind === 'humidity') {
      return '<svg viewBox="0 0 12 16" fill="currentColor"><polygon points="6,0 11,9 1,9"/><circle cx="6" cy="10.5" r="5"/></svg>';
    }
    if (kind === 'temperature') {
      return '<svg viewBox="0 0 14 16" fill="currentColor"><rect x="5" y="0" width="4" height="10" rx="2"/><circle cx="7" cy="12" r="4"/></svg>';
    }
    if (kind === 'battery') {
      return '<svg viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="3" width="13" height="10" rx="2.5"/><rect x="15" y="6.5" width="2.2" height="3" rx="0.8" fill="currentColor" stroke="none"/></svg>';
    }
    if (kind === 'power') {
      return '<svg viewBox="0 0 12 16" fill="currentColor"><path d="M7 0 L1 9.5 H5 L4 16 L11 6 H6.2 Z"/></svg>';
    }
    return '';
  }

  _build() {
    if (this._built) return;
    this._built = true;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
      <div class="card">
        <div class="head"><div class="title"></div><div class="icon-box"></div></div>
        <div class="value hidden"></div>
        <div class="legend"></div>
        <div class="chart">
          <div class="chart-inner"></div>
          <div class="extrema-pill" data-role="max"></div>
          <div class="extrema-pill" data-role="min"></div>
        </div>
      </div>`;
    this._cardEl = this.shadowRoot.querySelector('.card');
    this._titleEl = this.shadowRoot.querySelector('.title');
    this._iconBoxEl = this.shadowRoot.querySelector('.icon-box');
    this._valueEl = this.shadowRoot.querySelector('.value');
    this._legendEl = this.shadowRoot.querySelector('.legend');
    this._chartEl = this.shadowRoot.querySelector('.chart-inner');
    this._pillMaxEl = this.shadowRoot.querySelector('.extrema-pill[data-role="max"]');
    this._pillMinEl = this.shadowRoot.querySelector('.extrema-pill[data-role="min"]');
    this._activeIndex = null;
    this._legendItemEls = [];

    // Hover-to-isolate (desktop/mouse), matching mini-graph-card's legend
    // behavior: entering a legend item dims every other line/area.
    this._legendEl.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const item = e.target.closest('.item');
      if (!item) return;
      this._setActive(Number(item.dataset.index));
    });
    this._legendEl.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'mouse') return;
      const item = e.target.closest('.item');
      if (!item || item.contains(e.relatedTarget)) return;
      this._setActive(null);
    });
    // Tap-to-isolate (touch/mobile, and also works with a mouse click):
    // tap a name to isolate its line, tap it again to show all again.
    this._legendEl.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      const idx = Number(item.dataset.index);
      this._setActive(this._activeIndex === idx ? null : idx);
    });
  }

  _setActive(idx) {
    this._activeIndex = idx;
    const svg = this._chartEl && this._chartEl.querySelector('svg');
    if (svg) {
      svg.querySelectorAll('[data-idx]').forEach((el) => {
        const match = idx === null || Number(el.dataset.idx) === idx;
        el.style.opacity = match ? '' : '0.08';
      });
    }
    if (this._legendEl) {
      this._legendEl.querySelectorAll('.item').forEach((item) => {
        const match = idx === null || Number(item.dataset.index) === idx;
        item.style.opacity = match ? '' : '0.4';
        // Solid: the isolated line's chip is tinted with its colour.
        if (this._isSolid()) item.classList.toggle('selected', idx !== null && match);
      });
    }
    this._updateExtrema();
  }

  // Shows the min/max value of whichever line is currently isolated, as a
  // small frosted "lens" pill positioned right at the peak/valley on the
  // curve. Only visible while a line is isolated (hover or tap) - there's
  // no single sensible min/max across e.g. six different rooms at once.
  _updateExtrema() {
    const idx = this._activeIndex;
    const stats = idx !== null && this._rowStats ? this._rowStats[idx] : null;
    if (!stats || !this._pillMaxEl || !this._pillMinEl) {
      if (this._pillMaxEl) this._pillMaxEl.classList.remove('visible');
      if (this._pillMinEl) this._pillMinEl.classList.remove('visible');
      return;
    }
    const unit = stats.unit || '';
    const maxFrac = stats.maxPt[0] / 480;
    this._pillMaxEl.textContent = `${fmtVal(stats.max, unit)}${unit ? ' ' + unit : ''}`;
    this._pillMaxEl.style.left = (maxFrac * 100) + '%';
    this._pillMaxEl.style.top = (stats.maxPt[1] / 130 * 100) + '%';
    this._pillMaxEl.style.transform = pillTransform(maxFrac);
    this._pillMaxEl.classList.add('visible');

    const minFrac = stats.minPt[0] / 480;
    this._pillMinEl.textContent = `${fmtVal(stats.min, unit)}${unit ? ' ' + unit : ''}`;
    this._pillMinEl.style.left = (minFrac * 100) + '%';
    this._pillMinEl.style.top = (stats.minPt[1] / 130 * 100) + '%';
    this._pillMinEl.style.transform = pillTransform(minFrac);
    this._pillMinEl.classList.add('visible');
  }

  _rowColor(row, i) {
    return row.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
  }

  // Builds the legend's DOM nodes exactly once per config. This is
  // deliberately separate from _renderValue()'s per-tick text updates:
  // HA fires the hass setter constantly (any entity in the whole system
  // changing state), and rebuilding the legend's innerHTML on every tick
  // was destroying/recreating the item nodes under a stationary mouse.
  // The browser then synthesized spurious pointerout/pointerover on the
  // freshly-created node, which flickered the hover-isolate on and off in
  // sync with unrelated HA traffic instead of actual mouse movement.
  _buildLegend() {
    const rows = this._config.rows;
    const solid = this._isSolid();
    this._legendEl.innerHTML = rows.map((row, i) => `
      <div class="item" data-index="${i}"${solid ? ` style="--c:${this._rowColor(row, i)}"` : ''}>
        <div class="dot" style="background:${this._rowColor(row, i)}"></div>
        <div class="name"></div>
        <div class="val"></div>
      </div>
    `).join('');
    this._legendItemEls = Array.from(this._legendEl.querySelectorAll('.item')).map((item) => ({
      name: item.querySelector('.name'),
      val: item.querySelector('.val'),
    }));
  }

  _renderValue() {
    if (!this._hass || !this._config) return;
    const rows = this._config.rows;
    const cardUnit = this._config.unit;

    if (!this._legendItemEls || this._legendItemEls.length !== rows.length) {
      this._buildLegend();
    }

    // Per-row current value in the legend, same information mini-graph-card
    // shows via show.state for a multi-entity graph - this was missing
    // before and is the main technical-parity gap vs. the "normal" graph.
    // Only text content is touched here (never the item nodes themselves -
    // see _buildLegend for why that matters for the hover-isolate feature).
    rows.forEach((row, i) => {
      const state = this._hass.states[row.entity];
      const name = row.name || state?.attributes?.friendly_name || row.entity;
      const unit = cardUnit || state?.attributes?.unit_of_measurement || '';
      const val = parseFloat(state?.state);
      const valText = Number.isFinite(val) ? `${fmtVal(val, unit)}${unit ? ' ' + unit : ''}` : '–';
      const els = this._legendItemEls[i];
      if (!els) return;
      if (els.name.textContent !== name) els.name.textContent = name;
      if (els.val.textContent !== valText) els.val.textContent = valText;
    });

    // A single big "hero" number only makes sense for exactly one row -
    // mini-graph-card doesn't show one either once you go multi-entity,
    // since an average across e.g. six different rooms isn't a real reading.
    // The legend would just repeat the same value in that case, so it's
    // hidden entirely for single-row cards instead of duplicating it.
    if (rows.length === 1) {
      const state = this._hass.states[rows[0].entity];
      const unit = cardUnit || state?.attributes?.unit_of_measurement || '';
      const val = parseFloat(state?.state);
      this._valueEl.classList.remove('hidden');
      const html = `${fmtVal(val, unit)}<span class="unit">${unit}</span>`;
      if (this._valueHtml !== html) {
        this._valueHtml = html;
        this._valueEl.innerHTML = html;
      }
      this._legendEl.classList.add('hidden');
    } else {
      this._valueEl.classList.add('hidden');
      this._legendEl.classList.remove('hidden');
    }
  }

  async _fetchHistory() {
    if (!this._hass || !this._config || this._fetching) return;
    this._fetching = true;
    const hours = this._config.hours || 24;
    const end = Date.now();
    const start = end - hours * 3600 * 1000;
    const ids = this._config.rows.map((r) => r.entity);
    try {
      const startIso = new Date(start).toISOString();
      const data = await this._hass.callApi(
        'GET',
        `history/period/${startIso}?filter_entity_id=${ids.join(',')}&minimal_response&no_attributes`
      );
      this._paintChart(data, start, end);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('sensor-glass-chart-card: history fetch failed', err);
      this._chartEl.innerHTML = this._noDataHtml();
    } finally {
      this._fetching = false;
      this._renderValue();
      // Home Assistant history isn't push-updated - a light poll keeps
      // the curve current without hammering the recorder API.
      clearTimeout(this._pollTimer);
      this._pollTimer = this.isConnected ? setTimeout(() => this._fetchHistory(), 5 * 60 * 1000) : null;
    }
  }

  _paintChart(data, start, end) {
    const w = 480, h = 130, pad = 2, n = 48;
    const rows = this._config.rows;
    let anySeries = false;

    // history/period groups results per entity, but the outer array's order
    // isn't a contract Claude/HA guarantee if an entity has zero data in the
    // window - so match series to rows by entity_id (present on the first
    // record of each series even with no_attributes/minimal_response) and
    // only fall back to positional indexing if no entity_id is present at all.
    const seriesByEntity = {};
    (data || []).forEach((series) => {
      const first = series && series[0];
      const eid = first && first.entity_id;
      if (eid) seriesByEntity[eid] = series;
    });
    const hasEntityIds = Object.keys(seriesByEntity).length > 0;

    const built = rows.map((row, i) => {
      const raw = hasEntityIds ? (seriesByEntity[row.entity] || []) : ((data && data[i]) || []);
      const points = raw
        .map((s) => [new Date(s.last_changed).getTime(), parseFloat(s.state)])
        .filter((p) => Number.isFinite(p[1]));
      const series = resample(points, start, end, n);
      if (!series) return null;
      anySeries = true;
      const min = Math.min(...series), max = Math.max(...series);
      const range = max - min || 1;
      const minIdx = series.indexOf(min);
      const maxIdx = series.indexOf(max);
      const pts = series.map((v, idx) => {
        const x = pad + (idx / (n - 1)) * (w - pad * 2);
        const norm = (v - min) / range;
        const y = h - pad - norm * (h - pad * 2) * 0.85 - (h - pad * 2) * 0.075;
        return [x, y];
      });
      const linePath = smoothPath(pts);
      const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${h} L ${pts[0][0]},${h} Z`;
      const state = this._hass.states[row.entity];
      const unit = this._config.unit || state?.attributes?.unit_of_measurement || '';
      return {
        idx: i, color: this._rowColor(row, i), linePath, areaPath,
        min, max, minPt: pts[minIdx], maxPt: pts[maxIdx], unit,
      };
    });

    if (!anySeries) {
      this._chartEl.innerHTML = this._noDataHtml();
      return;
    }

    this._rowStats = {};
    built.forEach((s) => { if (s) this._rowStats[s.idx] = s; });

    // Single-row cards hide the legend entirely (see _renderValue), so
    // there's nothing left to hover/tap to trigger the isolate state -
    // show the extrema pills permanently in that case instead.
    if (rows.length === 1) this._activeIndex = 0;

    const areas = built.filter(Boolean).map((s) => `<path data-idx="${s.idx}" d="${s.areaPath}" fill="${s.color}" opacity="0.16"></path>`).join('');
    const lines = built.filter(Boolean).map((s) => `<path data-idx="${s.idx}" d="${s.linePath}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"></path>`).join('');
    this._chartEl.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%">${areas}${lines}</svg>`;
    // A periodic repaint (5-min poll) replaces the SVG - reapply whatever
    // isolation was active so it doesn't silently reset while someone's
    // mid-hover or has a line pinned.
    this._setActive(this._activeIndex);
  }
}

customElements.define('sensor-glass-chart-card', SensorGlassChartCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sensor-glass-chart-card',
  name: 'Sensor Glass Chart Card',
  description: 'Glassmorphes Multi-Entity-Chart (z. B. Temperatur oder Luftfeuchtigkeit über mehrere Räume) mit geglätteter Linienkurve, passend zur Liquid-Glass-Kartenfamilie.',
});
