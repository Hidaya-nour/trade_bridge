// LandingCheckbox.tsx
import type { InputHTMLAttributes, ReactNode } from "react";

interface LandingCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string | ReactNode;
}

const LandingCheckbox = ({
  label,
  className = "",
  id,
  ...props
}: LandingCheckboxProps) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={checkboxId}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      <label htmlFor={checkboxId} className="ml-2 text-sm text-gray-600">
        {label}
      </label>
    </div>
  );
};

export default LandingCheckbox;
