type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export type EmptyStateProps =
  | {
      message: string;
      title?: never;
      detail?: never;
      className?: string;
      as?: "div" | "section";
      framed?: never;
    }
  | {
      title: string;
      detail: string;
      message?: never;
      className?: string;
      as?: "div" | "section";
      framed?: boolean;
    };

export function createEmptyState(react: ReactElementApi) {
  return function EmptyState(props: EmptyStateProps) {
    if ("message" in props && props.message != null && props.title == null) {
      return react.createElement(
        props.as ?? "div",
        { className: ["empty", props.className].filter(Boolean).join(" ") },
        props.message,
      );
    }

    const title = "title" in props ? props.title : "";
    const detail = "detail" in props ? props.detail : "";
    const framed = "framed" in props ? (props.framed ?? true) : true;
    const as = props.as ?? "section";
    const baseClassName = framed ? "panel empty-panel" : "empty-panel";
    const resolvedClassName = props.className ? `${baseClassName} ${props.className}` : baseClassName;
    return react.createElement(
      as,
      { className: resolvedClassName },
      react.createElement("h3", null, title),
      react.createElement("p", null, detail),
    );
  };
}
