import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@answer-bubble/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@answer-bubble/audio': path.resolve(__dirname, '../../packages/audio/src/index.ts'),
      '@answer-bubble/transcription': path.resolve(__dirname, '../../packages/transcription/src/index.ts'),
      '@answer-bubble/diarization': path.resolve(__dirname, '../../packages/diarization/src/index.ts'),
      '@answer-bubble/llm': path.resolve(__dirname, '../../packages/llm/src/index.ts'),
      '@answer-bubble/notes': path.resolve(__dirname, '../../packages/notes/src/index.ts'),
      '@answer-bubble/memory': path.resolve(__dirname, '../../packages/memory/src/index.ts'),
      '@answer-bubble/graph': path.resolve(__dirname, '../../packages/graph/src/index.ts'),
      '@answer-bubble/vision': path.resolve(__dirname, '../../packages/vision/src/index.ts'),
    },
  },
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
