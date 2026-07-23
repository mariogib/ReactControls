/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createBrowseScrollSentinel } from "./createBrowseScrollSentinel.js";

type FakeNode = {
  type: any;
  props: Record<string, unknown>;
  children: unknown[];
};

function createFakeReact() {
  let stateSlot = 0;
  const refs: Array<{ current: unknown }> = [];
  const effects: Array<{
    effect: () => void | (() => void);
    deps?: readonly unknown[];
  }> = [];

  const react = {
    useRef<T>(initial: T) {
      const index = stateSlot++;
      if (!refs[index]) {
        refs[index] = { current: initial };
      }
      return refs[index] as { current: T };
    },
    useEffect(effect: () => void | (() => void), deps?: readonly unknown[]) {
      effects.push({ effect, deps });
    },
    createElement(
      type: any,
      props: Record<string, unknown> | null,
      ...children: unknown[]
    ): FakeNode {
      return { type, props: props ?? {}, children };
    },
  };

  return {
    react,
    runEffects() {
      for (const entry of effects) {
        entry.effect();
      }
    },
  };
}

test("createBrowseScrollSentinel renders a sentinel marker", () => {
  const { react } = createFakeReact();
  const BrowseScrollSentinel = createBrowseScrollSentinel(react);

  const element = BrowseScrollSentinel({
    enabled: true,
    onLoadMore: () => undefined,
    loadKey: 0,
  }) as FakeNode;

  assert.equal(element.type, "div");
  assert.equal(element.props.className, "browse-scroll-sentinel");
  assert.equal(element.props["aria-hidden"], true);
});
