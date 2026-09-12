import { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, ...inputProps }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-river-900">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="rounded-none border border-river-900/30 bg-white px-3 py-2 text-ink placeholder:text-ink/40 focus:border-river-600 focus:outline-none focus:ring-2 focus:ring-river-600/30"
      />
      {error && <p className="text-sm text-gold-600">{error}</p>}
    </div>
  );
}
