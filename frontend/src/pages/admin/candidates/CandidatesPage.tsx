import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import { Plus, Pencil, Trash2, Eye, User as UserIcon, Search, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useCandidates, useCandidateMutations } from '../../../hooks/useCandidates';
import type { Candidate } from '../../../models/Candidate';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useFormGuard } from '../../../hooks/useFormGuard';
import { isValidEmail, emailHelperText } from '../../../utils/validation';

const CARGO_OPTIONS = ['Desenvolvedor', 'QA', 'Service Desk'];
const SETOR_OPTIONS = ['Desenvolvimento', 'Service Desk'];
const NIVEL_OPTIONS = ['Trainee', 'Júnior', 'Pleno', 'Sênior'];
const SQUAD_OPTIONS = ['Squad 1', 'Squad 2', 'Squad 3'];

const emptyForm = { name: '', email: '', role: 'CANDIDATE', cargo: '', setor: '', nivel: '', squad: '' };

const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: candidates, isLoading, error } = useCandidates();
  const { create, update, remove } = useCandidateMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [search, setSearch] = useState('');
  const formGuard = useFormGuard();

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    if (!search.trim()) return candidates;
    const q = search.toLowerCase();
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [candidates, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    formGuard.setIsDirty(false);
    setOpen(true);
  };

  const openEdit = (c: Candidate) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, role: c.role, cargo: c.cargo, setor: c.setor, nivel: c.nivel, squad: c.squad });
    formGuard.setIsDirty(false);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !isValidEmail(form.email) || !form.cargo || !form.setor || !form.nivel || !form.squad) return;
    const onSuccess = () => {
      setOpen(false);
      formGuard.setIsDirty(false);
    };
    if (editing) {
      update.mutate({ id: editing.id, data: form }, { onSuccess });
    } else {
      create.mutate(form, { onSuccess });
    }
  };

  const handleDelete = (id: string) => {
    const c = candidates?.find((c) => c.id === id);
    if (c) { setDeleteTargetId(c.id); setDeleteTargetName(c.name); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar candidatos</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Candidatos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os candidatos que realizarão os exames</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={openCreate} sx={{ borderRadius: 2 }}>
          Novo Candidato
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <TextField
          size="small"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <Search size={16} className="mr-1.5 text-gray-400" /> } }}
          sx={{ minWidth: 280 }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={UserIcon}
              title={search ? 'Nenhum candidato encontrado' : 'Nenhum candidato cadastrado'}
              description={search ? 'Tente alterar os termos da busca.' : 'Cadastre candidatos para começar as avaliações.'}
            />
          </div>
        ) : (
          filteredCandidates.map((c) => (
            <div key={c.id} className="dash-stat-card">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                  <UserIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.email}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{c.cargo}</span>
                <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{c.nivel}</span>
                <span className="px-2 py-1 rounded-md bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">{c.setor}</span>
                <span className="px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">{c.squad}</span>
              </div>
              <div className="mt-3 flex gap-1">
                <IconButton onClick={() => navigate(`/admin/candidates/${c.id}`)} size="small" sx={{ color: 'text.secondary' }}>
                  <Eye size={16} />
                </IconButton>
                <IconButton onClick={() => openEdit(c)} size="small" sx={{ color: 'text.secondary' }}>
                  <Pencil size={16} />
                </IconButton>
                <IconButton onClick={() => handleDelete(c.id)} size="small" color="error">
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onClose={() => formGuard.guardAction(() => { setOpen(false); formGuard.setIsDirty(false); })} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editing ? 'Editar Candidato' : 'Novo Candidato'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); formGuard.setIsDirty(true); }} margin="normal" required />
          <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); formGuard.setIsDirty(true); }}
            error={form.email.length > 0 && !isValidEmail(form.email)}
            helperText={form.email.length > 0 ? emailHelperText(form.email) : ' '}
            margin="normal" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormControl fullWidth margin="normal">
              <InputLabel>Cargo</InputLabel>
              <Select value={form.cargo} label="Cargo" onChange={(e) => { setForm({ ...form, cargo: e.target.value }); formGuard.setIsDirty(true); }}>
                {CARGO_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Setor</InputLabel>
              <Select value={form.setor} label="Setor" onChange={(e) => { setForm({ ...form, setor: e.target.value }); formGuard.setIsDirty(true); }}>
                {SETOR_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormControl fullWidth margin="normal">
              <InputLabel>Nível</InputLabel>
              <Select value={form.nivel} label="Nível" onChange={(e) => { setForm({ ...form, nivel: e.target.value }); formGuard.setIsDirty(true); }}>
                {NIVEL_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Squad</InputLabel>
              <Select value={form.squad} label="Squad" onChange={(e) => { setForm({ ...form, squad: e.target.value }); formGuard.setIsDirty(true); }}>
                {SQUAD_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => formGuard.guardAction(() => { setOpen(false); formGuard.setIsDirty(false); })} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained"
            disabled={!form.name.trim() || !form.email.trim() || !isValidEmail(form.email) || !form.cargo || !form.setor || !form.nivel || !form.squad}
            sx={{ borderRadius: 2 }}>
            {editing ? 'Atualizar' : 'Salvar'}
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

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Remover Candidato"
        message={`Remover "${deleteTargetName}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (deleteTargetId) remove.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
        }}
        onCancel={() => setDeleteTargetId(null)}
        loading={remove.isPending}
      />
    </div>
  );
};

export default CandidatesPage;
