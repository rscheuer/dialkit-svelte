import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DialStore, Preset } from '../store/DialStore';

interface PresetManagerProps {
  panelId: string;
  presets: Preset[];
  activePresetId: string | null;
}

export function PresetManager({ panelId, presets, activePresetId }: PresetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNaming, setIsNaming] = useState(false);
  const [presetName, setPresetName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePreset = presets.find((p) => p.id === activePresetId);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsNaming(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Focus input when naming starts
  useEffect(() => {
    if (isNaming) {
      inputRef.current?.focus();
    }
  }, [isNaming]);

  const handleSave = () => {
    if (presetName.trim()) {
      DialStore.savePreset(panelId, presetName.trim());
      setPresetName('');
      setIsNaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsNaming(false);
      setPresetName('');
    }
  };

  const handleDelete = (e: React.MouseEvent, presetId: string) => {
    e.stopPropagation();
    DialStore.deletePreset(panelId, presetId);
  };

  return (
    <div ref={containerRef} className="dialkit-preset-manager">
      <button
        className="dialkit-preset-trigger"
        onClick={() => setIsOpen(!isOpen)}
        data-open={String(isOpen)}
        data-has-preset={String(!!activePreset)}
      >
        <span className="dialkit-preset-label">
          {activePreset ? activePreset.name : 'Presets'}
        </span>
        <motion.svg
          className="dialkit-preset-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.15 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dialkit-preset-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', visualDuration: 0.15, bounce: 0 }}
          >
            {presets.length > 0 && (
              <div className="dialkit-preset-list">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="dialkit-preset-item"
                    data-active={String(preset.id === activePresetId)}
                    onClick={() => {
                      DialStore.loadPreset(panelId, preset.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="dialkit-preset-name">{preset.name}</span>
                    <button
                      className="dialkit-preset-delete"
                      onClick={(e) => handleDelete(e, preset.id)}
                      title="Delete preset"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isNaming ? (
              <div className="dialkit-preset-save-row">
                <input
                  ref={inputRef}
                  type="text"
                  className="dialkit-preset-input"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Preset name..."
                />
                <button
                  className="dialkit-preset-confirm"
                  onClick={handleSave}
                  disabled={!presetName.trim()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                className="dialkit-preset-save-btn"
                onClick={() => setIsNaming(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Save Current
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
