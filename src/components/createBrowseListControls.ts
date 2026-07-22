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
    );
  };
}
