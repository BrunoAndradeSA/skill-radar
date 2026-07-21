import React, { useMemo, useState } from 'react';
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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Plus, FileText, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useTemplates, useTemplateMutations } from '../../../hooks/useTemplates';
import { useThemes } from '../../../hooks/useThemes';
import { useCompetencies } from '../../../hooks/useCompetencies';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useFormGuard } from '../../../hooks/useFormGuard';
import { TemplateService } from '../../../services/template.service';
import { RepositoryFactory } from '../../../repositories/RepositoryFactory';
import type { ExamTemplate } from '../../../models/ExamTemplate';

const templateService = new TemplateService(RepositoryFactory.getTemplateRepository());

const TemplatesPage: React.FC = () => {
  const { data: templates, isLoading, error } = useTemplates();
  const { data: themes } = useThemes();
  const { data: competencies } = useCompetencies();
  const compByTheme = useMemo(() => {
    const map = new Map<string, typeof competencies>();
    if (!competencies) return map;
    for (const c of competencies) {
      const existing = map.get(c.themeId);
      if (existing) existing.push(c);
      else map.set(c.themeId, [c]);
    }
    return map;
  }, [competencies]);
  const { create, update, remove } = useTemplateMutations();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExamTemplate | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seniority, setSeniority] = useState('Pleno');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isCertification, setIsCertification] = useState(true);
  const [themeDistributions, setThemeDistributions] = useState<{ themeId: string; questionCount: number; competencyIds: string[] }[]>([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const isSaving = create.isPending || update.isPending;
  const formGuard = useFormGuard();

  const populateForm = (item: ExamTemplate) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setSeniority(item.seniority);
    setDurationMinutes(item.durationMinutes);
    setIsCertification(item.isCertification);
    setThemeDistributions(
      item.themes.length > 0
        ? item.themes.map((t) => ({
            themeId: t.themeId,
            questionCount: t.questionCount,
            competencyIds: t.competencyIds || [],
          }))
        : [{ themeId: '', questionCount: 5, competencyIds: [] }]
    );
  };

  const handleOpen = async (item?: ExamTemplate) => {
    formGuard.setIsDirty(false);
    if (item) {
      setEditItem(null);
      setOpen(true);
      if (!item.themes?.length) {
        setLoadingTemplate(true);
        try {
          const full = await templateService.getTemplateById(item.id);
          if (full) item = full;
        } catch {
          // fallback to list item
        }
        setLoadingTemplate(false);
      }
      populateForm(item);
    } else {
      setEditItem(null);
      setName('');
      setDescription('');
      setSeniority('Pleno');
      setDurationMinutes(60);
      setIsCertification(true);
      setThemeDistributions([{ themeId: '', questionCount: 5, competencyIds: [] }]);
      setOpen(true);
    }
  };

  const handleClose = () => {
    formGuard.guardAction(() => {
      setOpen(false);
      setSaveError(null);
      formGuard.setIsDirty(false);
    });
  };
  const handleAddTheme = () => { setThemeDistributions((prev) => [...prev, { themeId: '', questionCount: 5, competencyIds: [] }]); formGuard.setIsDirty(true); };
  const handleRemoveTheme = (index: number) => { setThemeDistributions((prev) => prev.filter((_, i) => i !== index)); formGuard.setIsDirty(true); };
  const handleThemeChange = (index: number, themeId: string) => { setThemeDistributions((prev) => prev.map((d, i) => (i === index ? { ...d, themeId, competencyIds: [] } : d))); formGuard.setIsDirty(true); };
  const toggleCompetency = (index: number, competencyId: string) => {
    setThemeDistributions((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, competencyIds: d.competencyIds.includes(competencyId) ? d.competencyIds.filter((c) => c !== competencyId) : [...d.competencyIds, competencyId] } : d
      )
    );
    formGuard.setIsDirty(true);
  };

  const selectedThemeIds = themeDistributions.map((d) => d.themeId).filter(Boolean);
  const hasDuplicateThemes = new Set(selectedThemeIds).size !== selectedThemeIds.length;

  const handleSave = () => {
    if (!name.trim() || themeDistributions.length === 0 || isSaving) return;
    if (themeDistributions.some((d) => !d.themeId)) {
      setSaveError('Selecione um tema para cada distribuição antes de salvar.');
      return;
    }
    if (hasDuplicateThemes) {
      setSaveError('Não é permitido adicionar o mesmo tema mais de uma vez no template.');
      return;
    }
    setSaveError(null);
    const data: Omit<ExamTemplate, 'id'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      seniority: seniority as ExamTemplate['seniority'],
      durationMinutes,
      isCertification,
      themes: themeDistributions.map((d) => ({
        themeId: d.themeId,
        questionCount: d.questionCount,
        ...(d.competencyIds.length > 0 && { competencyIds: d.competencyIds }),
      })),
    };
    const onSettled = () => {
      setOpen(false);
      formGuard.setIsDirty(false);
    };
    if (editItem) {
      update.mutate(
        { id: editItem.id, template: data },
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
    setConfirmDeleteId(null);
    remove.mutate(confirmDeleteId);
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar templates</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Modelos de exame</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {templates?.map((t) => (
          <div key={t.id} className="dash-stat-card">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <FileText size={16} />
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">{t.name}</div>
            </div>
            {t.description && <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t.description}</div>}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">{t.seniority}</span>
              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">{t.durationMinutes}min</span>
              {t.isCertification && <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Certificação</span>}
            </div>
            <div className="mt-3 flex gap-1">
              <IconButton onClick={() => handleOpen(t)} size="small" sx={{ color: 'text.secondary' }}>
                <Pencil size={16} />
              </IconButton>
              <IconButton onClick={() => handleDelete(t.id)} size="small" color="error">
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        ))}
        {templates?.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="Nenhum template cadastrado" description="Crie um template de exame para começar." />
          </div>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editItem ? 'Editar Template' : 'Novo Template'}</DialogTitle>
        <DialogContent>
          {loadingTemplate ? (
            <div className="flex justify-center py-12"><CircularProgress /></div>
          ) : (
            <>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
              {saveError}
            </Alert>
          )}
          <TextField fullWidth label="Nome" value={name} onChange={(e) => { setName(e.target.value); formGuard.setIsDirty(true); }} margin="normal" required />
          <TextField fullWidth label="Descrição" value={description} onChange={(e) => { setDescription(e.target.value); formGuard.setIsDirty(true); }} margin="normal" multiline rows={2} />
          <div className="flex gap-3">
            <FormControl fullWidth margin="normal">
              <InputLabel>Senioridade</InputLabel>
              <Select value={seniority} label="Senioridade" onChange={(e) => { setSeniority(e.target.value); formGuard.setIsDirty(true); }}>
                <MenuItem value="Trainee">Trainee</MenuItem>
                <MenuItem value="Júnior">Júnior</MenuItem>
                <MenuItem value="Pleno">Pleno</MenuItem>
                <MenuItem value="Sênior">Sênior</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Duração (min)" type="number" value={durationMinutes} onChange={(e) => { setDurationMinutes(Number(e.target.value)); formGuard.setIsDirty(true); }} margin="normal" />
          </div>
          <FormControlLabel control={<Switch checked={isCertification} onChange={(e) => { setIsCertification(e.target.checked); formGuard.setIsDirty(true); }} />} label="Questões de certificação" />
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distribuição por Tema</span>
            {themeDistributions.map((dist, i) => {
              const comps = compByTheme.get(dist.themeId) || [];
              return (
                <div key={i} className="mt-2 p-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex gap-2 items-center mb-2">
                    <FormControl size="small" fullWidth error={dist.themeId ? hasDuplicateThemes && selectedThemeIds.filter((id) => id === dist.themeId).length > 1 : false}>
                      <InputLabel>Tema</InputLabel>
                      <Select value={dist.themeId} label="Tema" onChange={(e) => handleThemeChange(i, e.target.value)}>
                        {themes
                          ?.filter((t) => t.id === dist.themeId || !selectedThemeIds.includes(t.id))
                          .map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField size="small" label="Qtd" type="number" value={dist.questionCount}
                      onChange={(e) => { setThemeDistributions((prev) => prev.map((d, j) => j === i ? { ...d, questionCount: Number(e.target.value) } : d)); formGuard.setIsDirty(true); }}
                      sx={{ width: 90 }} />
                    <IconButton onClick={() => handleRemoveTheme(i)} color="error" size="small"><Trash2 size={16} /></IconButton>
                  </div>
                  {comps.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {comps.map((c) => (
                        <Button key={c.id} size="small"
                          variant={dist.competencyIds.includes(c.id) ? 'contained' : 'outlined'}
                          onClick={() => toggleCompetency(i, c.id)}
                          sx={{ fontSize: '0.7rem', borderRadius: 2 }}>
                          {c.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Button size="small" onClick={handleAddTheme} sx={{ mt: 1, borderRadius: 2 }}>+ Adicionar Tema</Button>
          </div>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSaving} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name.trim() || themeDistributions.length === 0 || isSaving} sx={{ borderRadius: 2 }}>
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
        title="Excluir Template"
        message="Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        loading={remove.isPending}
      />
    </div>
  );
};

export default TemplatesPage;
