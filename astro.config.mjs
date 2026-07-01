// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'bun-sqlite',
        resolveId(id) {
          if (id === 'bun:sqlite' || id === 'bun:sqlite?') {
            return { id: 'bun:sqlite', external: true };
          }
          return null;
        },
      },
    ],
    ssr: {
      noExternal: ['drizzle-orm'],
    },
    optimizeDeps: {
      exclude: ['bun:sqlite'],
    },
  },
  server: {
    host: true,
    port: 4321,
  },
});
