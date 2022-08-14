import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    dts: true,
    format: ['cjs', 'esm'],
    shims: true,
    clean: true,
  },
  {
    entry: ['playground/index.ts'],
    dts: true,
    format: "iife",
    shims: true,
    clean: true,
    outDir: "playground/dist",
    external: [/zrender/],
    replaceNodeEnv: true
  }
])
