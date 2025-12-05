// // services/toasterService.ts
// import { toast, ToastContentProps } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export const showSuccess = (message: string) => toast.success(message);
// export const showError = (message: string) => toast.error(message);

// export const showWarn = (
//   message: string | ((props: ToastContentProps) => React.ReactNode),
//   options = {}
// ) => toast.warn(message, options);

import { toast, ToastContentProps, ToastOptions } from "react-toastify";

// Helper to safely show toast once
const showToastOnce = (
  type: 'success' | 'error' | 'warn',
  message: string | ((props: ToastContentProps) => React.ReactNode),
  options: ToastOptions = {}
) => {
  const toastId = typeof message === 'string' ? message : `${type}-toast`;

  if (!toast.isActive(toastId)) {
    toast[type](message as any, {
      toastId,
      ...options,
    });
  }
};

// Show Success Toast (green)
export const showSuccess = (
  message: string | ((props: ToastContentProps) => React.ReactNode),
  options: ToastOptions = {}
) => showToastOnce('success', message, options);

// Show Error Toast (red)
export const showError = (
  message: string | ((props: ToastContentProps) => React.ReactNode),
  options: ToastOptions = {}
) => showToastOnce('error', message, options);

// Show Warning Toast (yellow)
export const showWarn = (
  message: string | ((props: ToastContentProps) => React.ReactNode),
  options: ToastOptions = {}
) => showToastOnce('warn', message, options);
