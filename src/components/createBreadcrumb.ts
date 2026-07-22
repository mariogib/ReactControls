type ReactNodeLike = any;

interface ReactElementApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
  Fragment?: any;
}

type LinkComponent = any;

export interface BreadcrumbItem {
  label: string;
  /** SPA route path when a Link component was provided to the factory. */
  to?: string;
  /** Plain anchor target (external or when no Link factory binding is used). */
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  className?: string;
  /** Visual separator between crumbs. Defaults to a chevron. */
  separator?: ReactNodeLike;
}

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function createBreadcrumb(react: ReactElementApi, Link?: LinkComponent) {
  return function Breadcrumb({
    items,
    ariaLabel = "Breadcrumb",
    className = "",
    separator = "/",
  }: BreadcrumbProps) {
    const crumbs = items.filter((item) => item.label?.trim());
    if (crumbs.length === 0) {
      return null;
    }

    return react.createElement(
      "nav",
      {
        className: classNames("breadcrumb", className),
        "aria-label": ariaLabel,
      },
      react.createElement(
        "ol",
        { className: "breadcrumb-list" },
        ...crumbs.flatMap((item, index) => {
          const isCurrent = index === crumbs.length - 1;
          const nodes: ReactNodeLike[] = [];

          if (index > 0) {
            nodes.push(
              react.createElement(
                "li",
                {
                  key: `sep-${index}`,
                  className: "breadcrumb-separator",
                  "aria-hidden": true,
                },
                separator,
              ),
            );
          }

          let content: ReactNodeLike;
          if (isCurrent) {
            content = react.createElement(
              "span",
              { className: "breadcrumb-current", "aria-current": "page" },
              item.label,
            );
          } else if (item.to && Link) {
            content = react.createElement(
              Link,
              {
                to: item.to,
                className: "breadcrumb-link",
                onClick: item.onClick,
              },
              item.label,
            );
          } else if (item.to || item.href) {
            content = react.createElement(
              "a",
              {
                href: item.href ?? item.to,
                className: "breadcrumb-link",
                onClick: item.onClick,
              },
              item.label,
            );
          } else if (item.onClick) {
            content = react.createElement(
              "button",
              {
                type: "button",
                className: "breadcrumb-link breadcrumb-link-button",
                onClick: item.onClick,
              },
              item.label,
            );
          } else {
            content = react.createElement(
              "span",
              { className: "breadcrumb-muted" },
              item.label,
            );
          }

          nodes.push(
            react.createElement(
              "li",
              {
                key: `crumb-${index}-${item.label}`,
                className: classNames(
                  "breadcrumb-item",
                  isCurrent && "breadcrumb-item-current",
                ),
              },
              content,
            ),
          );

          return nodes;
        }),
      ),
    );
  };
}
