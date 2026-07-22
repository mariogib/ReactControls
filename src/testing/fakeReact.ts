export type FakeElement = {
  type: unknown;
  props: Record<string, unknown>;
  children: unknown[];
};

export function createFakeReact() {
  return {
    Fragment: "Fragment",
    createElement(type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]): FakeElement {
      return {
        type,
        props: props ?? {},
        children,
      };
    },
  };
}
