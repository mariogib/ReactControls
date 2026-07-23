type ReactNodeLike = any;

interface ReactElementApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

type CardComponent = (props: {
  children: ReactNodeLike;
  className?: string;
  onClick?: () => void;
}) => ReactNodeLike;

export interface ChartCardProps {
  title: string;
  children: ReactNodeLike;
  /** Optional route / path used with `onNavigate` to make the card open analysis. */
  to?: string;
  /** Called with `to` when the card (not the chart body) is clicked. */
  onNavigate?: (to: string) => void;
  height?: number;
  /** Label for the open-analysis chip when `to` is set. */
  openLabel?: string;
  className?: string;
}

export function createChartCard(react: ReactElementApi, Card: CardComponent) {
  return function ChartCard({
    title,
    children,
    to,
    onNavigate,
    height = 220,
    openLabel = "Open analysis",
    className = "",
  }: ChartCardProps) {
    const isLink = Boolean(to && onNavigate);
    const cardClassName = ["chart-card", isLink ? "chart-card--link" : "", className]
      .filter(Boolean)
      .join(" ");

    return react.createElement(
      Card,
      {
        className: cardClassName,
        onClick: isLink ? () => onNavigate!(to!) : undefined,
      },
      react.createElement(
        "div",
        { className: "chart-card-header" },
        react.createElement("h3", null, title),
        isLink
          ? react.createElement(
              "span",
              { className: "chart-card-open" },
              openLabel,
              react.createElement(
                "span",
                { className: "chart-card-open-arrow", "aria-hidden": true },
                "→",
              ),
            )
          : null,
      ),
      react.createElement(
        "div",
        {
          className: "chart-card-body",
          style: { width: "100%", height },
          onClick: isLink
            ? (event: { stopPropagation?: () => void }) => event.stopPropagation?.()
            : undefined,
        },
        children,
      ),
    );
  };
}
