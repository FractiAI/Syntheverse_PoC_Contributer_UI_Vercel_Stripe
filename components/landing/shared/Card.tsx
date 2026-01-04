interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', hover = true, padding = 'md' }: CardProps) {
  const paddingClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const hoverClass = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-[var(--hydrogen-amber)] hover:shadow-lg'
    : '';

  return (
    <div
      className={`cockpit-panel ${paddingClass} ${hoverClass} ${className}`}
      style={{
        border: '1px solid var(--keyline-primary)',
        borderRadius: '8px',
      }}
    >
      {children}
    </div>
  );
}

