# dialkit

Real-time parameter tweaking for React + Motion.

---

## Installation

```bash
npm install dialkit motion
```

---

## Setup

Add `<DialRoot />` once in your app layout:

```tsx
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DialRoot position="top-right" />
      </body>
    </html>
  );
}
```

---

## Usage

```tsx
import { useDialKit } from 'dialkit';
import { motion } from 'motion/react';

function Card() {
  const params = useDialKit('Card', {
    blur: [24, 0, 100],
    opacity: [0.8, 0, 1],
    scale: 1.18,
    spring: {
      type: 'spring',
      visualDuration: 0.3,
      bounce: 0.2,
    },
  });

  return (
    <motion.div
      style={{
        filter: `blur(${params.blur}px)`,
        opacity: params.opacity,
      }}
      animate={{ scale: params.scale }}
      transition={params.spring}
    />
  );
}
```

---

## API Reference

### useDialKit

```tsx
const params = useDialKit(name, config, options?)
```

| Param | Type | Description |
|-------|------|-------------|
| `name` | `string` | Panel title |
| `config` | `DialConfig` | Parameter definitions |
| `options.onAction` | `(action: string) => void` | Callback for action buttons |

### Config Types

| Format | Control | Example |
|--------|---------|---------|
| `[default, min, max]` | Slider | `blur: [24, 0, 100]` |
| `number` | Slider (auto range) | `scale: 1.18` |
| `boolean` | Toggle | `enabled: true` |
| `{ type: 'spring', ... }` | Spring editor | See below |
| `{ type: 'action' }` | Button | `reset: { type: 'action' }` |
| `{ nested: ... }` | Folder | Nest any config |

### Spring Config

Two modes available:

```tsx
// Time mode
spring: {
  type: 'spring',
  visualDuration: 0.3,
  bounce: 0.2,
}

// Physics mode
spring: {
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 1,
}
```

### Actions

Trigger callbacks from the panel:

```tsx
const params = useDialKit('Controls', {
  next: { type: 'action' },
  previous: { type: 'action' },
}, {
  onAction: (action) => {
    if (action === 'next') goNext();
    if (action === 'previous') goPrevious();
  },
});
```

### DialRoot

```tsx
<DialRoot position="top-right" />
```

| Position | |
|----------|--|
| `top-right` | Default |
| `top-left` | |
| `bottom-right` | |
| `bottom-left` | |

---

## License

MIT
