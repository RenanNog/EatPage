import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    // 1. Configurações do Servidor de Desenvolvimento (`npm run dev`)
    server: {
        // Escuta em todas as interfaces. O '::' (IPv6) ou '0.0.0.0' (IPv4) é
        // geralmente recomendado em ambientes containerizados como o Render.
        host: "0.0.0.0",
        port: 8080,
    },

    // 2. Configurações do Servidor de Preview/Produção (`npm run start`)
    // ESSENCIAL para o Render: usa os artefatos da pasta 'dist'.
    preview: {
        // O Render define a porta pela variável de ambiente PORT.
        // Usamos Number(process.env.PORT) para capturar essa porta.
        port: process.env.PORT ? Number(process.env.PORT) : 4173, // 4173 é a porta padrão do vite preview
        // Deve escutar em 0.0.0.0 para ser acessível externamente no Render.
        host: '0.0.0.0',
    },

    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));