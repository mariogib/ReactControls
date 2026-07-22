type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface EntityModalFormProps {
  title: ReactNodeLike;
  onClose: () => void;
  onSubmit: (event: unknown) => void;
  children: ReactNodeLike;
  actions?: ReactNodeLike;
  dialogClassName?: string;
  formClassName?: string;
}

export function createEntityModalForm(react: ReactElementApi, ModalDialog: any) {
  return function EntityModalForm({ title, onClose, onSubmit, children, actions, dialogClassName, formClassName }: EntityModalFormProps) {
    const resolvedFormClassName = ["session-modal-content", formClassName].filter(Boolean).join(" ");
    return react.createElement(
      ModalDialog,
      { title, onClose, dialogClassName },
      react.createElement(
        "form",
        { className: resolvedFormClassName, onSubmit },
        children,
        actions ? react.createElement("div", { className: "form-actions prize-form-actions" }, actions) : null,
      ),
    );
  };
}
