import { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`bg-river-900 px-5 py-2.5 font-medium text-paper transition-colors hover:bg-river-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
