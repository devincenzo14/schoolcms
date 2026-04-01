"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
  exiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl shadow-xl text-white text-sm font-medium backdrop-blur-sm min-w-[280px] max-w-sm ${
              toast.exiting ? "animate-toast-out" : "animate-toast-in"
            } ${
              toast.type === "success"
                ? "bg-green-600/95"
                : "bg-red-600/95"
            }`}
          >
            {toast.type === "success" ? (
              <FiCheckCircle className="shrink-0" size={18} />
            ) : (
              <FiAlertCircle className="shrink-0" size={18} />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
