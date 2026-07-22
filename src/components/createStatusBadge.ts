type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface StatusBadgeProps {
  status: string;
}

export function createStatusBadge(react: ReactElementApi) {
  return function StatusBadge({ status }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");
    return react.createElement("span", { className: `status-badge status-${normalizedStatus}` }, status);
  };
}
