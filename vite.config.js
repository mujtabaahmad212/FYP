import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh
      fastRefresh: true,
      // Include JSX in all files
      include: '**/*.{jsx,tsx}',
    }),
    tailwindcss(),
  ],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false, // Allow automatic port selection if 5173 is taken
    open: false, // Don't auto-open browser
    // Optimize WebSocket connection for HMR
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      // Port will be automatically detected
    },
    // Watch options
    watch: {
      usePolling: false,
      interval: 100,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    // Prevent connection timeout
    cors: true,
  },
  build: {
    // Optimize build
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Code splitting
    rollupOptions: {
      output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['lucide-react'],
              'chart-vendor': ['recharts'],
            },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'recharts',
    ],
    exclude: [],
    // Force pre-bundling
    force: false,
  },
  // Clear console output
  clearScreen: false,
  // Log level
  logLevel: 'info',
})
