import React from "react";
import {
  createBreadcrumb,
  createButton,
  createCard,
  createFormFields,
  createPageHero,
  createPanelSection,
  createReportLayout,
  createStatusMessage,
  exportToExcel,
  exportToPdf,
} from "@lunarq/frontend-shared";
import { factoryCode, snippetCode, type HelpGroup } from "./types";

const Button = createButton(React);
const Breadcrumb = createBreadcrumb(React);
const Card = createCard(React);
const PageHero = createPageHero(React);
const PanelSection = createPanelSection(React);
const StatusMessage = createStatusMessage(React);
const { DateTimeControl } = createFormFields(React);
const ReportLayout = createReportLayout(React, {
  exportToExcel: async (args) => {
    await exportToExcel({
      filename: args.filename.endsWith(".xlsx") ? args.filename : `${args.filename}.xlsx`,
      title: args.title,
      timestamp: args.timestamp,
      columns: args.columns.map((column) => ({
        header: column.header,
        key: column.key,
        format: column.format,
      })),
      data: args.data,
    });
  },
  exportToPDF: async (args) => {
    await exportToPdf({
      filename: args.filename.endsWith(".pdf") ? args.filename : `${args.filename}.pdf`,
      title: args.title,
      timestamp: args.timestamp,
      columns: args.columns.map((column) => ({
        header: column.header,
        key: column.key,
        format: column.format,
      })),
      data: args.data,
    });
  },
});

function CardExample() {
  return (
    <Card className="showcase-demo-card">
      <h3 style={{ marginTop: 0 }}>Shared Card</h3>
      <p className="showcase-copy">Use Card as a lightweight content container for demos and tiles.</p>
      <Button variant="secondary">Open</Button>
    </Card>
  );
}

function PageHeroExample() {
  return (
    <PageHero
      eyebrow="Layout"
      title="Page hero"
      description="Standard page intro with optional action row."
      actions={<Button>Primary action</Button>}
    />
  );
}

function BreadcrumbExample() {
  return (
    <Breadcrumb
      items={[
        { label: "Projects", href: "#projects" },
        { label: "MCP Track Tokens", href: "#project" },
        { label: "Cost by model" },
      ]}
    />
  );
}

function PanelSectionExample() {
  return (
    <PanelSection eyebrow="Section" title="Panel section" meta="Shared chrome" compact>
      <p className="showcase-copy" style={{ padding: "0 1.25rem 1.25rem" }}>
        Wrap related controls in a titled panel with optional meta or actions.
      </p>
    </PanelSection>
  );
}

function DateTimeControlExample() {
  const [dateValue, setDateValue] = React.useState("2026-07-20");
  const [dateTimeValue, setDateTimeValue] = React.useState("2026-07-20T09:30");
  const [withSeconds, setWithSeconds] = React.useState("2026-07-20T09:30:15");

  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <DateTimeControl
        htmlFor="help-dtc-date"
        label="Date mode"
        mode="date"
        value={dateValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDateValue(event.target.value)}
      />
      <DateTimeControl
        htmlFor="help-dtc-datetime"
        label="Datetime mode"
        mode="datetime"
        value={dateTimeValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDateTimeValue(event.target.value)}
      />
      <DateTimeControl
        htmlFor="help-dtc-seconds"
        label="Datetime + seconds"
        mode="datetime-seconds"
        value={withSeconds}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWithSeconds(event.target.value)}
      />
    </div>
  );
}

function ReportLayoutExample() {
  const rows = [
    { campaign: "Summer Launch", budget: 12500, status: "active" },
    { campaign: "Loyalty Push", budget: 8200, status: "scheduled" },
  ];

  return (
    <ReportLayout
      title="Campaign spend"
      description="Compact report shell with Excel/PDF export actions."
      filename="campaign-spend"
      data={rows}
      columns={[
        { header: "Campaign", key: "campaign" },
        { header: "Budget", key: "budget" },
        { header: "Status", key: "status" },
      ]}
    >
      <StatusMessage tone="info" title="Sample report" detail="Export buttons call the shared Excel/PDF helpers." />
      <table className="browse-table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Budget</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.campaign}>
              <td>{row.campaign}</td>
              <td>{row.budget}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportLayout>
  );
}

