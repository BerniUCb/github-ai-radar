// Loads the dataset the Python pipeline writes to `data.json` and exposes a few
// formatting helpers shared across the dashboard.

import { useEffect, useState } from "react";

export function useRadarData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`data.json ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(setError);
  }, []);

  return { data, error };
}

/** 45230 -> "45.2k", 1_200_000 -> "1.2M". */
export function human(n) {
  if (n == null) return "0";
  n = Number(n);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`.replace(".0M", "M");
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`.replace(".0k", "k");
  return `${Math.round(n)}`;
}

export const LANG_COLORS = {
  Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a", Rust: "#dea584",
  Go: "#00ADD8", "C++": "#f34b7d", C: "#555555", "Jupyter Notebook": "#DA5B0B",
  Java: "#b07219", Shell: "#89e051", HTML: "#e34c26", Ruby: "#701516",
  Swift: "#F05138", Kotlin: "#A97BFF",
};

export function langColor(lang) {
  return LANG_COLORS[lang] || "#8A92A6";
}
