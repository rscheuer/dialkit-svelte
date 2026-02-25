import { useEffect, useId, useSyncExternalStore, useRef } from 'react';
import { DialStore, buildResolvedValues } from 'dialkit/core';
import type { DialConfig, ResolvedValues } from 'dialkit/core';

export interface UseDialOptions {
  onAction?: (action: string) => void;
}

export function useDialKit<T extends DialConfig>(
  name: string,
  config: T,
  options?: UseDialOptions
): ResolvedValues<T> {
  const instanceId = useId();
  const panelId = `${name}-${instanceId}`;
  const configRef = useRef(config);
  const onActionRef = useRef(options?.onAction);
  onActionRef.current = options?.onAction;

  // Register panel on mount
  useEffect(() => {
    DialStore.registerPanel(panelId, name, configRef.current);
    return () => DialStore.unregisterPanel(panelId);
  }, [panelId, name]);

  // Subscribe to action events
  useEffect(() => {
    return DialStore.subscribeActions(panelId, (action) => {
      onActionRef.current?.(action);
    });
  }, [panelId]);

  // Subscribe to changes
  // DialStore.getValues returns a stable empty object when panel not registered
  const values = useSyncExternalStore(
    (callback) => DialStore.subscribe(panelId, callback),
    () => DialStore.getValues(panelId),
    () => DialStore.getValues(panelId)
  );

  // Build resolved values object
  return buildResolvedValues(config, values, '') as ResolvedValues<T>;
}
