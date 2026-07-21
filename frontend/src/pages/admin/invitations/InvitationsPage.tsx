import React, { useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Plus, Mail, Link, Check, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useInvitations, useInvitationMutations } from '../../../hooks/useInvitations';
import { useTemplates } from '../../../hooks/useTemplates';
import { useCandidates } from '../../../hooks/useCandidates';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useFormGuard } from '../../../hooks/useFormGuard';

interface CandidateOption {
  id: string;
  name: string;
  email: string;
  cargo: string;
  nivel: string;
  squad: string;
  setor: string;
}

const InvitationsPage: React.FC = () => {
  const { data: invitations, isLoading, error } = useInvitations();
  const { data: templates } = useTemplates();
  const { data: candidates } = useCandidates();
  const { create } = useInvitationMutations();
  const [open, setOpen] = useState(false);
  const [candidate, setCandidate] = useState<CandidateOption | null>(null);
  const [templateId, setTemplateId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const formGuard = useFormGuard();

  const [filterCandidato, setFilterCandidato] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const filteredInvitations = useMemo(() => {
    if (!invitations) return [];
    return invitations.filter((inv) => {
      if (inv.selectionProcessId) return false;
      const q = filterCandidato.toLowerCase();
      if (filterCandidato && !inv.candidateName?.toLowerCase().includes(q) && !inv.candidateEmail?.toLowerCase().includes(q)) return false;

      if (filterStatus) {
        const now = new Date();
        const isUsed = inv.used;
        const isExpired = !isUsed && new Date(inv.expiresAt) < now;
        const isPending = !isUsed && !isExpired;
        if (filterStatus === 'used' && !isUsed) return false;
        if (filterStatus === 'expired' && !isExpired) return false;
        if (filterStatus === 'pending' && !isPending) return false;
      }

      const created = new Date(inv.createdAt);
      if (filterDateStart && created < new Date(filterDateStart)) return false;
      if (filterDateEnd) {
        const end = new Date(filterDateEnd);
        end.setDate(end.getDate() + 1);
        if (created >= end) return false;
      }

      return true;
    });
  }, [invitations, filterCandidato, filterStatus, filterDateStart, filterDateEnd]);

  const getExamLink = (token: string) => `${window.location.origin}/exam/${token}`;

  const copyLink = async (id: string, token: string) => {
    await navigator.clipboard.writeText(getExamLink(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setCandidate(null);
    setTemplateId('');
  };

  const handleSave = () => {
    if (!candidate || !templateId) return;
    create.mutate({
      candidateId: candidate.id,
      isExternal: false,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      cargo: candidate.cargo || undefined,
      squad: candidate.squad || undefined,
      setor: candidate.setor || undefined,
      nivel: candidate.nivel || undefined,
      templateId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
        formGuard.setIsDirty(false);
      },
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar convites</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Convites</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os convites para os candidatos</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => { resetForm(); formGuard.setIsDirty(false); setOpen(true); }} sx={{ borderRadius: 2 }}>
          Novo Convite
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <TextField size="small" placeholder="Candidato" value={filterCandidato} onChange={(e) => setFilterCandidato(e.target.value)} sx={{ minWidth: 150 }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="used">Usado</MenuItem>
            <MenuItem value="expired">Expirado</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" type="date" label="Data início" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
        <TextField size="small" type="date" label="Data fim" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        {filteredInvitations.length === 0 ? (
          <div className="flex justify-center">
            <EmptyState icon={Mail} title="Nenhum convite encontrado" description="Crie um template e envie convites para os candidatos." />
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Candidato</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nível</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Squad</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Setor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expiração</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvitations.map((inv) => (
                    <TableRow key={inv.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                            <Mail size={14} />
                          </div>
                          {inv.candidateName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{inv.candidateEmail}</TableCell>
                      <TableCell className="text-sm">{inv.cargo || '-'}</TableCell>
                      <TableCell className="text-sm">{inv.nivel || '-'}</TableCell>
                      <TableCell className="text-sm">{inv.squad || '-'}</TableCell>
                      <TableCell className="text-sm">{inv.setor || '-'}</TableCell>
                      <TableCell>
                        <code className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono">{inv.accessCode}</code>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={copiedId === inv.id ? 'Copiado!' : 'Copiar link de acesso'}>
                          <button
                            onClick={() => copyLink(inv.id, inv.token)}
                            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                          >
                            {copiedId === inv.id ? <Check size={14} /> : <Link size={14} />}
                            {copiedId === inv.id ? 'Copiado' : 'Copiar link'}
                          </button>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {inv.used ? (
                          <Chip label="Usado" color="success" size="small" variant="outlined" />
                        ) : new Date(inv.expiresAt) < new Date() ? (
                          <Chip label="Expirado" color="error" size="small" variant="outlined" />
                        ) : (
                          <Chip label="Pendente" color="warning" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>

      {/* Mobile: cards */}
      <div className="block md:hidden space-y-3">
        {filteredInvitations.length === 0 ? (
          <div className="flex justify-center">
            <EmptyState icon={Mail} title="Nenhum convite encontrado" description="Crie um template e envie convites para os candidatos." />
          </div>
        ) : (
          filteredInvitations.map((inv) => (
            <div key={inv.id} className="glass-panel p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm">{inv.candidateName}</div>
                  <div className="text-xs text-gray-500 truncate">{inv.candidateEmail}</div>
                </div>
                {inv.used ? (
                  <Chip label="Usado" color="success" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                ) : new Date(inv.expiresAt) < new Date() ? (
                  <Chip label="Expirado" color="error" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                ) : (
                  <Chip label="Pendente" color="warning" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                )}
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono">{inv.accessCode}</code>
                <button
                  onClick={() => copyLink(inv.id, inv.token)}
                  className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400"
                >
                  {copiedId === inv.id ? <Check size={14} /> : <Link size={14} />}
                  {copiedId === inv.id ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Expira: {new Date(inv.expiresAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onClose={() => formGuard.guardAction(() => { setOpen(false); formGuard.setIsDirty(false); })} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Novo Convite</DialogTitle>
        <DialogContent>
          {create.error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
              {create.error instanceof Error ? create.error.message : 'Erro ao criar convite'}
            </Alert>
          )}

          <Autocomplete
            options={candidates?.map((c) => ({ id: c.id, label: `${c.name} — ${c.email}`, name: c.name, email: c.email, cargo: c.cargo, nivel: c.nivel, squad: c.squad, setor: c.setor })) || []}
            value={candidate ? { id: candidate.id, label: `${candidate.name} — ${candidate.email}`, name: candidate.name, email: candidate.email, cargo: candidate.cargo, nivel: candidate.nivel, squad: candidate.squad, setor: candidate.setor } : null}
            onChange={(_, v) => { setCandidate(v ? { id: v.id, name: v.name, email: v.email, cargo: v.cargo, nivel: v.nivel, squad: v.squad, setor: v.setor } : null); formGuard.setIsDirty(true); }}
            renderInput={(params) => (
              <TextField {...params} label="Candidato" required margin="normal" />
            )}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <TextField label="Cargo" value={candidate?.cargo || ''} disabled fullWidth />
            <TextField label="Nível" value={candidate?.nivel || ''} disabled fullWidth />
            <TextField label="Squad" value={candidate?.squad || ''} disabled fullWidth />
            <TextField label="Setor" value={candidate?.setor || ''} disabled fullWidth />
          </div>

          <FormControl fullWidth margin="normal">
            <InputLabel>Template</InputLabel>
            <Select value={templateId} label="Template" onChange={(e) => { setTemplateId(e.target.value); formGuard.setIsDirty(true); }}>
              {templates?.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => formGuard.guardAction(() => { setOpen(false); formGuard.setIsDirty(false); })} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained"
            disabled={!candidate || !templateId || create.isPending}
            sx={{ borderRadius: 2 }}>
            {create.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={formGuard.confirmOpen}
        title="Descartar alterações?"
        message="Há alterações não salvas. Deseja descartá-las?"
        confirmLabel="Descartar"
        onConfirm={formGuard.handleConfirm}
        onCancel={formGuard.handleCancel}
        icon={AlertTriangle}
        severity="warning"
      />
    </div>
  );
};

export default InvitationsPage;
