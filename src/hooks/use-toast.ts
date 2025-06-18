import { useState, useCallback } from 'react';

interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: []
};

export function useToast() {
  const [state, setState] = useState<ToastState>(initialState);

  const toast = useCallback(({ title, description, variant = 'default' }: Toast) => {
    const newToast = { title, description, variant };
    
    setState((prev) => ({
      ...prev,
      toasts: [...prev.toasts, newToast]
    }));

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        toasts: prev.toasts.filter(t => t !== newToast)
      }));
    }, 5000);
  }, []);

  const dismiss = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      toasts: prev.toasts.filter((_, i) => i !== index)
    }));
  }, []);

  return {
    toast,
    dismiss,
    toasts: state.toasts
  };
}