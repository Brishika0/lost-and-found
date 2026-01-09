import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <--- Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This tells Vite that '@/' means the absolute path to the './src' directory.
      "@": path.resolve(__dirname, "./src"), 
    },
  },
});