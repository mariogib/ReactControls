import React from "react";
import {
  DailyLineChart,
  NamedBarChart,
  NamedPieChart,
  createAnalysisDetailBrowse,
  createBrowseListControls,
  createBrowseScrollSentinel,
  createCard,
  createChartCard,
  createEmptyState,
  createLoadingState,
  createMetricSurfaces,
  formatNumber,
} from "@lunarq/frontend-shared";
import { factoryCode, snippetCode, type HelpGroup } from "./types";

const Card = createCard(React);
const ChartCard = createChartCard(React, Card);
const LoadingState = createLoadingState(React);
const EmptyState = createEmptyState(React);
const { MetricCard, Panel, TablePanel } = createMetricSurfaces(React, Card);
const BrowseListControls = createBrowseListControls(React);
const BrowseScrollSentinel = createBrowseScrollSentinel(React);
const AnalysisDetailBrowse = createAnalysisDetailBrowse({
  BrowseListControls,
  BrowseScrollSentinel,
  TablePanel,
  EmptyState,
  formatNumber,
});

const lineData = [
  { day: "Mon", prompts: 12 },
  { day: "Tue", prompts: 18 },
  { day: "Wed", prompts: 9 },
  { day: "Thu", prompts: 22 },
  { day: "Fri", prompts: 15 },
];

const barData = [
  { name: "Cursor", value: 42 },
  { name: "VS Code", value: 18 },
  { name: "Other", value: 7 },
];

type DetailRow = {
  id: string;
  project: string;
  status: string;
  prompts: number;
};

const detailRows: DetailRow[] = [
  { id: "1", project: "frontend-shared", status: "active", prompts: 128 },
  { id: "2", project: "mcp-track-tokens", status: "active", prompts: 96 },
  { id: "3", project: "docs", status: "paused", prompts: 12 },
];

function LoadingStateExample() {
  return <LoadingState label="Loading analysis…" />;
}

function MetricSurfacesExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <div className="showcase-action-row">
        <MetricCard label="Prompts" value="1,284" hint="Last 7 days" />
        <MetricCard label="Active projects" value="6" />
      </div>
      <Panel className="stack">
        <p className="showcase-copy" style={{ margin: 0 }}>
          Panel wraps content on the shared Card surface.
        </p>
      </Panel>
      <TablePanel>
        <table className="browse-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Prompts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>frontend-shared</td>
              <td>128</td>
            </tr>
            <tr>
              <td>mcp-track-tokens</td>
              <td>96</td>
            </tr>
          </tbody>
        </table>
      </TablePanel>
    </div>
  );
}

function ChartCardExample() {
  const [opened, setOpened] = React.useState<string | null>(null);
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <ChartCard
        title="Prompts / day"
        height={180}
        to="/analysis/prompts-day"
        onNavigate={(to) => setOpened(to)}
      >
        <DailyLineChart data={lineData} xKey="day" yKey="prompts" yLabel="Prompts" />
      </ChartCard>
      {opened ? (
        <p className="showcase-copy" style={{ margin: 0 }}>
          Navigated to <code>{opened}</code>
        </p>
      ) : null}
    </div>
  );
}

function ThemeChartsExample() {
  return (
    <div className="showcase-stack" style={{ padding: 0 }}>
      <div style={{ width: "100%", height: 160 }}>
        <DailyLineChart data={lineData} xKey="day" yKey="prompts" yLabel="Prompts" />
      </div>
      <div style={{ width: "100%", height: 160 }}>
        <NamedBarChart data={barData} valueKey="value" valueLabel="Count" />
      </div>
      <div style={{ width: "100%", height: 180 }}>
        <NamedPieChart data={barData} valueKey="value" />
      </div>
    </div>
  );
}

