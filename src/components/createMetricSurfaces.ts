type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

type CardComponent = (props: {
  children: ReactNodeLike;
  className?: string;
  onClick?: () => void;
}) => ReactNodeLike;

export interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  to?: string;
  onClick?: () => void;
  /** Called when `to` is set; apps wire this to their router navigate. */
  onNavigate?: (to: string) => void;
}

export interface PanelProps {
  children: ReactNodeLike;
  className?: string;
  onClick?: () => void;
}

export interface TablePanelProps {
  children: ReactNodeLike;
  className?: string;
  style?: Record<string, unknown>;
}

export function createMetricSurfaces(react: ReactElementApi, Card: CardComponent) {
  function MetricCard({ label, value, hint, to, onClick, onNavigate }: MetricCardProps) {
    const interactive = Boolean(to || onClick);
    return react.createElement(
      Card,
      {
        className: `metric-card${interactive ? " metric-card--interactive" : ""}`,
        onClick: to ? () => onNavigate?.(to) : onClick,
      },
      react.createElement("div", { className: "label" }, label),
      react.createElement("div", { className: "value" }, value),
      hint ? react.createElement("div", { className: "hint" }, hint) : null,
    );
  }

  function Panel({ children, className = "", onClick }: PanelProps) {
    return react.createElement(
      Card,
      {
        className: ["panel", className].filter(Boolean).join(" "),
        onClick,
      },
      children,
    );
  }

  function TablePanel({ children, className = "", style }: TablePanelProps) {
    return react.createElement(
      "div",
      {
        className: ["card", "panel", "table-panel", className].filter(Boolean).join(" "),
        style,
      },
      react.createElement("div", { className: "table-wrap" }, children),
    );
  }

  return { MetricCard, Panel, TablePanel };
}
