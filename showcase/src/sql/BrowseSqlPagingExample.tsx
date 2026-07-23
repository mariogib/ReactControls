import React from "react";
import {
  createBrowseListControls,
  createBrowseLoadedPages,
  createBrowseScrollSentinel,
  createStatusBadge,
  getBrowsePageCount,
  getNextBrowsePageToLoad,
  loadBrowsePage,
  type BrowsePagingMode,
} from "@lunarq/frontend-shared";
import {
  BROWSE_SQL_PAGE_QUERY,
  countBrowseSqlRows,
  fetchBrowseSqlPage,
  formatMoney,
  type BrowseSqlQueryMeta,
  type OrderLineRow,
} from "./browseSqlPagingDb";

const BrowseListControls = createBrowseListControls(React);
const BrowseScrollSentinel = createBrowseScrollSentinel(React);
const StatusBadge = createStatusBadge(React);

type PageCache = Map<number, OrderLineRow[]>;

/**
 * Showcase: SQLite (sql.js) large joined query with load-once page cache.
 * A page runs `OFFSET`/`LIMIT` only the first time it is displayed.
 */
export function BrowseSqlPagingExample() {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"table" | "grid" | "calendar">("table");
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [pagingMode, setPagingMode] = React.useState<BrowsePagingMode>("lazy");
  const [loadedPages, setLoadedPages] = React.useState(() => createBrowseLoadedPages(0));
  const [pageCache, setPageCache] = React.useState<PageCache>(() => new Map());
  const [totalCount, setTotalCount] = React.useState(0);
  const [loadingPage, setLoadingPage] = React.useState(false);
  const [lastMeta, setLastMeta] = React.useState<BrowseSqlQueryMeta | null>(null);
  const [queryLog, setQueryLog] = React.useState<string[]>([]);

  const pageCacheRef = React.useRef(pageCache);
  pageCacheRef.current = pageCache;
  const inFlightRef = React.useRef<Set<number>>(new Set());
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(searchValue.trim()), 200);
    return () => window.clearTimeout(handle);
  }, [searchValue]);

  const resetPaging = React.useCallback(() => {
    requestIdRef.current += 1;
    inFlightRef.current = new Set();
    setPageIndex(0);
    setLoadedPages(createBrowseLoadedPages(0));
    setPageCache(new Map());
  }, []);

  React.useEffect(() => {
    resetPaging();
  }, [debouncedSearch, statusFilter, pageSize, pagingMode, resetPaging]);

  React.useEffect(() => {
    let cancelled = false;
    const requestId = requestIdRef.current;
    void (async () => {
      try {
        const count = await countBrowseSqlRows(debouncedSearch, statusFilter);
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }
        setTotalCount(count.totalCount);
        setLastMeta(count.meta);
        setQueryLog((previous) =>
          [`COUNT(*) = ${count.totalCount} · ${count.meta.elapsedMs}ms`, ...previous].slice(0, 8),
        );
        setReady(true);
        setError(null);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Failed to open SQLite database");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter]);

  const ensurePageLoaded = React.useCallback(
    async (targetPage: number) => {
      if (targetPage < 0) {
        return;
      }
      if (pageCacheRef.current.has(targetPage)) {
        setLoadedPages((previous) => loadBrowsePage(previous, targetPage));
        return;
      }
      if (inFlightRef.current.has(targetPage)) {
        return;
      }

      const requestId = requestIdRef.current;
      inFlightRef.current.add(targetPage);
      setLoadingPage(true);
      try {
        const result = await fetchBrowseSqlPage(
          targetPage,
          pageSize,
          debouncedSearch,
          statusFilter,
        );
        if (requestId !== requestIdRef.current) {
          return;
        }
        setPageCache((previous) => {
          if (previous.has(targetPage)) {
            return previous;
          }
          const next = new Map(previous);
          next.set(targetPage, result.rows);
          return next;
        });
        setLoadedPages((previous) => loadBrowsePage(previous, targetPage));
        setLastMeta(result.meta);
        setQueryLog((previous) =>
          [
            `SELECT page ${targetPage + 1} · OFFSET ${targetPage * pageSize} LIMIT ${pageSize} · ${result.meta.rowCount} rows · ${result.meta.elapsedMs}ms`,
            ...previous,
          ].slice(0, 8),
        );
      } catch (cause) {
        if (requestId === requestIdRef.current) {
          setError(cause instanceof Error ? cause.message : "Page query failed");
        }
      } finally {
        inFlightRef.current.delete(targetPage);
        if (requestId === requestIdRef.current) {
          setLoadingPage(false);
        }
      }
    },
    [debouncedSearch, pageSize, statusFilter],
  );

  React.useEffect(() => {
    if (!ready) {
      return;
    }
    void ensurePageLoaded(pageIndex);
  }, [ensurePageLoaded, pageIndex, ready]);

  const pageCount = getBrowsePageCount(totalCount, pageSize);
  const nextScrollPage = getNextBrowsePageToLoad(loadedPages, pageCount);

  const visibleRows = React.useMemo(() => {
    if (pagingMode === "scroll") {
      const rows: OrderLineRow[] = [];
      for (const index of [...loadedPages].sort((a, b) => a - b)) {
        const pageRows = pageCache.get(index);
        if (pageRows) {
          rows.push(...pageRows);
        }
      }
      return rows;
    }
    return pageCache.get(pageIndex) ?? [];
  }, [loadedPages, pageCache, pageIndex, pagingMode]);

  if (error) {
    return (
      <div className="showcase-browse-surface">
        <p className="showcase-browse-meta">SQLite demo failed: {error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="showcase-browse-surface">
        <p className="showcase-browse-meta">
          Seeding in-browser SQLite (~4.8k joined order lines across 5 tables)…
        </p>
      </div>
    );
  }

  return (
    <div className="showcase-browse-surface showcase-sql-paging">
      <BrowseListControls
        heading="Order lines (SQLite join)"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        allowCalendarView={false}
        searchValue={searchValue}
        searchPlaceholder="Search customer, product, SKU, region..."
        onSearchChange={setSearchValue}
        onExportToExcel={() => undefined}
        filters={[
          {
            id: "sql-paging-mode",
            label: "Paging mode",
            value: pagingMode,
            onChange: (value) => {
              setPagingMode(
                value === "scroll" ? "scroll" : value === "pages" ? "pages" : "lazy",
              );
            },
            options: [
              { value: "lazy", label: "Lazy pages (load once)" },
              { value: "pages", label: "Pages (also cached here)" },
              { value: "scroll", label: "Scroll load once" },
            ],
          },
          {
            id: "sql-status-filter",
            label: "Order status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "", label: "All statuses" },
              { value: "open", label: "open" },
              { value: "paid", label: "paid" },
              { value: "shipped", label: "shipped" },
              { value: "cancelled", label: "cancelled" },
            ],
          },
        ]}
        paging={{
          mode: pagingMode,
          pageSize,
          pageSizeOptions: [10, 25, 50],
          pageIndex,
          totalCount,
          loadedPages: pagingMode === "pages" ? undefined : loadedPages,
          onPageIndexChange: (next) => {
            setPageIndex(next);
          },
          onPageSizeChange: setPageSize,
        }}
      />

      <p className="showcase-browse-meta">
        {loadingPage ? "Querying SQLite…" : "Ready"} · {totalCount.toLocaleString()} matching
        lines · loaded [{[...loadedPages].sort((a, b) => a - b).join(", ")}] · cached pages{" "}
        {pageCache.size}/{pageCount}. Revisit a page — no second SELECT.
      </p>

      <div className="showcase-sql-log" aria-label="Recent SQL activity">
        <strong>DB activity (load-once)</strong>
        <ul>
          {queryLog.length === 0 ? <li>No queries yet</li> : null}
          {queryLog.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
        <pre className="showcase-sql-pre">
          {lastMeta
            ? `${lastMeta.sql}

-- params: ${JSON.stringify(lastMeta.params)}
-- ${lastMeta.elapsedMs}ms · ${lastMeta.rowCount} row(s)`
            : BROWSE_SQL_PAGE_QUERY}
        </pre>
      </div>

      {viewMode === "grid" ? (
        <div className="showcase-browse-grid-preview">
          {visibleRows.map((row) => (
            <div key={row.lineId} className="showcase-browse-tile">
              <strong>
                #{row.orderId} · {row.productName}
              </strong>
              <span>
                {row.customerName} · {row.regionName}
              </span>
              <StatusBadge status={row.orderStatus} />
              <span>{formatMoney(row.lineTotal)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="browse-table-wrap">
          <table className="browse-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Region</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>{loadingPage ? "Loading page…" : "No rows"}</td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr key={row.lineId}>
                    <td className="browse-table-primary">#{row.orderId}</td>
                    <td>{row.customerName}</td>
                    <td>{row.regionName}</td>
                    <td>
                      {row.sku} · {row.productName}
                    </td>
                    <td>{row.qty}</td>
                    <td>{formatMoney(row.lineTotal)}</td>
                    <td>
                      <StatusBadge status={row.orderStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagingMode === "scroll" ? (
        <BrowseScrollSentinel
          enabled={nextScrollPage !== null && !loadingPage}
          loadKey={`${[...loadedPages].sort((a, b) => a - b).join(",")}:${nextScrollPage ?? "done"}`}
          onLoadMore={() => {
            if (nextScrollPage === null) {
              return;
            }
            setPageIndex(nextScrollPage);
            setLoadedPages((previous) => loadBrowsePage(previous, nextScrollPage));
            void ensurePageLoaded(nextScrollPage);
          }}
        />
      ) : null}
    </div>
  );
}
