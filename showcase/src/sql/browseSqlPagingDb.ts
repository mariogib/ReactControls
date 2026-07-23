/**
 * In-browser SQLite demo for BrowseListControls database paging.
 *
 * Schema: regions → customers → orders → order_items ← products
 * Page fetch: joined SELECT with stable ORDER BY + LIMIT/OFFSET
 * Count fetch: same joins/filters with COUNT(*)
 *
 * Pair with createBrowseLoadedPages / loadBrowsePage so each pageIndex
 * is queried at most once until filters or pageSize change.
 */
import initSqlJs, { type Database, type SqlJsStatic, type SqlValue } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

export type OrderLineRow = {
  lineId: number;
  orderId: number;
  orderedAt: string;
  orderStatus: string;
  customerName: string;
  regionName: string;
  sku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type BrowseSqlQueryMeta = {
  sql: string;
  params: SqlValue[];
  elapsedMs: number;
  rowCount: number;
};

export type BrowseSqlPageResult = {
  rows: OrderLineRow[];
  meta: BrowseSqlQueryMeta;
};

export type BrowseSqlCountResult = {
  totalCount: number;
  meta: BrowseSqlQueryMeta;
};

const REGION_NAMES = [
  "Northern Cape",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
];

const PRODUCT_NAMES = [
  "Lunar Pass",
  "Orbit Kit",
  "Nebula Pack",
  "Comet Badge",
  "Solar Bundle",
  "Eclipse Addon",
  "Meteor Cap",
  "Galaxy Mug",
];

const ORDER_STATUSES = ["open", "paid", "shipped", "cancelled"] as const;

let sqlPromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
  }
  return sqlPromise;
}

function runExec(db: Database, sql: string) {
  db.run(sql);
}

function seedDatabase(db: Database) {
  runExec(
    db,
    `
    PRAGMA foreign_keys = ON;

    CREATE TABLE regions (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      region_id INTEGER NOT NULL REFERENCES regions(id),
      status TEXT NOT NULL
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      unit_price REAL NOT NULL
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      ordered_at TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      qty INTEGER NOT NULL,
      unit_price REAL NOT NULL
    );
  `,
  );

  const insert = db.prepare("INSERT INTO regions (id, name) VALUES (?, ?)");
  REGION_NAMES.forEach((name, index) => {
    insert.run([index + 1, name]);
  });
  insert.free();

  const insertProduct = db.prepare(
    "INSERT INTO products (id, sku, name, unit_price) VALUES (?, ?, ?, ?)",
  );
  PRODUCT_NAMES.forEach((name, index) => {
    insertProduct.run([
      index + 1,
      `SKU-${String(index + 1).padStart(3, "0")}`,
      name,
      49 + index * 17,
    ]);
  });
  insertProduct.free();

  const insertCustomer = db.prepare(
    "INSERT INTO customers (id, name, region_id, status) VALUES (?, ?, ?, ?)",
  );
  for (let id = 1; id <= 120; id += 1) {
    insertCustomer.run([
      id,
      `Customer ${id}`,
      ((id - 1) % REGION_NAMES.length) + 1,
      id % 7 === 0 ? "inactive" : "active",
    ]);
  }
  insertCustomer.free();

  const insertOrder = db.prepare(
    "INSERT INTO orders (id, customer_id, ordered_at, status) VALUES (?, ?, ?, ?)",
  );
  const insertItem = db.prepare(
    "INSERT INTO order_items (id, order_id, product_id, qty, unit_price) VALUES (?, ?, ?, ?, ?)",
  );

  let orderId = 1;
  let lineId = 1;
  // ~4,800 joined line rows: enough to feel “large” while seeding quickly in-browser.
  for (let day = 0; day < 200; day += 1) {
    for (let batch = 0; batch < 4; batch += 1) {
      const customerId = ((orderId - 1) % 120) + 1;
      const status = ORDER_STATUSES[(orderId - 1) % ORDER_STATUSES.length];
      const orderedAt = `2025-${String((day % 12) + 1).padStart(2, "0")}-${String(
        (day % 28) + 1,
      ).padStart(2, "0")}T${String(8 + batch).padStart(2, "0")}:00:00Z`;
      insertOrder.run([orderId, customerId, orderedAt, status]);

      const lineCount = 2 + (orderId % 5);
      for (let line = 0; line < lineCount; line += 1) {
        const productId = ((orderId + line - 1) % PRODUCT_NAMES.length) + 1;
        const unitPrice = 49 + ((productId - 1) * 17);
        insertItem.run([lineId, orderId, productId, 1 + ((line + orderId) % 4), unitPrice]);
        lineId += 1;
      }
      orderId += 1;
    }
  }

  insertOrder.free();
  insertItem.free();

  runExec(
    db,
    `
    CREATE INDEX idx_orders_customer ON orders(customer_id);
    CREATE INDEX idx_orders_status_date ON orders(status, ordered_at);
    CREATE INDEX idx_order_items_order ON order_items(order_id);
    CREATE INDEX idx_order_items_product ON order_items(product_id);
    CREATE INDEX idx_customers_region ON customers(region_id);
  `,
  );
}

