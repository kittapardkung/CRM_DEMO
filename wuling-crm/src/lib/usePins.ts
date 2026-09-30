import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "crm_pins";
const EVENT = "crm-pins-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}
const snapshot = () => { try { return localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; } };

/** Pinned lead ids, kept in this browser's localStorage only (as in the design reference). */
export function usePins() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const pins = useMemo<string[]>(() => { try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; } }, [raw]);
  const toggle = useCallback((id: string) => {
    const next = pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: pins just don't persist */ }
    window.dispatchEvent(new Event(EVENT));
  }, [pins]);
  return [pins, toggle] as const;
}
