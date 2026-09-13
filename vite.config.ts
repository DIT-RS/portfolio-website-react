import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PORTFOLIO_DATA = 'src/data/portfolio-data.json'

// The data file lives in src/ so it can be imported and type-checked; it is
// also published at the site root for the runtime fetch.
const portfolioDataAsset = (): Plugin => ({
  name: 'portfolio-data-asset',
  configureServer(server) {
    server.middlewares.use('/portfolio-data.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(readFileSync(PORTFOLIO_DATA))
    })
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'portfolio-data.json',
      source: readFileSync(PORTFOLIO_DATA, 'utf8'),
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    portfolioDataAsset(),
  ],
})
