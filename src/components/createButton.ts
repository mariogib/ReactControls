type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface ButtonProps {
  children: ReactNodeLike;
  onClick?: (event: unknown) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "outlined" | "warning";
  disabled?: boolean;
  className?: string;
}

export function createButton(react: ReactElementApi) {
  return function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    className = "",
  }: ButtonProps) {
    const variantClass = variant === "primary"
      ? "primary-btn"
      : variant === "secondary"
        ? "secondary-btn"
        : variant === "danger"
          ? "danger-btn"
          : variant === "warning"
            ? "warning-btn"
            : "outlined-btn";

    return react.createElement(
      "button",
      {
        type,
        onClick,
        disabled,
        className: `${variantClass} ${className}`.trim(),
      },
      children,
    );
  };
}
