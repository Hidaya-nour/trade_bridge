import React, { forwardRef, useState } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
}

const LandingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isLoading = false,
      loadingText,
      startIcon,
      endIcon,
      variant = "primary",
      fullWidth = false,
      className = "",
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(event);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseDown?.(event);
    };

    const baseStyle: React.CSSProperties =
      variant === "primary"
        ? {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: isHovered
              ? "0 10px 30px rgba(102, 126, 234, 0.4)"
              : "0 0 rgba(0, 0, 0, 0.1)",
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          }
        : {};

    const mergedStyle = {
      ...baseStyle,
      ...style,
    };
    const isDisabled = Boolean(disabled) || isLoading;

    const spinner = (
      <svg
        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    const childContent = isLoading ? (
      <span className="ml-2 text-sm font-semibold">
        {loadingText ?? children}
      </span>
    ) : (
      <>
        {startIcon && <span className="mr-2">{startIcon}</span>}
        <span>{children}</span>
        {endIcon && <span className="ml-2">{endIcon}</span>}
      </>
    );

    return (
      <button
        ref={ref}
        className={`${
          fullWidth ? "w-full" : "inline-flex"
        } py-3 px-4 font-semibold rounded-xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 ${
          variant === "primary"
            ? "text-white"
            : variant === "outline"
              ? "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50"
              : "text-blue-600 bg-transparent hover:bg-blue-50"
        } ${className}`}
        style={mergedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        disabled={isDisabled}
        {...rest}
      >
        {isLoading ? (
          <>
            {spinner}
            {childContent}
          </>
        ) : (
          childContent
        )}
      </button>
    );
  }
);

LandingButton.displayName = "LandingButton";

export default LandingButton;
