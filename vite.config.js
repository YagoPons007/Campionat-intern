// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    open: true    // abre el navegador automáticamente al arrancar `npm run dev`
  }
});
