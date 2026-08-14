"use client";

import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, className, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-brand-600 focus:ring-2 ${className ?? ""}`}
        {...props}
      />
    </label>
  );
}
