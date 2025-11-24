import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    // 1. Configurações do Servidor de Desenvolvimento (`npm run dev`)
    server: {
        host: "0.0.0.0",
        port: 8080,
    },

    // 2. Configurações do Servidor de Preview/Produção (`npm run start`)
    preview: {
        port: process.env.PORT ? Number(process.env.PORT) : 4173,
        host: '0.0.0.0', // Mantém o host aberto para aceitar conexões

        // 💥 NOVIDADE: Adiciona o domínio do Render aos hosts permitidos
        // 'eatpage.onrender.com' é o host que está sendo bloqueado
        allowedHosts: [
            'eatpage.onrender.com',
            '.onrender.com' // Adiciona o curinga para o domínio do Render, caso o nome mude
        ],
    },

    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));