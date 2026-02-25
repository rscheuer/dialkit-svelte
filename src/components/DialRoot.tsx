import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DialStore, type PanelConfig } from 'dialkit/core';
import { Panel } from './Panel';

export type DialPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface DialRootProps {
  position?: DialPosition;
}

export function DialRoot({ position = 'top-right' }: DialRootProps) {
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [mounted, setMounted] = useState(false);

  // Subscribe to global panel changes
  useEffect(() => {
    setMounted(true);
    setPanels(DialStore.getPanels());

    const unsubscribe = DialStore.subscribeGlobal(() => {
      setPanels(DialStore.getPanels());
    });

    return unsubscribe;
  }, []);

  // Don't render on server
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  // Don't render if no panels registered
  if (panels.length === 0) {
    return null;
  }

  const content = (
    <div className="dialkit-root">
      <div className="dialkit-panel" data-position={position}>
        {panels.map((panel) => (
          <Panel key={panel.id} panel={panel} />
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
