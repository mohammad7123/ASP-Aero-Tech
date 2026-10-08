/**
 * Tiny coordination store for the boot sequence.
 *
 * Anything heavy that should finish before the intro lifts (e.g. the 3D world)
 * calls `boot.hold(key)` and later `boot.release(key)`. The loader waits for
 * all holds (bounded by a max duration), plays its exit, then calls
 * `boot.finish()`. Entrance animations subscribe with `onBootComplete`.
 */
type Listener = () => void;

const holds = new Set<string>();
const listeners = new Set<Listener>();
let complete = false;

const emit = () => listeners.forEach((fn) => fn());

export const boot = {
  hold(key: string) {
    if (complete) return;
    holds.add(key);
    emit();
  },
  release(key: string) {
    if (holds.delete(key)) emit();
  },
  get pending() {
    return holds.size;
  },
  get complete() {
    return complete;
  },
  finish() {
    if (complete) return;
    complete = true;
    holds.clear();
    emit();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** Runs `cb` once the intro has finished (immediately if it already has). */
export function onBootComplete(cb: () => void): () => void {
  if (complete) {
    const id = window.setTimeout(cb, 0);
    return () => window.clearTimeout(id);
  }
  let done = false;
  const unsubscribe = boot.subscribe(() => {
    if (!done && complete) {
      done = true;
      unsubscribe();
      cb();
    }
  });
  return () => {
    done = true;
    unsubscribe();
  };
}
