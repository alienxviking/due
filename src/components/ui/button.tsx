"use client";

import type { HTMLMotionProps } from "motion/react";
import { RippleButton, RippleButtonRipples } from "@/components/animate-ui/primitives/buttons/ripple";
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering";
import { tap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-accent text-white shadow-[0_8px_24px_-8px_var(--accent)]",
  success: "bg-ok text-white dark:text-bg",
  soft: "bg-surface-2 text-text",
  ghost: "bg-transparent text-muted",
} as const;

const RIPPLE = {
  primary: "rgb(255 255 255 / 0.45)",
  success: "rgb(255 255 255 / 0.45)",
  soft: "color-mix(in oklab, var(--text) 18%, transparent)",
  ghost: "color-mix(in oklab, var(--text) 12%, transparent)",
} as const;

type Props = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: keyof typeof VARIANTS;
  size?: "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
};

/** Animate UI ripple button, styled for Due. Shows shimmering text while loading. */
export function Button({ variant = "primary", size = "md", loading, loadingText = "Saving…", className, children, disabled, onClick, ...props }: Props) {
  return (
    <RippleButton
      hoverScale={1}
      tapScale={0.96}
      disabled={disabled || loading}
      onClick={(e) => {
        tap();
        onClick?.(e);
      }}
      className={cn(
        "relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden font-semibold outline-none transition-[opacity,background-color] focus-visible:ring-4 focus-visible:ring-accent/25 disabled:opacity-60",
        size === "lg" ? "rounded-2xl px-5 py-4 text-[15px]" : "rounded-xl px-3.5 py-2.5 text-sm",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <ShimmeringText
          text={loadingText}
          duration={1.1}
          color={variant === "soft" || variant === "ghost" ? "var(--muted)" : "rgb(255 255 255 / 0.7)"}
          shimmeringColor={variant === "soft" || variant === "ghost" ? "var(--text)" : "#fff"}
        />
      ) : (
        children
      )}
      <RippleButtonRipples color={RIPPLE[variant]} />
    </RippleButton>
  );
}