function AnalysisDetailBrowseExample() {
  return (
    <AnalysisDetailBrowse
      heading="Project activity"
      rows={detailRows}
      getSearchText={(row) => `${row.project} ${row.status}`}
      getStatusValue={(row) => row.status}
      statusOptions={[
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ]}
      exportFilename="project-activity"
      exportTitle="Project activity"
      exportColumns={[
        { header: "Project", key: "project" },
        { header: "Status", key: "status" },
        { header: "Prompts", key: "prompts" },
      ]}
      toExportRow={(row) => ({
        project: row.project,
        status: row.status,
        prompts: row.prompts,
      })}
      renderTable={(rows) => (
        <table className="browse-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Prompts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.project}</td>
                <td>{row.status}</td>
                <td>{row.prompts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      renderGrid={(rows) => (
        <div className="showcase-action-row">
          {rows.map((row) => (
            <MetricCard
              key={row.id}
              label={row.project}
              value={String(row.prompts)}
              hint={row.status}
            />
          ))}
        </div>
      )}
      emptyMessage="No matching rows."
      emptySourceMessage="No activity loaded."
      enablePaging
      pageSize={5}
    />
  );
}

export const ANALYSIS_HELP_GROUPS: HelpGroup[] = [
  {
    id: "analysisSurfaces",
    eyebrow: "Analysis",
    title: "Metrics & loading",
    items: [
      {
        id: "loadingState",
        title: "LoadingState",
        description: "Polite loading placeholder for async panels and detail routes.",
        code: factoryCode(
          "createLoadingState",
          "LoadingState",
          `export function Example() {
  return <LoadingState label="Loading analysis…" />;
}`,
        ),
        Example: LoadingStateExample,
      },
      {
        id: "metricSurfaces",
        title: "Metric surfaces",
        description:
          "createMetricSurfaces builds MetricCard, Panel, and TablePanel on top of Card.",
        code: snippetCode(
          'import { createCard, createMetricSurfaces } from "@lunarq/frontend-shared";',
          `const Card = createCard(React);
const { MetricCard, Panel, TablePanel } = createMetricSurfaces(React, Card);`,
          `export function Example() {
  return (
    <>
      <MetricCard label="Prompts" value="1,284" hint="Last 7 days" />
      <Panel>Panel body</Panel>
      <TablePanel>
        <table>{/* rows */}</table>
      </TablePanel>
    </>
  );
}`,
        ),
        Example: MetricSurfacesExample,
      },
      {
        id: "chartCard",
        title: "ChartCard",
        description:
          "Chart frame with optional open-analysis navigation wired through onNavigate.",
        code: snippetCode(
          'import { createCard, createChartCard, DailyLineChart } from "@lunarq/frontend-shared";',
          `const Card = createCard(React);
const ChartCard = createChartCard(React, Card);`,
          `export function Example() {
  return (
    <ChartCard title="Prompts / day" to="/analysis/prompts-day" onNavigate={(to) => navigate(to)}>
      <DailyLineChart data={data} xKey="day" yKey="prompts" />
    </ChartCard>
  );
}`,
        ),
        Example: ChartCardExample,
      },
    ],
  },
  {
    id: "themeCharts",
    eyebrow: "Charts",
    title: "Theme charts",
    items: [
      {
        id: "themeCharts",
        title: "DailyLine / NamedBar / NamedPie",
        description:
          "Recharts helpers that read chart colours from theme CSS variables (--chart-1 …).",
        code: snippetCode(
          'import { DailyLineChart, NamedBarChart, NamedPieChart } from "@lunarq/frontend-shared";',
          "",
          `export function Example() {
  return (
    <>
      <div style={{ height: 160 }}>
        <DailyLineChart data={lineData} xKey="day" yKey="prompts" />
      </div>
      <div style={{ height: 160 }}>
        <NamedBarChart data={barData} valueKey="value" />
      </div>
      <div style={{ height: 180 }}>
        <NamedPieChart data={barData} valueKey="value" />
      </div>
    </>
  );
}`,
        ),
        Example: ThemeChartsExample,
      },
    ],
  },
  {
    id: "analysisBrowse",
    eyebrow: "Browse",
    title: "Analysis detail browse",
    items: [
      {
        id: "analysisDetailBrowse",
        title: "AnalysisDetailBrowse",
        description:
          "Searchable, filterable, pageable detail table/grid with Excel export for analysis pages.",
        code: snippetCode(
          'import {\n  createAnalysisDetailBrowse,\n  createBrowseListControls,\n  createBrowseScrollSentinel,\n  createCard,\n  createEmptyState,\n  createMetricSurfaces,\n  formatNumber,\n} from "@lunarq/frontend-shared";',
          `const Card = createCard(React);
const { TablePanel } = createMetricSurfaces(React, Card);
const AnalysisDetailBrowse = createAnalysisDetailBrowse({
  BrowseListControls: createBrowseListControls(React),
  BrowseScrollSentinel: createBrowseScrollSentinel(React),
  TablePanel,
  EmptyState: createEmptyState(React),
  formatNumber,
});`,
          `export function Example() {
  return (
    <AnalysisDetailBrowse
      rows={rows}
      getSearchText={(row) => row.project}
      exportFilename="activity"
      exportTitle="Activity"
      exportColumns={[{ header: "Project", key: "project" }]}
      toExportRow={(row) => ({ project: row.project })}
      renderTable={(rows) => <table>{/* … */}</table>}
      renderGrid={(rows) => <div>{/* tiles */}</div>}
    />
  );
}`,
        ),
        Example: AnalysisDetailBrowseExample,
      },
    ],
  },
];
