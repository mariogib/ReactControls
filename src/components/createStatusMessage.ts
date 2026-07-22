type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

type StatusTone = "info" | "success" | "error" | "warning";

export interface StatusMessageProps {
  title: ReactNodeLike;
  detail: ReactNodeLike;
  tone?: StatusTone;
  className?: string;
}

export function createStatusMessage(react: ReactElementApi) {
  return function StatusMessage({ title, detail, tone = "info", className }: StatusMessageProps) {
    const resolvedClassName = ["status-message", `status-${tone}`, className].filter(Boolean).join(" ");
    const role = tone === "error" || tone === "warning" ? "alert" : "status";
    return react.createElement(
      "section",
      { className: resolvedClassName, role },
      react.createElement("h3", null, title),
      react.createElement("p", null, detail),
    );
  };
}
