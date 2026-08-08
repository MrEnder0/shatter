# Shatter

A Minecraft Bedrock Edition add-on that gives items real physical properties — starting with **shattering**, with **bouncing** planned next.

Shatter is a scripting-API behavior pack (JavaScript, `@minecraft/server`) that watches dropped item entities in the world and reacts to how they fall.

## Features

### 💥 Shattering

Fragile items break instead of surviving a fall. Every tick, Shatter tracks each dropped item entity's vertical speed. If an item is falling fast enough (by default ~9 blocks/second) and lands on a solid, non-liquid block, it shatters — the item entity is removed, optionally with a glass-break sound and a smoke particle.

Currently breakable items:

| Category | Items |
|---|---|
| Glass | Glass, Glass Pane, Tinted Glass |
| Stained Glass | All 16 colors of stained glass (blocks & panes) |
| Ice | Ice |
| Fragile items | Glass Bottle, Egg, Brown Egg, Blue Egg |
| Light-emitting | Glowstone, Sea Lantern |
| Amethyst | Amethyst Block, Amethyst Shard |

The full, up-to-date list lives in `breakableItemTypeIds` in [`scripts/index.js`](scripts/index.js) — that's also the place to add new items.

### ⚙️ Config

The first time a player spawns in a world, Shatter shows a config form letting them toggle:

- **Enable Sounds** — play a glass-break sound when an item shatters
- **Enable Particles** — spawn a smoke particle when an item shatters

The choice is saved to the world (via dynamic properties) so the form only appears once per world. Fall-speed sensitivity and other tuning constants (`VERTICAL_SPEED_THRESHOLD_TO_BREAK`, `GROUND_CHECK_OFFSET`) can be adjusted directly at the top of `scripts/index.js`.

## Roadmap

- **Bounce physics** — slime blocks, slime balls, and similar bouncy items/blocks will get proper bounce behavior instead of (or alongside) shattering.
- [ ] Special-case items/blocks that should never — or should always — shatter (e.g. dripstone)
- [ ] Custom shatter particle instead of reusing vanilla smoke
- [x] Per-world config for toggling break sounds/particles

## Installation

1. Download or clone this repo.
2. Copy the pack folder (containing `manifest.json` and `scripts/`) into your world's `behavior_packs` folder, or zip it up as a `.mcpack`.
3. Activate the pack in your world's Behavior Packs settings.
4. Enable the **Beta APIs** experimental toggle for the world — Shatter relies on the `@minecraft/server` scripting API and won't load without it.

Requires Minecraft Bedrock **1.20.0+**.

## Development

The `scripts/` folder is a small npm project used only for type definitions/editor autocomplete (`@minecraft/server`, `@minecraft/server-ui`) — there's no build step. Run `npm install` inside `scripts/` if you want types while editing.

```
shatter/
├── manifest.json      # Pack manifest
└── scripts/
    ├── index.js        # Shatter detection & shatter logic
    └── config.js        # First-join config UI + saved settings
```
