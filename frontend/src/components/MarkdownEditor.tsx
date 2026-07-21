import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import Editor from '@monaco-editor/react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useThemeMode } from '../hooks/useThemeMode';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  showPreview?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MonacoErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Monaco Editor failed to load:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Editor indisponível. Atualize a página ou tente novamente.
        </Alert>
      );
    }
    return this.props.children;
  }
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  height = '400px',
  showPreview = true
}) => {
  const { mode } = useThemeMode();

  return (
    <Box sx={{ display: 'flex', gap: 2, height, width: '100%' }}>
      <Box sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <MonacoErrorBoundary>
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme={mode === 'dark' ? 'vs-dark' : 'light'}
            value={value}
            onChange={onChange}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on'
            }}
          />
        </MonacoErrorBoundary>
      </Box>
      {showPreview && (
        <Box sx={{ flex: 1, border: 1, borderColor: 'divider', borderRadius: 1, p: 2, overflowY: 'auto' }}>
          <MarkdownRenderer content={value || '*No content*'} />
        </Box>
      )}
    </Box>
  );
};
