# GridContainer.vue & RestaurantTable.vue — Original vs VPS

## GridContainer.vue

| Aspect | Original (f2ad2c3) | Current VPS |
|--------|-------------------|-------------|
| **grid-template-columns** | `repeat(3, 1fr)` only | `repeat(auto-fit, minmax(200px, 1fr))` + media repeat(3, 1fr) |
| **gap** | `grid-gap: 15px` (one value = same H and V) | `row-gap: 16px; column-gap: 16px` |
| **grid-auto-rows** | **`1fr`** ← rows share space equally → **tall rows** | `72px` (fixed) |
| **align-items / justify-items** | (none) | `align-items: start; justify-items: center` |
| **.grid-item-container** | (no styles) | `min-height: 0; align-self: start; width: 100%; max-width: 240px; overflow: hidden` |
| **@media 768px** | (none) | duplicate grid-template-columns, gap 16px |
| **@media 1024px** | `grid-gap: 30px` | `row-gap: 20px; column-gap: 20px` |

**Problem in original:** `grid-auto-rows: 1fr` makes each row take an equal fraction of the container height, so rows become tall and cards stretch.

---

## RestaurantTable.vue

| Aspect | Original (f2ad2c3) | Current VPS |
|--------|-------------------|-------------|
| **.main-wrapper width** | `width: 100%` | `width: 240px` |
| **.main-wrapper height** | **`height: 100%`** ← fills grid cell → **tall card** | `height: 72px; max-height: 72px` |
| **.main-wrapper padding** | `15px` | `6px 10px` |
| **.main-wrapper** | no flex, no gap | `display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; overflow: hidden` |
| **Header** | `.header` with flex, no `.title` class | `.title` with ellipsis, same flex |
| **.content / .seats-wrapper** | flex, wrap, margin 15px/20px, width 80%/40% | grid 3 cols, gap 6px, no margin |
| **cssProps / --columns** | used for seats layout | removed |
| **.circle size** | 15px, 20px @1024 | 14px, 16px @1024 |

**Problem in original:** `height: 100%` makes the card fill the grid cell, so with `grid-auto-rows: 1fr` the cards became very tall.

---

## Why the current layout can still look wrong

1. **Row height = card height (72px)** so there is no extra space for a visible gap between rows; the gap is drawn *between* rows, so it should show. If the build is old or cached, you might still see old CSS.
2. **Duplicate rule in @media 768px:** `grid-template-columns` is set twice (repeat(3, 1fr) then repeat(auto-fit, minmax(200px, 1fr))); the second overrides the first.
3. **Original used a single `grid-gap`** so horizontal and vertical were always the same; we now use row-gap and column-gap separately (same value, but structure differs).

## Recommended fix (compact like red mockup, same gap H and V)

- **GridContainer:** Use one `gap: 16px` (or 20px @1024), fix `grid-template-columns` to `repeat(3, 1fr)` at 768px+ (no duplicate), keep `grid-auto-rows: 72px`, keep `align-items: start` and `justify-items: center`.
- **RestaurantTable:** Keep fixed `height: 72px`, `max-height: 72px`, `width: 240px`; no `height: 100%`.
- Rebuild and hard-refresh so the new CSS is loaded.
