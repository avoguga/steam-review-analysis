/**
 * Configurações do aplicativo Steam Reviews Analyzer
 * Este arquivo contém constantes e configurações da aplicação
 */

const CONFIG = {
    // Configurações padrão
    DEFAULTS: {
        APP_ID: "",                   // Sem ID padrão
        REVIEWS_PER_PAGE: 20,         // Número de reviews por página
        THEME: "dark",                // Tema padrão
        LANGUAGE: "all",              // Idioma padrão
        AI_PROVIDER: "openai",        // Provedor de IA padrão
        AI_MODEL: "gpt-4o",           // Modelo de IA padrão (atualizado para o mais recente)
    },
    
    // URLs da API
    API: {
        // URL da API do Steam (simulada em modo de demonstração)
        STEAM_API: "https://store.steampowered.com/appreviews/",
        // URLs das APIs de IA
        OPENAI_API: "https://api.openai.com/v1/chat/completions",
        ANTHROPIC_API: "https://api.anthropic.com/v1/messages"
    },
    
    // Limites da API
    LIMITS: {
        MAX_REVIEWS_PER_REQUEST: 100,         // Máximo de reviews por requisição
        MAX_REVIEWS_FOR_AI_ANALYSIS: 20,      // Máximo de reviews para enviar para análise de IA
        MAX_RETRIES: 3,                       // Máximo de tentativas para requisições com erro
        MAX_TOKEN_LENGTH: 4096,               // Limite de tokens para requisições de IA
    },
    
    // Modelos de IA disponíveis
    AI_MODELS: {
        OPENAI: [
            { id: "gpt-4o", name: "GPT-4o" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
        ],
        ANTHROPIC: [
            { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
            { id: "claude-3-opus", name: "Claude 3 Opus" },
            { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
            { id: "claude-3-haiku", name: "Claude 3 Haiku" }
        ]
    },
    
    // Definições de storage local
    STORAGE: {
        SETTINGS_KEY: "steamReviewsSettings",  // Chave para armazenar as configurações
        CACHE_KEY_PREFIX: "steamReviews_"      // Prefixo para chaves de cache
    },
    
    // Definições de gráficos
    CHARTS: {
        COLORS: {
            POSITIVE: "#5c7e10",                // Verde para avaliações positivas
            NEGATIVE: "#c94a4a",                // Vermelho para avaliações negativas
            SENTIMENT: [
                "#4CAF50",                     // Verde escuro (Muito positivo)
                "#8BC34A",                     // Verde claro (Positivo)
                "#FFC107",                     // Amarelo (Neutro)
                "#FF9800",                     // Laranja (Negativo)
                "#F44336"                      // Vermelho (Muito negativo)
            ]
        }
    }
};

// Exportar como variável global
window.CONFIG = CONFIG;