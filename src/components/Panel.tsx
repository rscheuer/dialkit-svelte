import { DialStore, ControlMeta, PanelConfig, SpringConfig } from '../store/DialStore';
import { Folder } from './Folder';
import { Slider } from './Slider';
import { Toggle } from './Toggle';
import { SpringControl } from './SpringControl';
import { useSyncExternalStore } from 'react';

interface PanelProps {
  panel: PanelConfig;
}

export function Panel({ panel }: PanelProps) {
  // Subscribe to panel value changes
  const values = useSyncExternalStore(
    (cb) => DialStore.subscribe(panel.id, cb),
    () => DialStore.getValues(panel.id),
    () => DialStore.getValues(panel.id)
  );

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

  return (
    <Folder title={panel.name} defaultOpen={true} isRoot={true} panelId={panel.id}>
      {renderControls()}
    </Folder>
  );
}
