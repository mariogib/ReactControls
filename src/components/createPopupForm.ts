type ReactNodeLike = any;
type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactPopupFormApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;
  useRef: <T>(initialValue: T) => { current: T };
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

export interface PopupFormProps {
  /** Window / application title shown in the title bar. */
  title: ReactNodeLike;
  /** Optional supporting line under the title. */
  subtitle?: ReactNodeLike;
  children: ReactNodeLike;
  /** Footer / action row (Save, Cancel, …). Rendered inside the form when `onSubmit` is set. */
  footer?: ReactNodeLike;
  onClose: () => void;
  /** When set, children + footer are wrapped in a `<form>`. */
  onSubmit?: (event: { preventDefault: () => void }) => void;
  contentClassName?: string;
  bodyClassName?: string;
  formClassName?: string;
  footerClassName?: string;
  closeLabel?: string;
  /** Close when the dimmed overlay is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Allow dragging from the title bar. Defaults to `true`. */
  draggable?: boolean;
}

/**
 * Draggable popup shell for add/edit forms: title bar, drag handle, and close button.
 */
export function createPopupForm(react: ReactPopupFormApi) {
  return function PopupForm({
    title,
    subtitle,
    children,
    footer,
    onClose,
    onSubmit,
    contentClassName = "",
    bodyClassName = "",
    formClassName = "",
    footerClassName = "",
    closeLabel = "Close",
    closeOnOverlayClick = true,
    draggable = true,
  }: PopupFormProps) {
    const panelRef = react.useRef<HTMLDivElement | null>(null);
    const dragOffsetRef = react.useRef({ x: 0, y: 0 });
    const [position, setPosition] = react.useState<{ x: number; y: number } | null>(null);

    react.useEffect(() => {
      function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    react.useEffect(() => {
      if (!draggable || typeof window === "undefined") {
        return;
      }

      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const panelNode = panel;

      function handlePointerMove(event: PointerEvent) {
        setPosition({
          x: Math.max(16, Math.min(event.clientX - dragOffsetRef.current.x, window.innerWidth - 80)),
          y: Math.max(16, Math.min(event.clientY - dragOffsetRef.current.y, window.innerHeight - 48)),
        });
      }

      function handlePointerUp() {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      }

      function handlePointerDown(event: Event) {
        if (!(event instanceof PointerEvent) || event.button !== 0) {
          return;
        }

        const target = event.target as HTMLElement | null;
        if (target?.closest(".popup-form-close, button, a, input, select, textarea")) {
          return;
        }

        const rect = panelNode.getBoundingClientRect();
        dragOffsetRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        setPosition({ x: rect.left, y: rect.top });

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        event.preventDefault();
      }

      const handle = panelNode.querySelector(".popup-form-titlebar") as HTMLElement | null;
      handle?.addEventListener("pointerdown", handlePointerDown);

      return () => {
        handle?.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }, [draggable]);

    const panelStyle =
      position != null
        ? {
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "none",
            margin: 0,
          }
        : undefined;

    const body = react.createElement(
      "div",
      { className: ["popup-form-body", bodyClassName].filter(Boolean).join(" ") },
      children,
    );

    const footerNode = footer
      ? react.createElement(
          "div",
          { className: ["popup-form-footer", footerClassName].filter(Boolean).join(" ") },
          footer,
        )
      : null;

    const main = onSubmit
      ? react.createElement(
          "form",
          {
            className: ["popup-form-form", "stack", formClassName].filter(Boolean).join(" "),
            onSubmit,
            noValidate: true,
          },
          body,
          footerNode,
        )
      : react.createElement("div", { className: "popup-form-main" }, body, footerNode);

    return react.createElement(
      "div",
      {
        className: "popup-form-overlay",
        role: "presentation",
        onMouseDown: closeOnOverlayClick
          ? (event: { target: EventTarget | null; currentTarget: EventTarget }) => {
              if (event.target === event.currentTarget) {
                onClose();
              }
            }
          : undefined,
      },
      react.createElement(
        "div",
        {
          ref: panelRef,
          className: ["popup-form", "card", contentClassName].filter(Boolean).join(" "),
          role: "dialog",
          "aria-modal": true,
          "aria-label": typeof title === "string" ? title : "Dialog",
          style: panelStyle,
          onMouseDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
        },
        react.createElement(
          "div",
          {
            className: ["popup-form-titlebar", draggable ? "popup-form-titlebar--draggable" : ""]
              .filter(Boolean)
              .join(" "),
          },
          react.createElement(
            "div",
            { className: "popup-form-title-text" },
            react.createElement("h2", { className: "popup-form-title" }, title),
            subtitle
              ? react.createElement("p", { className: "popup-form-subtitle" }, subtitle)
              : null,
          ),
          react.createElement(
            "button",
            {
              type: "button",
              className: "popup-form-close",
              onClick: onClose,
              "aria-label": closeLabel,
            },
            "×",
          ),
        ),
        main,
      ),
    );
  };
}
