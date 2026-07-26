import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Info, Cookie } from 'lucide-react';

interface StorageItem {
  key: string;
  purpose: string;
  duration: string;
  type: string;
}

const STORAGE_ITEMS: StorageItem[] = [
  {
    key: 'user_session',
    purpose: 'Armazenar token de autenticação e dados do usuário logado.',
    duration: '30 dias ou até logout',
    type: 'localStorage',
  },
  {
    key: 'feature_flags',
    purpose: 'Armazenar preferências de funcionalidades do sistema.',
    duration: 'Indeterminado',
    type: 'localStorage',
  },
  {
    key: 'cookie_consent',
    purpose: 'Registrar seu consentimento para armazenamento local.',
    duration: 'Indeterminado',
    type: 'localStorage',
  },
  {
    key: 'exam_token',
    purpose: 'Armazenar token de acesso ao exame.',
    duration: 'Sessão (fechar navegador)',
    type: 'sessionStorage',
  },
  {
    key: 'exam_authenticated',
    purpose: 'Indicar que o candidato está autenticado no exame.',
    duration: 'Sessão (fechar navegador)',
    type: 'sessionStorage',
  },
  {
    key: 'session_expired',
    purpose: 'Sinalizar que a sessão expirou para exibir aviso.',
    duration: 'Sessão (fechar navegador)',
    type: 'sessionStorage',
  },
];

interface CookieConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onRevoke?: () => void;
}

export const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({ open, onClose, onRevoke }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: 3 } } }}
  >
    <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
        <Info size={16} className="text-teal-600 dark:text-teal-400" />
      </div>
      Cookies e Armazenamento Local
    </DialogTitle>
    <DialogContent>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        A plataforma Skill Radar utiliza exclusivamente armazenamento local no navegador
        para funcionamento. Nenhum dado é compartilhado com terceiros ou usado para
        rastreamento. Abaixo, a lista completa de itens armazenados:
      </p>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Chave</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Finalidade</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Duração</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STORAGE_ITEMS.map((item) => (
              <TableRow key={item.key}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {item.key}
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>{item.purpose}</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{item.duration}</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{item.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, justifyContent: onRevoke ? 'space-between' : 'flex-end' }}>
      {onRevoke && (
        <Button
          onClick={onRevoke}
          color="error"
          startIcon={<Cookie size={16} />}
          sx={{ borderRadius: 2, fontSize: '0.8rem' }}
        >
          Revogar Consentimento
        </Button>
      )}
      <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
        {onRevoke ? 'Fechar' : 'Entendi'}
      </Button>
    </DialogActions>
  </Dialog>
);
