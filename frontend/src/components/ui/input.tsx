import React, { forwardRef, useMemo, useState } from "react";

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "className" | "prefix"
  > {
  label: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      prefix,
      suffix,
      containerClassName = "",
      inputClassName = "",
      onFocus,
      onBlur,
      style: userStyle,
      ...rest
    },
    ref
  ) => {
    const { id: providedId, value, type = "text", ...inputAttributes } = rest;

    const inputId = useMemo(() => {
      if (providedId) return providedId;
      const normalized = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "");
      return normalized
        ? `input-${normalized}`
        : `input-${Math.random().toString(36).slice(2, 9)}`;
    }, [label, providedId]);

    const [isFocused, setIsFocused] = useState(false);

    const hasValue = useMemo(() => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return value.toString().length > 0;
    }, [value]);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const shrinkLabel = isFocused || hasValue;
    const paddingLeft = prefix ? "pl-14" : "pl-6";
    const paddingRight = suffix ? "pr-14" : "pr-6";

    const inputStyle: React.CSSProperties = {
      boxShadow: isFocused ? "0 10px 25px rgba(102, 126, 234, 0.2)" : "none",
      transform: isFocused ? "translateY(-2px)" : "translateY(0)",
      ...userStyle,
    };

    return (
      <div className={`relative mb-6 ${containerClassName}`}>
        {type === "password" && (
          <style>{`
            input[type="password"]::-webkit-contacts-auto-fill-button,
            input[type="password"]::-webkit-credentials-auto-fill-button,
            input[type="password"]::-ms-reveal {
              display: none !important;
            }
            input[type="password"] {
              -webkit-appearance: none;
            }
          `}</style>
        )}

        <label
          htmlFor={inputId}
          className={`absolute left-6 z-10 transition-all duration-300 pointer-events-none font-medium ${
            shrinkLabel
              ? "-top-2.5 text-xs bg-white px-2 text-purple-600"
              : "top-1/2 -translate-y-1/2 text-gray-600 text-base"
          }`}
        >
          {label}
        </label>

        {prefix && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          type={type}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full h-16 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:bg-white text-gray-800 transition-all duration-300 text-base ${inputClassName} ${paddingLeft} ${paddingRight}`}
          style={inputStyle}
          {...inputAttributes}
        />

        {suffix && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-auto">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
