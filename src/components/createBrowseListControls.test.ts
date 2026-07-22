/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import { createBrowseListControls } from "./createBrowseListControls.js";
import { createFakeReact } from "../testing/fakeReact.js";

type FakeElement = {
  type: unknown;
  props: Record<string, unknown>;
  children: unknown[];
};

test("createBrowseListControls hides calendar when allowCalendarView is false", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  const element = BrowseListControls({
    heading: "Competitions",
    viewMode: "grid",
    searchValue: "",
    searchPlaceholder: "Search competitions...",
    onSearchChange: () => undefined,
    onViewModeChange: () => undefined,
    onExportToExcel: () => undefined,
    allowCalendarView: false,
  }) as FakeElement;

  const header = element.children[0] as FakeElement;
  const toolbar = header.children[1] as FakeElement;
  const viewSwitch = toolbar.children[1] as FakeElement;

  assert.equal(viewSwitch.children.length, 2);
  const labels = viewSwitch.children.map(
    (child) => (child as FakeElement).children[0],
  );
  assert.deepEqual(labels, ["Table", "Grid"]);
});

test("createBrowseListControls shows day/month/year scope in calendar mode", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  let nextScope = "";
  const element = BrowseListControls({
    heading: "Campaigns",
    viewMode: "calendar",
    calendarScope: "month",
    onCalendarScopeChange: (value) => {
      nextScope = value;
    },
    searchValue: "",
    searchPlaceholder: "Search campaigns...",
    onSearchChange: () => undefined,
    onViewModeChange: () => undefined,
    onExportToExcel: () => undefined,
    allowCalendarView: true,
  }) as FakeElement;

  const header = element.children[0] as FakeElement;
  const toolbar = header.children[1] as FakeElement;
  const scopeSwitch = toolbar.children[2] as FakeElement;
  const labels = scopeSwitch.children.map(
    (child) => (child as FakeElement).children[0],
  );

  assert.deepEqual(labels, ["Day", "Month", "Year"]);
  const yearButton = scopeSwitch.children[2] as FakeElement;
  (yearButton.props.onClick as () => void)();
  assert.equal(nextScope, "year");
});

test("createBrowseListControls can hide day and year calendar scope options", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  const element = BrowseListControls({
    heading: "Campaigns",
    viewMode: "calendar",
    calendarScope: "month",
    showCalendarDayOption: false,
    showCalendarYearOption: false,
    searchValue: "",
    searchPlaceholder: "Search campaigns...",
    onSearchChange: () => undefined,
    onViewModeChange: () => undefined,
    onExportToExcel: () => undefined,
    allowCalendarView: true,
  }) as FakeElement;

  const header = element.children[0] as FakeElement;
  const toolbar = header.children[1] as FakeElement;
  // Export + view switch only — scope switch hidden when only Month remains.
  assert.equal(toolbar.children.length, 2);
});

test("createBrowseListControls renders filters and wires select change handlers", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  let nextValue = "";
  const element = BrowseListControls({
    heading: "Campaigns",
    viewMode: "table",
    searchValue: "",
    searchPlaceholder: "Search campaigns...",
    onSearchChange: () => undefined,
    onViewModeChange: () => undefined,
    onExportToExcel: () => undefined,
    filters: [
      {
        id: "statusFilter",
        label: "Filter by status",
        value: "",
        options: [
          { label: "All Statuses", value: "" },
          { label: "Active", value: "Active" },
        ],
        onChange: (value) => {
          nextValue = value;
        },
      },
    ],
  }) as FakeElement;

  const listControls = element.children[1] as FakeElement;
  const filterGroup = listControls.children[1] as FakeElement;
  const select = filterGroup.children[1] as FakeElement;

  const onChange = select.props.onChange as (event: {
    target: { value: string };
  }) => void;
  onChange({ target: { value: "Active" } });

  assert.equal(nextValue, "Active");
});
