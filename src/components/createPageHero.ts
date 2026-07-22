type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface PageHeroProps {
  eyebrow: string;
  title: ReactNodeLike;
  description: ReactNodeLike;
  actions?: ReactNodeLike;
}

export function createPageHero(react: ReactElementApi) {
  return function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
    return react.createElement(
      "header",
      { className: "hero" },
      react.createElement(
        "div",
        null,
        react.createElement("p", { className: "eyebrow" }, eyebrow),
        react.createElement("h1", null, title),
        react.createElement("p", { className: "hero-copy" }, description),
      ),
      actions ? react.createElement("div", { className: "hero-actions" }, actions) : null,
    );
  };
}
