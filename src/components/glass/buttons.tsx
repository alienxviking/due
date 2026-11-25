"use client";

import { Spinner } from "@/components/ios/spinner";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { tap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Btn = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

/** Primary action: Aceternity Hover Border Gradient (a light that travels around the border). */
export function GlowButton({ children, loading, className, onClick, disabled, type = "button", ...props }: Btn) {
  return (
    <HoverBorderGradient
      as="button"
      // HoverBorderGradient types its props as generic HTML attributes; these are real <button> props.
      {...({ type, disabled: disabled || loading } as React.HTMLAttributes<HTMLElement>)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        tap(8);
        onClick?.(e);
      }}
      containerClassName={cn("rounded-full disabled:opacity-50", className)}
      className="flex min-h-11 w-full items-center justify-center gap-2 bg-black px-6 text-[15px] font-semibold text-white"
      {...props}
    >
      {loading ? <Spinner size={18} /> : children}
    </HoverBorderGradient>
  );
}

/** Solid white pill (the brightest action on a screen). */
export function WhiteButton({ children, loading, className, onClick, ...props }: Btn) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      onClick={(e) => {
        tap(8);
        onClick?.(e);
      }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-black shadow-[0_0_30px_-8px_rgb(255_255_255/0.6)] transition-[transform,opacity] active:scale-[0.97] disabled:opacity-50",
        className,
      )}
    >
      {loading ? <Spinner size={18} /> : children}
    </button>
  );
}

/** Quiet glass pill. */
export function GhostButton({ children, className, onClick, tone, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "danger" }) {
  return (
    <button
      {...props}
      onClick={(e) => {
        tap(6);
        onClick?.(e);
      }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-[15px] font-medium transition-colors hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50",
        tone === "danger" ? "text-red" : "text-neutral-200",
        className,
      )}
    >
      {children}
    </button>
  );
}
