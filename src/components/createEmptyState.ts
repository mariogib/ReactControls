type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface EmptyStateProps {
  title: string;
  detail: string;
  className?: string;
  as?: "div" | "section";
  framed?: boolean;
}

export function createEmptyState(react: ReactElementApi) {
  return function EmptyState({ title, detail, className, as = "section", framed = true }: EmptyStateProps) {
    const baseClassName = framed ? "panel empty-panel" : "empty-panel";
    const resolvedClassName = className ? `${baseClassName} ${className}` : baseClassName;
    return react.createElement(as, { className: resolvedClassName }, react.createElement("h3", null, title), react.createElement("p", null, detail));
  };
}
