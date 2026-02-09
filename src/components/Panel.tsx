import { useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
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

  // Subscribe to panel value changes
  const values = useSyncExternalStore(
    (cb) => DialStore.subscribe(panel.id, cb),
    () => DialStore.getValues(panel.id),
    () => DialStore.getValues(panel.id)
  );

  const presets = DialStore.getPresets(panel.id);
  const activePresetId = DialStore.getActivePresetId(panel.id);

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
        // Collect consecutive actions
        const actions: ControlMeta[] = [control];
        while (i + 1 < panel.controls.length && panel.controls[i + 1].type === 'action') {
          i++;
          actions.push(panel.controls[i]);
        }

        // Render action group
        result.push(
          <div key={`actions-${actions[0].path}`} className="dialkit-labeled-control dialkit-actions-group">
            <span className="dialkit-labeled-control-label">Actions</span>
            <div className="dialkit-actions-stack">
              {actions.map((action) => (
                <button
                  key={action.path}
                  className="dialkit-action-button"
                  onClick={() => DialStore.triggerAction(panel.id, action.path)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
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
      <Folder title={panel.name} defaultOpen={true} isRoot={true}>
        {renderControls()}
      </Folder>

      <div className="dialkit-panel-toolbar">
        <PresetManager
          panelId={panel.id}
          presets={presets}
          activePresetId={activePresetId}
        />

        <button
          className="dialkit-toolbar-copy"
          onClick={handleCopy}
          title="Copy parameters"
        >
          <div style={{ position: 'relative', width: 14, height: 14 }}>
            {/* Copy icon */}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', inset: 0 }}
              initial={false}
              animate={{
                opacity: copied ? 0 : 1,
                scale: copied ? 0.7 : 1,
                filter: copied ? 'blur(6px)' : 'blur(0px)',
              }}
              transition={iconTransition}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </motion.svg>
            {/* Check icon */}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', inset: 0 }}
              initial={false}
              animate={{
                opacity: copied ? 1 : 0,
                scale: copied ? 1 : 0.7,
                filter: copied ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={iconTransition}
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          </div>
        </button>
      </div>
    </div>
  );
}
