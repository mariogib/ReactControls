type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;
type DependencyList = readonly unknown[];

export function createFakeReactHooks() {
  const effects: Array<() => void | (() => void)> = [];

  function useState<T>(initialState: T | (() => T)): [T, Dispatch<T>] {
    let value: T = typeof initialState === "function" ? (initialState as () => T)() : initialState;
    const setState: Dispatch<T> = (action) => {
      value = typeof action === "function" ? (action as (prev: T) => T)(value) : action;
    };
    return [value, setState];
  }

  function useRef<T>(initialValue: T): { current: T } {
    return { current: initialValue };
  }

  function useEffect(effect: () => void | (() => void), _dependencies?: DependencyList): void {
    effects.push(effect);
  }

  function useCallback<T extends (...args: any[]) => any>(callback: T, _dependencies: DependencyList): T {
    return callback;
  }

  return {
    useState,
    useRef,
    useEffect,
    useCallback,
    _effects: effects,
    runEffects() {
      for (const effect of effects) {
        effect();
      }
    },
  };
}

export function createStatefulReactHooks() {
  const stateSlots: Array<{ value: unknown; setter: (action: unknown) => void }> = [];
  let stateIndex = 0;
  const effects: Array<{ effect: () => void | (() => void); deps?: DependencyList }> = [];

  function useState<T>(initialState: T | (() => T)): [T, Dispatch<T>] {
    const idx = stateIndex++;
    if (stateSlots[idx] === undefined) {
      const initial: T = typeof initialState === "function" ? (initialState as () => T)() : initialState;
      const slot = {
        value: initial as unknown,
        setter: (action: unknown) => {
          slot.value = typeof action === "function" ? (action as (prev: T) => T)(slot.value as T) : action;
        },
      };
      stateSlots[idx] = slot;
    }
    const slot = stateSlots[idx];
    return [slot.value as T, slot.setter as Dispatch<T>];
  }

  function useRef<T>(initialValue: T): { current: T } {
    return { current: initialValue };
  }

  function useEffect(effect: () => void | (() => void), deps?: DependencyList): void {
    effects.push({ effect, deps });
  }

  function useCallback<T extends (...args: any[]) => any>(callback: T, _deps: DependencyList): T {
    return callback;
  }

  function resetStateIndex() {
    stateIndex = 0;
  }

  function runEffects() {
    for (const { effect } of effects) {
      effect();
    }
    effects.length = 0;
  }

  function getState(idx: number): unknown {
    return stateSlots[idx]?.value;
  }

  return {
    useState,
    useRef,
    useEffect,
    useCallback,
    resetStateIndex,
    runEffects,
    getState,
  };
}
