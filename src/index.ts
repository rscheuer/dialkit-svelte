// Main hook
export { useDialKit } from './hooks/useDialKit';
export type { UseDialOptions } from './hooks/useDialKit';

// Root component (user mounts once)
export { DialRoot } from './components/DialRoot';
export type { DialPosition } from './components/DialRoot';

// Individual components (for advanced usage)
export { Slider } from './components/Slider';
export { Toggle } from './components/Toggle';
export { SegmentedControl } from './components/SegmentedControl';
export { Folder } from './components/Folder';
export { ButtonGroup } from './components/ButtonGroup';
export { SpringControl } from './components/SpringControl';
export { SpringVisualization } from './components/SpringVisualization';

// Store (for advanced usage)
export { DialStore } from './store/DialStore';
export type {
  SpringConfig,
  ActionConfig,
  DialValue,
  DialConfig,
  ResolvedValues,
  ControlMeta,
  PanelConfig,
} from './store/DialStore';
