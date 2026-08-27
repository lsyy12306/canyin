import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// 后台管理前端独立构建。API 基址由 .env 的 VITE_API_BASE 控制（默认值 /api）。
// 开发态通过下方代理将 /api 与 /uploads 转发到后端（FastAPI，默认 :8000）。
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
