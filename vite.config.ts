import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// IMPORT BOUNDARY RULE (Decision 1B):
// Nothing in src/ may import from port/ directly — only via engine/index.js.
// If ESLint is added, enforce with no-restricted-imports patterns: ["**/port/*"]
// See src/utils/engineImportRule.ts for full documentation.

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (['react', 'react-dom', 'react-router-dom'].some(pkg => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
                            return 'vendor-react';
                        }
                        if (id.includes('/node_modules/d3') || id.includes('\\node_modules\\d3')) {
                            return 'vendor-d3';
                        }
                        if (id.includes('/node_modules/react-syntax-highlighter') || id.includes('\\node_modules\\react-syntax-highlighter')) {
                            return 'vendor-syntax';
                        }
                        if (['react-markdown', 'rehype-katex', 'remark-math', 'katex'].some(pkg => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
                            return 'vendor-markdown';
                        }
                    }
                },
            },
        },
    },
})
