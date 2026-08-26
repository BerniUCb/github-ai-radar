export default function SectionCard({ title, subtitle, actions, className = "", children }) {
  return (
    <div className={`bg-surface-dark border border-border-dark rounded-xl p-lg ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-start mb-lg gap-md">
          <div>
            {title && <h2 className="font-headline-md text-headline-md text-text-primary-dark">{title}</h2>}
            {subtitle && <p className="font-body-sm text-body-sm text-text-muted-dark mt-1">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
