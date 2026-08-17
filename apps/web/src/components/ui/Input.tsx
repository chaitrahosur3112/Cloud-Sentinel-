import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors
          bg-white dark:bg-gray-900
          border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:ring-red-400" : ""}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";