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

test("createBrowseListControls renders page paging controls", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  let pageIndex = 0;
  let pageSize = 10;
  const element = BrowseListControls({
    heading: "Campaigns",
    viewMode: "table",
    searchValue: "",
    searchPlaceholder: "Search campaigns...",
    onSearchChange: () => undefined,
    onExportToExcel: () => undefined,
    showViewSwitch: false,
    showExportButton: false,
    showHeading: false,
    showSearch: false,
    paging: {
      mode: "pages",
      pageSize,
      pageIndex,
      totalCount: 35,
      onPageIndexChange: (value) => {
        pageIndex = value;
      },
      onPageSizeChange: (value) => {
        pageSize = value;
      },
    },
  }) as FakeElement;

  const paging = element.children.find(
    (child) =>
      child &&
      typeof child === "object" &&
      (child as FakeElement).props.className === "browse-paging",
  ) as FakeElement;
  assert.ok(paging);
  const nav = paging.children[2] as FakeElement;
  const nextButton = nav.children[2] as FakeElement;
  (nextButton.props.onClick as () => void)();
  assert.equal(pageIndex, 1);
});

test("createBrowseListControls lazy mode uses page navigation", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  let pageIndex = 0;
  const element = BrowseListControls({
    heading: "Campaigns",
    viewMode: "table",
    searchValue: "",
    searchPlaceholder: "Search...",
    onSearchChange: () => undefined,
    onExportToExcel: () => undefined,
    showViewSwitch: false,
    showExportButton: false,
    showHeading: false,
    showSearch: false,
    paging: {
      mode: "lazy",
      pageSize: 10,
      pageIndex,
      totalCount: 25,
      loadedPages: new Set([0]),
      onPageIndexChange: (value) => {
        pageIndex = value;
      },
    },
  }) as FakeElement;

  const paging = element.children.find(
    (child) =>
      child &&
      typeof child === "object" &&
      (child as FakeElement).props.className === "browse-paging",
  ) as FakeElement;
  const nav = paging.children[2] as FakeElement;
  const nextButton = nav.children[2] as FakeElement;
  (nextButton.props.onClick as () => void)();
  assert.equal(pageIndex, 1);
});

test("createBrowseListControls scroll mode shows scroll hint", () => {
  const ReactLike = createFakeReact();
  const BrowseListControls = createBrowseListControls(ReactLike);

  const element = BrowseListControls({
    heading: "Campaigns",
    viewMode: "table",
    searchValue: "",
    searchPlaceholder: "Search...",
    onSearchChange: () => undefined,
    onExportToExcel: () => undefined,
    showViewSwitch: false,
    showExportButton: false,
    showHeading: false,
    showSearch: false,
    paging: {
      mode: "scroll",
      pageSize: 10,
      pageIndex: 0,
      totalCount: 25,
      loadedPages: new Set([0]),
      onPageIndexChange: () => undefined,
    },
  }) as FakeElement;

  const paging = element.children.find(
    (child) =>
      child &&
      typeof child === "object" &&
      (child as FakeElement).props.className === "browse-paging",
  ) as FakeElement;
  const hint = paging.children[2] as FakeElement;
  assert.equal(hint.children[0], "Scroll to load more");
});

test("sliceBrowsePage loads only the displayed page for lazy mode", async () => {
  const {
    createBrowseLoadedPages,
    loadBrowsePage,
    sliceBrowsePage,
  } = await import("./createBrowseListControls.js");
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  assert.deepEqual(
    sliceBrowsePage(items, { mode: "pages", pageIndex: 1, pageSize: 3 }),
    [4, 5, 6],
  );

  let loaded = createBrowseLoadedPages(0);
  assert.deepEqual(
    sliceBrowsePage(items, {
      mode: "lazy",
      pageIndex: 0,
      pageSize: 3,
      loadedPages: loaded,
    }),
    [1, 2, 3],
  );
  assert.deepEqual(
    sliceBrowsePage(items, {
      mode: "lazy",
      pageIndex: 1,
      pageSize: 3,
      loadedPages: loaded,
    }),
    [],
  );

  const same = loadBrowsePage(loaded, 0);
  assert.equal(same, loaded);

  loaded = loadBrowsePage(loaded, 1);
  assert.deepEqual(
    sliceBrowsePage(items, {
      mode: "lazy",
      pageIndex: 1,
      pageSize: 3,
      loadedPages: loaded,
    }),
    [4, 5, 6],
  );
  assert.deepEqual(
    sliceBrowsePage(items, {
      mode: "scroll",
      pageIndex: 1,
      pageSize: 3,
      loadedPages: loaded,
    }),
    [1, 2, 3, 4, 5, 6],
  );
});
