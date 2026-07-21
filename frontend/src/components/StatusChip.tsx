import React from 'react';
import Chip from '@mui/material/Chip';
import type { AssessmentStatus } from '../models/enums/AssessmentStatus';

type ChipColor = 'default' | 'info' | 'success' | 'error' | 'warning';

interface StatusChipProps {
  status: AssessmentStatus | 'USED' | 'EXPIRED' | 'PENDING';
  size?: 'small' | 'medium';
  sx?: Record<string, unknown>;
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Não Iniciada',
  IN_PROGRESS: 'Em Andamento',
  FINISHED: 'Finalizada',
  TERMINATED: 'Encerrada',
  REJECTED: 'Rejeitada',
  USED: 'Usado',
  EXPIRED: 'Expirado',
  PENDING: 'Pendente',
};

const statusColors: Record<string, ChipColor> = {
  NOT_STARTED: 'default',
  IN_PROGRESS: 'info',
  FINISHED: 'success',
  TERMINATED: 'error',
  REJECTED: 'error',
  USED: 'success',
  EXPIRED: 'error',
  PENDING: 'warning',
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small', sx }) => (
  <Chip
    label={statusLabels[status] || status}
    color={statusColors[status] || 'default'}
    size={size}
    variant="outlined"
    sx={sx}
  />
);
