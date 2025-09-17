import { defineConfig } from 'vite'

// Plugin to transform projectfu imports to absolute paths in the final output
const transformProjectFUImports = () => {
  return {
    name: 'transform-projectfu-imports',
    generateBundle(options, bundle) {
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName]
        if (chunk.type === 'chunk' && chunk.code) {
          chunk.code = chunk.code.replace(
            /'projectfu\/([^']+)'/g, 
            "'/systems/projectfu/module/$1'"
          )
          chunk.code = chunk.code.replace(
            /"projectfu\/([^"]+)"/g, 
            '"/systems/projectfu/module/$1"'
          )
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [transformProjectFUImports()],
  build: {
    lib: {
      entry: 'scripts/module.ts',
      name: 'fu-inline-automations',
      fileName: 'module',
      formats: ['es']
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        /^foundry-fabula-ultima\//,
        /^projectfu\//
      ],
      output: {
        entryFileNames: 'module.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    sourcemap: true,
    minify: false,
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': '/scripts'
    }
  }
}) 