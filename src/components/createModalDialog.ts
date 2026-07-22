type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface ModalDialogProps {
  title: ReactNodeLike;
  subtitle?: ReactNodeLike;
  children: ReactNodeLike;
  footer?: ReactNodeLike;
  onClose?: () => void;
  contentClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
  closeLabel?: string;
  showCloseButton?: boolean;
  /** Extra controls rendered before the close button (e.g. maximize). */
  headerActions?: ReactNodeLike;
}

export function createModalDialog(react: ReactElementApi) {
  return function ModalDialog({
    title,
    subtitle,
    children,
    footer,
    onClose,
    contentClassName = "",
    bodyClassName = "",
    headerClassName = "",
    footerClassName = "",
    closeButtonClassName = "",
    closeLabel = "Close dialog",
    showCloseButton = true,
    headerActions = null,
  }: ModalDialogProps) {
    const showHeaderControls = Boolean(headerActions) || (showCloseButton && Boolean(onClose));

    return react.createElement(
      "div",
      {
        className: "modal-overlay",
        onClick: onClose,
        role: "dialog",
        "aria-modal": true,
      },
      react.createElement(
        "div",
        {
          className: ["modal-content", contentClassName].filter(Boolean).join(" "),
          onClick: (event: { stopPropagation: () => void }) => event.stopPropagation(),
        },
        react.createElement(
          "div",
          { className: ["modal-header", headerClassName].filter(Boolean).join(" ") },
          react.createElement(
            "div",
            null,
            react.createElement("h2", null, title),
            subtitle ? react.createElement("p", { className: "page-subtitle" }, subtitle) : null,
          ),
          showHeaderControls
            ? react.createElement(
                "div",
                { className: "modal-header-actions" },
                headerActions,
                showCloseButton && onClose
                  ? react.createElement(
                      "button",
                      {
                        className: ["close-button", closeButtonClassName].filter(Boolean).join(" "),
                        onClick: onClose,
                        "aria-label": closeLabel,
                      },
                      "×",
                    )
                  : null,
              )
            : null,
        ),
        react.createElement("div", { className: ["modal-body", bodyClassName].filter(Boolean).join(" ") }, children),
        footer ? react.createElement("div", { className: ["modal-footer", footerClassName].filter(Boolean).join(" ") }, footer) : null,
      ),
    );
  };
}
