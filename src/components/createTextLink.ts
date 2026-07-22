type ReactNodeLike = any;

interface ReactElementApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

type RouterLinkComponent = any;

export type TextLinkVariant = "accent" | "muted" | "subtle";
export type TextLinkUnderline = "hover" | "always" | "none";

export interface TextLinkProps {
  children: ReactNodeLike;
  /** SPA route when a router Link was provided to the factory. */
  to?: string;
  /** Plain anchor href (also used when no router Link binding is available). */
  href?: string;
  variant?: TextLinkVariant;
  underline?: TextLinkUnderline;
  /** Opens in a new tab with safe rel defaults. */
  external?: boolean;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  onClick?: (event: unknown) => void;
}

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function createTextLink(
  react: ReactElementApi,
  RouterLink?: RouterLinkComponent,
) {
  return function TextLink({
    children,
    to,
    href,
    variant = "accent",
    underline = "hover",
    external = false,
    target,
    rel,
    title,
    ariaLabel,
    className = "",
    disabled = false,
    onClick,
  }: TextLinkProps) {
    const resolvedTarget = target ?? (external ? "_blank" : undefined);
    const resolvedRel =
      rel ??
      (resolvedTarget === "_blank" ? "noopener noreferrer" : undefined);

    const classes = classNames(
      "text-link",
      `text-link-${variant}`,
      `text-link-underline-${underline}`,
      disabled && "text-link-disabled",
      className,
    );

    const sharedProps: Record<string, unknown> = {
      className: classes,
      title,
      "aria-label": ariaLabel,
      onClick: disabled ? undefined : onClick,
    };

    if (disabled) {
      return react.createElement(
        "span",
        {
          ...sharedProps,
          "aria-disabled": true,
        },
        children,
      );
    }

    if (to && RouterLink) {
      return react.createElement(
        RouterLink,
        {
          ...sharedProps,
          to,
          target: resolvedTarget,
          rel: resolvedRel,
        },
        children,
      );
    }

    if (href || to) {
      return react.createElement(
        "a",
        {
          ...sharedProps,
          href: href ?? to,
          target: resolvedTarget,
          rel: resolvedRel,
        },
        children,
      );
    }

    return react.createElement(
      "button",
      {
        ...sharedProps,
        type: "button",
      },
      children,
    );
  };
}
