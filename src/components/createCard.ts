type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface CardProps {
  children: ReactNodeLike;
  className?: string;
  onClick?: () => void;
}

export function createCard(react: ReactElementApi) {
  return function Card({ children, className = "", onClick }: CardProps) {
    const handleClick = onClick ? { onClick, style: { cursor: "pointer" } } : {};
    return react.createElement("div", { className: `card ${className}`.trim(), ...handleClick }, children);
  };
}
