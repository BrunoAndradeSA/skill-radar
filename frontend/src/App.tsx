import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeModeProvider } from './components/ThemeModeProvider';
import { FeatureFlagProvider } from './feature-flags/FeatureFlagProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>
          <ThemeModeProvider>
            <RouterProvider router={router} />
          </ThemeModeProvider>
        </FeatureFlagProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
