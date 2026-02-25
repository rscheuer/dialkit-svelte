import { readable, type Readable } from 'svelte/store';
import { onDestroy } from 'svelte';
import { DialStore, buildResolvedValues } from 'dialkit/core';
import type { DialConfig, ResolvedValues, DialValue } from 'dialkit/core';

export interface UseDialOptions {
  onAction?: (path: string) => void;
}

export interface DialKitBinding<T extends DialConfig> {
  params: Readable<ResolvedValues<T>>;
  set: (path: string, value: DialValue) => void;
  panelId: string;
  destroy: () => void;
}

function generatePanelId(name: string): string {
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : `s${Date.now().toString(36)}`;
  return `${name}-${suffix}`;
}

export function useDialKit<T extends DialConfig>(
  name: string,
  config: T,
  options?: UseDialOptions
): DialKitBinding<T> {
  const panelId = generatePanelId(name);

  DialStore.registerPanel(panelId, name, config);

  const params = readable(buildResolvedValues(config, DialStore.getValues(panelId), '') as ResolvedValues<T>, (set: (value: ResolvedValues<T>) => void) => {
    const unsub = DialStore.subscribe(panelId, () => {
      set(buildResolvedValues(config, DialStore.getValues(panelId), '') as ResolvedValues<T>);
    });
    return unsub;
  });

  let unsubActions: (() => void) | null = null;
  if (options?.onAction) {
    unsubActions = DialStore.subscribeActions(panelId, options.onAction);
  }

  const destroy = (): void => {
    unsubActions?.();
    DialStore.unregisterPanel(panelId);
  };

  try {
    onDestroy(destroy);
  } catch {
    // Not in component context; user must call destroy() manually when done.
  }

  return {
    params,
    set: (path: string, value: DialValue) => {
      DialStore.updateValue(panelId, path, value);
    },
    panelId,
    destroy,
  };
}
