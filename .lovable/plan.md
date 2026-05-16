## Goal
Rebrand the site's blue palette to Imperial Blue `#00296b` (HSL ~217 100% 21%) while keeping gold accents and ivory/cream text untouched.

## Approach
All blues are centralized as HSL tokens in `src/index.css`. I'll retune the navy-family tokens around `#00296b` so the entire site updates in one place. Gold, ivory, and accent colors stay as-is.

## Token changes (src/index.css, both `:root` and `.dark`)

Base imperial blue = `217 100% 21%` (#00296b). Derived shades keep the same hue/saturation, only lightness varies for depth where shadows/contrast are needed — producing an even, cohesive gradient feel across surfaces.

| Token | Before | After | Purpose |
|---|---|---|---|
| `--background` | 220 50% 10% | **217 100% 21%** | Page background = exact #00296b |
| `--ink` | 220 50% 8% | 217 100% 14% | Deepest blue (footer/overlays) |
| `--card` | 220 45% 14% | 217 80% 26% | Lifted surface |
| `--popover` | 220 50% 12% | 217 90% 23% | Popovers |
| `--secondary` | 220 40% 18% | 217 70% 30% | Panels |
| `--muted` | 220 35% 20% | 217 60% 32% | Muted surface |
| `--input` | 220 35% 18% | 217 65% 28% | Inputs |
| `--border` | 220 35% 22% | 217 55% 35% | Borders |
| `--emerald-deep` | 220 45% 16% | 217 85% 24% | "Emerald deep" band (still blue alias) |
| `--accent-domestic-soft` | 220 40% 20% | 217 65% 28% | Category soft bg |
| `--accent-international-soft` | 220 40% 20% | 217 65% 28% | Category soft bg |
| `--sidebar-background` | 220 50% 10% | 217 100% 21% | Sidebar bg |
| `--sidebar-accent` | 220 40% 18% | 217 70% 30% | Sidebar accent |
| `--sidebar-border` | 220 35% 22% | 217 55% 35% | Sidebar border |
| `--primary-foreground` / `--accent-foreground` / `--sidebar-primary-foreground` | 220 50% 10% | 217 100% 21% | Text-on-gold matches new bg |
| `--gradient-hero` | uses 220 50% 8% | use 217 100% 14% | Hero gradient stays in-family |
| `--shadow-luxe` | 220 60% 4% | 217 100% 8% | Shadow tone matches family |
| `.globe-sphere` gradient stops | 220 hues | 217 hues | Globe orb matches |

Gold (`--gold`, `--gold-deep`, `--primary`, `--accent`, `--ring`), foreground ivory (`--foreground`, `--card-foreground`, etc.), `--accent-domestic` (amber), and `--accent-international` (sky) are **unchanged**.

## Files touched
- `src/index.css` — only file edited.

## Verification
- Visually confirm preview: background = #00296b, gold accents intact, ivory text readable, cards/panels show subtle lighter-blue depth, hero/footer use deeper blue shades for an even gradient.