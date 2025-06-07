import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // For SPA fallback, use the following instead:
    // middlewareMode: 'html',
  }
});
