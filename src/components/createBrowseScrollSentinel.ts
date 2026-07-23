type ReactNodeLike = any;

interface ReactScrollSentinelApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
  useRef: <T>(initialValue: T) => { current: T };
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
}

export interface BrowseScrollSentinelProps {
  /** When false, the observer does nothing. */
  enabled?: boolean;
  /** Called when the sentinel enters the viewport and more rows can load. */
  onLoadMore: () => void;
  /**
   * Changes when a load completes (e.g. current pageIndex).
   * Resets the internal lock so the next scroll intersection can fire.
   */
  loadKey?: string | number;
  /** IntersectionObserver rootMargin. Defaults to `240px`. */
  rootMargin?: string;
  className?: string;
}

/**
 * Place after browse list content when `paging.mode === "scroll"`.
 * Uses IntersectionObserver to request the next chunk as the user scrolls.
 */
export function createBrowseScrollSentinel(react: ReactScrollSentinelApi) {
  return function BrowseScrollSentinel({
    enabled = true,
    onLoadMore,
    loadKey,
    rootMargin = "240px",
    className = "",
  }: BrowseScrollSentinelProps) {
    const nodeRef = react.useRef<HTMLDivElement | null>(null);
    const lockedRef = react.useRef(false);
    const onLoadMoreRef = react.useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;

    react.useEffect(() => {
      lockedRef.current = false;
    }, [enabled, loadKey]);

    react.useEffect(() => {
      const node = nodeRef.current;
      if (!node || !enabled) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.some((entry) => entry.isIntersecting);
          if (!isVisible || lockedRef.current) {
            return;
          }
          lockedRef.current = true;
          onLoadMoreRef.current();
        },
        { root: null, rootMargin, threshold: 0 },
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, [enabled, rootMargin]);

    return react.createElement("div", {
      ref: nodeRef,
      className: ["browse-scroll-sentinel", className].filter(Boolean).join(" "),
      "aria-hidden": true,
    });
  };
}