/** Shared in-browser SQLite DB (sql.js). Created once per page load. */
export function getBrowseSqlDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await getSqlJs();
      const db = new SQL.Database();
      seedDatabase(db);
      return db;
    })();
  }
  return dbPromise;
}

const JOINED_FROM = `
  FROM order_items oi
  INNER JOIN orders o ON o.id = oi.order_id
  INNER JOIN customers c ON c.id = o.customer_id
  INNER JOIN regions r ON r.id = c.region_id
  INNER JOIN products p ON p.id = oi.product_id
`;

const JOINED_WHERE = `
  WHERE (?1 = '' OR lower(c.name) LIKE '%' || lower(?1) || '%'
               OR lower(p.name) LIKE '%' || lower(?1) || '%'
               OR lower(p.sku) LIKE '%' || lower(?1) || '%'
               OR lower(r.name) LIKE '%' || lower(?1) || '%')
    AND (?2 = '' OR o.status = ?2)
`;

export const BROWSE_SQL_PAGE_QUERY = `
SELECT
  oi.id AS line_id,
  o.id AS order_id,
  o.ordered_at,
  o.status AS order_status,
  c.name AS customer_name,
  r.name AS region_name,
  p.sku,
  p.name AS product_name,
  oi.qty,
  oi.unit_price,
  (oi.qty * oi.unit_price) AS line_total
${JOINED_FROM}
${JOINED_WHERE}
ORDER BY o.ordered_at DESC, oi.id ASC
LIMIT ?3 OFFSET ?4
`.trim();

export const BROWSE_SQL_COUNT_QUERY = `
SELECT COUNT(*) AS total_count
${JOINED_FROM}
${JOINED_WHERE}
`.trim();

function mapRow(values: SqlValue[]): OrderLineRow {
  return {
    lineId: Number(values[0]),
    orderId: Number(values[1]),
    orderedAt: String(values[2]),
    orderStatus: String(values[3]),
    customerName: String(values[4]),
    regionName: String(values[5]),
    sku: String(values[6]),
    productName: String(values[7]),
    qty: Number(values[8]),
    unitPrice: Number(values[9]),
    lineTotal: Number(values[10]),
  };
}

function timedQuery(
  db: Database,
  sql: string,
  params: SqlValue[],
): { values: SqlValue[][]; elapsedMs: number } {
  const started = performance.now();
  const statement = db.prepare(sql);
  statement.bind(params);
  const values: SqlValue[][] = [];
  while (statement.step()) {
    values.push(statement.get());
  }
  statement.free();
  return {
    values,
    elapsedMs: Math.round((performance.now() - started) * 100) / 100,
  };
}

/** COUNT(*) for the filtered join — run when filters change, not per page revisit. */
export async function countBrowseSqlRows(
  search: string,
  status: string,
): Promise<BrowseSqlCountResult> {
  const db = await getBrowseSqlDatabase();
  const params = [search.trim(), status.trim()];
  const { values, elapsedMs } = timedQuery(db, BROWSE_SQL_COUNT_QUERY, params);
  const totalCount = Number(values[0]?.[0] ?? 0);
  return {
    totalCount,
    meta: {
      sql: BROWSE_SQL_COUNT_QUERY,
      params,
      elapsedMs,
      rowCount: 1,
    },
  };
}

/**
 * Fetch one page with OFFSET/LIMIT. Call only when that pageIndex is not
 * already in the loadedPages cache.
 */
export async function fetchBrowseSqlPage(
  pageIndex: number,
  pageSize: number,
  search: string,
  status: string,
): Promise<BrowseSqlPageResult> {
  const db = await getBrowseSqlDatabase();
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const index = Math.max(0, Math.floor(pageIndex) || 0);
  const params = [search.trim(), status.trim(), size, index * size];
  const { values, elapsedMs } = timedQuery(db, BROWSE_SQL_PAGE_QUERY, params);
  const rows = values.map(mapRow);
  return {
    rows,
    meta: {
      sql: BROWSE_SQL_PAGE_QUERY,
      params,
      elapsedMs,
      rowCount: rows.length,
    },
  };
}

export function formatMoney(value: number): string {
  return `R ${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
