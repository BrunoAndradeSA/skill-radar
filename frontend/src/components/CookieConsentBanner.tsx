import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { CookieConsentDialog } from './CookieConsentDialog';
import { FeatureFlagService } from '../feature-flags/FeatureFlagService';

const CONSENT_KEY = 'cookie_consent';

interface CookieConsentValue {
  accepted: boolean;
  timestamp: number;
}

function getConsent(): CookieConsentValue | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as CookieConsentValue) : null;
  } catch {
    return null;
  }
}

function setConsent(): void {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }));
}

export const CookieConsentBanner: React.FC = () => {
  const [consent, setConsentState] = useState<CookieConsentValue | null>(getConsent);
  const [dialogOpen, setDialogOpen] = useState(false);

  const enabled = FeatureFlagService.getFlag('enableCookieConsent');
  if (!enabled || consent?.accepted) return null;

  const handleAccept = () => {
    setConsent();
    setConsentState({ accepted: true, timestamp: Date.now() });
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto glass dark:glass rounded-2xl shadow-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 pointer-events-auto animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Utilizamos armazenamento local para garantir o funcionamento da plataforma.
                Seus dados não são compartilhados com terceiros.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="small"
                variant="text"
                onClick={() => setDialogOpen(true)}
                sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 500 }}
              >
                Saiba mais
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleAccept}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))',
                  '&:hover': {
                    background: 'linear-gradient(135deg, var(--color-accent-deep), #0d5e5a)',
                  },
                }}
              >
                Aceitar
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CookieConsentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};
