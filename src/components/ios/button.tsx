"use client";

import { Spinner } from "./spinner";
import { tap } from "@/lib/haptics";

/** Large filled button (iOS 15+ `.borderedProminent`, large control size). */
export function FilledButton({
  children,
  loading,
  variant = "tint",
  className = "",
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: "tint" | "gray" | "label" }) {
  const look = variant === "tint" ? "bg-tint text-white" : variant === "label" ? "bg-label text-bg" : "bg-fill text-tint";
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      onClick={(e) => {
        tap(6);
        onClick?.(e);
      }}
      className={`flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[14px] px-5 text-[17px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50 ${look} ${className}`}
    >
      {loading ? <Spinner size={20} /> : children}
    </button>
  );
}
