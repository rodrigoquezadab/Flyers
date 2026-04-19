import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Forced restart to load missing dependency cache
export default defineConfig({
  plugins: [react()],
})
