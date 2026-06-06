export type ToastType = "success" | "error" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastListener = (toasts: ToastItem[]) => void;

const listeners = new Set<ToastListener>();
let toasts: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function showToast(type: ToastType, message: string, durationMs = 3500) {
  const id = createId();
  toasts = [...toasts, { id, type, message }];
  emit();
  window.setTimeout(() => dismissToast(id), durationMs);
}

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

export function toastSuccess(message: string) {
  showToast("success", message);
}

export function toastError(message: string) {
  showToast("error", message);
}

export function toastWarning(message: string) {
  showToast("warning", message);
}
