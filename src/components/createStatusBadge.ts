type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type StatusBadgeProps =
  | { status: string; label?: never; tone?: never }
  | { label: string; tone?: StatusTone; status?: never };

const toneClass: Record<StatusTone, string> = {
  success: "badge badge-success",
  warning: "badge badge-warning",
  danger: "badge badge-danger",
  info: "badge badge-info",
  neutral: "badge",
};

export function createStatusBadge(react: ReactElementApi) {
  return function StatusBadge(props: StatusBadgeProps) {
    if ("label" in props && props.label != null) {
      const tone = props.tone ?? "neutral";
      return react.createElement("span", { className: toneClass[tone] }, props.label);
    }

    const status = "status" in props ? props.status : "";
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
    return react.createElement(
      "span",
      { className: `status-badge status-${normalizedStatus}` },
      status,
    );
  };
}
