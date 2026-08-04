/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";
import {
  createDataTable,
  nextDataTableSort,
  normalizeDataTableColumn,
  sortBrowseRows,
  type DataTableSortState,
} from "./createDataTable.js";
import { createFakeReact, type FakeElement } from "../testing/fakeReact.js";
import { sliceBrowsePage } from "./createBrowseListControls.js";

test("normalizeDataTableColumn keeps string headers non-sortable", () => {
  assert.deepEqual(normalizeDataTableColumn("Name", 0), {
    id: "col-0",
    header: "Name",
    sortable: false,
  });
});

test("nextDataTableSort toggles asc and desc on the same column", () => {
  assert.deepEqual(nextDataTableSort(null, "name"), {
    columnId: "name",
    direction: "asc",
  });
  assert.deepEqual(nextDataTableSort({ columnId: "name", direction: "asc" }, "name"), {
    columnId: "name",
    direction: "desc",
  });
  assert.deepEqual(nextDataTableSort({ columnId: "name", direction: "desc" }, "name"), {
    columnId: "name",
    direction: "asc",
  });
  assert.deepEqual(nextDataTableSort({ columnId: "name", direction: "desc" }, "status"), {
    columnId: "status",
    direction: "asc",
  });
});

test("sortBrowseRows sorts strings and numbers with nulls last", () => {
  const rows = [
    { name: "Charlie", score: 2 },
    { name: null as string | null, score: 1 },
    { name: "alice", score: 3 },
    { name: "Bob", score: null as number | null },
  ];

  const byName = sortBrowseRows(rows, { columnId: "name", direction: "asc" }, (row, id) =>
    id === "name" ? row.name : row.score,
  );
  assert.deepEqual(
    byName.map((row) => row.name),
    ["alice", "Bob", "Charlie", null],
  );

  const byScoreDesc = sortBrowseRows(
    rows,
    { columnId: "score", direction: "desc" },
    (row, id) => (id === "score" ? row.score : row.name),
  );
  assert.deepEqual(
    byScoreDesc.map((row) => row.score),
    [3, 2, 1, null],
  );
});

test("sortBrowseRows then sliceBrowsePage keeps lazy pages ordered globally", () => {
  const rows = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    name: `Item ${String.fromCharCode(74 - index)}`,
  }));
  const sorted = sortBrowseRows(rows, { columnId: "name", direction: "asc" }, (row) => row.name);
  const page0 = sliceBrowsePage(sorted, {
    mode: "lazy",
    pageIndex: 0,
    pageSize: 3,
    loadedPages: new Set([0]),
  });
  assert.deepEqual(
    page0.map((row) => row.name),
    ["Item A", "Item B", "Item C"],
  );
});

test("createDataTable renders plain string headers without buttons", () => {
  const react = createFakeReact();
  const DataTable = createDataTable(react);
  const element = DataTable({
    headers: ["Name", "Status"],
    children: null,
  }) as FakeElement;
  const table = element.children[0] as FakeElement;
  const thead = table.children[0] as FakeElement;
  const row = thead.children[0] as FakeElement;
  const firstTh = row.children[0] as FakeElement;
  assert.equal(firstTh.type, "th");
  assert.equal(firstTh.children[0], "Name");
  assert.equal(firstTh.props["aria-sort"], undefined);
});

test("createDataTable sortable header click toggles sort via onSortChange", () => {
  const react = createFakeReact();
  const DataTable = createDataTable(react);
  let sort: DataTableSortState = null;

  const render = () =>
    DataTable({
      headers: [
        { id: "name", header: "Name", sortable: true },
        { id: "status", header: "Status" },
      ],
      children: null,
      sort,
      onSortChange: (next) => {
        sort = next;
      },
      className: "browse-table",
    }) as FakeElement;

  let element = render();
  let table = element.children[0] as FakeElement;
  assert.equal(table.props.className, "browse-table");
  let row = (table.children[0] as FakeElement).children[0] as FakeElement;
  const nameTh = row.children[0] as FakeElement;
  const statusTh = row.children[1] as FakeElement;
  assert.equal(nameTh.props["aria-sort"], "none");
  assert.equal(statusTh.children[0], "Status");

  const nameButton = nameTh.children[0] as FakeElement;
  assert.equal(nameButton.type, "button");
  (nameButton.props.onClick as () => void)();
  assert.deepEqual(sort, { columnId: "name", direction: "asc" });

  element = render();
  table = element.children[0] as FakeElement;
  row = (table.children[0] as FakeElement).children[0] as FakeElement;
  const activeButton = (row.children[0] as FakeElement).children[0] as FakeElement;
  assert.equal((row.children[0] as FakeElement).props["aria-sort"], "ascending");
  (activeButton.props.onClick as () => void)();
  assert.deepEqual(sort, { columnId: "name", direction: "desc" });
});
