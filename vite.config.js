import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const watchDataPlugin = () => {
  return {
    name: 'watch-data-dir',
    configureServer(server) {
      server.watcher.add(path.resolve(__dirname, '../Data/**/*.json'));
      server.watcher.on('change', (file) => {
        if (file.includes('Data') && file.endsWith('.json')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), watchDataPlugin()],
})
