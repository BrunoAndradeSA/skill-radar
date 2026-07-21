import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx', './src/routes/index.tsx'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      '@mui/material/Alert',
      '@mui/material/Box',
      '@mui/material/Button',
      '@mui/material/Checkbox',
      '@mui/material/Chip',
      '@mui/material/CircularProgress',
      '@mui/material/CssBaseline',
      '@mui/material/Dialog',
      '@mui/material/DialogActions',
      '@mui/material/DialogContent',
      '@mui/material/DialogTitle',
      '@mui/material/FormControl',
      '@mui/material/FormControlLabel',
      '@mui/material/FormLabel',
      '@mui/material/IconButton',
      '@mui/material/InputLabel',
      '@mui/material/LinearProgress',
      '@mui/material/MenuItem',
      '@mui/material/Radio',
      '@mui/material/RadioGroup',
      '@mui/material/Select',
      '@mui/material/Switch',
      '@mui/material/Table',
      '@mui/material/TableBody',
      '@mui/material/TableCell',
      '@mui/material/TableContainer',
      '@mui/material/TableHead',
      '@mui/material/TableRow',
      '@mui/material/TextField',
      '@mui/material/Tooltip',
      '@mui/material/styles',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui/material') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react-core';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (
              id.includes('react-markdown') ||
              id.includes('micromark') ||
              id.includes('unist') ||
              id.includes('vfile') ||
              id.includes('space-separated-tokens') ||
              id.includes('comma-separated-tokens') ||
              id.includes('decode-named-character-reference') ||
              id.includes('mdast-util-') ||
              id.includes('property-information') ||
              id.includes('trim-lines') ||
              id.includes('ccount')
            ) {
              return 'vendor-markdown';
            }
            return 'vendor-others';
          }
        },
      },
    },
  },
  appType: 'spa',
})
