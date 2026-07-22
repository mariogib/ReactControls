type ReactNodeLike = any;

interface ReactElementApi {
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface DataTableProps {
  headers: string[];
  children: ReactNodeLike;
}

export function createDataTable(react: ReactElementApi) {
  return function DataTable({ headers, children }: DataTableProps) {
    return react.createElement(
      "div",
      { className: "table-shell" },
      react.createElement(
        "table",
        null,
        react.createElement(
          "thead",
          null,
          react.createElement(
            "tr",
            null,
            ...headers.map((header) => react.createElement("th", { key: header }, header)),
          ),
        ),
        react.createElement("tbody", null, children),
      ),
    );
  };
}
