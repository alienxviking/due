"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** UIAlertController with a text field (used to give a reject reason). */
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-[52px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.form
            role="alertdialog"
            aria-label={title}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            onSubmit={(e) => {
              e.preventDefault();
              onConfirm(text);
            }}
            className="w-full max-w-[270px] overflow-hidden rounded-[14px] bg-bar text-center backdrop-blur-2xl backdrop-saturate-150"
          >
            <div className="px-4 pt-5 pb-4">
              <p className="text-[17px] font-semibold leading-[22px]">{title}</p>
              {message && <p className="mt-0.5 text-[13px] leading-4">{message}</p>}
              <input
                ref={input}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={300}
                placeholder={placeholder}
                className="mt-3.5 w-full rounded-[7px] border-[0.5px] border-sep bg-cell px-2 py-1.5 text-[13px] outline-none"
              />
            </div>
            <div className="hairline-t grid grid-cols-2">
              <button type="button" onClick={onCancel} className="py-[11px] text-[17px] text-tint active:bg-fill">
                Cancel
              </button>
              <button className={`border-l-[0.5px] border-sep py-[11px] text-[17px] font-semibold active:bg-fill ${destructive ? "text-red" : "text-tint"}`}>
                {confirmLabel}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
