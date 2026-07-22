type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
  Fragment: any;
}

export interface RegistryResourcePageProps {
  eyebrow: string;
  title: ReactNodeLike;
  description: ReactNodeLike;
  actions?: ReactNodeLike;
  errorTitle: ReactNodeLike;
  error?: string | null;
  isFormOpen: boolean;
  editorTitle: ReactNodeLike;
  onClose: () => void;
  onSubmit: (...args: any[]) => void;
  editorContent: ReactNodeLike;
  saving: boolean;
  submitLabel: ReactNodeLike;
  sectionEyebrow: string;
  sectionTitle: ReactNodeLike;
  sectionMeta: ReactNodeLike;
  loading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDetail: string;
  headers: string[];
  rows: ReactNodeLike;
  actionButtonClassName?: string;
}

export function createRegistryResourcePage(
  react: ReactElementApi,
  components: {
    CrudRegistryPage: any;
    DataTable: any;
    EmptyState: any;
    EntityModalForm: any;
    PanelSection: any;
    StatusMessage: any;
  },
) {
  const { CrudRegistryPage, DataTable, EmptyState, EntityModalForm, PanelSection, StatusMessage } = components;

  return function RegistryResourcePage({
    eyebrow,
    title,
    description,
    actions,
    errorTitle,
    error,
    isFormOpen,
    editorTitle,
    onClose,
    onSubmit,
    editorContent,
    saving,
    submitLabel,
    sectionEyebrow,
    sectionTitle,
    sectionMeta,
    loading,
    isEmpty,
    emptyTitle,
    emptyDetail,
    headers,
    rows,
    actionButtonClassName = "primary-btn",
  }: RegistryResourcePageProps) {
    return react.createElement(
      CrudRegistryPage,
      {
        eyebrow,
        title,
        description,
        actions,
        status: error ? react.createElement(StatusMessage, { title: errorTitle, detail: error, tone: "error" }) : null,
        editor: isFormOpen ? react.createElement(
          EntityModalForm,
          {
            title: editorTitle,
            onClose,
            onSubmit,
            dialogClassName: "entity-form-modal",
            formClassName: "entity-form",
            actions: react.createElement(
              react.Fragment,
              null,
              react.createElement("button", { className: "secondary-btn", onClick: onClose, type: "button" }, "Cancel"),
              react.createElement("button", { className: actionButtonClassName, disabled: saving, type: "submit" }, saving ? "Saving..." : submitLabel),
            ),
          },
          editorContent,
        ) : null,
      },
      react.createElement(
        "div",
        { className: "registry-page-sections" },
        react.createElement(
          PanelSection,
          { eyebrow: sectionEyebrow, title: sectionTitle, meta: sectionMeta, compact: true },
          loading
            ? react.createElement(EmptyState, { title: emptyTitle.replace("No ", "Loading "), detail: emptyDetail.replace("Create", "Reading"), as: "div", framed: false })
            : isEmpty
              ? react.createElement(EmptyState, { title: emptyTitle, detail: emptyDetail, as: "div", framed: false })
              : react.createElement(DataTable, { headers }, rows),
        ),
      ),
    );
  };
}
