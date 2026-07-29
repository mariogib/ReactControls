type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface LoadingStateProps {
  label?: string;
}

export function createLoadingState(react: ReactElementApi) {
  return function LoadingState({ label = "Loading…" }: LoadingStateProps) {
    return react.createElement(
      "div",
      { className: "loading-box", role: "status", "aria-live": "polite" },
      label,
    );
  };
}
