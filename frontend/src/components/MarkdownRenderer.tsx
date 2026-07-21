import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import Box from '@mui/material/Box';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <Box sx={{
      '& img': { maxWidth: '100%' },
      '& code': { 
        backgroundColor: 'action.hover',
        padding: '2px 4px',
        borderRadius: '4px',
        fontFamily: 'monospace'
      },
      '& pre': {
        backgroundColor: 'action.hover',
        padding: '16px',
        borderRadius: '8px',
        overflowX: 'auto',
        '& code': {
          backgroundColor: 'transparent',
          padding: 0
        }
      }
    }}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
    </Box>
  );
};
