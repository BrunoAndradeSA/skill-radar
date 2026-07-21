import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

interface ToastData {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ToastNotificationProps {
  toast: ToastData;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => (
  <Snackbar
    open={toast.open}
    autoHideDuration={4000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert
      onClose={onClose}
      severity={toast.severity}
      variant="filled"
      sx={{ borderRadius: 2, minWidth: 280 }}
    >
      {toast.message}
    </Alert>
  </Snackbar>
);
