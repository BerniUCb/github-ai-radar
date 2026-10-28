import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** Filter and sort state kept in the URL, so a view can be shared by copying
 *  the link. `defaults` must be a stable object (define it at module level).
 *  Values equal to their default are left out of the URL, and updates replace
 *  the current history entry so typing doesn't fill the back button.
 *  Change several keys in one call: two calls in the same event would overwrite
 *  each other. */
export function useUrlState(defaults) {
  const [params, setParams] = useSearchParams();

  const values = Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, params.get(key) ?? fallback])
  );

  const update = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === defaults[key] || value === "" || value == null) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace: true }
      );
    },
    [defaults, setParams]
  );

  return [values, update];
}

/** "momentum:asc" -> { key: "momentum", dir: "asc" }. Missing key = unsorted. */
export function parseSort(value) {
  const [key, dir] = (value || "").split(":");
  return { key: key || null, dir: dir === "asc" ? "asc" : "desc" };
}
