# DialKit

## Build

- After editing styles in `src/styles/theme.css`, run `npm run build` — the CSS is copied to `dist/styles.css` via tsup's `onSuccess` hook, not hot-reloaded.
- The example app (`example/photostack`) imports `dialkit/styles.css` which resolves to `dist/styles.css`.

## Style Rules

- Buttons in `ButtonGroup` must always stack vertically (never inline/row).
