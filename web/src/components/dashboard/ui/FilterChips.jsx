// A row of toggle chips that picks one value out of a set. Chips wrap onto
// more lines when there are many, so nothing scrolls sideways.
export default function FilterChips({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1 rounded-full border font-label-caps text-label-caps transition-colors ${
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-dark text-text-muted-dark hover:border-outline-variant hover:text-on-surface"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
