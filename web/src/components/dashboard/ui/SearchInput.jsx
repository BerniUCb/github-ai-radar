import { Search } from "lucide-react";

// The one search field used by every list and table, so it looks and behaves
// the same everywhere.
export default function SearchInput({ value, onChange, placeholder, label, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-dark pointer-events-none" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full bg-background-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface placeholder-text-muted-dark focus:outline-none focus:border-primary-container transition-colors"
      />
    </div>
  );
}
