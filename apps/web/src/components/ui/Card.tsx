import { ReactNode } from "react";

interface Props {
  children:   ReactNode;
  className?: string;
  padding?:   boolean;
}

export function Card({ children, className = "", padding = true }: Props) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200
      dark:border-gray-800 shadow-sm ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}