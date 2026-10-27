import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node18',
  clean: true,
  dts: false,
  sourcemap: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
