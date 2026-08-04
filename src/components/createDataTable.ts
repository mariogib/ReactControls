type ReactNodeLike = any;

interface ReactElementApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSortState = {
  columnId: string;
  direction: DataTableSortDirection;
} | null;

export type DataTableColumnConfig = {
  id: string;
  header: string;
  sortable?: boolean;
  className?: string;
};

export type DataTableColumn = string | DataTableColumnConfig;

export type DataTableSortControls = {
  sort: DataTableSortState;
  onSortChange: (next: DataTableSortState) => void;
};

export type BrowseSortValue = string | number | Date | null | undefined;

export interface DataTableProps {
  headers: DataTableColumn[];
  children: ReactNodeLike;
  sort?: DataTableSortState;
  onSortChange?: (next: DataTableSortState) => void;
  /** Extra class on the inner `<table>` (e.g. `"browse-table"`). */
  className?: string;
  /** Extra class on the outer shell (default `"table-shell"`). */
  shellClassName?: string;
}

export function normalizeDataTableColumn(
  column: DataTableColumn,
  index: number,
): DataTableColumnConfig {
  if (typeof column === "string") {
    return {
      id: `col-${index}`,
      header: column,
      sortable: false,
    };
  }
  return {
    id: column.id,
    header: column.header,
    sortable: Boolean(column.sortable),
    className: column.className,
  };
}

/** Toggle asc ↔ desc for the same column; first click on a new column starts at asc. */
export function nextDataTableSort(
  current: DataTableSortState,
  columnId: string,
): DataTableSortState {
  if (!current || current.columnId !== columnId) {
    return { columnId, direction: "asc" };
  }
  return {
    columnId,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
}

function compareBrowseSortValues(
  left: BrowseSortValue,
  right: BrowseSortValue,
): number {
  if (left instanceof Date || right instanceof Date) {
    const leftTime = left instanceof Date ? left.getTime() : new Date(String(left)).getTime();
    const rightTime = right instanceof Date ? right.getTime() : new Date(String(right)).getTime();
    if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
      return leftTime - rightTime;
    }
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  const leftNumber = typeof left === "number" ? left : Number(left);
  const rightNumber = typeof right === "number" ? right : Number(right);
  if (
    typeof left !== "string" &&
    typeof right !== "string" &&
    Number.isFinite(leftNumber) &&
    Number.isFinite(rightNumber)
  ) {
    return leftNumber - rightNumber;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Sort a full in-memory list before paging. Does not mutate `rows`.
 * Pass `null` sort to return a shallow copy of the input order.
 * Null/empty values always sort last (asc and desc).
 */
export function sortBrowseRows<T>(
  rows: readonly T[],
  sort: DataTableSortState,
  getValue: (row: T, columnId: string) => BrowseSortValue,
): T[] {
  if (!sort) {
    return [...rows];
  }
  const { columnId, direction } = sort;
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = getValue(left, columnId);
    const rightValue = getValue(right, columnId);
    const leftNull = leftValue == null || leftValue === "";
    const rightNull = rightValue == null || rightValue === "";
    if (leftNull && rightNull) {
      return 0;
    }
    if (leftNull) {
      return 1;
    }
    if (rightNull) {
      return -1;
    }
    return compareBrowseSortValues(leftValue, rightValue) * factor;
  });
}

function ariaSortValue(
  sort: DataTableSortState | undefined,
  columnId: string,
  sortable: boolean,
): "none" | "ascending" | "descending" | undefined {
  if (!sortable) {
    return undefined;
  }
  if (!sort || sort.columnId !== columnId) {
    return "none";
  }
  return sort.direction === "asc" ? "ascending" : "descending";
}

export function createDataTable(react: ReactElementApi) {
  return function DataTable({
    headers,
    children,
    sort = null,
    onSortChange,
    className,
    shellClassName = "table-shell",
  }: DataTableProps) {
    const columns = headers.map(normalizeDataTableColumn);

    return react.createElement(
      "div",
      { className: shellClassName },
      react.createElement(
        "table",
        { className: className || undefined },
        react.createElement(
          "thead",
          null,
          react.createElement(
            "tr",
            null,
            ...columns.map((column) => {
              const active = Boolean(sort && sort.columnId === column.id);
              const thClass = [
                column.className,
                column.sortable ? "sortable" : null,
                active ? "is-sorted" : null,
              ]
                .filter(Boolean)
                .join(" ");

              if (!column.sortable || !onSortChange) {
                return react.createElement(
                  "th",
                  {
                    key: column.id,
                    className: thClass || undefined,
                    scope: "col",
                  },
                  column.header,
                );
              }

              const direction = active ? sort!.direction : null;
              return react.createElement(
                "th",
                {
                  key: column.id,
                  className: thClass || undefined,
                  scope: "col",
                  "aria-sort": ariaSortValue(sort, column.id, true),
                },
                react.createElement(
                  "button",
                  {
                    type: "button",
                    className: "data-table-sort-btn",
                    onClick: () => onSortChange(nextDataTableSort(sort, column.id)),
                  },
                  react.createElement("span", { className: "data-table-sort-label" }, column.header),
                  react.createElement(
                    "span",
                    {
                      className: "data-table-sort-indicator",
                      "aria-hidden": true,
                    },
                    direction === "asc" ? "▲" : direction === "desc" ? "▼" : "↕",
                  ),
                ),
              );
            }),
          ),
        ),
        react.createElement("tbody", null, children),
      ),
    );
  };
}
