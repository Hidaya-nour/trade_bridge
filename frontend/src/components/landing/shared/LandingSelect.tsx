// LandingSelect.tsx
// LandingSelect.tsx
import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface LandingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
}

const LandingSelect = ({
  label,
  options,
  error,
  fullWidth = true,
  className = "",
  id,
  ...props
}: LandingSelectProps) => {
  // eslint-disable-next-line react-hooks/purity
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
          focus:border-transparent outline-none transition-colors
          ${error ? "border-red-500" : "border-gray-300"}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LandingSelect;
