import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Base path for GitHub Pages (only in production/build)
  // In development, use root path '/'
  // In production, use repository name for GitHub Pages
  const getBasePath = () => {
    if (mode === 'development') {
      return '/'; // Root path for local development
    }
    // For production builds (GitHub Pages)
    if (process.env.GITHUB_REPOSITORY) {
      return `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`;
    }
    return '/marble-majesty-ui/'; // Default for GitHub Pages
  };

  return {
  base: getBasePath(),
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/allinstone': {
        target: 'https://www.allinstone.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/allinstone/, '/assets/v-5/configurator-new'),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  };
});
