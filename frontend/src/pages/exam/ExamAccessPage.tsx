import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useExamAccess } from '../../hooks/useExam';

const ERROR_MESSAGES: Record<string, string> = {
  INVITATION_INVALID: 'Código de acesso inválido. Verifique o link e tente novamente.',
  INVITATION_EXPIRED: 'Este convite já expirou. Solicite um novo acesso.',
  TOKEN_INVALID: 'Link de acesso inválido.',
  default: 'Erro ao validar acesso. Tente novamente.',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code;
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.default;
  }
  return ERROR_MESSAGES.default;
}

const ExamAccessPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const { validate, isLoading, error } = useExamAccess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const inv = await validate({ token, accessCode });
      if (inv) {
        sessionStorage.setItem('exam_authenticated', '1');
        sessionStorage.setItem('exam_token', token ?? '');
        navigate(`/exam/rules?invitationId=${inv.id}&templateId=${inv.templateId}`);
      }
    } catch {
      // error is handled via the query state
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass rounded-2xl shadow-xl p-8 md:p-10 border border-white/10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/favicon.svg" alt="Skill Radar" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading">
            Acesso ao Exame
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Informe o código recebido por email para iniciar sua avaliação
          </p>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Código de Acesso"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            margin="normal"
            required
            autoFocus
            placeholder="Ex: XYZ789"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!accessCode.trim()}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--color-accent-deep), #0d5e5a)',
              },
            }}
          >
            Iniciar Exame
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ExamAccessPage;
