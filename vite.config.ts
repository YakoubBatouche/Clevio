import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import site from './src/content/site.json' with { type: 'json' }

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export default defineConfig({
  plugins: [react(), {
    name: 'clevio-seo',
    transformIndexHtml: (html) => html.replace(/%CLEVIO_SEO_(title|description|shareTitle|shareDescription)%/g,
      (_, field: keyof typeof site.seo) => escapeHtml(site.seo[field])),
  }],
  base: './',
  build: { target: 'es2022', sourcemap: true },
  server: { host: '0.0.0.0' },
})
