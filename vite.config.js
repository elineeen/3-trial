import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
console.dir(process.env)
export default defineConfig({
  plugins: [vue()],
  base:'/3-trial/',
})
