import { useId } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

const TEXT = { left: "text-left", right: "text-right", center: "text-center" };
const JUSTIFY = { left: "justify-start", right: "justify-end", center: "justify-center" };

// Shared table. From md up it's a table; below that each row becomes a card, so
// nothing needs horizontal scrolling on a phone. The page owns the data
// (filtering, sorting) and describes each column as
//   { key, label, align, sortable, hint, primary, footer, cell(row) }
// primary: the card title (one per table).
// footer: shown at the bottom of the card without a label, e.g. an action.
export default function DataTable({ columns, rows, sort, onSort, rowKey, minWidth = 820, empty = "No results." }) {
  const sortId = useId();
  const sortable = columns.filter((c) => c.sortable);
  const primary = columns.find((c) => c.primary);
  const body = columns.filter((c) => !c.primary && !c.footer);
  const footer = columns.filter((c) => c.footer);
  const activeSort = sortable.find((c) => c.key === sort?.key);

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
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

      <div className="md:hidden">
        {sortable.length > 0 && (
          <div className="flex items-center gap-sm px-md py-3 border-b border-border-dark">
            <label htmlFor={sortId} className="font-label-caps text-label-caps text-text-muted-dark shrink-0">
              Sort by
            </label>
            <select
              id={sortId}
              value={activeSort?.key ?? ""}
              onChange={(e) => onSort(e.target.value)}
              className="flex-1 min-w-0 bg-background-dark border border-border-dark rounded py-1.5 px-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container"
            >
              {!activeSort && <option value="" disabled>Choose a column</option>}
              {sortable.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            {activeSort && (
              <button
                type="button"
                onClick={() => onSort(activeSort.key)}
                aria-label={`Sort ${activeSort.label} ${sort.dir === "asc" ? "descending" : "ascending"}`}
                className="shrink-0 p-1.5 rounded border border-border-dark text-primary"
              >
                {sort.dir === "asc" ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
              </button>
            )}
          </div>
        )}

        <ul>
          {rows.map((row) => (
            <li key={rowKey(row)} className="px-md py-4 border-b border-border-dark/60">
              {primary && <div className="font-body-sm text-body-sm min-w-0">{primary.cell(row)}</div>}
              {body.length > 0 && (
                <dl className="mt-sm grid grid-cols-2 gap-x-md gap-y-sm font-body-sm text-body-sm">
                  {body.map((col) => (
                    <div key={col.key} className="min-w-0">
                      <dt className="font-label-caps text-label-caps text-text-muted-dark">{col.label}</dt>
                      <dd className="mt-0.5 text-on-surface">{col.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {footer.map((col) => (
                <div key={col.key} className="mt-md">{col.cell(row)}</div>
              ))}
            </li>
          ))}
          {rows.length === 0 && <li className="py-10 text-center text-text-muted-dark">{empty}</li>}
        </ul>
      </div>
    </>
  );
}
