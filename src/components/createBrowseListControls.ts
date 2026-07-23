type ReactNodeLike = any;

interface ReactElementApi {
  createElement(
    type: any,
    props?: Record<string, unknown> | null,
    ...children: ReactNodeLike[]
  ): ReactNodeLike;
}

export type BrowseViewMode = "table" | "grid" | "calendar";
export type BrowseCalendarScope = "day" | "month" | "year";
/**
 * `pages` = classic page navigation over the full list.
 * `lazy` = page navigation that loads each displayed page once into a cache.
 * `scroll` = infinite scroll that loads each next page once into a cache.
 */
export type BrowsePagingMode = "pages" | "lazy" | "scroll";

export interface BrowseFilterOption {
  label: string;
  value: string;
}

export interface BrowseFilterConfig {
  id: string;
  label: string;
  value: string;
  options: BrowseFilterOption[];
  ariaLabel?: string;
  className?: string;
  onChange: (value: string) => void;
}

export interface BrowsePagingConfig {
  /** Defaults to `"pages"`. */
  mode?: BrowsePagingMode;
  /** Max rows shown per page (or per lazy/scroll load). */
  pageSize: number;
  /** Optional selectable page-size values. */
  pageSizeOptions?: number[];
  /** 0-based index of the page currently displayed (pages / lazy) or last requested (scroll). */
  pageIndex: number;
  /** Total rows available after filtering (not just the current page). */
  totalCount: number;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Pages already loaded for `lazy` / `scroll`.
   * A page is loaded at most once; revisiting it reuses this cache.
   */
  loadedPages?: ReadonlySet<number>;
  pageSizeLabel?: string;
  ariaLabel?: string;
}

export interface BrowseListControlsProps {
  heading: string;
  viewMode: BrowseViewMode;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onViewModeChange?: (value: BrowseViewMode) => void;
  onExportToExcel: () => void | Promise<void>;
  filters?: BrowseFilterConfig[];
  allowCalendarView?: boolean;
  /**
   * Active calendar scope when `viewMode` is `"calendar"`.
   * Defaults to `"month"`.
   */
  calendarScope?: BrowseCalendarScope;
  onCalendarScopeChange?: (value: BrowseCalendarScope) => void;
  /** Include the Day scope option. Defaults to `true`. */
  showCalendarDayOption?: boolean;
  /** Include the Year scope option. Defaults to `true`. */
  showCalendarYearOption?: boolean;
  calendarScopeAriaLabel?: string;
  exportLabel?: string;
  exportDisabled?: boolean;
  viewAriaLabel?: string;
  searchAriaLabel?: string;
  showHeading?: boolean;
  showSearch?: boolean;
  showViewSwitch?: boolean;
  showExportButton?: boolean;
  customControls?: ReactNodeLike[];
  /** Optional paging / lazy-load controls. Omit or pass `null` to disable. */
  paging?: BrowsePagingConfig | null;
}

const TABLE_AND_GRID_OPTIONS: Array<{ value: BrowseViewMode; label: string }> =
  [
    { value: "table", label: "Table" },
    { value: "grid", label: "Grid" },
  ];

