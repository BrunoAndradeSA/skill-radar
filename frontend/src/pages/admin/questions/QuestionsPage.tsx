import { useMemo, useState } from 'react';
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
import FormLabel from '@mui/material/FormLabel';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import { Plus, CircleHelp, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useQuestions, useQuestionMutations } from '../../../hooks/useQuestions';
import { useThemes } from '../../../hooks/useThemes';
import { useCompetencies } from '../../../hooks/useCompetencies';
import { MarkdownEditor } from '../../../components/MarkdownEditor';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useFormGuard } from '../../../hooks/useFormGuard';
import type { Question } from '../../../models/Question';
import type { Seniority } from '../../../models/enums/Seniority';
import type { QuestionType } from '../../../models/enums/QuestionType';

const QuestionsPage: React.FC = () => {
  const [themeFilter, setThemeFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { data: questions, isLoading, error } = useQuestions({
    themeId: themeFilter || undefined,
    seniority: (seniorityFilter || undefined) as Seniority | undefined,
    type: (typeFilter || undefined) as QuestionType | undefined,
  });
  const { data: themes } = useThemes();
  const { data: competencies } = useCompetencies();
  const { create, update, remove } = useQuestionMutations();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Question | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isSaving = create.isPending || update.isPending;
  const formGuard = useFormGuard();

  const [formThemeId, setFormThemeId] = useState('');
  const [formSeniority, setFormSeniority] = useState('Pleno');
  const [formType, setFormType] = useState('NORMAL');
  const [formText, setFormText] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formCompetencyIds, setFormCompetencyIds] = useState<string[]>([]);
  const [formAlternatives, setFormAlternatives] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  const filteredCompetencies = useMemo(
    () => competencies?.filter((c) => c.themeId === formThemeId) || [],
    [competencies, formThemeId],
  );
  const themeHasCompetencies = filteredCompetencies.length > 0;
  const canSave = formText.trim() && formThemeId && themeHasCompetencies && formCompetencyIds.length > 0 && !isSaving;

  const handleOpen = (item?: Question) => {
    if (item) {
      setEditItem(item);
      setFormThemeId(item.themeId);
      setFormSeniority(item.seniority);
      setFormType(item.type);
      setFormText(item.text);
      setFormExplanation(item.explanation || '');
      setFormCompetencyIds(item.competencyIds);
      setFormAlternatives(item.alternatives.map((a) => ({ text: a.text, isCorrect: a.isCorrect })));
    } else {
      setEditItem(null);
      setFormThemeId('');
      setFormSeniority('Pleno');
      setFormType('NORMAL');
      setFormText('');
      setFormExplanation('');
      setFormCompetencyIds([]);
      setFormAlternatives([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    }
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
    if (!canSave) return;
    setSaveError(null);

    const textTrimmed = formText.trim();
    const explanationTrimmed = formExplanation.trim();

    if (textTrimmed.length > 10000) {
      setSaveError('O enunciado excede o limite máximo de 10.000 caracteres.');
      return;
    }
    if (explanationTrimmed.length > 5000) {
      setSaveError('A explicação excede o limite máximo de 5.000 caracteres.');
      return;
    }
    if (formAlternatives.some((a) => a.text.trim().length > 2000)) {
      setSaveError('Cada alternativa deve ter no máximo 2.000 caracteres.');
      return;
    }
    if (!formAlternatives.some((a) => a.isCorrect)) {
      setSaveError('Selecione uma alternativa correta.');
      return;
    }

    const alts = formAlternatives.map((a) => ({
      text: a.text.trim(),
      isCorrect: a.isCorrect,
    }));
    const data = {
      themeId: formThemeId,
      seniority: formSeniority as Question['seniority'],
      type: formType as Question['type'],
      text: textTrimmed,
      explanation: explanationTrimmed,
      competencyIds: formCompetencyIds,
      alternatives: alts,
    } as Omit<Question, 'id'>;
    const onSettled = () => {
      setOpen(false);
      formGuard.setIsDirty(false);
    };
    if (editItem) {
      update.mutate(
        { id: editItem.id, question: data },
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

  const toggleCorrect = (index: number) => {
    setFormAlternatives((prev) => prev.map((a, i) => ({ ...a, isCorrect: i === index })));
    formGuard.setIsDirty(true);
  };

  const addAlternative = () => { setFormAlternatives((prev) => [...prev, { text: '', isCorrect: false }]); formGuard.setIsDirty(true); };
  const removeAlternative = (index: number) => {
    if (formAlternatives.length <= 2) return;
    setFormAlternatives((prev) => prev.filter((_, i) => i !== index));
    formGuard.setIsDirty(true);
  };
  const toggleCompetency = (id: string) => {
    setFormCompetencyIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    formGuard.setIsDirty(true);
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar questões</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Questões</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie o banco de questões</p>
        </div>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpen()} sx={{ borderRadius: 2 }}>
          Nova Questão
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Tema</InputLabel>
          <Select value={themeFilter} label="Tema" onChange={(e) => setThemeFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {themes?.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Senioridade</InputLabel>
          <Select value={seniorityFilter} label="Senioridade" onChange={(e) => setSeniorityFilter(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Trainee">Trainee</MenuItem>
            <MenuItem value="Júnior">Júnior</MenuItem>
            <MenuItem value="Pleno">Pleno</MenuItem>
            <MenuItem value="Sênior">Sênior</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={typeFilter} label="Tipo" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="NORMAL">Normal</MenuItem>
            <MenuItem value="CERTIFICATION">Certificação</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {questions?.map((q) => (
          <div
            key={q.id}
            className="dash-stat-card flex flex-col"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <CircleHelp size={16} />
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                {q.text.length > 100 ? q.text.substring(0, 100) + '...' : q.text}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Chip label={q.seniority} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
              <Chip label={q.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
              <span className="text-xs text-gray-400">{q.alternatives.length} alternativas</span>
            </div>
            <div className="mt-auto flex gap-1">
              <IconButton onClick={() => handleOpen(q)} size="small" sx={{ color: 'text.secondary' }}>
                <Pencil size={16} />
              </IconButton>
              <IconButton onClick={() => handleDelete(q.id)} size="small" color="error">
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        ))}
        {questions?.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="Nenhuma questão encontrada" description="Tente ajustar os filtros ou crie uma nova questão." />
          </div>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{editItem ? 'Editar Questão' : 'Nova Questão'}</DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
              {saveError}
            </Alert>
          )}
          <div className="flex gap-3" style={{ marginTop: 8 }}>
            <FormControl fullWidth>
              <InputLabel>Tema</InputLabel>
              <Select value={formThemeId} label="Tema" onChange={(e) => { setFormThemeId(e.target.value); formGuard.setIsDirty(true); }}>
                {themes?.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Senioridade</InputLabel>
              <Select value={formSeniority} label="Senioridade" onChange={(e) => { setFormSeniority(e.target.value); formGuard.setIsDirty(true); }}>
                <MenuItem value="Trainee">Trainee</MenuItem>
                <MenuItem value="Júnior">Júnior</MenuItem>
                <MenuItem value="Pleno">Pleno</MenuItem>
                <MenuItem value="Sênior">Sênior</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={formType} label="Tipo" onChange={(e) => { setFormType(e.target.value); formGuard.setIsDirty(true); }}>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="CERTIFICATION">Certificação</MenuItem>
              </Select>
            </FormControl>
          </div>

          <FormLabel sx={{ mt: 2, mb: 0.5, display: 'block', fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
            Competências
          </FormLabel>
          {formThemeId && !themeHasCompetencies ? (
            <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
              Este tema não possui competências cadastradas. Cadastre competências antes de criar questões.
            </Alert>
          ) : (
            <>
              <div className="flex gap-1 flex-wrap">
                {filteredCompetencies.map((c) => (
                  <Chip key={c.id} label={c.name} size="small"
                    color={formCompetencyIds.includes(c.id) ? 'primary' : 'default'}
                    onClick={() => toggleCompetency(c.id)} />
                ))}
              </div>
              {formThemeId && formCompetencyIds.length === 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                  Selecione ao menos uma competência
                </span>
              )}
            </>
          )}

          <FormLabel sx={{ mt: 2, mb: 0.5, display: 'block', fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
            Enunciado (Markdown)
          </FormLabel>
          <MarkdownEditor value={formText} onChange={(v) => { setFormText(v ?? ''); formGuard.setIsDirty(true); }} />

          <FormLabel sx={{ mt: 2, mb: 0.5, display: 'block', fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
            Alternativas
          </FormLabel>
          {formAlternatives.map((alt, i) => (
            <div key={i} className="flex gap-2 items-center" style={{ marginTop: 8 }}>
              <Radio checked={alt.isCorrect} onChange={() => toggleCorrect(i)} size="small" />
              <TextField fullWidth size="small" placeholder={`Alternativa ${i + 1}`} value={alt.text}
                onChange={(e) => { setFormAlternatives((prev) => prev.map((a, j) => j === i ? { ...a, text: e.target.value } : a)); formGuard.setIsDirty(true); }} />
              <IconButton size="small" onClick={() => removeAlternative(i)} disabled={formAlternatives.length <= 2}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
          <Button size="small" onClick={addAlternative} sx={{ mt: 1, borderRadius: 2 }}>+ Adicionar alternativa</Button>

          <FormLabel sx={{ mt: 2, mb: 0.5, display: 'block', fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
            Explicação (Markdown)
          </FormLabel>
          <MarkdownEditor value={formExplanation} onChange={(v) => { setFormExplanation(v ?? ''); formGuard.setIsDirty(true); }} showPreview={false} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSaving} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!canSave} sx={{ borderRadius: 2 }}>
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
        title="Excluir Questão"
        message="Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        loading={remove.isPending}
      />
    </div>
  );
};

export default QuestionsPage;
