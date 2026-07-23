import React from "react";
import {
  createBrowseListControls,
  createBrowseLoadedPages,
  createBrowseScrollSentinel,
  createButton,
  createDataTable,
  createEmptyState,
  createFormFields,
  createModalDialog,
  createStatsGrid,
  createStatusBadge,
  createStatusMessage,
  loadBrowsePage,
  sliceBrowsePage,
  type BrowsePagingMode,
} from "@lunarq/frontend-shared";
import { BrowseSqlPagingExample } from "./sql/BrowseSqlPagingExample";

const Button = createButton(React);
const BrowseListControls = createBrowseListControls(React);
const BrowseScrollSentinel = createBrowseScrollSentinel(React);
const DataTable = createDataTable(React);
const EmptyState = createEmptyState(React);
const ModalDialog = createModalDialog(React);
const StatsGrid = createStatsGrid(React);
const StatusBadge = createStatusBadge(React);
const StatusMessage = createStatusMessage(React);
const {
  TextField,
  SelectField,
  TextAreaField,
  NumberField,
  CurrencyField,
  DateField,
  TimeField,
  DateTimeField,
  CheckboxField,
} = createFormFields(React);

export type HelpItem = {
  id: string;
  title: string;
  description: string;
  code: string;
  Example: () => React.ReactNode;
};

export type HelpGroup = {
  id: string;
  eyebrow: string;
  title: string;
  items: HelpItem[];
};

function factoryCode(factoryName: string, binding: string, body: string) {
  return [
    'import React from "react";',
    `import { ${factoryName} } from "@lunarq/frontend-shared";`,
    "",
    `const ${binding} = ${factoryName}(React);`,
    "",
    body.trim(),
  ].join("\n");
}

function browseExampleCode(body: string) {
  return [
    'import React from "react";',
    'import {',
    "  createBrowseListControls,",
    "  createButton,",
    "  createFormFields,",
    "  createStatusBadge,",
    '} from "@lunarq/frontend-shared";',
    "",
    "const BrowseListControls = createBrowseListControls(React);",
    "const Button = createButton(React);",
    "const StatusBadge = createStatusBadge(React);",
    "const { CurrencyField, DateField, CheckboxField, TextField } = createFormFields(React);",
    "",
    body.trim(),
  ].join("\n");
}

type HelpBrowseItem = {
  id: string;
  name: string;
  status: string;
  budget: string;
  startDate: string;
  featured: boolean;
};

function createBrowseItem(partial?: Partial<HelpBrowseItem>, index = 1): HelpBrowseItem {
  return {
    id: partial?.id ?? `item-${Date.now()}-${index}`,
    name: partial?.name ?? `New Item ${index}`,
    status: partial?.status ?? (partial?.featured ? "active" : "draft"),
    budget: partial?.budget ?? "1000",
    startDate: partial?.startDate ?? "2026-07-20",
    featured: partial?.featured ?? false,
  };
}

function formatBudget(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return `R ${value}`;
  }
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BrowseAddForm({
  idPrefix,
  draft,
  onChange,
  onAdd,
  addLabel,
}: {
  idPrefix: string;
  draft: Omit<HelpBrowseItem, "id" | "status"> & { name: string };
  onChange: (next: Omit<HelpBrowseItem, "id" | "status"> & { name: string }) => void;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="showcase-help-browse-form">
      <TextField
        htmlFor={`${idPrefix}-name`}
        label="Name"
        name="name"
        value={draft.name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...draft, name: event.target.value })
        }
      />
      <DateField
        htmlFor={`${idPrefix}-date`}
        label="Start date"
        name="startDate"
        value={draft.startDate}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...draft, startDate: event.target.value })
        }
      />
      <CurrencyField
        htmlFor={`${idPrefix}-budget`}
        label="Budget"
        name="budget"
        prefix="R"
        value={draft.budget}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...draft, budget: event.target.value })
        }
      />
      <CheckboxField
        label="Featured"
        name="featured"
        checked={draft.featured}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...draft, featured: event.target.checked })
        }
      />
      <div className="showcase-help-browse-form-actions">
        <Button onClick={onAdd}>{addLabel}</Button>
      </div>
    </div>
  );
}