const CALENDAR_OPTION: { value: BrowseViewMode; label: string } = {
  value: "calendar",
  label: "Calendar",
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function resolveCalendarScopeOptions(
  showCalendarDayOption: boolean,
  showCalendarYearOption: boolean,
): Array<{ value: BrowseCalendarScope; label: string }> {
  const options: Array<{ value: BrowseCalendarScope; label: string }> = [];
  if (showCalendarDayOption) {
    options.push({ value: "day", label: "Day" });
  }
  options.push({ value: "month", label: "Month" });
  if (showCalendarYearOption) {
    options.push({ value: "year", label: "Year" });
  }
  return options;
}

export function isBrowseChunkPagingMode(
  mode: BrowsePagingMode | undefined,
): mode is "lazy" | "scroll" {
  return mode === "lazy" || mode === "scroll";
}

export function getBrowsePageCount(totalCount: number, pageSize: number): number {
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const total = Math.max(0, Math.floor(totalCount) || 0);
  return total === 0 ? 1 : Math.ceil(total / size);
}

/** Create a loaded-page cache that already includes the first page. */
export function createBrowseLoadedPages(
  initialPageIndex = 0,
): Set<number> {
  return new Set([Math.max(0, Math.floor(initialPageIndex) || 0)]);
}

/**
 * Mark a page as loaded. Returns the same set reference when the page was
 * already cached so callers can skip redundant state updates.
 */
export function loadBrowsePage(
  loadedPages: ReadonlySet<number>,
  pageIndex: number,
): Set<number> {
  const index = Math.max(0, Math.floor(pageIndex) || 0);
  if (loadedPages.has(index)) {
    return loadedPages instanceof Set ? loadedPages : new Set(loadedPages);
  }
  const next = new Set(loadedPages);
  next.add(index);
  return next;
}

/** Next page index to request for scroll mode (first gap, else max + 1). */
export function getNextBrowsePageToLoad(
  loadedPages: ReadonlySet<number>,
  pageCount: number,
): number | null {
  const count = Math.max(1, Math.floor(pageCount) || 1);
  for (let index = 0; index < count; index += 1) {
    if (!loadedPages.has(index)) {
      return index;
    }
  }
  return null;
}

function slicePageWindow<T>(
  items: readonly T[],
  pageIndex: number,
  pageSize: number,
): T[] {
  const start = pageIndex * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Slice filtered rows for the active browse paging mode.
 * `lazy` returns only the displayed page, and only after it has been loaded.
 * `scroll` returns every loaded page (each page loaded at most once).
 */
export function sliceBrowsePage<T>(
  items: readonly T[],
  paging: Pick<BrowsePagingConfig, "mode" | "pageIndex" | "pageSize" | "loadedPages">,
): T[] {
  const pageSize = Math.max(1, Math.floor(paging.pageSize) || 1);
  const pageIndex = Math.max(0, Math.floor(paging.pageIndex) || 0);
  const mode = paging.mode ?? "pages";

  if (mode === "pages") {
    return slicePageWindow(items, pageIndex, pageSize);
  }

  const loadedPages = paging.loadedPages;
  if (mode === "lazy") {
    if (loadedPages && !loadedPages.has(pageIndex)) {
      return [];
    }
    return slicePageWindow(items, pageIndex, pageSize);
  }

  // scroll
  if (!loadedPages || loadedPages.size === 0) {
    return [];
  }
  const ordered = [...loadedPages].sort((a, b) => a - b);
  const rows: T[] = [];
  for (const index of ordered) {
    rows.push(...slicePageWindow(items, index, pageSize));
  }
  return rows;
}

export function createBrowseListControls(react: ReactElementApi) {
  return function BrowseListControls({
    heading,
    viewMode,
    searchValue,
    searchPlaceholder,
    onSearchChange,
    onViewModeChange = () => undefined,
    onExportToExcel,
    filters = [],
    allowCalendarView = false,
    calendarScope = "month",
    onCalendarScopeChange = () => undefined,
    showCalendarDayOption = true,
    showCalendarYearOption = true,
    calendarScopeAriaLabel,
    exportLabel = "Export to Excel",
    exportDisabled = false,
    viewAriaLabel,
    searchAriaLabel,
    showHeading = true,
    showSearch = true,
    showViewSwitch = true,
    showExportButton = true,
    customControls = [],
    paging = null,
  }: BrowseListControlsProps) {
    const viewOptions = allowCalendarView
      ? [...TABLE_AND_GRID_OPTIONS, CALENDAR_OPTION]
      : TABLE_AND_GRID_OPTIONS;

    const calendarScopeOptions = resolveCalendarScopeOptions(
      showCalendarDayOption,
      showCalendarYearOption,
    );
    const showCalendarScopeSwitch =
      allowCalendarView &&
      viewMode === "calendar" &&
      calendarScopeOptions.length > 1;

    const headerActions: ReactNodeLike[] = [];

    if (showExportButton) {
      headerActions.push(
        react.createElement(
          "button",
          {
            key: "export-button",
            type: "button",
            className: "secondary-btn",
            onClick: onExportToExcel,
            disabled: exportDisabled,
          },
          exportLabel,
        ),
      );
    }

    if (showViewSwitch) {
      headerActions.push(
        react.createElement(
          "div",
          {
            key: "view-switch",
            className: "browse-view-switch",
            role: "group",
            "aria-label": viewAriaLabel ?? `${heading} view`,
          },
          ...viewOptions.map((option) =>
            react.createElement(
              "button",
              {
                key: option.value,
                type: "button",
                className: `browse-view-switch-btn ${viewMode === option.value ? "active" : ""}`,
                onClick: () => onViewModeChange(option.value),
                "aria-pressed": viewMode === option.value,
              },
              option.label,
            ),
          ),
        ),
      );
    }

    if (showCalendarScopeSwitch) {
      headerActions.push(
        react.createElement(
          "div",
          {
            key: "calendar-scope-switch",
            className: "browse-view-switch browse-calendar-scope-switch",
            role: "group",
            "aria-label": calendarScopeAriaLabel ?? `${heading} calendar scope`,
          },
          ...calendarScopeOptions.map((option) =>
            react.createElement(
              "button",
              {
                key: option.value,
                type: "button",
                className: `browse-view-switch-btn ${calendarScope === option.value ? "active" : ""}`,
                onClick: () => onCalendarScopeChange(option.value),
                "aria-pressed": calendarScope === option.value,
              },
              option.label,
            ),
          ),
        ),
      );
    }

    let pagingBar: ReactNodeLike = null;
    if (paging) {
      const mode = paging.mode ?? "pages";
      const pageNavMode = mode === "pages" || mode === "lazy";
      const pageSize = Math.max(1, Math.floor(paging.pageSize) || 1);
      const pageIndex = Math.max(0, Math.floor(paging.pageIndex) || 0);
      const totalCount = Math.max(0, Math.floor(paging.totalCount) || 0);
      const pageCount = getBrowsePageCount(totalCount, pageSize);
      const safePageIndex = Math.min(pageIndex, pageCount - 1);
      const loadedPages = paging.loadedPages;
      const loadedCount =
        mode === "scroll"
          ? Math.min(
              totalCount,
              [...(loadedPages ?? [])].reduce((sum, index) => {
                const start = index * pageSize;
                return sum + Math.max(0, Math.min(pageSize, totalCount - start));
              }, 0),
            )
          : 0;
      const rangeStart =
        totalCount === 0
          ? 0
          : mode === "scroll"
            ? loadedCount === 0
              ? 0
              : 1
            : safePageIndex * pageSize + 1;
      const rangeEnd =
        totalCount === 0
          ? 0
          : mode === "scroll"
            ? loadedCount
            : Math.min(totalCount, (safePageIndex + 1) * pageSize);
      const pageSizeOptions = Array.from(
        new Set([...(paging.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS), pageSize]),
      ).sort((a, b) => a - b);
      const nextScrollPage =
        mode === "scroll"
          ? getNextBrowsePageToLoad(loadedPages ?? new Set(), pageCount)
          : null;
      const canLoadMore = mode === "scroll" && nextScrollPage !== null && totalCount > 0;
      const canGoPrev = pageNavMode && safePageIndex > 0;
      const canGoNext = pageNavMode && safePageIndex < pageCount - 1;

      const pagingChildren: ReactNodeLike[] = [
        react.createElement(
          "label",
          {
            key: "page-size",
            className: "browse-paging-size",
            htmlFor: "browse-page-size",
          },
          react.createElement("span", null, paging.pageSizeLabel ?? "Rows per page"),
          react.createElement(
            "select",
            {
              id: "browse-page-size",
              className: "filter-select",
              value: String(pageSize),
              disabled: !paging.onPageSizeChange,
              "aria-label": paging.pageSizeLabel ?? "Rows per page",
              onChange: (event: { target: { value: string } }) => {
                const nextSize = Number(event.target.value);
                if (!Number.isFinite(nextSize) || nextSize < 1) {
                  return;
                }
                paging.onPageSizeChange?.(nextSize);
              },
            },
            ...pageSizeOptions.map((size) =>
              react.createElement(
                "option",
                { key: `page-size-${size}`, value: String(size) },
                String(size),
              ),
            ),
          ),
        ),
        react.createElement(
          "span",
          { key: "range", className: "browse-paging-range" },
          totalCount === 0
            ? "No rows"
            : mode === "scroll"
              ? `Loaded ${rangeStart === 0 ? 0 : rangeStart}–${rangeEnd} of ${totalCount}`
              : `Showing ${rangeStart}–${rangeEnd} of ${totalCount}`,
        ),
      ];

      if (pageNavMode) {
        pagingChildren.push(
          react.createElement(
            "div",
            { key: "page-nav", className: "browse-paging-nav" },
            react.createElement(
              "button",
              {
                type: "button",
                className: "secondary-btn browse-paging-btn",
                disabled: !canGoPrev,
                onClick: () => paging.onPageIndexChange(Math.max(0, safePageIndex - 1)),
              },
              "Previous",
            ),
            react.createElement(
              "span",
              { className: "browse-paging-page" },
              `Page ${safePageIndex + 1} of ${pageCount}`,
            ),
            react.createElement(
              "button",
              {
                type: "button",
                className: "secondary-btn browse-paging-btn",
                disabled: !canGoNext,
                onClick: () =>
                  paging.onPageIndexChange(Math.min(pageCount - 1, safePageIndex + 1)),
              },
              "Next",
            ),
          ),
        );
      } else {
        pagingChildren.push(
          react.createElement(
            "span",
            { key: "scroll-hint", className: "browse-paging-hint" },
            canLoadMore ? "Scroll to load more" : totalCount === 0 ? "" : "All pages loaded",
          ),
        );
      }

      pagingBar = react.createElement(
        "div",
        {
          className: "browse-paging",
          role: "navigation",
          "aria-label": paging.ariaLabel ?? `${heading} paging`,
        },
        ...pagingChildren,
      );
    }

    return react.createElement(
      "div",
      { className: "browse-list-controls" },
      showHeading || headerActions.length > 0
        ? react.createElement(
            "div",
            { className: "section-header" },
            showHeading ? react.createElement("h2", null, heading) : null,
            headerActions.length > 0
              ? react.createElement(
                  "div",
                  { className: "browse-toolbar-actions" },
                  ...headerActions,
                )
              : null,
          )
        : null,
      showSearch || filters.length > 0 || customControls.length > 0
        ? react.createElement(
            "div",
            { className: "list-controls" },
            showSearch
              ? react.createElement("input", {
                  type: "text",
                  placeholder: searchPlaceholder,
                  value: searchValue,
                  onChange: (event: { target: { value: string } }) =>
                    onSearchChange(event.target.value),
                  className: "search-input",
                  "aria-label": searchAriaLabel ?? searchPlaceholder,
                })
              : null,
            ...filters.map((filter) =>
              react.createElement(
                "div",
                { key: filter.id, className: "filter-group" },
                react.createElement(
                  "label",
                  { htmlFor: filter.id, className: "visually-hidden" },
                  filter.label,
                ),
                react.createElement(
                  "select",
                  {
                    id: filter.id,
                    value: filter.value,
                    onChange: (event: { target: { value: string } }) =>
                      filter.onChange(event.target.value),
                    className: filter.className
                      ? `filter-select ${filter.className}`
                      : "filter-select",
                    "aria-label": filter.ariaLabel ?? filter.label,
                  },
                  ...filter.options.map((option) =>
                    react.createElement(
                      "option",
                      {
                        key: `${filter.id}-${option.value}`,
                        value: option.value,
                      },
                      option.label,
                    ),
                  ),
                ),
              ),
            ),
            ...customControls,
          )
        : null,
      pagingBar,
    );
  };
}
