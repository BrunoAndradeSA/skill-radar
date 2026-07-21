import { useState, useCallback, useRef } from 'react';

export function useFormGuard() {
  const [isDirty, setIsDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmActionRef = useRef<(() => void) | null>(null);

  const guardAction = useCallback((onConfirm: () => void) => {
    if (isDirty) {
      confirmActionRef.current = onConfirm;
      setConfirmOpen(true);
    } else {
      onConfirm();
    }
  }, [isDirty]);

  const handleConfirm = useCallback(() => {
    setConfirmOpen(false);
    setIsDirty(false);
    confirmActionRef.current?.();
    confirmActionRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    confirmActionRef.current = null;
  }, []);

  return { isDirty, setIsDirty, confirmOpen, guardAction, handleConfirm, handleCancel };
}
