import { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DialStore, ControlMeta, PanelConfig, SpringConfig } from '../store/DialStore';
import { Folder } from './Folder';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { SpringControl } from './SpringControl';
import { TextControl } from './TextControl';
import { SelectControl } from './SelectControl';
import { ColorControl } from './ColorControl';
import { PresetManager } from './PresetManager';

interface PanelProps {
  panel: PanelConfig;
}

export function Panel({ panel }: PanelProps) {
  const [copied, setCopied] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Subscribe to panel value changes
  const values = useSyncExternalStore(
    (cb) => DialStore.subscribe(panel.id, cb),
    () => DialStore.getValues(panel.id),
    () => DialStore.getValues(panel.id)
  );

  const presets = DialStore.getPresets(panel.id);
  const activePresetId = DialStore.getActivePresetId(panel.id);

  const handleAddPreset = () => {
    const nextNum = presets.length + 1;
    DialStore.savePreset(panel.id, `Preset ${nextNum}`);
  };

  const handleCopy = () => {
    const jsonStr = JSON.stringify(values, null, 2);

    const instruction = `Update the useDialKit configuration for "${panel.name}" with these values:

\`\`\`json
${jsonStr}
\`\`\`

Apply these values as the new defaults in the useDialKit call.`;

    navigator.clipboard.writeText(instruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderControl = (control: ControlMeta) => {
    const value = values[control.path];

    switch (control.type) {
      case 'slider':
        return (
          <Slider
            key={control.path}
            label={control.label}
            value={value as number}
            onChange={(v) => DialStore.updateValue(panel.id, control.path, v)}
            min={control.min}
            max={control.max}
            step={control.step}
          />
        );

      case 'toggle':
        return (
          <Toggle
            key={control.path}
            label={control.label}
            checked={value as boolean}
            onChange={(v) => DialStore.updateValue(panel.id, control.path, v)}
          />
        );

      case 'spring':
        return (
          <SpringControl
            key={control.path}
            panelId={panel.id}
            path={control.path}
            label={control.label}
            spring={value as SpringConfig}
            onChange={(v) => DialStore.updateValue(panel.id, control.path, v)}
          />
        );

      case 'folder':
        return (
          <Folder key={control.path} title={control.label}>
            {control.children?.map(renderControl)}
          </Folder>
        );

      case 'text':
        return (
          <TextControl
            key={control.path}
            label={control.label}
            value={value as string}
            onChange={(v) => DialStore.updateValue(panel.id, control.path, v)}
            placeholder={control.placeholder}
          />
        );

      case 'select':
        return (
          <SelectControl
            key={control.path}
            label={control.label}
            value={value as string}
            options={control.options ?? []}
            onChange={(v) => DialStore.updateValue(panel.id, control.path, v)}
          />
        );

      case 'color':
        return (
          <ColorControl
            key={control.path}
            label={control.label}
            value={value as string}
            onChange={(v) => DialStore.updateValue(panel.id, control.path, v)}
          />
        );

      default:
        return null;
    }
  };

  // Group consecutive actions together
  const renderControls = () => {
    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < panel.controls.length) {
      const control = panel.controls[i];

      if (control.type === 'action') {
        result.push(
          <button
            key={control.path}
            className="dialkit-button"
            onClick={() => DialStore.triggerAction(panel.id, control.path)}
          >
            {control.label}
          </button>
        );
      } else {
        result.push(renderControl(control));
      }

      i++;
    }

    return result;
  };

  const iconTransition = { type: 'spring' as const, visualDuration: 0.4, bounce: 0.1 };

  return (
    <div className="dialkit-panel-wrapper">
      <Folder title={panel.name} defaultOpen={true} isRoot={true} onOpenChange={setIsPanelOpen}>
        {renderControls()}
      </Folder>

      <AnimatePresence initial={false}>
        {isPanelOpen && (
          <motion.div
            className="dialkit-panel-toolbar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0 }}
            style={{ transformOrigin: 'top right', marginTop: 8, willChange: 'transform, opacity' }}
          >
        <button
          className="dialkit-toolbar-add"
          onClick={handleAddPreset}
          title="Add preset"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <PresetManager
          panelId={panel.id}
          presets={presets}
          activePresetId={activePresetId}
          onAdd={handleAddPreset}
        />

        <button
          className="dialkit-toolbar-copy"
          onClick={handleCopy}
          title="Copy parameters"
        >
          <motion.span
            className="dialkit-toolbar-copy-label"
            initial={false}
            animate={{ opacity: copied ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V7H8V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M19.2405 16.1852L18.5436 14.3733C18.4571 14.1484 18.241 14 18 14C17.759 14 17.5429 14.1484 17.4564 14.3733L16.7595 16.1852C16.658 16.4493 16.4493 16.658 16.1852 16.7595L14.3733 17.4564C14.1484 17.5429 14 17.759 14 18C14 18.241 14.1484 18.4571 14.3733 18.5436L16.1852 19.2405C16.4493 19.342 16.658 19.5507 16.7595 19.8148L17.4564 21.6267C17.5429 21.8516 17.759 22 18 22C18.241 22 18.4571 21.8516 18.5436 21.6267L19.2405 19.8148C19.342 19.5507 19.5507 19.342 19.8148 19.2405L21.6267 18.5436C21.8516 18.4571 22 18.241 22 18C22 17.759 21.8516 17.5429 21.6267 17.4564L19.8148 16.7595C19.5507 16.658 19.342 16.4493 19.2405 16.1852Z" fill="currentColor"/>
              <path d="M16 5H17C18.6569 5 20 6.34315 20 8V11M8 5H7C5.34315 5 4 6.34315 4 8V18C4 19.6569 5.34315 21 7 21H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copy Values
          </motion.span>
          <motion.span
            className="dialkit-toolbar-copy-check"
            initial={false}
            animate={{ opacity: copied ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            Copied!
          </motion.span>
        </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
