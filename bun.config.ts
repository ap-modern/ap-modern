import { defineConfig } from 'bun';

export default defineConfig({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'bun',
  format: 'esm',
  splitting: true,
  minify: false,
  sourcemap: 'external',
});
