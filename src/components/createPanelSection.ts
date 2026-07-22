type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface PanelSectionProps {
  eyebrow?: string;
  title?: ReactNodeLike;
  meta?: ReactNodeLike;
  actions?: ReactNodeLike;
  compact?: boolean;
  children: ReactNodeLike;
}

export function createPanelSection(react: ReactElementApi) {
  return function PanelSection({ eyebrow, title, meta, actions, compact, children }: PanelSectionProps) {
    const hasHeader = eyebrow || title || meta || actions;
    const headerClassName = compact ? "panel-header compact" : "panel-header";

    return react.createElement(
      "section",
      { className: "panel" },
      hasHeader
        ? react.createElement(
            "div",
            { className: headerClassName },
            react.createElement(
              "div",
              null,
              eyebrow ? react.createElement("p", { className: "eyebrow" }, eyebrow) : null,
              title ? react.createElement("h2", null, title) : null,
            ),
            actions ? react.createElement("div", { className: "panel-actions" }, actions) : meta ? react.createElement("div", { className: "panel-meta" }, meta) : null,
          )
        : null,
      children,
    );
  };
}
