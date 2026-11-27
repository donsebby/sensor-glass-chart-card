# Sensor Glass Chart Card

A frosted-glass multi-entity line chart for Home Assistant Lovelace, styled to match the [Liquid Glass](https://community.home-assistant.io/t/liquid-glass-tile-card-an-ios-26-liquid-glass-tile-card-for-your-dashboard/1016733) card family (`liquid-glass-tile-card`, `liquid-lens-navbar-card`). Built as a drop-in glass-styled alternative to `mini-graph-card` for multi-room/multi-entity history graphs (temperature, humidity, power, battery, etc.).

![Sensor Glass Chart Card: multi-room temperatures and a single-value solar chart](asset/sensor-glass-chart-card.png)

## Features

- **Multiple entities, one chart** — smoothed, resampled line + area chart for any number of sensors, auto-colored from a shared palette (same palette as `liquid-glass-tile-card-v2`, so a tile and a chart row referring to the same entity always share a color).
- **Legend with live values** — each row shows its current state + unit, not just a color key.
- **Single-row "hero" mode** — with exactly one row, the legend is replaced by a large glanceable number (like a tile card), avoiding a redundant duplicate value.
- **Hover-to-isolate (desktop) / tap-to-isolate (touch)** — hovering or tapping a legend name dims every other line so you can focus on one entity's curve. Tap again to show all lines.
- **Min/max "lens" pills** — while a line is isolated, its highest and lowest values in the visible window are shown as small frosted glass pills positioned right on the peak/valley of the curve. For single-row cards, the pills are shown permanently (there's no legend to interact with).
- **Full-bleed chart** — the graph runs edge-to-edge like a native card, not boxed in by the card's own padding.
- **Configurable time window, unit, and icon.**

## Installation

### HACS (recommended)

1. HACS → Frontend → ⋮ → Custom repositories → add this repo URL, category "Lovelace".
2. Install "Sensor Glass Chart Card".
3. Add the resource if HACS doesn't do it automatically (Settings → Dashboards → Resources).

### Manual

1. Download `sensor-glass-chart-card.js` from the [latest release](../../releases/latest).
2. Copy it to `/config/www/`.
3. Add as a dashboard resource: Settings → Dashboards → Resources → `/local/sensor-glass-chart-card.js`, type "JavaScript Module".

## Usage

```yaml
type: custom:sensor-glass-chart-card
title: Temperaturen
icon: temperature
unit: °C
hours: 12
rows:
  - entity: sensor.living_room_temperature
    name: Living Room
  - entity: sensor.bedroom_temperature
    name: Bedroom
    color: "#5ea8d9" # optional - overrides the auto palette
```

### Single-entity ("hero" mode)

```yaml
type: custom:sensor-glass-chart-card
title: Battery
icon: battery
unit: "%"
hours: 12
rows:
  - entity: sensor.solar_battery_level
    name: Charge
    color: "#66BB6A"
```

With exactly one row, the legend is hidden and replaced with a large current-value display, and the min/max pills are shown permanently.

### Solid look

`look: solid` swaps the glass for a calm, solid panel, matching `look: solid` in
`liquid-glass-tile-card-v2`:

- **Panel:** solid surface from the optional CSS variable `--surface` (default: the
  theme's card background at 88 %), a hairline border, no blur and no shadow.
  `bg_opacity` has no effect in this look.
- **Icon:** a plain round icon – neutral with several rows, tinted with the row
  colour for a single-row card. No icon is shown when `icon` is omitted.
- **Legend:** each entry is a quiet chip (`--lg-tile-bg`); the chip of the line
  isolated by hover/tap is tinted with its colour.
- **Chart:** lines, their colours and the light area fills stay as they are; the
  min/max pills become plain solid pills.
- Text: title 15 px, legend 13 px, numbers with tabular figures. Transitions are
  switched off for `prefers-reduced-motion`.

```yaml
type: custom:sensor-glass-chart-card
title: Temperatures
icon: temperature
look: solid
rows:
  - entity: sensor.living_room_temperature
  - entity: sensor.bedroom_temperature
```

The look can also come from your theme, for all Liquid Glass cards at once: set
`lg-look: solid` in the Home Assistant theme (the CSS variable `--lg-look`, value
`solid` or `glass`). `look:` on a single card overrides the theme; without either the
card stays glass. The card picks up theme switches on its own.

```yaml
# in your Home Assistant theme
lg-look: solid
```

## Configuration Reference

| Option | Level | Type | Description |
|---|---|---|---|
| `title` | Card | string | Card heading, shown top-left. |
| `icon` | Card | `temperature` \| `humidity` \| `battery` \| `power` | Icon shown in the glass icon-box, top-right. Omit for no icon. |
| `unit` | Card | string | Unit label applied to all rows. If omitted, each row falls back to its own entity's `unit_of_measurement`. |
| `hours` | Card | number | History window in hours shown on the chart. Default `24`. |
| `bg_opacity` | Card | number (0–1) | Overrides the glass background opacity. Default matches the rest of the Liquid Glass family (~70%). |
| `look` | Card | string | `solid` switches to a calm, solid panel without glass, `glass` forces glass, see *Solid look*. Default: the theme's `lg-look`, otherwise glass. |
| `rows` | Card | array | The entities to chart (see below). Required, at least one. |
| `rows[].entity` | Row | string | Entity ID. Required. |
| `rows[].name` | Row | string | Display name. Falls back to the entity's `friendly_name`. |
| `rows[].color` | Row | string (hex) | Overrides the auto-assigned palette color for this row. |

## Design notes / technical details

- Chart geometry mirrors the approach used by [`mini-graph-card`](https://github.com/kalkih/mini-graph-card): the outer card carries no horizontal/bottom padding, only the header/legend get their own padding, and the SVG's height is left to the browser's intrinsic aspect-ratio handling (no fixed pixel height) rather than fighting a `preserveAspectRatio` mismatch. This is what makes the chart bleed to the card edges without a bleed/clip hack.
- The card matches its corner-clipping via both `overflow: hidden` **and** `clip-path: inset(0 round 20px)` on the outer card — `overflow: hidden` alone is unreliable together with `backdrop-filter` in some WebKit-based renderers (e.g. the HA Companion App), so `clip-path` is used as the robust fallback.
- History is fetched via `history/period` and matched back to configured rows by `entity_id` (present on the first record of each returned series), not by array position — the History API's per-entity ordering isn't a documented guarantee, and matching by position silently mismatches colors/curves if any entity has no data in the window.
- Legend DOM nodes are built once per config and only their text content is updated afterwards. Rebuilding the whole legend's `innerHTML` on every Home Assistant state tick (which fires constantly, for any entity in the system, not just this card's own) was found to make the browser synthesize spurious `pointerout`/`pointerover` events on the freshly recreated nodes — which flickered the hover-isolate feature on and off under a stationary mouse, in sync with unrelated HA traffic rather than actual mouse movement.

## License

MIT

## Theme variables

Like the other Liquid Glass cards, this card reads two optional CSS variables, so one theme can align all of them:

```yaml
# in your Home Assistant theme
lg-radius: 22px                          # corner radius of the glass panel
lg-backdrop: blur(22px) saturate(180%)   # blur/saturation behind the panel
```

Without them nothing changes. Options set on the card itself (e.g. `blur`) still win.

## Changelog

### Unreleased
- Solid look: the panel takes its fill from `--lg-tile-bg` when the theme sets it (glass solid look).
- Solid look: the card's own panel takes edge, shadow and blur from the theme (`--lg-tile-edge`, `--lg-tile-shadow`, `--lg-panel-backdrop`).
- Solid look: inner surfaces take their edge and shadow from the theme (`--lg-tile-edge`, `--lg-tile-shadow`), so a glass theme can give them a light glass edge.

### 1.4.0
- The look can come from the theme: `lg-look: solid` (CSS variable `--lg-look`) switches all Liquid Glass cards to the solid look; `look:` on the card overrides it (see *Solid look*).
- New card option `look: solid`: a calm, solid panel instead of glass (see *Solid look*). Solid surface from the optional `--surface`, round icon (tinted with the row colour on single-row cards), legend entries as chips with the isolated line's chip tinted, plain min/max pills, larger text (15/13 px). Chart lines and fills are unchanged. Without `look` the card renders exactly as before.
- The legend is rebuilt when the card config changes, so changed row colours show up without a reload.

### 1.3.1
- Reads the optional theme variables `--lg-radius` and `--lg-backdrop` (see *Theme variables*).
- Only re-renders when one of the card's own entities changes, instead of on every state change in Home Assistant.
- Stops polling the history API while the card is not on screen (closed popup, other view) and refreshes when it comes back.
- "No history available" message follows the Home Assistant language.
