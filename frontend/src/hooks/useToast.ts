import { useCallback, useState } from 'react';
import type { AlertColor } from '@mui/material/Alert';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return { toast, showToast, hideToast };
}