function BrowseItemsTable({ items }: { items: HelpBrowseItem[] }) {
  return (
    <div className="browse-table-wrap">
      <table className="browse-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Start date</th>
            <th>Featured</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="browse-table-primary">{item.name}</div>
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>{formatBudget(item.budget)}</td>
              <td>{item.startDate}</td>
              <td>{item.featured ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BrowseItemsGrid({ items }: { items: HelpBrowseItem[] }) {
  return (
    <div className="showcase-browse-grid-preview">
      {items.map((item) => (
        <div key={item.id} className="showcase-browse-tile">
          <strong>{item.name}</strong>
          <StatusBadge status={item.status} />
          <span>{formatBudget(item.budget)}</span>
          <span>{item.startDate}</span>
          <span>{item.featured ? "Featured" : "Standard"}</span>
        </div>
      ))}
    </div>
  );
}

function BrowseItemsCalendar({ items }: { items: HelpBrowseItem[] }) {
  const byDate = items.reduce<Record<string, HelpBrowseItem[]>>((acc, item) => {
    const key = item.startDate || "Unscheduled";
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort();

  return (
    <div className="showcase-help-browse-calendar">
      {dates.map((date) => (
        <section key={date} className="showcase-help-browse-calendar-day">
          <h5>{date}</h5>
          <div className="showcase-help-browse-calendar-items">
            {byDate[date].map((item) => (
              <article key={item.id} className="showcase-browse-tile">
                <strong>{item.name}</strong>
                <StatusBadge status={item.status} />
                <span>{formatBudget(item.budget)}</span>
                <span>{item.featured ? "Featured" : "Standard"}</span>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function BrowseItemsView({
  viewMode,
  items,
}: {
  viewMode: "table" | "grid" | "calendar";
  items: HelpBrowseItem[];
}) {
  if (items.length === 0) {
    return <EmptyState title="No items yet" detail="Use the form above to add the first row." framed />;
  }
  if (viewMode === "grid") {
    return <BrowseItemsGrid items={items} />;
  }
  if (viewMode === "calendar") {
    return <BrowseItemsCalendar items={items} />;
  }
  return <BrowseItemsTable items={items} />;
}

function formFieldCode(componentName: string, body: string) {
  return [
    'import React from "react";',
    'import { createFormFields } from "@lunarq/frontend-shared";',
    "",
    `const { ${componentName} } = createFormFields(React);`,
    "",
    body.trim(),
  ].join("\n");
}

function ButtonExample() {
  return (
    <div className="showcase-action-row">
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger" disabled>
        Delete
      </Button>
    </div>
  );
}

function StatusBadgeExample() {
  return (
    <div className="showcase-action-row">
      <StatusBadge status="active" />
      <StatusBadge status="scheduled" />
      <StatusBadge status="paused" />
      <StatusBadge status="completed" />
    </div>
  );
}

function StatusMessageExample() {
  return (
    <StatusMessage
      tone="success"
      title="Campaign published"
      detail="The loyalty push is live for EMEA and NA."
    />
  );
}

function StatsGridExample() {
  return (
    <StatsGrid
      items={[
        { icon: "📋", label: "Open", value: "24", accentColor: "#f97316" },
        { icon: "☑️", label: "Completed", value: "128", accentColor: "#22c55e" },
        { icon: "🗓️", label: "This week", value: "11", accentColor: "#3b82f6" },
      ]}
    />
  );
}

function TextFieldExample() {
  const [value, setValue] = React.useState("Summer Launch");
  return (
    <TextField
      htmlFor="help-text"
      label="Campaign name"
      name="name"
      value={value}
      placeholder="Enter a name"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

function SelectFieldExample() {
  const [value, setValue] = React.useState("emea");
  return (
    <SelectField
      htmlFor="help-select"
      label="Region"
      name="region"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setValue(event.target.value)}
    >
      <option value="emea">EMEA</option>
      <option value="na">NA</option>
      <option value="apac">APAC</option>
    </SelectField>
  );
}

function TextAreaFieldExample() {
  const [value, setValue] = React.useState("Target VIP renewals with a mid-month incentive.");
  return (
    <TextAreaField
      htmlFor="help-textarea"
      label="Brief"
      name="brief"
      rows={4}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
    />
  );
}

function NumberFieldExample() {
  const [value, setValue] = React.useState("3");
  return (
    <NumberField
      htmlFor="help-number"
      label="Quantity"
      name="quantity"
      min={0}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

function CurrencyFieldExample() {
  const [value, setValue] = React.useState("12500");
  return (
    <CurrencyField
      htmlFor="help-currency"
      label="Budget"
      name="budget"
      prefix="R"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

function DateFieldExample() {
  const [value, setValue] = React.useState("2026-07-20");
  return (
    <DateField
      htmlFor="help-date"
      label="Start date"
      name="startDate"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

function TimeFieldExample() {
  const [value, setValue] = React.useState("09:30");
  return (
    <TimeField
      htmlFor="help-time"
      label="Start time"
      name="startTime"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

function DateTimeFieldExample() {
  const [value, setValue] = React.useState("2026-07-20T09:30");
  return (
    <DateTimeField
      htmlFor="help-datetime"
      label="Launch at"
      name="launchAt"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
}

function CheckboxFieldExample() {
  const [checked, setChecked] = React.useState(true);
  return (
    <CheckboxField
      label="Notify regional owners"
      name="notify"
      checked={checked}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setChecked(event.target.checked)}
    />
  );
}

function useBrowseDraft() {
  return React.useState({
    name: "",
    budget: "2500",
    startDate: "2026-07-20",
    featured: true,
  });
}

function appendBrowseItem(
  setItems: React.Dispatch<React.SetStateAction<HelpBrowseItem[]>>,
  draft: { name: string; budget: string; startDate: string; featured: boolean },
  fallbackName: string,
) {
  setItems((current) => [
    ...current,
    createBrowseItem(
      {
        name: draft.name.trim() || `${fallbackName} ${current.length + 1}`,
        budget: draft.budget || "0",
        startDate: draft.startDate,
        featured: draft.featured,
        status: draft.featured ? "active" : "draft",
      },
      current.length + 1,
    ),
  ]);
}

function BrowseDefaultExample() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [draft, setDraft] = useBrowseDraft();
  const [items, setItems] = React.useState<HelpBrowseItem[]>([
    createBrowseItem({
      id: "comp-1",
      name: "Summer Campaign",
      status: "active",
      budget: "12500",
      startDate: "2026-07-01",
      featured: true,
    }),
    createBrowseItem({
      id: "comp-2",
      name: "Weekly Redemptions",
      status: "pending",
      budget: "3200",
      startDate: "2026-07-15",
      featured: false,
    }),
  ]);

  const filteredItems = items.filter((item) => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      item.name.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.startDate.includes(query) ||
      item.budget.includes(query)
    );
  });

  return (
    <div className="showcase-browse-surface">
      <BrowseListControls
        heading="Competitions"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        searchPlaceholder="Search competitions..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => undefined}
        exportLabel="Export to Excel"
      />
      <BrowseAddForm
        idPrefix="help-browse-default"
        draft={draft}
        onChange={setDraft}
        addLabel="Add Competition"
        onAdd={() => {
          appendBrowseItem(setItems, draft, "Competition");
          setDraft({ name: "", budget: "2500", startDate: "2026-07-20", featured: true });
        }}
      />
      <p className="showcase-browse-meta">View: {viewMode} · {filteredItems.length} of {items.length}</p>
      <BrowseItemsView viewMode={viewMode} items={filteredItems} />
    </div>
  );
}

function BrowsePagingExample() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [pagingMode, setPagingMode] = React.useState<BrowsePagingMode>("pages");
  const [loadedPages, setLoadedPages] = React.useState(() => createBrowseLoadedPages(0));
  const items = React.useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) =>
        createBrowseItem({
          id: `page-${index + 1}`,
          name: `Campaign ${index + 1}`,
          status: index % 2 === 0 ? "active" : "draft",
          budget: String(1000 + index * 25),
          startDate: "2026-07-20",
          featured: index % 3 === 0,
        }),
      ),
    [],
  );

  const filteredItems = items.filter((item) => {
    const query = searchValue.trim().toLowerCase();
    return !query || item.name.toLowerCase().includes(query) || item.status.includes(query);
  });

  React.useEffect(() => {
    setPageIndex(0);
    setLoadedPages(createBrowseLoadedPages(0));
  }, [pagingMode, pageSize, searchValue]);

  React.useEffect(() => {
    if (pagingMode === "pages") {
      return;
    }
    setLoadedPages((previous) => loadBrowsePage(previous, pageIndex));
  }, [pageIndex, pagingMode]);

  const pageRows = sliceBrowsePage(filteredItems, {
    mode: pagingMode,
    pageIndex,
    pageSize,
    loadedPages: pagingMode === "pages" ? undefined : loadedPages,
  });

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const nextScrollPage =
    pagingMode === "scroll"
      ? Array.from({ length: pageCount }, (_, index) => index).find((index) => !loadedPages.has(index)) ??
        null
      : null;

  return (
    <div className="showcase-browse-surface">
      <BrowseListControls
        heading="Paged campaigns"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        searchPlaceholder="Search campaigns..."
        onSearchChange={(value) => {
          setSearchValue(value);
          setPageIndex(0);
        }}
        onExportToExcel={() => undefined}
        filters={[
          {
            id: "paging-mode",
            label: "Paging mode",
            value: pagingMode,
            onChange: (value) => {
              const next: BrowsePagingMode =
                value === "lazy" ? "lazy" : value === "scroll" ? "scroll" : "pages";
              setPagingMode(next);
              setPageIndex(0);
            },
            options: [
              { value: "pages", label: "Pages" },
              { value: "lazy", label: "Lazy pages" },
              { value: "scroll", label: "Scroll load" },
            ],
          },
        ]}
        paging={{
          mode: pagingMode,
          pageSize,
          pageSizeOptions: [5, 10, 25],
          pageIndex,
          totalCount: filteredItems.length,
          loadedPages: pagingMode === "pages" ? undefined : loadedPages,
          onPageIndexChange: setPageIndex,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPageIndex(0);
          },
        }}
      />
      <p className="showcase-browse-meta">
        Mode {pagingMode} · showing {pageRows.length} of {filteredItems.length}
        {pagingMode !== "pages" ? ` · loaded pages [${[...loadedPages].sort((a, b) => a - b).join(", ")}]` : ""}
      </p>
      <BrowseItemsView viewMode={viewMode === "calendar" ? "table" : viewMode} items={pageRows} />
      {pagingMode === "scroll" ? (
        <BrowseScrollSentinel
          enabled={nextScrollPage !== null}
          loadKey={`${[...loadedPages].join(",")}:${nextScrollPage ?? "done"}`}
          onLoadMore={() => {
            if (nextScrollPage === null) {
              return;
            }
            setLoadedPages((previous) => loadBrowsePage(previous, nextScrollPage));
            setPageIndex(nextScrollPage);
          }}
        />
      ) : null}
    </div>
  );
}

function BrowseFiltersExample() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [draft, setDraft] = useBrowseDraft();
  const [items, setItems] = React.useState<HelpBrowseItem[]>([
    createBrowseItem({
      id: "award-1",
      name: "Welcome Voucher",
      status: "pending",
      budget: "150",
      startDate: "2026-07-08",
      featured: false,
    }),
    createBrowseItem({
      id: "award-2",
      name: "Loyalty Bonus",
      status: "active",
      budget: "500",
      startDate: "2026-07-12",
      featured: true,
    }),
  ]);

  const filteredItems = items.filter((item) => {
    const query = searchValue.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.startDate.includes(query);
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="showcase-browse-surface">
      <BrowseListControls
        heading="Awards"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        searchPlaceholder="Search awards..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => undefined}
        exportLabel="Export Awards"
        filters={[
          {
            id: "help-status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
            ],
          },
        ]}
      />
      <BrowseAddForm
        idPrefix="help-browse-filters"
        draft={draft}
        onChange={setDraft}
        addLabel="Add Award"
        onAdd={() => {
          appendBrowseItem(setItems, draft, "Award");
          setDraft({ name: "", budget: "150", startDate: "2026-07-20", featured: false });
        }}
      />
      <p className="showcase-browse-meta">View: {viewMode} · {filteredItems.length} of {items.length}</p>
      <BrowseItemsView viewMode={viewMode} items={filteredItems} />
    </div>
  );
}

function BrowseCalendarExample() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("calendar");
  const [calendarScope, setCalendarScope] = React.useState<"day" | "month" | "year">("month");
  const [searchValue, setSearchValue] = React.useState("");
  const [draft, setDraft] = useBrowseDraft();
  const [items, setItems] = React.useState<HelpBrowseItem[]>([
    createBrowseItem({
      id: "camp-1",
      name: "July Sprint Promo",
      status: "scheduled",
      budget: "18000",
      startDate: "2026-07-10",
      featured: true,
    }),
    createBrowseItem({
      id: "camp-2",
      name: "Flash Friday",
      status: "active",
      budget: "4500",
      startDate: "2026-07-18",
      featured: false,
    }),
  ]);

  const filteredItems = items.filter((item) => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      item.name.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.startDate.includes(query)
    );
  });

  return (
    <div className="showcase-browse-surface">
      <BrowseListControls
        heading="Campaigns"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        allowCalendarView
        calendarScope={calendarScope}
        onCalendarScopeChange={setCalendarScope}
        searchValue={searchValue}
        searchPlaceholder="Search campaigns..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => undefined}
      />
      <BrowseAddForm
        idPrefix="help-browse-calendar"
        draft={draft}
        onChange={setDraft}
        addLabel="Add Campaign"
        onAdd={() => {
          appendBrowseItem(setItems, draft, "Campaign");
          setDraft({ name: "", budget: "5000", startDate: "2026-07-22", featured: true });
        }}
      />
      <p className="showcase-browse-meta">
        View: {viewMode}
        {viewMode === "calendar" ? ` · scope ${calendarScope}` : ""} · {filteredItems.length} of {items.length}
      </p>
      <BrowseItemsView viewMode={viewMode} items={filteredItems} />
    </div>
  );
}

function DataTableExample() {
  return (
    <DataTable headers={["Campaign", "Status", "Owner"]}>
      <tr>
        <td>Summer Launch</td>
        <td>active</td>
        <td>Ava Patel</td>
      </tr>
      <tr>
        <td>Loyalty Push</td>
        <td>scheduled</td>
        <td>Noah Kim</td>
      </tr>
    </DataTable>
  );
}

function EmptyStateExample() {
  return (
    <EmptyState
      title="No campaigns match"
      detail="Adjust search or filters to see results again."
      framed
    />
  );
}

function ModalDialogExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="showcase-action-row">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      {open ? (
        <ModalDialog
          title="Shared Modal Example"
          subtitle="Composable dialog shell"
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>Close</Button>}
        >
          <p className="showcase-copy">
            Use this dialog for confirmations, editors, and other focused flows.
          </p>
        </ModalDialog>
      ) : null}
    </div>
  );
}

export const HELP_GROUPS: HelpGroup[] = [
  {
    id: "primitives",
    eyebrow: "Primitives",
    title: "Core UI",
    items: [
      {
        id: "button",
        title: "Button",
        description: "Reusable action trigger with variants, disabled state, and type selection.",
        code: factoryCode(
          "createButton",
          "Button",
          `export function Example() {
  return (
    <>
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger" disabled>Delete</Button>
    </>
  );
}`,
        ),
        Example: ButtonExample,
      },
      {
        id: "statusBadge",
        title: "StatusBadge",
        description: "Compact semantic label that derives styling from the supplied status.",
        code: factoryCode(
          "createStatusBadge",
          "StatusBadge",
          `export function Example() {
  return (
    <>
      <StatusBadge status="active" />
      <StatusBadge status="scheduled" />
      <StatusBadge status="paused" />
    </>
  );
}`,
        ),
        Example: StatusBadgeExample,
      },
      {
        id: "statusMessage",
        title: "StatusMessage",
        description: "Prominent feedback banner for success, warning, info, or error states.",
        code: factoryCode(
          "createStatusMessage",
          "StatusMessage",
          `export function Example() {
  return (
    <StatusMessage
      tone="success"
      title="Campaign published"
      detail="The loyalty push is live for EMEA and NA."
    />
  );
}`,
        ),
        Example: StatusMessageExample,
      },
    ],
  },
  {
    id: "metrics",
    eyebrow: "Metrics",
    title: "Stats Grid",
    items: [
      {
        id: "statsGrid",
        title: "StatsGrid",
        description: "Shared metric cards with optional icons and accent colors.",
        code: factoryCode(
          "createStatsGrid",
          "StatsGrid",
          `export function Example() {
  return (
    <StatsGrid
      items={[
        { icon: "📋", label: "Open", value: "24", accentColor: "#f97316" },
        { icon: "☑️", label: "Completed", value: "128", accentColor: "#22c55e" },
        { icon: "🗓️", label: "This week", value: "11", accentColor: "#3b82f6" },
      ]}
    />
  );
}`,
        ),
        Example: StatsGridExample,
      },
    ],
  },
  {
    id: "forms",
    eyebrow: "Forms",
    title: "Field Primitives",
    items: [
      {
        id: "textField",
        title: "TextField",
        description: "Single-line textual input with optional placeholder and variants.",
        code: formFieldCode(
          "TextField",
          `export function Example() {
  const [value, setValue] = React.useState("Summer Launch");
  return (
    <TextField
      htmlFor="name"
      label="Campaign name"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: TextFieldExample,
      },
      {
        id: "selectField",
        title: "SelectField",
        description: "Single or multi-option select input with shared label treatment.",
        code: formFieldCode(
          "SelectField",
          `export function Example() {
  const [value, setValue] = React.useState("emea");
  return (
    <SelectField
      htmlFor="region"
      label="Region"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    >
      <option value="emea">EMEA</option>
      <option value="na">NA</option>
    </SelectField>
  );
}`,
        ),
        Example: SelectFieldExample,
      },
      {
        id: "textAreaField",
        title: "TextAreaField",
        description: "Multi-line text entry control with configurable rows and placeholder.",
        code: formFieldCode(
          "TextAreaField",
          `export function Example() {
  const [value, setValue] = React.useState("Target VIP renewals...");
  return (
    <TextAreaField
      htmlFor="brief"
      label="Brief"
      rows={4}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: TextAreaFieldExample,
      },
      {
        id: "numberField",
        title: "NumberField",
        description: "Numeric input for counts and other quantity-like values.",
        code: formFieldCode(
          "NumberField",
          `export function Example() {
  const [value, setValue] = React.useState("3");
  return (
    <NumberField
      htmlFor="quantity"
      label="Quantity"
      min={0}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: NumberFieldExample,
      },
      {
        id: "currencyField",
        title: "CurrencyField",
        description: "Numeric input with a configurable leading prefix for monetary values.",
        code: formFieldCode(
          "CurrencyField",
          `export function Example() {
  const [value, setValue] = React.useState("12500");
  return (
    <CurrencyField
      htmlFor="budget"
      label="Budget"
      prefix="R"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: CurrencyFieldExample,
      },
      {
        id: "dateField",
        title: "DateField",
        description: "Date picker that uses the shared field styling contract.",
        code: formFieldCode(
          "DateField",
          `export function Example() {
  const [value, setValue] = React.useState("2026-07-20");
  return (
    <DateField
      htmlFor="startDate"
      label="Start date"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: DateFieldExample,
      },
      {
        id: "timeField",
        title: "TimeField",
        description: "Time-only input with the same shared field wrapper and focus behavior.",
        code: formFieldCode(
          "TimeField",
          `export function Example() {
  const [value, setValue] = React.useState("09:30");
  return (
    <TimeField
      htmlFor="startTime"
      label="Start time"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: TimeFieldExample,
      },
      {
        id: "dateTimeField",
        title: "DateTimeField",
        description: "Combined date and time picker for timestamp-style forms.",
        code: formFieldCode(
          "DateTimeField",
          `export function Example() {
  const [value, setValue] = React.useState("2026-07-20T09:30");
  return (
    <DateTimeField
      htmlFor="launchAt"
      label="Launch at"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}`,
        ),
        Example: DateTimeFieldExample,
      },
      {
        id: "checkboxField",
        title: "CheckboxField",
        description: "Checkbox row with shared spacing and label alignment.",
        code: formFieldCode(
          "CheckboxField",
          `export function Example() {
  const [checked, setChecked] = React.useState(true);
  return (
    <CheckboxField
      label="Notify regional owners"
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
    />
  );
}`,
        ),
        Example: CheckboxFieldExample,
      },
    ],
  },
  {
    id: "browse",
    eyebrow: "Browse",
    title: "BrowseListControls Variations",
    items: [
      {
        id: "browseDefault",
        title: "BrowseListControls (Default)",
        description:
          "Own the list in page state. Add rows with DateField, CurrencyField, and CheckboxField; render StatusBadge; switch Table/Grid from viewMode.",
        code: browseExampleCode(`export function Example() {
  const [viewMode, setViewMode] = React.useState("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [draft, setDraft] = React.useState({
    name: "",
    budget: "2500",
    startDate: "2026-07-20",
    featured: true,
  });
  const [items, setItems] = React.useState([
    {
      id: "1",
      name: "Summer Campaign",
      status: "active",
      budget: "12500",
      startDate: "2026-07-01",
      featured: true,
    },
  ]);

  const filteredItems = items.filter((item) => {
    const query = searchValue.trim().toLowerCase();
    return !query || item.name.toLowerCase().includes(query);
  });

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
      />

      <DateField
        htmlFor="startDate"
        label="Start date"
        value={draft.startDate}
        onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
      />
      <CurrencyField
        htmlFor="budget"
        label="Budget"
        prefix="R"
        value={draft.budget}
        onChange={(event) => setDraft((current) => ({ ...current, budget: event.target.value }))}
      />
      <CheckboxField
        label="Featured"
        checked={draft.featured}
        onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))}
      />
      <Button
        onClick={() =>
          setItems((current) => [
            ...current,
            {
              id: String(current.length + 1),
              name: draft.name || \`Competition \${current.length + 1}\`,
              status: draft.featured ? "active" : "draft",
              budget: draft.budget,
              startDate: draft.startDate,
              featured: draft.featured,
            },
          ])
        }
      >
        Add Competition
      </Button>

      {viewMode === "grid" ? (
        <div className="grid">
          {filteredItems.map((item) => (
            <article key={item.id}>
              <strong>{item.name}</strong>
              <StatusBadge status={item.status} />
              <span>R {item.budget}</span>
              <span>{item.startDate}</span>
            </article>
          ))}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Start date</th>
              <th>Featured</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td><StatusBadge status={item.status} /></td>
                <td>R {item.budget}</td>
                <td>{item.startDate}</td>
                <td>{item.featured ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}`),
        Example: BrowseDefaultExample,
      },
      {
        id: "browseFilters",
        title: "BrowseListControls (Filters)",
        description:
          "Same field pattern with filters. StatusBadge shows status; Table/Grid updates from viewMode.",
        code: browseExampleCode(`export function Example() {
  const [viewMode, setViewMode] = React.useState("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [items, setItems] = React.useState([
    {
      id: "1",
      name: "Welcome Voucher",
      status: "pending",
      budget: "150",
      startDate: "2026-07-08",
      featured: false,
    },
  ]);

  const filteredItems = items.filter((item) => {
    const matchesStatus = !status || item.status === status;
    return matchesStatus;
  });

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
        filters={[
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
            ],
          },
        ]}
      />
      {/* Add form uses DateField, CurrencyField, CheckboxField — same as Default */}
      {viewMode === "grid"
        ? filteredItems.map((item) => (
            <div key={item.id}>
              {item.name} <StatusBadge status={item.status} />
            </div>
          ))
        : (
          <table>{/* columns: name, StatusBadge, budget, startDate, featured */}</table>
        )}
    </>
  );
}`),
        Example: BrowseFiltersExample,
      },
      {
        id: "browseCalendar",
        title: "BrowseListControls (Calendar)",
        description:
          "Table, Grid, and Calendar all switch from viewMode. Rows use DateField values, CurrencyField budgets, CheckboxField featured, and StatusBadge.",
        code: browseExampleCode(`export function Example() {
  const [viewMode, setViewMode] = React.useState("calendar");
  const [calendarScope, setCalendarScope] = React.useState("month");
  const [searchValue, setSearchValue] = React.useState("");
  const [items, setItems] = React.useState([
    {
      id: "1",
      name: "July Sprint Promo",
      status: "scheduled",
      budget: "18000",
      startDate: "2026-07-10",
      featured: true,
    },
  ]);

  return (
    <>
      <BrowseListControls
        heading="Campaigns"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        allowCalendarView
        calendarScope={calendarScope}
        onCalendarScopeChange={setCalendarScope}
        searchValue={searchValue}
        searchPlaceholder="Search campaigns..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => {}}
      />
      {/* Add form: DateField + CurrencyField + CheckboxField */}
      {viewMode === "calendar" ? (
        <div>{/* group items by startDate */}</div>
      ) : viewMode === "grid" ? (
        <div>{/* grid tiles with StatusBadge */}</div>
      ) : (
        <table>{/* table rows with StatusBadge */}</table>
      )}
    </>
  );
}`),
        Example: BrowseCalendarExample,
      },
      {
        id: "browsePaging",
        title: "BrowseListControls (Paging)",
        description:
          "Optional paging with classic pages, lazy per-page load-once cache, or infinite scroll.",
        code: browseExampleCode(`import {
  createBrowseLoadedPages,
  loadBrowsePage,
  sliceBrowsePage,
} from "@lunarq/frontend-shared";

export function Example() {
  const [viewMode, setViewMode] = React.useState("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [loadedPages, setLoadedPages] = React.useState(() => createBrowseLoadedPages(0));
  const items = Array.from({ length: 42 }, (_, index) => ({
    id: String(index + 1),
    name: \`Campaign \${index + 1}\`,
    status: index % 2 === 0 ? "active" : "draft",
  }));
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(searchValue.trim().toLowerCase()),
  );
  React.useEffect(() => {
    setLoadedPages((previous) => loadBrowsePage(previous, pageIndex));
  }, [pageIndex]);
  const pageRows = sliceBrowsePage(filtered, {
    mode: "lazy",
    pageIndex,
    pageSize,
    loadedPages,
  });

  return (
    <>
      <BrowseListControls
        heading="Campaigns"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        searchPlaceholder="Search..."
        onSearchChange={(value) => {
          setSearchValue(value);
          setPageIndex(0);
        }}
        onExportToExcel={() => {}}
        paging={{
          mode: "lazy",
          pageSize,
          pageIndex,
          totalCount: filtered.length,
          loadedPages,
          onPageIndexChange: setPageIndex,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPageIndex(0);
          },
        }}
      />
      <table>
        <tbody>
          {pageRows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}`),
        Example: BrowsePagingExample,
      },
      {
        id: "browseSqlPaging",
        title: "BrowseListControls (SQLite paging)",
        description:
          "Load-once page cache against an in-browser SQLite DB (sql.js): large multi-table join with COUNT(*) + OFFSET/LIMIT. Revisiting a page does not run SELECT again.",
        code: `import {
  createBrowseLoadedPages,
  loadBrowsePage,
} from "@lunarq/frontend-shared";
import { countBrowseSqlRows, fetchBrowseSqlPage } from "./sql/browseSqlPagingDb";

// 1) COUNT when filters change
const { totalCount } = await countBrowseSqlRows(search, status);

// 2) SELECT page only if not cached
async function ensurePageLoaded(pageIndex: number) {
  if (pageCache.has(pageIndex)) {
    setLoadedPages((prev) => loadBrowsePage(prev, pageIndex));
    return;
  }
  const { rows } = await fetchBrowseSqlPage(pageIndex, pageSize, search, status);
  pageCache.set(pageIndex, rows);
  setLoadedPages((prev) => loadBrowsePage(prev, pageIndex));
}

// SQL (joined): order_items ⋈ orders ⋈ customers ⋈ regions ⋈ products
// ORDER BY ordered_at DESC, line id
// LIMIT :pageSize OFFSET :pageIndex * :pageSize`,
        Example: BrowseSqlPagingExample,
      },
    ],
  },
  {
    id: "data",
    eyebrow: "Data",
    title: "Tables & Empty States",
    items: [
      {
        id: "dataTable",
        title: "DataTable",
        description: "Responsive shell for header-driven tabular content.",
        code: factoryCode(
          "createDataTable",
          "DataTable",
          `export function Example() {
  return (
    <DataTable headers={["Campaign", "Status", "Owner"]}>
      <tr>
        <td>Summer Launch</td>
        <td>active</td>
        <td>Ava Patel</td>
      </tr>
    </DataTable>
  );
}`,
        ),
        Example: DataTableExample,
      },
      {
        id: "emptyState",
        title: "EmptyState",
        description: "Message-only fallback for empty collections or first-run states.",
        code: factoryCode(
          "createEmptyState",
          "EmptyState",
          `export function Example() {
  return (
    <EmptyState
      title="No campaigns match"
      detail="Adjust search or filters to see results again."
      framed
    />
  );
}`,
        ),
        Example: EmptyStateExample,
      },
    ],
  },
  {
    id: "overlay",
    eyebrow: "Overlay",
    title: "Shared Modal",
    items: [
      {
        id: "modalDialog",
        title: "ModalDialog",
        description: "App-agnostic dialog shell for editors, confirmations, and focused flows.",
        code: [
          'import React from "react";',
          'import { createButton, createModalDialog } from "@lunarq/frontend-shared";',
          "",
          "const Button = createButton(React);",
          "const ModalDialog = createModalDialog(React);",
          "",
          `export function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      {open ? (
        <ModalDialog
          title="Shared Modal Example"
          subtitle="Composable dialog shell"
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>Close</Button>}
        >
          <p>Use this dialog for confirmations and editors.</p>
        </ModalDialog>
      ) : null}
    </>
  );
}`,
        ].join("\n"),
        Example: ModalDialogExample,
      },
    ],
  },
];
