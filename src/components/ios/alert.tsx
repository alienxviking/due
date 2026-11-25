"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GhostButton, WhiteButton } from "@/components/glass/buttons";
import { fieldClass, GlowField } from "@/components/glass/input";

/** Glass dialog with a text field (used to give a reject reason). */
export function PromptAlert({
  open,
  title,
  message,
  placeholder,
  confirmLabel,
  destructive,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setTimeout(() => input.current?.focus(), 150);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.form
            role="dialog"
            aria-label={title}
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              onConfirm(text);
            }}
            className="w-full max-w-sm rounded-[24px] border border-white/10 bg-neutral-950/90 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl"
          >
            <p className="text-chrome text-xl font-bold">{title}</p>
            {message && <p className="mt-1.5 text-sm text-neutral-400">{message}</p>}
            <GlowField className="mt-5">
              <input ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder={placeholder} className={fieldClass} />
            </GlowField>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <GhostButton type="button" onClick={onCancel}>
                Cancel
              </GhostButton>
              <WhiteButton type="submit" className={destructive ? "!bg-red !text-black" : ""}>
                {confirmLabel}
              </WhiteButton>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
