type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface CrudRegistryPageProps {
  eyebrow: string;
  title: ReactNodeLike;
  description: ReactNodeLike;
  actions?: ReactNodeLike;
  status?: ReactNodeLike;
  children: ReactNodeLike;
  editor?: ReactNodeLike;
}

export function createCrudRegistryPage(react: ReactElementApi, PageHero: any) {
  return function CrudRegistryPage({ eyebrow, title, description, actions, status, children, editor }: CrudRegistryPageProps) {
    return react.createElement(
      "div",
      { className: "app-shell" },
      react.createElement(PageHero, { eyebrow, title, description, actions }),
      status,
      children,
      editor,
    );
  };
}
