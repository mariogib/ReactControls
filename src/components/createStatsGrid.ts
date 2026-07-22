type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface StatItem {
  icon?: ReactNodeLike;
  label: ReactNodeLike;
  value: ReactNodeLike;
  variant?: string;
  accentColor?: string;
}

export interface StatsGridProps {
  items: StatItem[];
  className?: string;
}

export function createStatsGrid(react: ReactElementApi) {
  return function StatsGrid({ items, className = "" }: StatsGridProps) {
    return react.createElement(
      "div",
      { className: ["stats-grid", className].filter(Boolean).join(" ") },
      ...items.map((item, index) => react.createElement(
        "div",
        {
          key: `${index}-${String(item.label)}`,
          className: ["stat-card", item.accentColor ? "stat-card-accent" : "", item.variant].filter(Boolean).join(" "),
          style: item.accentColor ? { "--stat-accent": item.accentColor } : undefined,
        },
        react.createElement(
          "div",
          { className: "stat-content" },
          item.icon ? react.createElement("div", { className: "stat-icon" }, item.icon) : null,
          react.createElement(
            "div",
            { className: "stat-copy" },
            react.createElement("div", { className: "stat-value" }, item.value),
            react.createElement("div", { className: "stat-label" }, item.label),
          ),
        ),
      )),
    );
  };
}
