"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "info" | "success" | "warning" | "error";

type AnchorRect = { top: number; left: number; width?: number; height?: number } | null;

type ToastItem = {
  id: number;
  message: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  action?: () => void;
  anchorRect?: AnchorRect; // optional anchor coordinates
};

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ToastContextValue = {
  toast: (
    message: string,
    opts?: {
      type?: ToastType;
      duration?: number;
      actionLabel?: string;
      action?: () => void;
      anchorRect?: AnchorRect;
    }
  ) => void;
  confirm: (opts?: ConfirmOptions) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    resolve?: (v: boolean) => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }>({ open: false });

  const toast = useCallback(
    (
      message: string,
      opts?: {
        type?: ToastType;
        duration?: number;
        actionLabel?: string;
        action?: () => void;
        anchorRect?: AnchorRect;
      }
    ) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const item: ToastItem = {
        id,
        message,
        type: opts?.type || "info",
        duration: opts?.duration ?? 5000,
        actionLabel: opts?.actionLabel,
        action: opts?.action,
        anchorRect: opts?.anchorRect ?? null,
      };
      setToasts((s) => [...s, item]);
      if (item.duration && item.duration > 0) {
        setTimeout(() => {
          setToasts((s) => s.filter((t) => t.id !== id));
        }, item.duration);
      }
    },
    []
  );

  const confirm = useCallback((opts?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        open: true,
        resolve,
        title: opts?.title,
        message: opts?.message,
        confirmLabel: opts?.confirmLabel || "Confirm",
        cancelLabel: opts?.cancelLabel || "Cancel",
      });
    });
  }, []);

  const closeConfirm = useCallback(
    (value: boolean) => {
      if (confirmState.resolve) confirmState.resolve(value);
      setConfirmState({ open: false });
    },
    [confirmState]
  );

  // Helper to compute style for a toast: anchored or top-right stack
  function toastStyleForAnchor(anchorRect?: AnchorRect, index = 0) {
    if (!anchorRect) {
      return {
        position: "fixed" as const,
        right: 16,
        top: `calc(var(--toast-top-offset, 5.25rem) + ${index * 56}px)`,
        pointerEvents: "auto" as const,
        zIndex: 9999,
      };
    }
    const gap = 8;
    const left = anchorRect.left + (anchorRect.width ?? 0) + gap;
    const top = anchorRect.top;
    return {
      position: "fixed" as const,
      left,
      top,
      pointerEvents: "auto" as const,
      zIndex: 9999,
      transform: "translateY(-8px)",
      minWidth: 200,
    };
  }

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Anchored toasts */}
      {toasts
        .filter((t) => t.anchorRect)
        .map((t) => (
          <div
            key={t.id}
            style={toastStyleForAnchor(t.anchorRect)}
            className="rounded-md shadow px-4 py-2 flex items-center justify-between gap-3"
            role="status"
            aria-live="polite"
          >
            <div className="text-sm break-words">{t.message}</div>
            <div className="flex items-center gap-2">
              {t.actionLabel && t.action && (
                <button
                  onClick={() => {
                    try {
                      t.action && t.action();
                    } finally {
                      setToasts((s) => s.filter((x) => x.id !== t.id));
                    }
                  }}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  {t.actionLabel}
                </button>
              )}
              <button
                onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))}
                className="text-xs px-2 py-1 rounded bg-transparent hover:bg-gray-100"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

      {/* Top-right stacked toasts */}
      <div
        style={{
          position: "fixed",
          right: 16,
          zIndex: 9999,
          pointerEvents: "none",
          top: "var(--toast-top-offset, 5.25rem)",
        }}
      >
        {toasts
          .filter((t) => !t.anchorRect)
          .map((t, i) => (
            <div
              key={t.id}
              style={{ pointerEvents: "auto", marginBottom: 8 }}
              className={`max-w-sm w-full rounded-md shadow px-4 py-2 flex items-center justify-between gap-3 ${
                t.type === "error"
                  ? "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100"
                  : t.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : t.type === "warning"
                  ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                  : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="text-sm break-words">{t.message}</div>
              <div className="flex items-center gap-2">
                {t.actionLabel && t.action && (
                  <button
                    onClick={() => {
                      try {
                        t.action && t.action();
                      } finally {
                        setToasts((s) => s.filter((x) => x.id !== t.id));
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    {t.actionLabel}
                  </button>
                )}
                <button
                  onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))}
                  className="text-xs px-2 py-1 rounded bg-transparent hover:bg-gray-100"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Confirm modal */}
      {confirmState.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-medium mb-2">{confirmState.title || "Confirm"}</div>
            <div className="text-sm text-gray-600 mb-4">{confirmState.message || "Are you sure?"}</div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => closeConfirm(false)}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
              >
                {confirmState.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                {confirmState.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
