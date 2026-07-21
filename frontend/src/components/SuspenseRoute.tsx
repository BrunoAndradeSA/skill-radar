import { Suspense, type ReactNode } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

export function SuspenseRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            width: '100%',
          }}
        >
          <LinearProgress
            sx={{
              height: 3,
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                backgroundImage: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-light) 50%, var(--color-accent) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
              },
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' },
              },
            }}
          />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
}
