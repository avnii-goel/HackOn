"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = "success", visible, onClose }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (visible && mounted) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center px-8 py-3 rounded-full shadow-2xl font-semibold transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      } ${
        type === "error" ? "bg-slc-red text-white" : "bg-slc-leaf text-white"
      }`}
    >
      <span>{message}</span>
    </div>,
    document.body
  );
}

// Global Hook to use Toast easily anywhere
export function useToast() {
  const [toastConfig, setToastConfig] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastConfig({ message, type, visible: true });
  };

  const ToastComponent = () => (
    <Toast
      message={toastConfig.message}
      type={toastConfig.type}
      visible={toastConfig.visible}
      onClose={() => setToastConfig((prev) => ({ ...prev, visible: false }))}
    />
  );

  return { showToast, ToastComponent };
}
