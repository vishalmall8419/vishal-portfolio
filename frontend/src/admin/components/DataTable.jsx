import { FiSearch, FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import "./DataTable.css";

/**
 * columns: [{ key, label, render?: (row) => node, width?: string }]
 * actions: (row) => node  — rendered in the last cell
 */
export default function DataTable({
  columns,
  rows,
  loading,
  q,
  onSearch,
  pagination,
  onPageChange,
  actions,
  emptyMessage = "No records found.",
  searchPlaceholder = "Search…",
}) {
  return (
    <div className="admx-table-wrap admx-glass">
      <div className="admx-table-toolbar">
        <div className="admx-table-search">
          <FiSearch />
          <input
            type="text"
            placeholder={searchPlaceholder}
            defaultValue={q}
            onKeyDown={(e) => e.key === "Enter" && onSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="admx-table-scroll">
        <table className="admx-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width }}>
                  {c.label}
                </th>
              ))}
              {actions && <th style={{ width: 120 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="admx-loading-block">
                    <div className="admx-spinner" /> Loading…
                  </div>
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="admx-empty">
                    <FiInbox />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                  {actions && <td className="admx-table-actions">{actions(row)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="admx-table-pagination">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="admx-pagination-controls">
            <button
              className="admx-btn admx-btn-outline admx-btn-icon"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <FiChevronLeft />
            </button>
            <button
              className="admx-btn admx-btn-outline admx-btn-icon"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
