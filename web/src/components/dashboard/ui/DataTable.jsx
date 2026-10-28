import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

const TEXT = { left: "text-left", right: "text-right", center: "text-center" };
const JUSTIFY = { left: "justify-start", right: "justify-end", center: "justify-center" };

// Shared table shell: one header style, one row rhythm, one sort control. The
// page owns the data (filtering, sorting) and describes each column as
//   { key, label, align, sortable, hint, cell(row) }
export default function DataTable({ columns, rows, sort, onSort, rowKey, minWidth = 820, empty = "No results." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-border-dark bg-surface-container-low">
            {columns.map((col) => {
              const align = col.align ?? "left";
              const active = sort?.key === col.key;
              const SortIcon = !active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={!col.sortable ? undefined : active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  className={`p-0 font-label-caps text-label-caps font-medium text-text-muted-dark ${TEXT[align]}`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      title={col.hint ?? `Sort by ${col.label}`}
                      className={`group w-full py-3 px-md flex items-center gap-1.5 ${JUSTIFY[align]} hover:text-on-surface transition-colors ${active ? "text-on-surface" : ""}`}
                    >
                      <span>{col.label}</span>
                      <SortIcon
                        size={13}
                        aria-hidden="true"
                        className={active ? "text-primary" : "text-outline-variant opacity-0 group-hover:opacity-100 transition-opacity"}
                      />
                    </button>
                  ) : (
                    <span title={col.hint} className="block py-3 px-md">{col.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark/60 font-body-sm text-body-sm text-on-surface">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="group hover:bg-surface-container/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`py-4 px-md ${TEXT[col.align ?? "left"]}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-text-muted-dark">{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
