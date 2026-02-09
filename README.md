# dialkit

Real-time parameter tweaking for React + Motion.

## Quick Start

```bash
npm install dialkit motion
```

```tsx
// layout.tsx
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DialRoot />
      </body>
    </html>
  );
}
```

```tsx
// component.tsx
import { useDialKit } from 'dialkit';

function Card() {
  const p = useDialKit('Card', {
    blur: [24, 0, 100],
    scale: 1.2,
    color: '#ff5500',
  });

  return (
    <div style={{ filter: `blur(${p.blur}px)`, color: p.color }}>
      ...
    </div>
  );
}
```

---

## useDialKit

```tsx
const params = useDialKit(name, config, options?)
```

| Param | Type | Description |
|-------|------|-------------|
| `name` | `string` | Panel title displayed in the UI |
| `config` | `object` | Parameter definitions (see Config Types) |
| `options.onAction` | `(path: string) => void` | Callback when action buttons are clicked |

**Returns** an object matching your config shape with live values.

---

## Config Types

### Slider

```tsx
blur: [24, 0, 100]      // [default, min, max]
scale: 1.2              // auto-infers range (0 to value×3)
```

Values 0–1 are treated as normalized (range stays 0–1).

### Toggle

```tsx
enabled: true
```

### Text

```tsx
title: 'Hello'                                    // auto-detected
subtitle: { type: 'text', placeholder: '...' }    // explicit
```

Non-hex strings auto-detect as text inputs.

### Color

```tsx
color: '#ff5500'                          // auto-detected
bg: { type: 'color', default: '#000' }    // explicit
```

Hex strings (#RGB, #RRGGBB, #RRGGBBAA) auto-detect as color pickers.

### Select

```tsx
theme: {
  type: 'select',
  options: ['light', 'dark', 'system'],
  default: 'dark',
}
```

Options can be strings or `{ value, label }` objects.

### Spring

```tsx
// Time-based
spring: { type: 'spring', visualDuration: 0.3, bounce: 0.2 }

// Physics-based
spring: { type: 'spring', stiffness: 200, damping: 25, mass: 1 }
```

Visual editor with animation preview. Integrates directly with Motion.

### Action

```tsx
const p = useDialKit('Controls', {
  reset: { type: 'action', label: 'Reset' },
}, {
  onAction: (path) => {
    if (path === 'reset') handleReset();
  },
});
```

### Folder

```tsx
shadow: {
  blur: [10, 0, 50],
  color: '#000',
}
// Access: params.shadow.blur
```

Nested objects become collapsible folders.

---

## DialRoot

```tsx
<DialRoot position="top-right" />
```

| Prop | Type | Default |
|------|------|---------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` |

Mount once at your app root.

---

## Features

**Presets** — Save/load parameter snapshots during your session. Click the Presets dropdown in the toolbar.

**Copy** — Export current values as JSON. Click the copy icon in the toolbar.

**Auto-detection** — Strings become text inputs, hex strings become color pickers.

---

## Types

```tsx
import type {
  SpringConfig,
  SelectConfig,
  ColorConfig,
  TextConfig,
  ActionConfig,
  DialConfig,
  ResolvedValues,
} from 'dialkit';
```

Values are fully typed. `params.blur` infers as `number`, `params.color` as `string`, etc.

---

## License

MIT
