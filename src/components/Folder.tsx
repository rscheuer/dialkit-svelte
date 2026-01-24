import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DialStore } from '../store/DialStore';

interface FolderProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  isRoot?: boolean;
  panelId?: string;
}

export function Folder({ title, children, defaultOpen = true, isRoot = false, panelId }: FolderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!panelId) return;

    const values = DialStore.getValues(panelId);
    const jsonStr = JSON.stringify(values, null, 2);

    // Build instruction for Claude Code
    const instruction = `Update the useDialKit configuration for "${title}" with these values:

\`\`\`json
${jsonStr}
\`\`\`

Apply these values as the new defaults in the useDialKit call.`;

    navigator.clipboard.writeText(instruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const iconTransition = { type: 'spring' as const, visualDuration: 0.4, bounce: 0.1 };

  const folderContent = (
    <div className={`dialkit-folder ${isRoot ? 'dialkit-folder-root' : ''}`}>
      <div className="dialkit-folder-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="dialkit-folder-title-row">
          <span className={`dialkit-folder-title ${isRoot ? 'dialkit-folder-title-root' : ''}`}>
            {title}
          </span>
          {isRoot && panelId && (
            <motion.button
              className="dialkit-folder-copy"
              onClick={handleCopy}
              title="Copy parameters"
              initial={false}
              animate={{
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0.7,
                filter: isOpen ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={iconTransition}
              style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
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
            </motion.button>
          )}
        </div>
        {isRoot ? (
          // Root panel uses minus/plus icons with crossfade
          <div className="dialkit-folder-icon" style={{ position: 'relative' }}>
            {/* Minus icon (when open) */}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              initial={false}
              animate={{
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0.7,
                filter: isOpen ? 'blur(0px)' : 'blur(6px)',
              }}
              transition={iconTransition}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </motion.svg>
            {/* Plus icon (when closed) */}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              initial={false}
              animate={{
                opacity: isOpen ? 0 : 1,
                scale: isOpen ? 0.7 : 1,
                filter: isOpen ? 'blur(6px)' : 'blur(0px)',
              }}
              transition={iconTransition}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </motion.svg>
          </div>
        ) : (
          // Section folders use rotating chevron with gentle spring
          <motion.svg
            className="dialkit-folder-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
          >
            <line x1="5" y1="9" x2="12" y2="16" />
            <line x1="19" y1="9" x2="12" y2="16" />
          </motion.svg>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="dialkit-folder-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0 }}
          >
            <div className="dialkit-folder-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // For root folders, wrap in animated panel container
  if (isRoot) {
    return (
      <motion.div
        className="dialkit-panel-inner"
        initial={false}
        animate={{
          width: isOpen ? 280 : 160,
          boxShadow: isOpen
            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
            : '0 4px 16px rgba(0, 0, 0, 0.25)',
        }}
        transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.05 }}
        data-collapsed={!isOpen}
      >
        {folderContent}
      </motion.div>
    );
  }

  return folderContent;
}
