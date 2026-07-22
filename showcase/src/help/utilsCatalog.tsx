import React from "react";
import {
  createButton,
  createStatusMessage,
  exportToExcel,
  exportToPdf,
  formatBoolean,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  formatStatus,
  getErrorMessage,
  getUniqueSortedValues,
  normalizeAppBasePath,
  resolveApiBaseUrl,
  trimToUndefined,
  truncateText,
} from "@lunarq/frontend-shared";
import { snippetCode, type HelpGroup } from "./types";

const Button = createButton(React);
const StatusMessage = createStatusMessage(React);

function FormattingExample() {
  return (
    <pre className="showcase-code-block">
      {JSON.stringify(
        {
          formatCurrency: formatCurrency(12500.5),
          formatMoney: formatMoney(12500.5),
          formatNumber: formatNumber(12500.5),
          formatBoolean: formatBoolean(true),
          formatStatus: formatStatus("active"),
          truncateText: truncateText("A very long campaign title for the tile", 24),
        },
        null,
        2,
      )}
    </pre>
  );
}

function DateTimeUtilsExample() {
  const value = new Date("2026-07-20T09:30:00");
  return (
    <pre className="showcase-code-block">
      {JSON.stringify(
        {
          formatDate: formatDate(value),
          formatDateTime: formatDateTime(value),
        },
        null,
        2,
      )}
    </pre>
  );
}

function ExportUtilsExample() {
  const rows = [
    { campaign: "Summer Launch", budget: 12500 },
    { campaign: "Loyalty Push", budget: 8200 },
  ];
  const columns = [
    { header: "Campaign", key: "campaign" },
    { header: "Budget", key: "budget" },
  ];
  const [message, setMessage] = React.useState<string | null>(null);

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <div className="showcase-action-row">
        <Button
          onClick={async () => {
            await exportToExcel({
              filename: "help-export.xlsx",
              title: "Help Export",
              timestamp: new Date().toISOString(),
              columns,
              data: rows,
            });
            setMessage("Excel download started");
          }}
        >
          Export Excel
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await exportToPdf({
              filename: "help-export.pdf",
              title: "Help Export",
              timestamp: new Date().toISOString(),
              columns,
              data: rows,
            });
            setMessage("PDF download started");
          }}
        >
          Export PDF
        </Button>
      </div>
      {message ? <StatusMessage tone="success" title="Export" detail={message} /> : null}
    </div>
  );
}

function RuntimeUrlsExample() {
  return (
    <pre className="showcase-code-block">
      {JSON.stringify(
        {
          normalizeAppBasePath: normalizeAppBasePath("/admin/"),
          resolveApiBaseUrl: resolveApiBaseUrl(
            { hostname: "localhost", port: "4190", protocol: "http:" },
            "/admin",
            "http://localhost:5080",
          ),
          trimToUndefined: trimToUndefined("  "),
          getUniqueSortedValues: getUniqueSortedValues(
            [{ status: "active" }, { status: "draft" }, { status: "active" }],
            (item) => item.status,
          ),
          getErrorMessage: getErrorMessage(new Error("Boom"), "Fallback"),
        },
        null,
        2,
      )}
    </pre>
  );
}

export const UTILS_HELP_GROUPS: HelpGroup[] = [
  {
    id: "formatting",
    eyebrow: "Utils",
    title: "Formatting",
    items: [
      {
        id: "formattingHelpers",
        title: "Formatting helpers",
        description: "formatCurrency, formatMoney, formatNumber, formatBoolean, formatStatus, truncateText.",
        code: snippetCode(
          'import { formatCurrency, formatMoney, formatStatus } from "@lunarq/frontend-shared";',
          "",
          `formatCurrency(12500.5);
formatMoney(12500.5);
formatStatus("active");`,
        ),
        Example: FormattingExample,
      },
      {
        id: "dateTimeHelpers",
        title: "Date/time helpers",
        description: "formatDate, formatDateTime, and related date parsing/formatting helpers.",
        code: snippetCode(
          'import { formatDate, formatDateTime } from "@lunarq/frontend-shared";',
          "",
          `formatDate(new Date());
formatDateTime(new Date());`,
        ),
        Example: DateTimeUtilsExample,
      },
    ],
  },
  {
    id: "export",
    eyebrow: "Utils",
    title: "Export",
    items: [
      {
        id: "excelPdfExport",
        title: "Excel & PDF export",
        description: "exportToExcel and exportToPdf build downloadable table documents.",
        code: snippetCode(
          'import { exportToExcel, exportToPdf } from "@lunarq/frontend-shared";',
          "",
          `await exportToExcel({
  filename: "report.xlsx",
  title: "Report",
  timestamp: new Date().toISOString(),
  columns: [{ header: "Name", key: "name" }],
  data: [{ name: "Alpha" }],
});`,
        ),
        Example: ExportUtilsExample,
      },
    ],
  },
  {
    id: "runtime",
    eyebrow: "Utils",
    title: "Runtime & Collections",
    items: [
      {
        id: "runtimeHelpers",
        title: "Runtime URL & misc helpers",
        description: "normalizeAppBasePath, resolveApiBaseUrl, trimToUndefined, getUniqueSortedValues, getErrorMessage.",
        code: snippetCode(
          'import { normalizeAppBasePath, resolveApiBaseUrl, getErrorMessage } from "@lunarq/frontend-shared";',
          "",
          `normalizeAppBasePath("/admin/");
resolveApiBaseUrl(
  { hostname: "localhost", port: "4190", protocol: "http:" },
  "/admin",
  "http://localhost:5080",
);
getErrorMessage(error, "Fallback");`,
        ),
        Example: RuntimeUrlsExample,
      },
    ],
  },
];
