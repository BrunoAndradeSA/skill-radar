import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Clock, AlertTriangle, Monitor, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useExamStart, useExamReject, useExamTemplate } from '../../hooks/useExam';

const ExamRulesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitationId');
  const templateId = searchParams.get('templateId');
  const [accepted, setAccepted] = React.useState(false);

  const { data: template, isLoading: templateLoading } = useExamTemplate(templateId);
  const { start, isLoading: isStarting } = useExamStart();
  const { reject, isRejecting } = useExamReject();

  if (templateLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <CircularProgress />
      </div>
    );
  }

  if (!invitationId || !templateId || !template) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Dados do exame inválidos. Retorne ao link de acesso e tente novamente.
        </Alert>
      </div>
    );
  }

  const handleAccept = () => {
    start({ invitationId, templateId });
  };

  const handleReject = () => {
    reject({ invitationId, templateId });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass rounded-2xl shadow-xl border border-white/10 w-full max-w-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <img src="/favicon.svg" alt="Skill Radar" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading">
            Regras do Exame
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {template.name}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/30">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Tempo de Exame</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Você terá <strong>{template.durationMinutes} minutos</strong> para concluir a avaliação.
                O tempo começa a contar assim que você aceitar as regras e iniciar o exame.
                Ao final do tempo, o exame será encerrado automaticamente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/30">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Perda de Foco</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Não troque de aba ou minimize a janela do navegador durante o exame.
                O sistema monitora perdas de foco. A <strong>1ª violação</strong> gera um alerta;
                a <strong>2ª violação</strong> encerra o exame automaticamente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/30">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Monitor size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Proteção Contra Automação</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                O sistema detecta o uso de extensões de IA, scripts de automação (Selenium, Puppeteer)
                e respondedores automáticos. Qualquer tentativa de automatizar as respostas
                será detectada e <strong>encerrará o exame imediatamente</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/30">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Monitor size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Ambiente de Exame</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Realize o exame em um ambiente tranquilo, com conexão estável com a internet.
                Certifique-se de ter tempo suficiente disponível antes de iniciar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-gray-50/50 dark:bg-gray-800/30">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Instruções Gerais</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-400 mt-1 list-disc list-inside space-y-1">
                <li>O exame é composto por {template.themes.reduce((acc, t) => acc + t.questionCount, 0)} questões.</li>
                <li>Cada questão possui apenas <strong>uma</strong> alternativa correta.</li>
                <li>Você pode navegar entre as questões usando os botões Anterior e Próxima.</li>
                <li>Ao final, revise suas respostas antes de clicar em <strong>Finalizar Exame</strong>.</li>
                <li>Após finalizar, você não poderá alterar as respostas.</li>
              </ul>
            </div>
          </div>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              color="primary"
            />
          }
          label={
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Li e aceito as regras do exame
            </span>
          }
          sx={{ mb: 3 }}
        />

        <div className="flex gap-3">
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<XCircle size={18} />}
            onClick={handleReject}
            disabled={isRejecting || isStarting}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
          >
            {isRejecting ? 'Encerrando...' : 'Não Aceito — Encerrar'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CheckCircle size={18} />}
            onClick={handleAccept}
            disabled={!accepted || isStarting || isRejecting}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))',
              '&:hover': { background: 'linear-gradient(135deg, var(--color-accent-deep), #0d5e5a)' },
            }}
          >
            {isStarting ? 'Iniciando...' : 'Aceito — Iniciar Exame'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamRulesPage;
