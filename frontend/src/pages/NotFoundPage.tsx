import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading mb-2">
          Página não encontrada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          A página que você procura não existe ou foi movida.
        </p>
        <Button
          variant="contained"
          startIcon={<Home size={18} />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2 }}
        >
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
