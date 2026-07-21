import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Plus, Palette, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useThemes, useThemeMutations } from '../../../hooks/useThemes';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useFormGuard } from '../../../hooks/useFormGuard';
import type { Theme } from '../../../models/Theme';

const ThemesPage: React.FC = () => {
  const { data: themes, isLoading, error } = useThemes();
  const { create, update, remove } = useThemeMutations();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Theme | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isSaving = create.isPending || update.isPending;
  const formGuard = useFormGuard();

  const handleOpen = (item?: Theme) => {
    if (item) {
      setEditItem(item);
      setName(item.name);
      setDescription(item.description || '');
    } else {
      setEditItem(null);
      setName('');
      setDescription('');
    }
    setSaveError(null);
    formGuard.setIsDirty(false);
    setOpen(true);
  };

  const handleClose = () => {
    formGuard.guardAction(() => {
      setOpen(false);
      setSaveError(null);
      formGuard.setIsDirty(false);
    });
  };

  const handleSave = () => {
    if (!name.trim() || isSaving) return;
    setSaveError(null);
    const data = { name: name.trim(), description: description.trim() || undefined };
    const onSettled = () => {
      setOpen(false);
      formGuard.setIsDirty(false);
    };
    if (editItem) {
      update.mutate(
        { id: editItem.id, theme: data },
        { onSuccess: onSettled, onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erro ao salvar') },
      );
    } else {
      create.mutate(data, {
        onSuccess: onSettled,
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erro ao salvar'),
      });
    }
  };



  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setDeleteError(null);
    setConfirmDeleteId(null);
    remove.mutate(confirmDeleteId, {
      onError: (err) => setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir'),
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar temas</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Temas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os temas do sistema</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
          Novo Tema
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {themes?.map((theme) => (
          <div
            key={theme.id}
            className="dash-stat-card"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <Palette size={16} />
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">{theme.name}</div>
            </div>
            {theme.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{theme.description}</div>
            )}
            <div className="mt-3 flex gap-1">
              <IconButton onClick={() => handleOpen(theme)} size="small" sx={{ color: 'text.secondary' }}>
                <Pencil size={16} />
              </IconButton>
              <IconButton onClick={() => handleDelete(theme.id)} size="small" color="error">
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        ))}
        {themes?.length === 0 && (
          <div className="col-span-full">
            <EmptyState icon={Palette} title="Nenhum tema cadastrado" description="Crie o primeiro tema para começar." />
          </div>
        )}
      </div>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editItem ? 'Editar Tema' : 'Novo Tema'}</DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
              {saveError}
            </Alert>
          )}
          <TextField autoFocus fullWidth label="Nome" value={name} onChange={(e) => { setName(e.target.value); formGuard.setIsDirty(true); }} margin="normal" required />
          <TextField fullWidth label="Descrição" value={description} onChange={(e) => { setDescription(e.target.value); formGuard.setIsDirty(true); }} margin="normal" multiline rows={3} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSaving} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name.trim() || isSaving} sx={{ borderRadius: 2 }}>
            {isSaving ? 'Salvando...' : 'Salvar'}
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
        open={!!confirmDeleteId}
        title="Excluir Tema"
        message="Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        loading={remove.isPending}
      />
    </div>
  );
};

export default ThemesPage;
