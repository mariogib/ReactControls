import React from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import HelpPage from "./HelpPage";
import {
  createAdminShell,
  createButton,
  createCard,
  createBrowseListControls,
  createDataTable,
  createEmptyState,
  createFormFields,
  createModalDialog,
  createPageHero,
  createPanelSection,
  createSessionInfo,
  createStatsGrid,
  createStatusBadge,
  createStatusMessage,
  createUseAdminUser,
  type AdminNavItem,
} from "@lunarq/frontend-shared";
import "@lunarq/frontend-shared/admin/index.css";
import "./showcase.css";

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
type ConfigKey =
  | "button"
  | "statusBadge"
  | "statusMessage"
  | "statsGrid"
  | "browseDefault"
  | "browseFilters"
  | "browseCalendar"
  | "textField"
  | "selectField"
  | "textAreaField"
  | "numberField"
  | "currencyField"
  | "dateField"
  | "timeField"
  | "dateTimeField"
  | "checkboxField"
  | "dataTable"
  | "emptyState"
  | "modalDialog";
type FieldVariant = "form-group" | "field";

const AdminShell = createAdminShell(React, NavLink);
const Button = createButton(React);
const Card = createCard(React);
const BrowseListControls = createBrowseListControls(React);
const DataTable = createDataTable(React);
const EmptyState = createEmptyState(React);
const ModalDialog = createModalDialog(React);
const PageHero = createPageHero(React);
const PanelSection = createPanelSection(React);
const SessionInfo = createSessionInfo(React);
const StatsGrid = createStatsGrid(React);
const StatusBadge = createStatusBadge(React);
const StatusMessage = createStatusMessage(React);
const useAdminUser = createUseAdminUser(React);
const { TextField, SelectField: ShowcaseSelectField, TextAreaField, NumberField, DateField, TimeField, DateTimeField, CurrencyField, CheckboxField } = createFormFields(React);

function FloatingPanel({
  title,
  subtitle,
  children,
  codePreview,
  footer,
  onClose,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  codePreview?: string;
  footer?: React.ReactNode;
  onClose: () => void;
}) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const [position, setPosition] = React.useState({ x: 0, y: 96 });
  const [hasPosition, setHasPosition] = React.useState(false);

  React.useEffect(() => {
    if (hasPosition || typeof window === "undefined") {
      return;
    }

    const panelWidth = 420;
    setPosition({
      x: Math.max(window.innerWidth - panelWidth - 32, 24),
      y: 96,
    });
    setHasPosition(true);
  }, [hasPosition]);

  React.useEffect(() => {
    if (!panelRef.current) {
      return;
    }

    panelRef.current.style.setProperty("--showcase-panel-left", `${position.x}px`);
    panelRef.current.style.setProperty("--showcase-panel-top", `${position.y}px`);
  }, [position]);

  React.useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      setPosition({
        x: Math.max(event.clientX - dragOffsetRef.current.x, 16),
        y: Math.max(event.clientY - dragOffsetRef.current.y, 16),
      });
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    const panelElement = panelRef.current;
    if (!panelElement) {
      return;
    }
    const panelNode = panelElement;

    function handlePointerDown(event: Event) {
      if (!(event instanceof PointerEvent)) {
        return;
      }

      const rect = panelNode.getBoundingClientRect();
      dragOffsetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    const dragHandle = panelNode.querySelector(".showcase-floating-header") as HTMLElement | null;
    dragHandle?.addEventListener("pointerdown", handlePointerDown);

    return () => {
      dragHandle?.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return (
    <div ref={panelRef} className="showcase-floating-panel">
      <div className="showcase-floating-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <button className="showcase-floating-close" onClick={onClose} type="button" aria-label="Close configurator">
          ×
        </button>
      </div>
      <div className="showcase-floating-body">{children}</div>
      {codePreview ? (
        <div className="showcase-code-card">
          <div className="showcase-code-card-header">Configured Code</div>
          <pre className="showcase-code-block"><code>{codePreview}</code></pre>
        </div>
      ) : null}
      {footer ? <div className="showcase-floating-footer">{footer}</div> : null}
    </div>
  );
}

function ConfigTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button className="showcase-config-trigger" onClick={onClick} title="Configure" type="button">
      i
    </button>
  );
}

function DemoCard({
  title,
  description,
  onConfigure,
  children,
}: {
  title: string;
  description: string;
  onConfigure: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="showcase-demo-card">
      <div className="showcase-demo-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <ConfigTrigger onClick={onConfigure} />
      </div>
      <div className="showcase-demo-preview">{children}</div>
    </Card>
  );
}

function PropertyEditor({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="showcase-property-editor">
      <div className="showcase-property-copy">
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <div className="showcase-property-control">{children}</div>
    </div>
  );
}

function parseOptions(optionsText: string) {
  return optionsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label] = line.split(":");
      return { label: (label ?? value).trim(), value: value.trim() };
    });
}

function parseTableRows(rowsText: string) {
  return rowsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((cell) => cell.trim()));
}

function quote(value: string) {
  return JSON.stringify(value);
}

function toCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(fileName: string, headers: string[], rows: string[][]) {
  const content = [
    headers.map((header) => toCsvValue(header)).join(","),
    ...rows.map((row) => row.map((cell) => toCsvValue(cell)).join(",")),
  ].join("\n");

  const csvBlob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderProp(name: string, value: string | boolean | number | undefined, kind: "string" | "boolean" | "number" = "string") {
  if (value === undefined) {
    return null;
  }

  if (kind === "boolean") {
    return `${name}={${value ? "true" : "false"}}`;
  }

  if (kind === "number") {
    return `${name}={${value}}`;
  }

  return `${name}=${quote(String(value))}`;
}

function joinProps(values: Array<string | null>) {
  return values.filter(Boolean).join("\n  ");
}

function buildFactoryExample(factoryName: string, componentName: string, body: string) {
  return [
    'import React from "react";',
    `import { ${factoryName} } from "@lunarq/frontend-shared/components";`,
    "",
    `const { ${componentName} } = ${factoryName}(React);`,
    "",
    body,
  ].join("\n");
}

function buildComponentExample(importLine: string, body: string) {
  return [
    'import React from "react";',
    importLine,
    "",
    body,
  ].join("\n");
}

function renderOptionNodes(options: ReadonlyArray<{ label: string; value: string }>) {
  return options.map((option) => React.createElement("option", {
    key: `${option.value}:${option.label}`,
    value: option.value,
  }, option.label));
}

const navItems: AdminNavItem[] = [
  { to: "/app", end: true, label: "Overview", icon: "📊" },
  {
    to: "/app/help",
    label: "Help",
    icon: "❓",
    children: [
      { to: "/app/help/components", label: "Components", icon: "🧩" },
      { to: "/app/help/hooks", label: "Hooks", icon: "🪝" },
      { to: "/app/help/theme", label: "Theme", icon: "🎨" },
      { to: "/app/help/admin", label: "Admin", icon: "🛡️" },
      { to: "/app/help/auth", label: "Auth", icon: "🔐" },
      { to: "/app/help/maintenance", label: "Maintenance", icon: "🔧" },
      { to: "/app/help/utils", label: "Utils", icon: "🧰" },
    ],
  },
  { to: "/app/reports", label: "Reports", icon: "📈" },
  { to: "/app/settings", label: "Settings", icon: "⚙️" },
];

const mockUserManager = {
  async getUser() {
    return {
      profile: {
        name: "System Administrator",
        email: "admin@lunarq.com",
        sub: "system-admin-1",
        roles: ["system administrator"],
      },
      access_token: null,
      scope: "openid profile email roles",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    };
  },
};

const statIconOptions = [
  { label: "Clipboard", value: "📋" },
  { label: "Check", value: "☑️" },
  { label: "Calendar", value: "🗓️" },
  { label: "Money", value: "💰" },
  { label: "Target", value: "🎯" },
  { label: "Trophy", value: "🏆" },
  { label: "Gift", value: "🎁" },
  { label: "Chart", value: "📈" },
  { label: "Users", value: "👥" },
  { label: "Warning", value: "⚠️" },
  { label: "Sparkles", value: "✨" },
  { label: "None", value: "" },
];

const buttonVariantOptions = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Warning", value: "warning" },
  { label: "Danger", value: "danger" },
  { label: "Outlined", value: "outlined" },
];

const buttonTypeOptions = [
  { label: "button", value: "button" },
  { label: "submit", value: "submit" },
  { label: "reset", value: "reset" },
];

const fieldVariantOptions = [
  { label: "form-group", value: "form-group" },
  { label: "field", value: "field" },
];

const emptyStateWrapperOptions = [
  { label: "div", value: "div" },
  { label: "section", value: "section" },
];

