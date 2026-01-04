interface SectionWrapperProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'muted' | 'dark';
}

export function SectionWrapper({
  id,
  eyebrow,
  title,
  children,
  className = '',
  background = 'default',
}: SectionWrapperProps) {
  const bgClass = {
    default: '',
    muted: 'bg-[var(--cockpit-carbon)]',
    dark: 'bg-[#0a0a0a]',
  }[background];

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${bgClass} ${className}`}
      style={{ scrollMarginTop: '80px' }}
    >
      <div className="container mx-auto max-w-6xl px-6">
        {eyebrow && (
          <div className="cockpit-label mb-2 text-xs uppercase tracking-wider">{eyebrow}</div>
        )}
        {title && <h2 className="cockpit-title mb-8 text-3xl md:text-4xl">{title}</h2>}
        {children}
      </div>
    </section>
  );
}