export const LAYOUT_HELP_GROUPS: HelpGroup[] = [
  {
    id: "layout",
    eyebrow: "Layout",
    title: "Page Chrome",
    items: [
      {
        id: "card",
        title: "Card",
        description: "Clickable or static content card used as a lightweight container.",
        code: factoryCode(
          "createCard",
          "Card",
          `export function Example() {
  return (
    <Card>
      <h3>Shared Card</h3>
      <p>Use Card for demos and tiles.</p>
    </Card>
  );
}`,
        ),
        Example: CardExample,
      },
      {
        id: "pageHero",
        title: "PageHero",
        description: "Page header with eyebrow, title, description, and optional actions.",
        code: factoryCode(
          "createPageHero",
          "PageHero",
          `export function Example() {
  return (
    <PageHero
      eyebrow="Layout"
      title="Page hero"
      description="Standard page intro."
    />
  );
}`,
        ),
        Example: PageHeroExample,
      },
      {
        id: "breadcrumb",
        title: "Breadcrumb",
        description:
          "Theme-aware navigation trail for nested pages. Bind with React Router Link for SPA routes.",
        code: [
          'import React from "react";',
          'import { Link } from "react-router-dom";',
          'import { createBreadcrumb } from "@lunarq/frontend-shared";',
          "",
          "const Breadcrumb = createBreadcrumb(React, Link);",
          "",
          `export function Example() {
  return (
    <Breadcrumb
      items={[
        { label: "Projects", to: "/projects" },
        { label: "MCP Track Tokens", to: "/projects/1" },
        { label: "Cost by model" },
      ]}
    />
  );
}`,
        ].join("\n"),
        Example: BreadcrumbExample,
      },
      {
        id: "panelSection",
        title: "PanelSection",
        description: "Section panel with optional eyebrow, title, meta, and actions.",
        code: factoryCode(
          "createPanelSection",
          "PanelSection",
          `export function Example() {
  return (
    <PanelSection eyebrow="Section" title="Panel section" meta="Shared chrome" compact>
      <p>Related controls go here.</p>
    </PanelSection>
  );
}`,
        ),
        Example: PanelSectionExample,
      },
    ],
  },
  {
    id: "advancedForms",
    eyebrow: "Forms",
    title: "DateTimeControl",
    items: [
      {
        id: "dateTimeControl",
        title: "DateTimeControl",
        description: "Mode-driven date / datetime / datetime-seconds control from createFormFields.",
        code: snippetCode(
          'import { createFormFields } from "@lunarq/frontend-shared";',
          "const { DateTimeControl } = createFormFields(React);",
          `export function Example() {
  const [value, setValue] = React.useState("2026-07-20T09:30");
  return (
    <DateTimeControl
      htmlFor="launchAt"
      label="Launch at"
      mode="datetime"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: DateTimeControlExample,
      },
    ],
  },
  {
    id: "pages",
    eyebrow: "Pages",
    title: "Composite Page Shells",
    items: [
      {
        id: "reportLayout",
        title: "ReportLayout",
        description: "Report page chrome with filters slot and Excel/PDF export actions.",
        code: snippetCode(
          'import { createReportLayout, exportToExcel, exportToPdf } from "@lunarq/frontend-shared";',
          `const ReportLayout = createReportLayout(React, {
  exportToExcel: async (args) => { /* map to exportToExcel */ },
  exportToPDF: async (args) => { /* map to exportToPdf */ },
});`,
          `export function Example() {
  const data = [{ campaign: "Summer Launch", budget: 12500 }];
  return (
    <ReportLayout
      title="Campaign spend"
      filename="campaign-spend"
      data={data}
      columns={[
        { header: "Campaign", key: "campaign" },
        { header: "Budget", key: "budget" },
      ]}
    >
      <p>Report body</p>
    </ReportLayout>
  );
}`,
        ),
        Example: ReportLayoutExample,
      },
    ],
  },
];
