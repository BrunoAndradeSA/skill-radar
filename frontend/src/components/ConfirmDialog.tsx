import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Trash2, type LucideIcon } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  icon?: LucideIcon;
  severity?: 'error' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Excluir',
  onConfirm,
  onCancel,
  loading = false,
  icon: Icon,
  severity = 'error',
}) => {
  const IconComponent = Icon ?? Trash2;
  const isError = severity === 'error';
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      slotProps={{ paper: { sx: { borderRadius: 3 }, role: 'dialog' } }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isError
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-amber-100 dark:bg-amber-900/30'
        }`}>
          <IconComponent size={16} className={
            isError ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
          } />
        </div>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading} sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color={isError ? 'error' : 'warning'} disabled={loading} sx={{ borderRadius: 2 }}>
          {loading ? (isError ? 'Excluindo...' : 'Descartando...') : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
