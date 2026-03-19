import type { ReactNode } from "react";

interface LandingCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerContent?: ReactNode;
}

const LandingCard = ({
  title,
  subtitle,
  children,
  className = "",
  headerContent,
}: LandingCardProps) => {
  return (
    <section
      className={`bg-white border border-gray-200 rounded-3xl shadow-xl p-8 max-w-lg mx-auto ${className}`}
    >
      <header className="text-center mb-6">
        {headerContent ? (
          headerContent
        ) : (
          <>
            {title && (
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            )}
          </>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
};

export default LandingCard;
