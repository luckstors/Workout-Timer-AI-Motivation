import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ⬅️ penting supaya path asset relatif (bisa dibuka di Electron via file://)
  build: {
    outDir: 'dist',      // hasil build di folder dist (default)
    emptyOutDir: true,   // hapus isi folder dist sebelum build baru
  },
})
