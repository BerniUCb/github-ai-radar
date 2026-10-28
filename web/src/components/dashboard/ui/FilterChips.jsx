// A row of toggle chips that picks one value out of a set. Scrolls sideways
// when there are more options than fit, so long lists stay on one line.
export default function FilterChips({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1 rounded-full border font-label-caps text-label-caps whitespace-nowrap transition-colors ${
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