function ShowcaseContent() {
  const [activeConfig, setActiveConfig] = React.useState<ConfigKey | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [buttonConfig, setButtonConfig] = React.useState({ className: "", disabled: false, label: "Primary Action", type: "button" as const, variant: "primary" as const });
  const [statusBadgeConfig, setStatusBadgeConfig] = React.useState({ status: "active" });
  const [statusMessageConfig, setStatusMessageConfig] = React.useState({ className: "", detail: "The shared status message component is reusable across apps.", title: "Success", tone: "success" as const });
  const [statsConfig, setStatsConfig] = React.useState({
    cardOneAccent: "#60a5fa",
    cardOneIcon: "📋",
    cardOneLabel: "Total Campaigns",
    cardOneValue: "0",
    cardTwoAccent: "#a3e635",
    cardTwoIcon: "☑️",
    cardTwoLabel: "Active",
    cardTwoValue: "0",
    cardThreeAccent: "",
    cardThreeIcon: "🎯",
    cardThreeLabel: "Competitions",
    cardThreeValue: "0",
  });
  const [textFieldConfig, setTextFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-text-field", inputClassName: "", label: "Name", name: "name", placeholder: "Acme Supplier", required: false, value: "" , variant: "form-group" as FieldVariant});
  const [selectFieldConfig, setSelectFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-select-field", inputClassName: "", label: "Type", name: "type", optionsText: "cash:Cash\nvoucher:Voucher\ngift-card:Gift Card", required: false, title: "Prize type", value: "cash", variant: "form-group" as FieldVariant});
  const [textAreaFieldConfig, setTextAreaFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-textarea-field", inputClassName: "", label: "Notes", name: "notes", placeholder: "Add notes", required: false, rows: 4, value: "", variant: "form-group" as FieldVariant});
  const [numberFieldConfig, setNumberFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-number-field", inputClassName: "", label: "Quantity", max: "100", min: "0", name: "quantity", placeholder: "0", required: false, step: "1", value: "12", variant: "form-group" as FieldVariant});
  const [currencyFieldConfig, setCurrencyFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-currency-field", inputClassName: "", label: "Budget", max: "100000", min: "0", name: "budget", placeholder: "0.00", prefix: "R", required: false, step: "0.01", value: "5000", variant: "form-group" as FieldVariant});
  const [dateFieldConfig, setDateFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-date-field", inputClassName: "", label: "Date", max: "", min: "", name: "scheduledDate", required: false, value: "2026-06-09", variant: "form-group" as FieldVariant});
  const [timeFieldConfig, setTimeFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-time-field", inputClassName: "", label: "Time", max: "", min: "", name: "scheduledTime", required: false, value: "09:30", variant: "form-group" as FieldVariant});
  const [dateTimeFieldConfig, setDateTimeFieldConfig] = React.useState({ className: "", disabled: false, htmlFor: "showcase-datetime-field", inputClassName: "", label: "Date & Time", max: "", min: "", name: "scheduledAt", required: false, value: "2026-06-09T09:30", variant: "form-group" as FieldVariant});
  const [checkboxFieldConfig, setCheckboxFieldConfig] = React.useState({ checked: true, disabled: false, label: "Resource is active", name: "active" });
  const [dataTableConfig, setDataTableConfig] = React.useState({ headersText: "Name|Status|Updated", rowsText: "Prize Supplier A|Active|09 Jun 2026\nPrize Supplier B|Inactive|08 Jun 2026" });
  const [emptyStateConfig, setEmptyStateConfig] = React.useState({ as: "div" as "div" | "section", className: "", detail: "This is the shared empty-state presentation.", framed: false, title: "No records found" });
  const [modalConfig, setModalConfig] = React.useState({ body: "Future apps can consume the same modal structure and styling without redefining the layout.", footerLabel: "Close", showCloseButton: true, subtitle: "This is rendered from frontend-shared", title: "Shared Modal Example" });
  const [defaultBrowseView, setDefaultBrowseView] = React.useState<"table" | "grid" | "calendar">("grid");
  const [defaultSearchValue, setDefaultSearchValue] = React.useState("");
  const [opsBrowseView, setOpsBrowseView] = React.useState<"table" | "grid" | "calendar">("table");
  const [opsSearchValue, setOpsSearchValue] = React.useState("");
  const [opsStatusFilter, setOpsStatusFilter] = React.useState("");
  const [opsTypeFilter, setOpsTypeFilter] = React.useState("");
  const [calendarBrowseView, setCalendarBrowseView] = React.useState<"table" | "grid" | "calendar">("calendar");
  const [calendarScope, setCalendarScope] = React.useState<"day" | "month" | "year">("month");
  const [calendarSearchValue, setCalendarSearchValue] = React.useState("");
  const [calendarStatusFilter, setCalendarStatusFilter] = React.useState("");
  const [selectedCalendarDay, setSelectedCalendarDay] = React.useState<Date | null>(null);
  const [calendarCursor, setCalendarCursor] = React.useState(() => new Date(2026, 6, 1));

  const statusOptions = ["active", "inactive", "completed", "draft", "pending"];
  const toneOptions = ["info", "success", "warning", "error"] as const;

  const statsItems = [
    { accentColor: statsConfig.cardOneAccent || undefined, icon: statsConfig.cardOneIcon, label: statsConfig.cardOneLabel, value: statsConfig.cardOneValue },
    { accentColor: statsConfig.cardTwoAccent || undefined, icon: statsConfig.cardTwoIcon, label: statsConfig.cardTwoLabel, value: statsConfig.cardTwoValue },
    { accentColor: statsConfig.cardThreeAccent || undefined, icon: statsConfig.cardThreeIcon, label: statsConfig.cardThreeLabel, value: statsConfig.cardThreeValue },
  ];

  const selectOptions = parseOptions(selectFieldConfig.optionsText);
  const tableHeaders = dataTableConfig.headersText.split("|").map((header) => header.trim()).filter(Boolean);
  const tableRows = parseTableRows(dataTableConfig.rowsText);
  const [defaultBrowseRows, setDefaultBrowseRows] = React.useState([
    { name: "Summer Campaign", status: "Active", owner: "Marketing Team" },
    { name: "Weekly Redemptions", status: "Pending", owner: "Ops Team" },
    { name: "Season Finale", status: "Scheduled", owner: "Events Team" },
    { name: "Referral Burst", status: "Active", owner: "Growth Team" },
  ]);
  const [opsBrowseRows, setOpsBrowseRows] = React.useState([
    { award: "Welcome Voucher", status: "pending", type: "instant", recipient: "A. Nkosi" },
    { award: "Loyalty Bonus", status: "notified", type: "scheduled", recipient: "T. Adams" },
    { award: "July Cashback", status: "redeemed", type: "instant", recipient: "M. Daniels" },
    { award: "Weekend Draw", status: "pending", type: "scheduled", recipient: "P. Molefe" },
  ]);
  const [calendarBrowseRows, setCalendarBrowseRows] = React.useState([
    { campaign: "July Sprint Promo", status: "scheduled", startDate: "2026-07-10", endDate: "2026-07-24" },
    { campaign: "Back to School", status: "scheduled", startDate: "2026-08-01", endDate: "2026-08-31" },
    { campaign: "Spring Lucky Draw", status: "active", startDate: "2026-09-15", endDate: "2026-10-10" },
    { campaign: "Holiday Mega Prize", status: "completed", startDate: "2026-12-01", endDate: "2026-12-24" },
    { campaign: "Flash Friday", status: "active", startDate: "2026-07-18", endDate: "2026-07-20" },
  ]);

  const defaultFilteredRows = defaultBrowseRows.filter((row) => {
    const query = defaultSearchValue.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return row.name.toLowerCase().includes(query) || row.status.toLowerCase().includes(query) || row.owner.toLowerCase().includes(query);
  });

  const opsFilteredRows = opsBrowseRows.filter((row) => {
    const query = opsSearchValue.trim().toLowerCase();
    const matchesSearch = !query
      || row.award.toLowerCase().includes(query)
      || row.status.toLowerCase().includes(query)
      || row.type.toLowerCase().includes(query)
      || row.recipient.toLowerCase().includes(query);
    const matchesStatus = !opsStatusFilter || row.status === opsStatusFilter;
    const matchesType = !opsTypeFilter || row.type === opsTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const calendarFilteredRows = calendarBrowseRows.filter((row) => {
    const query = calendarSearchValue.trim().toLowerCase();
    const matchesSearch = !query
      || row.campaign.toLowerCase().includes(query)
      || row.status.toLowerCase().includes(query)
      || row.startDate.toLowerCase().includes(query)
      || row.endDate.toLowerCase().includes(query);
    const matchesStatus = !calendarStatusFilter || row.status === calendarStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const showcaseCalendarYear = calendarCursor.getFullYear();
  const showcaseCalendarMonth = calendarCursor.getMonth() + 1;
  const monthLabel = new Date(showcaseCalendarYear, showcaseCalendarMonth - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const selectedDayTitle = selectedCalendarDay?.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const firstDayIndex = new Date(showcaseCalendarYear, showcaseCalendarMonth - 1, 1).getDay();
  const daysInMonth = new Date(showcaseCalendarYear, showcaseCalendarMonth, 0).getDate();
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: firstDayIndex }, () => null),
    ...Array.from({ length: daysInMonth }, (_, dayIndex) => dayIndex + 1),
  ];
  const totalCells = Math.ceil(calendarCells.length / 7) * 7;
  const paddedCalendarCells = [
    ...calendarCells,
    ...Array.from({ length: totalCells - calendarCells.length }, () => null),
  ];
  const eventsByDay = React.useMemo(() => {
    const eventsMap: Record<number, typeof calendarFilteredRows> = {};
    for (const row of calendarFilteredRows) {
      const startDate = new Date(`${row.startDate}T00:00:00`);
      const endDate = new Date(`${row.endDate}T00:00:00`);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        continue;
      }

      const eventStart = startDate;
      const eventEnd = endDate;
      const cursor = new Date(eventStart.getTime());

      while (cursor <= eventEnd) {
        if (cursor.getFullYear() === showcaseCalendarYear && cursor.getMonth() === showcaseCalendarMonth - 1) {
          const dayOfMonth = cursor.getDate();
          const current = eventsMap[dayOfMonth] ?? [];
          eventsMap[dayOfMonth] = [...current, row];
        }

        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return eventsMap;
  }, [calendarFilteredRows, showcaseCalendarMonth, showcaseCalendarYear]);

  function closeConfigModal() {
    setActiveConfig(null);
  }

  function showPreviousCalendarMonth() {
    setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function showNextCalendarMonth() {
    setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function showCurrentCalendarMonth() {
    const now = new Date();
    setCalendarCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedCalendarDay(null);
  }

  function openCalendarDay(dayOfMonth: number) {
    setSelectedCalendarDay(new Date(showcaseCalendarYear, showcaseCalendarMonth - 1, dayOfMonth));
  }

  function closeCalendarDay() {
    setSelectedCalendarDay(null);
  }

  function exportDefaultBrowseRows() {
    downloadCsv(
      "competitions-export.csv",
      ["Name", "Status", "Owner"],
      defaultFilteredRows.map((row) => [row.name, row.status, row.owner]),
    );
  }

  function exportOpsBrowseRows() {
    downloadCsv(
      "awards-export.csv",
      ["Award", "Status", "Type", "Recipient"],
      opsFilteredRows.map((row) => [row.award, row.status, row.type, row.recipient]),
    );
  }

  function exportCalendarBrowseRows() {
    downloadCsv(
      "campaigns-export.csv",
      ["Campaign", "Status", "Start Date", "End Date"],
      calendarFilteredRows.map((row) => [row.campaign, row.status, row.startDate, row.endDate]),
    );
  }

  function renderConfigModal() {
    if (!activeConfig) {
      return null;
    }

    switch (activeConfig) {
      case "button":
        return (
          <FloatingPanel title="Configure Button" subtitle="Experiment with every visual property on the shared button." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildFactoryExample("createButton", "Button", `export function Example() {
  return (
    <Button\n+      ${joinProps([
            renderProp("variant", buttonConfig.variant),
            renderProp("type", buttonConfig.type),
            buttonConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            buttonConfig.className ? renderProp("className", buttonConfig.className) : null,
      ])}\n+    >\n+      ${buttonConfig.label}\n+    </Button>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Text rendered inside the button.">
                <TextField htmlFor="button-label" label="Label" value={buttonConfig.label} onChange={(event: InputChangeEvent) => setButtonConfig((current) => ({ ...current, label: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Variant" description="Controls the visual emphasis and color treatment.">
                <ShowcaseSelectField htmlFor="button-variant" label="Variant" title="Button variant" value={buttonConfig.variant} onChange={(event: SelectChangeEvent) => setButtonConfig((current) => ({ ...current, variant: event.target.value as typeof current.variant }))}>
                  {renderOptionNodes(buttonVariantOptions)}
                </ShowcaseSelectField>
              </PropertyEditor>
              <PropertyEditor label="Button Type" description="Select whether the button behaves like a button, submit, or reset control.">
                <ShowcaseSelectField htmlFor="button-type" label="Type" title="Button type" value={buttonConfig.type} onChange={(event: SelectChangeEvent) => setButtonConfig((current) => ({ ...current, type: event.target.value as typeof current.type }))}>
                  {renderOptionNodes(buttonTypeOptions)}
                </ShowcaseSelectField>
              </PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and switches the control into a disabled state.">
                <CheckboxField checked={buttonConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setButtonConfig((current) => ({ ...current, disabled: event.target.checked }))} />
              </PropertyEditor>
              <PropertyEditor label="Custom Class" description="Optional extra CSS class names appended to the component.">
                <TextField htmlFor="button-class-name" label="Custom Class" value={buttonConfig.className} onChange={(event: InputChangeEvent) => setButtonConfig((current) => ({ ...current, className: event.target.value }))} />
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "statusBadge":
        return (
          <FloatingPanel title="Configure StatusBadge" subtitle="Change the status string used to derive the badge styling." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildFactoryExample("createStatusBadge", "StatusBadge", `export function Example() {
  return (
    <StatusBadge\n+      ${renderProp("status", statusBadgeConfig.status)}\n+    />
  );
}`)}>
            <PropertyEditor label="Status" description="The badge text and normalized status class are both derived from this value.">
              <ShowcaseSelectField htmlFor="status-badge-status" label="Status" title="Status badge value" value={statusBadgeConfig.status} onChange={(event: SelectChangeEvent) => setStatusBadgeConfig({ status: event.target.value })}>
                {renderOptionNodes(statusOptions.map((status) => ({ label: status, value: status })))}
              </ShowcaseSelectField>
            </PropertyEditor>
          </FloatingPanel>
        );
      case "statusMessage":
        return (
          <FloatingPanel title="Configure StatusMessage" subtitle="Experiment with tone, title, detail, and extra class names." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildFactoryExample("createStatusMessage", "StatusMessage", `export function Example() {
  return (
    <StatusMessage\n+      ${joinProps([
            renderProp("title", statusMessageConfig.title),
            renderProp("detail", statusMessageConfig.detail),
            renderProp("tone", statusMessageConfig.tone),
            statusMessageConfig.className ? renderProp("className", statusMessageConfig.className) : null,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Title" description="Short summary heading shown above the detail text.">
                <TextField htmlFor="status-message-title" label="Title" value={statusMessageConfig.title} onChange={(event: InputChangeEvent) => setStatusMessageConfig((current) => ({ ...current, title: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Detail" description="Longer supporting explanation rendered under the title.">
                <TextAreaField htmlFor="status-message-detail" label="Detail" rows={4} value={statusMessageConfig.detail} onChange={(event: TextAreaChangeEvent) => setStatusMessageConfig((current) => ({ ...current, detail: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Tone" description="Chooses the semantic styling and accessibility role.">
                <ShowcaseSelectField htmlFor="status-message-tone" label="Tone" title="Status message tone" value={statusMessageConfig.tone} onChange={(event: SelectChangeEvent) => setStatusMessageConfig((current) => ({ ...current, tone: event.target.value as typeof current.tone }))}>
                  {renderOptionNodes(toneOptions.map((tone) => ({ label: tone, value: tone })))}
                </ShowcaseSelectField>
              </PropertyEditor>
              <PropertyEditor label="Custom Class" description="Optional extra CSS classes appended to the message wrapper.">
                <TextField htmlFor="status-message-class-name" label="Custom Class" value={statusMessageConfig.className} onChange={(event: InputChangeEvent) => setStatusMessageConfig((current) => ({ ...current, className: event.target.value }))} />
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "statsGrid":
        return (
          <FloatingPanel title="Configure StatsGrid" subtitle="Experiment with values, icons, labels, and optional accent colors for each stat card." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildFactoryExample("createStatsGrid", "StatsGrid", `export function Example() {
  return (
    <StatsGrid
      items={[
${statsItems.map((item) => `        { label: ${quote(String(item.label))}, value: ${quote(String(item.value))}, icon: ${quote(String(item.icon ?? ""))}${item.accentColor ? `, accentColor: ${quote(item.accentColor)}` : ""} }`).join(",\n")}
      ]}
    />
  );
}`)}>
            <div className="showcase-property-grid">
              {[
                ["cardOne", "First stat card"],
                ["cardTwo", "Second stat card"],
                ["cardThree", "Third stat card"],
              ].map(([prefix, label]) => (
                <div key={prefix} className="showcase-property-cluster">
                  <h4>{label}</h4>
                  <PropertyEditor label="Label" description="Short uppercase descriptor for the stat.">
                    <TextField htmlFor={`${prefix}-label`} label="Label" value={statsConfig[`${prefix}Label` as keyof typeof statsConfig] as string} onChange={(event: InputChangeEvent) => setStatsConfig((current) => ({ ...current, [`${prefix}Label`]: event.target.value }))} />
                  </PropertyEditor>
                  <PropertyEditor label="Value" description="Main numeric or textual metric value.">
                    <TextField htmlFor={`${prefix}-value`} label="Value" value={statsConfig[`${prefix}Value` as keyof typeof statsConfig] as string} onChange={(event: InputChangeEvent) => setStatsConfig((current) => ({ ...current, [`${prefix}Value`]: event.target.value }))} />
                  </PropertyEditor>
                  <PropertyEditor label="Icon" description="Emoji or short text icon rendered on the left side of the card.">
                    <ShowcaseSelectField htmlFor={`${prefix}-icon`} label="Icon" title={`Icon for ${label}`} value={statsConfig[`${prefix}Icon` as keyof typeof statsConfig] as string} onChange={(event: SelectChangeEvent) => setStatsConfig((current) => ({ ...current, [`${prefix}Icon`]: event.target.value }))}>
                      {renderOptionNodes(statIconOptions)}
                    </ShowcaseSelectField>
                  </PropertyEditor>
                  <PropertyEditor label="Accent Color" description="Optional left edge accent color. Leave empty to remove the accent.">
                    <TextField htmlFor={`${prefix}-accent`} label="Accent Color" placeholder="#60a5fa" value={statsConfig[`${prefix}Accent` as keyof typeof statsConfig] as string} onChange={(event: InputChangeEvent) => setStatsConfig((current) => ({ ...current, [`${prefix}Accent`]: event.target.value }))} />
                  </PropertyEditor>
                </div>
              ))}
            </div>
          </FloatingPanel>
        );
      case "browseDefault":
        return (
          <FloatingPanel title="Configure BrowseListControls (Default)" subtitle="Own the list in page state, then wire an Add action through customControls." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { createBrowseListControls, createButton } from "@lunarq/frontend-shared";', `const BrowseListControls = createBrowseListControls(React);
const Button = createButton(React);

export function Example() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("grid");
  const [searchValue, setSearchValue] = React.useState("");
  const [items, setItems] = React.useState([
    { name: "Summer Campaign", status: "Active", owner: "Marketing Team" },
  ]);

  return (
    <>
      <BrowseListControls
        heading="Competitions"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        searchPlaceholder="Search competitions..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => {}}
        exportLabel="Export to Excel"
        customControls={[
          <Button
            key="add"
            onClick={() =>
              setItems((current) => [
                ...current,
                { name: \`New Competition \${current.length + 1}\`, status: "Draft", owner: "You" },
              ])
            }
          >
            Add Competition
          </Button>,
        ]}
      />
      {/* Render items below — BrowseListControls does not own the list */}
      <ul>
        {items.map((item) => (
          <li key={item.name}>{item.name}</li>
        ))}
      </ul>
    </>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Intent" description="Baseline toolbar plus the Add pattern via customControls.">
                <p className="showcase-copy">Keep list items in page state. Pass an Add button through customControls and append to that state when clicked.</p>
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "browseFilters":
        return (
          <FloatingPanel title="Configure BrowseListControls (Filters)" subtitle="Filters and Add both sit beside search; list ownership stays in the page." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { createBrowseListControls, createButton } from "@lunarq/frontend-shared";', `const BrowseListControls = createBrowseListControls(React);
const Button = createButton(React);

export function Example() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [type, setType] = React.useState("");
  const [items, setItems] = React.useState([
    { award: "Welcome Voucher", status: "pending", type: "instant" },
  ]);

  return (
    <>
      <BrowseListControls
        heading="Awards"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        searchPlaceholder="Search awards..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => {}}
        exportLabel="Export Awards"
        filters={[
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [{ value: "", label: "All Statuses" }, { value: "pending", label: "Pending" }],
          },
          {
            id: "type",
            label: "Type",
            value: type,
            onChange: setType,
            options: [{ value: "", label: "All Types" }, { value: "instant", label: "Instant" }],
          },
        ]}
        customControls={[
          <Button
            key="add"
            onClick={() =>
              setItems((current) => [
                ...current,
                { award: \`New Award \${current.length + 1}\`, status: "pending", type: "instant" },
              ])
            }
          >
            Add Award
          </Button>,
        ]}
      />
      <ul>
        {items.map((item) => (
          <li key={item.award}>{item.award}</li>
        ))}
      </ul>
    </>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Intent" description="Adds page-level filtering and an Add action with reusable filter config objects.">
                <p className="showcase-copy">Useful when list pages need custom filtering dimensions like status, type, ownership, or region — plus a create action in customControls.</p>
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "browseCalendar":
        return (
          <FloatingPanel title="Configure BrowseListControls (Calendar)" subtitle="Optional calendar mode with the same customControls Add pattern." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { createBrowseListControls, createButton } from "@lunarq/frontend-shared";', `const BrowseListControls = createBrowseListControls(React);
const Button = createButton(React);

export function Example() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("calendar");
  const [searchValue, setSearchValue] = React.useState("");
  const [items, setItems] = React.useState([
    { campaign: "July Sprint Promo", status: "scheduled", startDate: "2026-07-10" },
  ]);

  return (
    <>
      <BrowseListControls
        heading="Campaigns"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        allowCalendarView
        searchValue={searchValue}
        searchPlaceholder="Search campaigns..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => {}}
        customControls={[
          <Button
            key="add"
            onClick={() =>
              setItems((current) => [
                ...current,
                { campaign: \`New Campaign \${current.length + 1}\`, status: "draft", startDate: "2026-07-20" },
              ])
            }
          >
            Add Campaign
          </Button>,
        ]}
      />
      <ul>
        {items.map((item) => (
          <li key={item.campaign}>{item.campaign}</li>
        ))}
      </ul>
    </>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Intent" description="Calendar toggle is optional; Add still goes through customControls and page-owned list state.">
                <p className="showcase-copy">Campaign and competition pages can enable calendar; other pages can stay table/grid only.</p>
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "textField":
        return (
          <FloatingPanel title="Configure TextField" subtitle="Change label, name, value, placeholder, and layout properties." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { TextField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(textFieldConfig.value)});

  return (
    <TextField\n+      ${joinProps([
            renderProp("htmlFor", textFieldConfig.htmlFor),
            renderProp("label", textFieldConfig.label),
            renderProp("name", textFieldConfig.name),
            "value={value}",
            renderProp("placeholder", textFieldConfig.placeholder),
            renderProp("variant", textFieldConfig.variant),
            textFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            textFieldConfig.required ? renderProp("required", true, "boolean") : null,
            textFieldConfig.className ? renderProp("className", textFieldConfig.className) : null,
            textFieldConfig.inputClassName ? renderProp("inputClassName", textFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="text-label" label="Label" value={textFieldConfig.label} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the input element."><TextField htmlFor="text-name" label="Name" value={textFieldConfig.name} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current control value used by the preview."><TextField htmlFor="text-value" label="Value" value={textFieldConfig.value} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Placeholder" description="Hint text displayed when the control has no value."><TextField htmlFor="text-placeholder" label="Placeholder" value={textFieldConfig.placeholder} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, placeholder: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="text-variant" label="Variant" title="Text field variant" value={textFieldConfig.variant} onChange={(event: SelectChangeEvent) => setTextFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={textFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={textFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="text-class-name" label="Wrapper Class" value={textFieldConfig.className} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the input element."><TextField htmlFor="text-input-class-name" label="Input Class" value={textFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "selectField":
        return (
          <FloatingPanel title="Configure SelectField" subtitle="Experiment with label, options, selected value, and layout properties." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { SelectField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(selectFieldConfig.value)});

  return (
    ${"<"}SelectField\n      ${joinProps([
            renderProp("htmlFor", selectFieldConfig.htmlFor),
            renderProp("label", selectFieldConfig.label),
            renderProp("name", selectFieldConfig.name),
            renderProp("title", selectFieldConfig.title),
            "value={value}",
            renderProp("variant", selectFieldConfig.variant),
            selectFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            selectFieldConfig.required ? renderProp("required", true, "boolean") : null,
            selectFieldConfig.className ? renderProp("className", selectFieldConfig.className) : null,
            selectFieldConfig.inputClassName ? renderProp("inputClassName", selectFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n    >\n${parseOptions(selectFieldConfig.optionsText).map((option) => `      <option value=${quote(option.value)}>${option.label}</option>`).join("\n")}\n    ${"</"}SelectField>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="select-label" label="Label" value={selectFieldConfig.label} onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the select element."><TextField htmlFor="select-name" label="Name" value={selectFieldConfig.name} onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Selected Value" description="Currently selected option value."><TextField htmlFor="select-value" label="Selected Value" value={selectFieldConfig.value} onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Options" description="One option per line. Use `value:Label` if you want different stored and visible values."><TextAreaField htmlFor="select-options" label="Options" rows={5} value={selectFieldConfig.optionsText} onChange={(event: TextAreaChangeEvent) => setSelectFieldConfig((current) => ({ ...current, optionsText: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="select-variant" label="Variant" title="Select field variant" value={selectFieldConfig.variant} onChange={(event: SelectChangeEvent) => setSelectFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={selectFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={selectFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="select-class-name" label="Wrapper Class" value={selectFieldConfig.className} onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the select element."><TextField htmlFor="select-input-class-name" label="Input Class" value={selectFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setSelectFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "textAreaField":
        return (
          <FloatingPanel title="Configure TextAreaField" subtitle="Adjust multi-line text entry settings and wrapper styling." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { TextAreaField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(textAreaFieldConfig.value)});

  return (
    <TextAreaField\n+      ${joinProps([
            renderProp("htmlFor", textAreaFieldConfig.htmlFor),
            renderProp("label", textAreaFieldConfig.label),
            renderProp("name", textAreaFieldConfig.name),
            "value={value}",
            renderProp("placeholder", textAreaFieldConfig.placeholder),
            renderProp("rows", textAreaFieldConfig.rows, "number"),
            renderProp("variant", textAreaFieldConfig.variant),
            textAreaFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            textAreaFieldConfig.required ? renderProp("required", true, "boolean") : null,
            textAreaFieldConfig.className ? renderProp("className", textAreaFieldConfig.className) : null,
            textAreaFieldConfig.inputClassName ? renderProp("inputClassName", textAreaFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="textarea-label" label="Label" value={textAreaFieldConfig.label} onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the textarea."><TextField htmlFor="textarea-name" label="Name" value={textAreaFieldConfig.name} onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current textarea content."><TextAreaField htmlFor="textarea-value" label="Value" rows={4} value={textAreaFieldConfig.value} onChange={(event: TextAreaChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Placeholder" description="Hint text displayed when the textarea has no value."><TextField htmlFor="textarea-placeholder" label="Placeholder" value={textAreaFieldConfig.placeholder} onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, placeholder: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Rows" description="Sets the starting visible height of the textarea."><NumberField htmlFor="textarea-rows" label="Rows" min={1} value={textAreaFieldConfig.rows} onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, rows: Number(event.target.value) || 1 }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="textarea-variant" label="Variant" title="Textarea variant" value={textAreaFieldConfig.variant} onChange={(event: SelectChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={textAreaFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={textAreaFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="textarea-class-name" label="Wrapper Class" value={textAreaFieldConfig.className} onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the textarea."><TextField htmlFor="textarea-input-class-name" label="Input Class" value={textAreaFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "numberField":
        return (
          <FloatingPanel title="Configure NumberField" subtitle="Adjust numeric bounds, increments, and layout properties." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { NumberField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(numberFieldConfig.value)});

  return (
    <NumberField\n+      ${joinProps([
            renderProp("htmlFor", numberFieldConfig.htmlFor),
            renderProp("label", numberFieldConfig.label),
            renderProp("name", numberFieldConfig.name),
            "value={value}",
            renderProp("placeholder", numberFieldConfig.placeholder),
            renderProp("min", numberFieldConfig.min),
            renderProp("max", numberFieldConfig.max),
            renderProp("step", numberFieldConfig.step),
            renderProp("variant", numberFieldConfig.variant),
            numberFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            numberFieldConfig.required ? renderProp("required", true, "boolean") : null,
            numberFieldConfig.className ? renderProp("className", numberFieldConfig.className) : null,
            numberFieldConfig.inputClassName ? renderProp("inputClassName", numberFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="number-label" label="Label" value={numberFieldConfig.label} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the input element."><TextField htmlFor="number-name" label="Name" value={numberFieldConfig.name} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current numeric string used in the preview."><TextField htmlFor="number-value" label="Value" value={numberFieldConfig.value} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Placeholder" description="Hint text displayed when the control has no value."><TextField htmlFor="number-placeholder" label="Placeholder" value={numberFieldConfig.placeholder} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, placeholder: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Min" description="Optional minimum allowed value."><TextField htmlFor="number-min" label="Min" value={numberFieldConfig.min} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, min: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Max" description="Optional maximum allowed value."><TextField htmlFor="number-max" label="Max" value={numberFieldConfig.max} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, max: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Step" description="How much the value changes with each input increment."><TextField htmlFor="number-step" label="Step" value={numberFieldConfig.step} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, step: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="number-variant" label="Variant" title="Number field variant" value={numberFieldConfig.variant} onChange={(event: SelectChangeEvent) => setNumberFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={numberFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={numberFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="number-class-name" label="Wrapper Class" value={numberFieldConfig.className} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the input element."><TextField htmlFor="number-input-class-name" label="Input Class" value={numberFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "currencyField":
        return (
          <FloatingPanel title="Configure CurrencyField" subtitle="Experiment with numeric bounds plus the visible prefix wrapper." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { CurrencyField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(currencyFieldConfig.value)});

  return (
    <CurrencyField\n+      ${joinProps([
            renderProp("htmlFor", currencyFieldConfig.htmlFor),
            renderProp("label", currencyFieldConfig.label),
            renderProp("name", currencyFieldConfig.name),
            "value={value}",
            renderProp("placeholder", currencyFieldConfig.placeholder),
            renderProp("prefix", currencyFieldConfig.prefix),
            renderProp("min", currencyFieldConfig.min),
            renderProp("max", currencyFieldConfig.max),
            renderProp("step", currencyFieldConfig.step),
            renderProp("variant", currencyFieldConfig.variant),
            currencyFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            currencyFieldConfig.required ? renderProp("required", true, "boolean") : null,
            currencyFieldConfig.className ? renderProp("className", currencyFieldConfig.className) : null,
            currencyFieldConfig.inputClassName ? renderProp("inputClassName", currencyFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="currency-label" label="Label" value={currencyFieldConfig.label} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the input element."><TextField htmlFor="currency-name" label="Name" value={currencyFieldConfig.name} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current numeric string used in the preview."><TextField htmlFor="currency-value" label="Value" value={currencyFieldConfig.value} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Placeholder" description="Hint text displayed when the control has no value."><TextField htmlFor="currency-placeholder" label="Placeholder" value={currencyFieldConfig.placeholder} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, placeholder: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Prefix" description="Text shown before the numeric input, such as a currency symbol."><TextField htmlFor="currency-prefix" label="Prefix" value={currencyFieldConfig.prefix} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, prefix: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Min" description="Optional minimum allowed value."><TextField htmlFor="currency-min" label="Min" value={currencyFieldConfig.min} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, min: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Max" description="Optional maximum allowed value."><TextField htmlFor="currency-max" label="Max" value={currencyFieldConfig.max} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, max: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Step" description="How much the value changes with each input increment."><TextField htmlFor="currency-step" label="Step" value={currencyFieldConfig.step} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, step: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="currency-variant" label="Variant" title="Currency field variant" value={currencyFieldConfig.variant} onChange={(event: SelectChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={currencyFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={currencyFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="currency-class-name" label="Wrapper Class" value={currencyFieldConfig.className} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the input element."><TextField htmlFor="currency-input-class-name" label="Input Class" value={currencyFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "dateField":
        return (
          <FloatingPanel title="Configure DateField" subtitle="Experiment with date bounds and shared field layout options." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { DateField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(dateFieldConfig.value)});

  return (
    <DateField\n+      ${joinProps([
            renderProp("htmlFor", dateFieldConfig.htmlFor),
            renderProp("label", dateFieldConfig.label),
            renderProp("name", dateFieldConfig.name),
            "value={value}",
            renderProp("min", dateFieldConfig.min),
            renderProp("max", dateFieldConfig.max),
            renderProp("variant", dateFieldConfig.variant),
            dateFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            dateFieldConfig.required ? renderProp("required", true, "boolean") : null,
            dateFieldConfig.className ? renderProp("className", dateFieldConfig.className) : null,
            dateFieldConfig.inputClassName ? renderProp("inputClassName", dateFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="date-label" label="Label" value={dateFieldConfig.label} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the input element."><TextField htmlFor="date-name" label="Name" value={dateFieldConfig.name} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current date string used in the preview."><TextField htmlFor="date-value" label="Value" value={dateFieldConfig.value} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Min" description="Optional minimum allowed value."><TextField htmlFor="date-min" label="Min" value={dateFieldConfig.min} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, min: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Max" description="Optional maximum allowed value."><TextField htmlFor="date-max" label="Max" value={dateFieldConfig.max} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, max: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="date-variant" label="Variant" title="Date field variant" value={dateFieldConfig.variant} onChange={(event: SelectChangeEvent) => setDateFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={dateFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={dateFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="date-class-name" label="Wrapper Class" value={dateFieldConfig.className} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the input element."><TextField htmlFor="date-input-class-name" label="Input Class" value={dateFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "timeField":
        return (
          <FloatingPanel title="Configure TimeField" subtitle="Experiment with time bounds and shared field layout options." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { TimeField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(timeFieldConfig.value)});

  return (
    <TimeField\n+      ${joinProps([
            renderProp("htmlFor", timeFieldConfig.htmlFor),
            renderProp("label", timeFieldConfig.label),
            renderProp("name", timeFieldConfig.name),
            "value={value}",
            renderProp("min", timeFieldConfig.min),
            renderProp("max", timeFieldConfig.max),
            renderProp("variant", timeFieldConfig.variant),
            timeFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            timeFieldConfig.required ? renderProp("required", true, "boolean") : null,
            timeFieldConfig.className ? renderProp("className", timeFieldConfig.className) : null,
            timeFieldConfig.inputClassName ? renderProp("inputClassName", timeFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="time-label" label="Label" value={timeFieldConfig.label} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the input element."><TextField htmlFor="time-name" label="Name" value={timeFieldConfig.name} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current time string used in the preview."><TextField htmlFor="time-value" label="Value" value={timeFieldConfig.value} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Min" description="Optional minimum allowed value."><TextField htmlFor="time-min" label="Min" value={timeFieldConfig.min} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, min: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Max" description="Optional maximum allowed value."><TextField htmlFor="time-max" label="Max" value={timeFieldConfig.max} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, max: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="time-variant" label="Variant" title="Time field variant" value={timeFieldConfig.variant} onChange={(event: SelectChangeEvent) => setTimeFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={timeFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={timeFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="time-class-name" label="Wrapper Class" value={timeFieldConfig.className} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the input element."><TextField htmlFor="time-input-class-name" label="Input Class" value={timeFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "dateTimeField":
        return (
          <FloatingPanel title="Configure DateTimeField" subtitle="Experiment with date/time bounds and shared field layout options." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { DateTimeField } from "../components";', `export function Example() {
  const [value, setValue] = React.useState(${quote(dateTimeFieldConfig.value)});

  return (
    <DateTimeField\n+      ${joinProps([
            renderProp("htmlFor", dateTimeFieldConfig.htmlFor),
            renderProp("label", dateTimeFieldConfig.label),
            renderProp("name", dateTimeFieldConfig.name),
            "value={value}",
            renderProp("min", dateTimeFieldConfig.min),
            renderProp("max", dateTimeFieldConfig.max),
            renderProp("variant", dateTimeFieldConfig.variant),
            dateTimeFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            dateTimeFieldConfig.required ? renderProp("required", true, "boolean") : null,
            dateTimeFieldConfig.className ? renderProp("className", dateTimeFieldConfig.className) : null,
            dateTimeFieldConfig.inputClassName ? renderProp("inputClassName", dateTimeFieldConfig.inputClassName) : null,
            `onChange={(event) => setValue(event.target.value)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Field label rendered above or beside the control."><TextField htmlFor="datetime-label" label="Label" value={dateTimeFieldConfig.label} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the input element."><TextField htmlFor="datetime-name" label="Name" value={dateTimeFieldConfig.name} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Value" description="Current date/time string used in the preview."><TextField htmlFor="datetime-value" label="Value" value={dateTimeFieldConfig.value} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, value: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Min" description="Optional minimum allowed value."><TextField htmlFor="datetime-min" label="Min" value={dateTimeFieldConfig.min} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, min: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Max" description="Optional maximum allowed value."><TextField htmlFor="datetime-max" label="Max" value={dateTimeFieldConfig.max} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, max: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Variant" description="Changes between stacked form-group layout and compact field layout."><ShowcaseSelectField htmlFor="datetime-variant" label="Variant" title="Date time field variant" value={dateTimeFieldConfig.variant} onChange={(event: SelectChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, variant: event.target.value as FieldVariant }))}>{renderOptionNodes(fieldVariantOptions)}</ShowcaseSelectField></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents interaction and displays a disabled preview."><CheckboxField checked={dateTimeFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Required" description="Marks the field as required in the rendered control."><CheckboxField checked={dateTimeFieldConfig.required} label="Required" onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, required: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Wrapper Class" description="Optional extra class names for the field wrapper."><TextField htmlFor="datetime-class-name" label="Wrapper Class" value={dateTimeFieldConfig.className} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, className: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Input Class" description="Optional extra class names applied directly to the input element."><TextField htmlFor="datetime-input-class-name" label="Input Class" value={dateTimeFieldConfig.inputClassName} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, inputClassName: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "checkboxField":
        return (
          <FloatingPanel title="Configure CheckboxField" subtitle="Adjust the label, checked state, and disabled behavior." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { CheckboxField } from "../components";', `export function Example() {
  const [checked, setChecked] = React.useState(${checkboxFieldConfig.checked ? "true" : "false"});

  return (
    <CheckboxField\n+      ${joinProps([
            renderProp("label", checkboxFieldConfig.label),
            renderProp("name", checkboxFieldConfig.name),
            "checked={checked}",
            checkboxFieldConfig.disabled ? renderProp("disabled", true, "boolean") : null,
            `onChange={(event) => setChecked(event.target.checked)}`,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Label" description="Describes what the checkbox enables or disables."><TextField htmlFor="checkbox-label" label="Label" value={checkboxFieldConfig.label} onChange={(event: InputChangeEvent) => setCheckboxFieldConfig((current) => ({ ...current, label: event.target.value }))} /></PropertyEditor>
              <PropertyEditor label="Checked" description="Toggles the checked state in the preview."><CheckboxField checked={checkboxFieldConfig.checked} label="Checked" onChange={(event: InputChangeEvent) => setCheckboxFieldConfig((current) => ({ ...current, checked: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Disabled" description="Prevents user interaction with the checkbox."><CheckboxField checked={checkboxFieldConfig.disabled} label="Disabled" onChange={(event: InputChangeEvent) => setCheckboxFieldConfig((current) => ({ ...current, disabled: event.target.checked }))} /></PropertyEditor>
              <PropertyEditor label="Name" description="HTML form name passed through to the checkbox input."><TextField htmlFor="checkbox-name" label="Name" value={checkboxFieldConfig.name} onChange={(event: InputChangeEvent) => setCheckboxFieldConfig((current) => ({ ...current, name: event.target.value }))} /></PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "dataTable":
        return (
          <FloatingPanel title="Configure DataTable" subtitle="Adjust headers and table rows to experiment with the table shell." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { DataTable } from "../components";', `export function Example() {
  return (
    <DataTable headers={[${tableHeaders.map((header) => quote(header)).join(", ")}]}>\n${tableRows.map((row) => `      <tr>\n${row.map((cell) => `        <td>${cell}</td>`).join("\n")}\n      </tr>`).join("\n")}
    </DataTable>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Headers" description="Separate headers using the `|` character.">
                <TextField htmlFor="table-headers" label="Headers" value={dataTableConfig.headersText} onChange={(event: InputChangeEvent) => setDataTableConfig((current) => ({ ...current, headersText: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Rows" description="One row per line. Separate cells using the `|` character.">
                <TextAreaField htmlFor="table-rows" label="Rows" rows={6} value={dataTableConfig.rowsText} onChange={(event: TextAreaChangeEvent) => setDataTableConfig((current) => ({ ...current, rowsText: event.target.value }))} />
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "emptyState":
        return (
          <FloatingPanel title="Configure EmptyState" subtitle="Change wrapper type, framing, copy, and extra classes." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { EmptyState } from "../components";', `export function Example() {
  return (
    <EmptyState\n+      ${joinProps([
            renderProp("title", emptyStateConfig.title),
            renderProp("detail", emptyStateConfig.detail),
            renderProp("as", emptyStateConfig.as),
            renderProp("framed", emptyStateConfig.framed, "boolean"),
            emptyStateConfig.className ? renderProp("className", emptyStateConfig.className) : null,
      ])}\n+    />
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Title" description="Primary message shown at the top of the empty state.">
                <TextField htmlFor="empty-title" label="Title" value={emptyStateConfig.title} onChange={(event: InputChangeEvent) => setEmptyStateConfig((current) => ({ ...current, title: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Detail" description="Supporting explanation under the title.">
                <TextAreaField htmlFor="empty-detail" label="Detail" rows={4} value={emptyStateConfig.detail} onChange={(event: TextAreaChangeEvent) => setEmptyStateConfig((current) => ({ ...current, detail: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Wrapper" description="Choose whether the empty state renders as a div or section.">
                <ShowcaseSelectField htmlFor="empty-as" label="Wrapper" title="Empty state wrapper element" value={emptyStateConfig.as} onChange={(event: SelectChangeEvent) => setEmptyStateConfig((current) => ({ ...current, as: event.target.value as typeof current.as }))}>
                  {renderOptionNodes(emptyStateWrapperOptions)}
                </ShowcaseSelectField>
              </PropertyEditor>
              <PropertyEditor label="Framed" description="Adds the panel framing and border treatment when enabled.">
                <CheckboxField checked={emptyStateConfig.framed} label="Framed" onChange={(event: InputChangeEvent) => setEmptyStateConfig((current) => ({ ...current, framed: event.target.checked }))} />
              </PropertyEditor>
              <PropertyEditor label="Custom Class" description="Optional extra CSS classes appended to the empty-state wrapper.">
                <TextField htmlFor="empty-class-name" label="Custom Class" value={emptyStateConfig.className} onChange={(event: InputChangeEvent) => setEmptyStateConfig((current) => ({ ...current, className: event.target.value }))} />
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      case "modalDialog":
        return (
          <FloatingPanel title="Configure ModalDialog" subtitle="Adjust the modal copy and close-button behavior for the preview modal." onClose={closeConfigModal} footer={<Button onClick={closeConfigModal}>Done</Button>} codePreview={buildComponentExample('import { ModalDialog, Button } from "../components";', `export function Example() {
  return (
    <ModalDialog\n+      ${joinProps([
            renderProp("title", modalConfig.title),
            renderProp("subtitle", modalConfig.subtitle),
            renderProp("showCloseButton", modalConfig.showCloseButton, "boolean"),
            `onClose={() => setIsOpen(false)}`,
            `footer={<Button>${modalConfig.footerLabel}</Button>}`,
      ])}\n+    >\n+      <p>${modalConfig.body}</p>\n+    </ModalDialog>
  );
}`)}>
            <div className="showcase-property-grid">
              <PropertyEditor label="Title" description="Heading shown at the top of the modal.">
                <TextField htmlFor="modal-title" label="Title" value={modalConfig.title} onChange={(event: InputChangeEvent) => setModalConfig((current) => ({ ...current, title: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Subtitle" description="Optional supporting text shown in the modal header.">
                <TextField htmlFor="modal-subtitle" label="Subtitle" value={modalConfig.subtitle} onChange={(event: InputChangeEvent) => setModalConfig((current) => ({ ...current, subtitle: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Body" description="Main body copy rendered inside the modal.">
                <TextAreaField htmlFor="modal-body" label="Body" rows={5} value={modalConfig.body} onChange={(event: TextAreaChangeEvent) => setModalConfig((current) => ({ ...current, body: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Footer Button Label" description="Text used by the preview modal’s footer action.">
                <TextField htmlFor="modal-footer-label" label="Footer Button Label" value={modalConfig.footerLabel} onChange={(event: InputChangeEvent) => setModalConfig((current) => ({ ...current, footerLabel: event.target.value }))} />
              </PropertyEditor>
              <PropertyEditor label="Show Close Button" description="Toggle the × button in the top right of the preview modal.">
                <CheckboxField checked={modalConfig.showCloseButton} label="Show Close Button" onChange={(event: InputChangeEvent) => setModalConfig((current) => ({ ...current, showCloseButton: event.target.checked }))} />
              </PropertyEditor>
            </div>
          </FloatingPanel>
        );
      default:
        return null;
    }
  }

  return (
    <div className="showcase-page">
      <PageHero
        eyebrow="Frontend Shared"
        title="Shared UI Showcase"
        description="A visual reference for the shared shell, session dropdown, primitives, forms, and admin-friendly layout patterns."
        actions={
          <div className="showcase-action-row">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
          </div>
        }
      />

      <div className="showcase-grid">
        <DemoCard title="Button" description="Reusable action trigger with variants, disabled state, and type selection." onConfigure={() => setActiveConfig("button")}>
          <div className="showcase-action-row">
            <Button className={buttonConfig.className} disabled={buttonConfig.disabled} type={buttonConfig.type} variant={buttonConfig.variant}>
              {buttonConfig.label}
            </Button>
          </div>
        </DemoCard>

        <DemoCard title="StatusBadge" description="Compact semantic label that derives styling from the supplied status." onConfigure={() => setActiveConfig("statusBadge")}>
          <StatusBadge status={statusBadgeConfig.status} />
        </DemoCard>

        <DemoCard title="StatusMessage" description="Prominent feedback banner for success, warning, info, or error states." onConfigure={() => setActiveConfig("statusMessage")}>
          <StatusMessage className={statusMessageConfig.className} title={statusMessageConfig.title} detail={statusMessageConfig.detail} tone={statusMessageConfig.tone} />
        </DemoCard>
      </div>

      <PanelSection eyebrow="Metrics" title="Stats Grid" meta="Shared pattern" compact actions={<ConfigTrigger onClick={() => setActiveConfig("statsGrid")} />}>
        <StatsGrid items={statsItems} />
      </PanelSection>

      <PanelSection eyebrow="Forms" title="Field Primitives" meta="Shared field system" compact>
        <div className="showcase-control-grid">
          <DemoCard title="TextField" description="Single-line textual input with optional placeholder and variants." onConfigure={() => setActiveConfig("textField")}>
            <TextField {...textFieldConfig} onChange={(event: InputChangeEvent) => setTextFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="SelectField" description="Single or multi-option select input with shared label treatment." onConfigure={() => setActiveConfig("selectField")}>
            <ShowcaseSelectField {...selectFieldConfig} onChange={(event: SelectChangeEvent) => setSelectFieldConfig((current) => ({ ...current, value: event.target.value }))}>
              {renderOptionNodes(selectOptions)}
            </ShowcaseSelectField>
          </DemoCard>
          <DemoCard title="TextAreaField" description="Multi-line text entry control with configurable rows and placeholder." onConfigure={() => setActiveConfig("textAreaField")}>
            <TextAreaField {...textAreaFieldConfig} onChange={(event: TextAreaChangeEvent) => setTextAreaFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="NumberField" description="Numeric input for counts and other quantity-like values." onConfigure={() => setActiveConfig("numberField")}>
            <NumberField {...numberFieldConfig} onChange={(event: InputChangeEvent) => setNumberFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="CurrencyField" description="Numeric input with a configurable leading prefix for monetary values." onConfigure={() => setActiveConfig("currencyField")}>
            <CurrencyField {...currencyFieldConfig} onChange={(event: InputChangeEvent) => setCurrencyFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="DateField" description="Date picker that uses the shared field styling contract." onConfigure={() => setActiveConfig("dateField")}>
            <DateField {...dateFieldConfig} onChange={(event: InputChangeEvent) => setDateFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="TimeField" description="Time-only input with the same shared field wrapper and focus behavior." onConfigure={() => setActiveConfig("timeField")}>
            <TimeField {...timeFieldConfig} onChange={(event: InputChangeEvent) => setTimeFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="DateTimeField" description="Combined date and time picker for timestamp-style forms." onConfigure={() => setActiveConfig("dateTimeField")}>
            <DateTimeField {...dateTimeFieldConfig} onChange={(event: InputChangeEvent) => setDateTimeFieldConfig((current) => ({ ...current, value: event.target.value }))} />
          </DemoCard>
          <DemoCard title="CheckboxField" description="Checkbox row with shared spacing and label alignment." onConfigure={() => setActiveConfig("checkboxField")}>
            <CheckboxField {...checkboxFieldConfig} onChange={(event: InputChangeEvent) => setCheckboxFieldConfig((current) => ({ ...current, checked: event.target.checked }))} />
          </DemoCard>
        </div>
      </PanelSection>

      <PanelSection eyebrow="Browse" title="BrowseListControls Variations" meta="Table + Grid always available" compact>
        <div className="showcase-browse-variants">
          <Card className="showcase-demo-card showcase-browse-card">
            <div className="showcase-demo-header">
              <div>
                <h3>Default (Table + Grid)</h3>
                <p>Difference: minimal setup using search + export, plus an Add action via customControls that appends to page-owned list state.</p>
              </div>
              <ConfigTrigger onClick={() => setActiveConfig("browseDefault")} />
            </div>
            <div className="showcase-demo-preview showcase-browse-surface">
              <BrowseListControls
                heading="Competitions"
                viewMode={defaultBrowseView}
                onViewModeChange={setDefaultBrowseView}
                searchValue={defaultSearchValue}
                searchPlaceholder="Search competitions..."
                onSearchChange={setDefaultSearchValue}
                onExportToExcel={exportDefaultBrowseRows}
                exportLabel="Export to Excel"
                customControls={[
                  <Button
                    key="add-competition"
                    onClick={() =>
                      setDefaultBrowseRows((current) => [
                        ...current,
                        {
                          name: `New Competition ${current.length + 1}`,
                          status: "Draft",
                          owner: "You",
                        },
                      ])
                    }
                  >
                    Add Competition
                  </Button>,
                ]}
              />
              <div className="showcase-browse-meta">Sample data: {defaultFilteredRows.length} of {defaultBrowseRows.length} competitions shown</div>
              {defaultBrowseView === "table" ? (
                <div className="browse-table-wrap">
                  <table className="browse-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaultFilteredRows.map((row) => (
                        <tr key={row.name}>
                          <td>
                            <div className="browse-table-primary">{row.name}</div>
                          </td>
                          <td>{row.status}</td>
                          <td>{row.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="showcase-browse-grid-preview">
                  {defaultFilteredRows.map((row) => (
                    <div key={`${row.name}-grid`} className="showcase-browse-tile">
                      <strong>{row.name}</strong>
                      <span>{row.status}</span>
                      <span>{row.owner}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="showcase-demo-card showcase-browse-card">
            <div className="showcase-demo-header">
              <div>
                <h3>Configured Filters</h3>
                <p>Difference: adds two configurable filters (status + type), export label, and an Add Award button through customControls.</p>
              </div>
              <ConfigTrigger onClick={() => setActiveConfig("browseFilters")} />
            </div>
            <div className="showcase-demo-preview showcase-browse-surface">
              <BrowseListControls
                heading="Awards"
                viewMode={opsBrowseView}
                onViewModeChange={setOpsBrowseView}
                searchValue={opsSearchValue}
                searchPlaceholder="Search awards..."
                onSearchChange={setOpsSearchValue}
                onExportToExcel={exportOpsBrowseRows}
                exportLabel="Export Awards"
                filters={[
                  {
                    id: "showcase-status-filter",
                    label: "Status",
                    value: opsStatusFilter,
                    onChange: setOpsStatusFilter,
                    options: [
                      { value: "", label: "All Statuses" },
                      { value: "pending", label: "Pending" },
                      { value: "notified", label: "Notified" },
                      { value: "redeemed", label: "Redeemed" },
                    ],
                  },
                  {
                    id: "showcase-type-filter",
                    label: "Type",
                    value: opsTypeFilter,
                    onChange: setOpsTypeFilter,
                    options: [
                      { value: "", label: "All Types" },
                      { value: "instant", label: "Instant" },
                      { value: "scheduled", label: "Scheduled" },
                    ],
                  },
                ]}
                customControls={[
                  <Button
                    key="add-award"
                    onClick={() =>
                      setOpsBrowseRows((current) => [
                        ...current,
                        {
                          award: `New Award ${current.length + 1}`,
                          status: "pending",
                          type: "instant",
                          recipient: "Unassigned",
                        },
                      ])
                    }
                  >
                    Add Award
                  </Button>,
                ]}
              />
              {opsBrowseView === "table" ? (
                <div className="browse-table-wrap">
                  <table className="browse-table">
                    <thead>
                      <tr>
                        <th>Award</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Recipient</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opsFilteredRows.map((row) => (
                        <tr key={`${row.award}-${row.recipient}`}>
                          <td>
                            <div className="browse-table-primary">{row.award}</div>
                          </td>
                          <td>{row.status}</td>
                          <td>{row.type}</td>
                          <td>{row.recipient}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="showcase-browse-grid-preview">
                  {opsFilteredRows.map((row) => (
                    <div key={`${row.award}-${row.recipient}-grid`} className="showcase-browse-tile">
                      <strong>{row.award}</strong>
                      <span>{row.status} - {row.type}</span>
                      <span>{row.recipient}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="showcase-browse-meta">
                Active filters: status={opsStatusFilter || "all"}, type={opsTypeFilter || "all"} | showing {opsFilteredRows.length} of {opsBrowseRows.length}
              </div>
            </div>
          </Card>

          <Card className="showcase-demo-card showcase-browse-card">
            <div className="showcase-demo-header">
              <div>
                <h3>Calendar Optional</h3>
                <p>Difference: same table/grid baseline with calendar enabled, plus Add Campaign via customControls.</p>
              </div>
              <ConfigTrigger onClick={() => setActiveConfig("browseCalendar")} />
            </div>
            <div className="showcase-demo-preview showcase-browse-surface">
              <BrowseListControls
                heading="Campaigns"
                viewMode={calendarBrowseView}
                onViewModeChange={(next) => {
                  setCalendarBrowseView(next);
                  if (next === "calendar") {
                    setCalendarScope("month");
                  }
                }}
                allowCalendarView
                calendarScope={calendarScope}
                onCalendarScopeChange={setCalendarScope}
                searchValue={calendarSearchValue}
                searchPlaceholder="Search campaigns..."
                onSearchChange={setCalendarSearchValue}
                onExportToExcel={exportCalendarBrowseRows}
                filters={[
                  {
                    id: "showcase-calendar-status-filter",
                    label: "Status",
                    value: calendarStatusFilter,
                    onChange: setCalendarStatusFilter,
                    options: [
                      { value: "", label: "All Statuses" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "active", label: "Active" },
                      { value: "completed", label: "Completed" },
                    ],
                  },
                ]}
                customControls={[
                  <Button
                    key="add-campaign"
                    onClick={() =>
                      setCalendarBrowseRows((current) => [
                        ...current,
                        {
                          campaign: `New Campaign ${current.length + 1}`,
                          status: "scheduled",
                          startDate: "2026-07-22",
                          endDate: "2026-07-28",
                        },
                      ])
                    }
                  >
                    Add Campaign
                  </Button>,
                ]}
              />
              {calendarBrowseView === "calendar" ? (
                <div className="showcase-calendar-preview">
                  <div className="showcase-calendar-header">
                    <div>
                      <strong>{selectedDayTitle ?? monthLabel}</strong>
                      <span>{calendarFilteredRows.length} scheduled campaign(s)</span>
                    </div>
                    <div className="showcase-calendar-nav" role="group" aria-label="Calendar month navigation">
                      <button type="button" className="secondary-btn" onClick={showPreviousCalendarMonth}>Previous</button>
                      {selectedCalendarDay ? (
                        <button type="button" className="secondary-btn" onClick={closeCalendarDay}>Month</button>
                      ) : null}
                      <button type="button" className="secondary-btn" onClick={showCurrentCalendarMonth}>Today</button>
                      <button type="button" className="secondary-btn" onClick={showNextCalendarMonth}>Next</button>
                    </div>
                  </div>
                  {selectedCalendarDay ? (
                    <div className="showcase-calendar-day-view">
                      {(eventsByDay[selectedCalendarDay.getDate()] ?? []).map((eventRow) => (
                        <div key={`${eventRow.campaign}-${eventRow.startDate}-day-view`} className="showcase-calendar-day-item">
                          <div>
                            <div className="showcase-calendar-day-item-title">{eventRow.campaign}</div>
                            <div className="showcase-calendar-day-item-meta">{eventRow.startDate} to {eventRow.endDate}</div>
                          </div>
                          <span className={`showcase-calendar-item-status is-${eventRow.status}`}>{eventRow.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="showcase-calendar-weekdays" aria-hidden="true">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                      </div>
                      <div className="showcase-calendar-grid" role="grid" aria-label={`${monthLabel} calendar preview`}>
                        {Array.from({ length: Math.ceil(paddedCalendarCells.length / 7) }, (_, rowIndex) => {
                          const rowCells = paddedCalendarCells.slice(rowIndex * 7, rowIndex * 7 + 7);
                          return (
                            <div key={`calendar-row-${rowIndex}`} className="showcase-calendar-row" role="row">
                              {rowCells.map((day, cellOffset) => {
                                const index = (rowIndex * 7) + cellOffset;
                                const events = day ? (eventsByDay[day] ?? []) : [];
                                const today = new Date();
                                const isToday = day
                                  ? (today.getFullYear() === showcaseCalendarYear
                                    && today.getMonth() === showcaseCalendarMonth - 1
                                    && today.getDate() === day)
                                  : false;

                                if (!day) {
                                  return <div key={`calendar-cell-${index}`} className="showcase-calendar-cell is-empty" role="gridcell" />;
                                }

                                return (
                                  <div key={`calendar-cell-${index}`} className="showcase-calendar-cell" role="gridcell">
                                    <button
                                      type="button"
                                      className={`showcase-calendar-cell-button${isToday ? " is-today" : ""}${events.length > 0 ? " has-items" : ""}`}
                                      onClick={() => openCalendarDay(day)}
                                      aria-label={`Open ${events.length} campaigns for ${showcaseCalendarYear}-${String(showcaseCalendarMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
                                    >
                                      <div className="showcase-calendar-day">{day}</div>
                                      {events.slice(0, 3).map((eventRow) => (
                                        <div key={`${eventRow.campaign}-${eventRow.startDate}`} className={`showcase-calendar-event is-${eventRow.status}`}>
                                          <strong>{eventRow.campaign}</strong>
                                          <span>{eventRow.startDate} to {eventRow.endDate}</span>
                                        </div>
                                      ))}
                                      {events.length > 3 ? <div className="showcase-calendar-more">+{events.length - 3} more</div> : null}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ) : calendarBrowseView === "table" ? (
                <div className="browse-table-wrap">
                  <table className="browse-table">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calendarFilteredRows.map((row) => (
                        <tr key={`${row.campaign}-${row.startDate}`}>
                          <td>
                            <div className="browse-table-primary">{row.campaign}</div>
                          </td>
                          <td>{row.status}</td>
                          <td>{row.startDate}</td>
                          <td>{row.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="showcase-browse-grid-preview">
                  {calendarFilteredRows.map((row) => (
                    <div key={`${row.campaign}-grid`} className="showcase-browse-tile">
                      <strong>{row.campaign}</strong>
                      <span>{row.status}</span>
                      <span>{row.startDate} to {row.endDate}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="showcase-browse-meta">Showing {calendarFilteredRows.length} of {calendarBrowseRows.length} campaigns</div>
            </div>
          </Card>
        </div>
      </PanelSection>

      <div className="showcase-grid two-column">
        <DemoCard title="DataTable" description="Responsive shell for header-driven tabular content." onConfigure={() => setActiveConfig("dataTable")}>
          <DataTable headers={tableHeaders}>
            {tableRows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.join("-")}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </DataTable>
        </DemoCard>

        <DemoCard title="EmptyState" description="Message-only fallback for empty collections or first-run states." onConfigure={() => setActiveConfig("emptyState")}>
          <EmptyState {...emptyStateConfig} />
        </DemoCard>
      </div>

      <PanelSection eyebrow="Overlay" title="Shared Modal" meta="Reusable dialog" compact actions={<ConfigTrigger onClick={() => setActiveConfig("modalDialog")} />}>
        <p className="showcase-copy">The modal primitive stays app-agnostic and can be composed into registry editors or other flows.</p>
        <div className="showcase-action-row">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </div>
      </PanelSection>

      {isModalOpen ? (
        <ModalDialog
          title={modalConfig.title}
          subtitle={modalConfig.subtitle}
          onClose={() => setIsModalOpen(false)}
          footer={<Button onClick={() => setIsModalOpen(false)}>{modalConfig.footerLabel}</Button>}
          showCloseButton={modalConfig.showCloseButton}
        >
          <p className="showcase-copy">{modalConfig.body}</p>
        </ModalDialog>
      ) : null}

      {renderConfigModal()}
    </div>
  );
}

export default function App() {
  const { userName, userEmail } = useAdminUser(async () => ({
    name: "System Administrator",
    email: "admin@lunarq.com",
  }));

  return (
    <BrowserRouter>
      <AdminShell
        navItems={navItems}
        logo={
          <div className="logo showcase-logo">
            <div className="showcase-logo-mark">LQ</div>
            <div className="logo-text">
              <div className="logo-title">LUNARQ</div>
              <div className="logo-subtitle">FRONTEND SHARED</div>
            </div>
          </div>
        }
        topBarContent={
          <SessionInfo
            userManager={mockUserManager}
            apiLabel="https://api.example.lunarq"
            authority="https://identity.example.lunarq"
            formatDateTime={(value) => value.toLocaleString("en-ZA", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          />
        }
        userName={userName}
        userEmail={userEmail}
        onSignOut={() => undefined}
      >
        <Routes>
          <Route path="/app" element={<ShowcaseContent />} />
          <Route path="/app/help" element={<Navigate to="/app/help/components" replace />} />
          <Route path="/app/help/:sectionId" element={<HelpPage />} />
          <Route
            path="/app/reports"
            element={
              <div className="showcase-page">
                <PageHero eyebrow="Reports" title="Reports" description="Demo navigation placeholder." />
              </div>
            }
          />
          <Route
            path="/app/settings"
            element={
              <div className="showcase-page">
                <PageHero eyebrow="Settings" title="Settings" description="Demo navigation placeholder." />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AdminShell>
    </BrowserRouter>
  );
}
