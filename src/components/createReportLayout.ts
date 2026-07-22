type ReactNodeLike = any;
type SetStateAction<T> = T | ((previousState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;

interface ReactReportLayoutApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  createElement(type: any, props?: Record<string, unknown> | null, ...children: ReactNodeLike[]): ReactNodeLike;
}

export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: unknown) => string;
}

export interface ReportLayoutProps {
  title: string;
  description?: string;
  icon?: string;
  children: ReactNodeLike;
  data: any[];
  columns: ReportColumn[];
  filename: string;
  filters?: ReactNodeLike;
  loading?: boolean;
  error?: string | null;
}

type ExportHandlers = {
  exportToExcel: (args: { filename: string; title: string; columns: ReportColumn[]; data: any[]; timestamp: string }) => Promise<void>;
  exportToPDF: (args: { filename: string; title: string; columns: ReportColumn[]; data: any[]; timestamp: string }) => Promise<void>;
};

export function createReportLayout(react: ReactReportLayoutApi, { exportToExcel, exportToPDF }: ExportHandlers) {
  return function ReportLayout({
    title,
    description,
    icon = "📊",
    children,
    data,
    columns,
    filename,
    filters,
    loading = false,
    error = null,
  }: ReportLayoutProps) {
    const [exporting, setExporting] = react.useState(false);
    const [exportError, setExportError] = react.useState<string | null>(null);

    const handleExportExcel = async () => {
      try {
        setExporting(true);
        setExportError(null);

        await exportToExcel({
          filename,
          title,
          columns,
          data,
          timestamp: new Date().toISOString().split("T")[0],
        });
      } catch (nextError) {
        const message = nextError instanceof Error ? nextError.message : "Export failed";
        setExportError(message);
        console.error("Excel export error:", nextError);
      } finally {
        setExporting(false);
      }
    };

    const handleExportPDF = async () => {
      try {
        setExporting(true);
        setExportError(null);

        await exportToPDF({
          filename,
          title,
          columns,
          data,
          timestamp: new Date().toLocaleString(),
        });
      } catch (nextError) {
        const message = nextError instanceof Error ? nextError.message : "Export failed";
        setExportError(message);
        console.error("PDF export error:", nextError);
      } finally {
        setExporting(false);
      }
    };

    return react.createElement(
      "div",
      { className: "report-container" },
      react.createElement(
        "div",
        { className: "report-header" },
        react.createElement(
          "div",
          { className: "report-title-section" },
          react.createElement(
            "h1",
            null,
            react.createElement("span", { className: "report-icon" }, icon),
            title,
          ),
          description ? react.createElement("p", { className: "report-description" }, description) : null,
        ),
        react.createElement(
          "div",
          { className: "report-actions" },
          react.createElement(
            "button",
            {
              className: "export-btn excel-btn",
              onClick: handleExportExcel,
              disabled: exporting || loading || data.length === 0,
              title: "Export to Excel",
              type: "button",
            },
            "📊 Export Excel",
          ),
          react.createElement(
            "button",
            {
              className: "export-btn pdf-btn",
              onClick: handleExportPDF,
              disabled: exporting || loading || data.length === 0,
              title: "Export to PDF",
              type: "button",
            },
            "📄 Export PDF",
          ),
        ),
      ),
      exportError
        ? react.createElement("div", { className: "error-message export-error" }, react.createElement("span", null, "⚠️"), exportError)
        : null,
      filters ? react.createElement("div", { className: "report-filters" }, filters) : null,
      error ? react.createElement("div", { className: "error-message" }, react.createElement("span", null, "⚠️"), error) : null,
      loading
        ? react.createElement(
            "div",
            { className: "report-loading" },
            react.createElement("div", { className: "spinner" }),
            react.createElement("p", null, "Loading report data..."),
          )
        : react.createElement("div", { className: "report-content" }, children),
      !loading && !error && data.length === 0
        ? react.createElement(
            "div",
            { className: "empty-state" },
            react.createElement("p", { className: "empty-icon" }, "📭"),
            react.createElement("p", null, "No data available for this report"),
          )
        : null,
      !loading && !error && data.length > 0
        ? react.createElement(
            "div",
            { className: "report-footer" },
            react.createElement("p", { className: "report-count" }, `Total records: ${data.length}`),
            react.createElement("p", { className: "report-timestamp" }, `Generated: ${new Date().toLocaleString()}`),
          )
        : null,
    );
  };
}
