/**
 * Módulo de API do Steam Reviews Analyzer
 * Contém funções para comunicação com APIs externas
 */

const API = {
    /**
     * Busca reviews do Steam usando alternativas para contornar CORS
     * @param {string} appId - ID do aplicativo Steam
     * @param {Object} params - Parâmetros da requisição
     * @returns {Promise<Object>} - Resposta da API
     */
    async fetchSteamReviews(appId, params = {}) {
        try {
            // Parâmetros padrão
            const defaultParams = {
                json: 1,
                cursor: "*",
                filter: "all",
                language: "all",
                review_type: "all",
                purchase_type: "all",
                num_per_page: CONFIG.DEFAULTS.REVIEWS_PER_PAGE,
                day_range: 365
            };
            
            // Mesclar com parâmetros passados
            const queryParams = { ...defaultParams, ...params };
            
            // Construir a URL para a API do Steam
            const steamUrl = `${CONFIG.API.STEAM_API}${appId}`;
            const queryString = Object.entries(queryParams)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            
            const fullUrl = `${steamUrl}?${queryString}`;
            
            // SOLUÇÃO PARA CORS:
            // Em vez de tentar acessar diretamente a API do Steam,
            // vamos simular dados para fins de demonstração
            
            console.log("Simulando chamada à API do Steam:", fullUrl);
            
            // Simular uma pequena latência de rede
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Retornar dados simulados
            return this.generateMockSteamReviews(appId, queryParams);
        } catch (error) {
            console.error("Erro ao buscar reviews do Steam:", error);
            throw error;
        }
    },
    
    /**
     * Gera dados simulados para demonstração (até que um backend possa ser implementado)
     * @param {string} appId - ID do aplicativo Steam
     * @param {Object} params - Parâmetros da requisição
     * @returns {Object} - Dados simulados para demonstração
     */
    generateMockSteamReviews(appId, params) {
        // Idiomas comuns para simulação
        const languages = ['english', 'brazilian', 'spanish', 'russian', 'german', 'french', 'italian'];
        
        // Gerar reviews simuladas
        const reviews = [];
        const reviewCount = parseInt(params.num_per_page) || 20;
        
        // Determinando se devemos filtrar por tipo de review
        let forcePositive = params.review_type === 'positive';
        let forceNegative = params.review_type === 'negative';
        
        for (let i = 0; i < reviewCount; i++) {
            // Determinar se será positiva ou negativa
            let isPositive;
            if (forcePositive) {
                isPositive = true;
            } else if (forceNegative) {
                isPositive = false;
            } else {
                // Aleatório com tendência para positivo (70% de chance)
                isPositive = Math.random() < 0.7;
            }
            
            // Selecionar idioma
            // Se language não for 'all', forçar o idioma selecionado
            let reviewLanguage;
            if (params.language !== 'all') {
                reviewLanguage = params.language;
            } else {
                // Aleatório com pesos
                const langIndex = Math.floor(Math.random() * languages.length);
                reviewLanguage = languages[langIndex];
            }
            
            // Gerar timestamp (últimos 90 dias)
            const now = Math.floor(Date.now() / 1000);
            const ninetyDaysAgo = now - (90 * 24 * 60 * 60);
            const timestamp = Math.floor(Math.random() * (now - ninetyDaysAgo)) + ninetyDaysAgo;
            
            // Gerar tempo de jogo (entre 1 e 100 horas, em minutos)
            const playtime = Math.floor(Math.random() * 6000) + 60;
            
            // Gerar votos (0 a 50 para úteis, 0 a 20 para engraçados)
            const votesUp = Math.floor(Math.random() * 51);
            const votesFunny = Math.floor(Math.random() * 21);
            
            // Gerar texto da review
            let reviewText;
            if (isPositive) {
                reviewText = this.generatePositiveReviewText(reviewLanguage);
            } else {
                reviewText = this.generateNegativeReviewText(reviewLanguage);
            }
            
            // Criar objeto de review
            reviews.push({
                recommendationid: Math.floor(Math.random() * 1000000000) + 100000000,
                author: {
                    steamid: Math.floor(Math.random() * 1000000000) + 1000000000,
                    num_games_owned: Math.floor(Math.random() * 200) + 10,
                    num_reviews: Math.floor(Math.random() * 50) + 1,
                    playtime_forever: playtime,
                    playtime_last_two_weeks: Math.floor(Math.random() * 1200) + 0,
                    playtime_at_review: Math.floor(playtime * 0.8)
                },
                language: reviewLanguage,
                review: reviewText,
                timestamp_created: timestamp,
                timestamp_updated: timestamp + Math.floor(Math.random() * 86400),
                voted_up: isPositive,
                votes_up: votesUp,
                votes_funny: votesFunny,
                steam_purchase: Math.random() < 0.9, // 90% chance
                received_for_free: Math.random() < 0.1, // 10% chance
                written_during_early_access: Math.random() < 0.2 // 20% chance
            });
        }
        
        // Calcular totais para o resumo
        let totalPositive, totalNegative;
        if (params.review_type === 'positive') {
            totalPositive = Math.floor(Math.random() * 1000) + 500;
            totalNegative = Math.floor(Math.random() * 200) + 50;
        } else if (params.review_type === 'negative') {
            totalPositive = Math.floor(Math.random() * 500) + 200;
            totalNegative = Math.floor(Math.random() * 500) + 100;
        } else {
            totalPositive = Math.floor(Math.random() * 1000) + 500;
            totalNegative = Math.floor(Math.random() * 300) + 50;
        }
        
        // Gerar cursor para paginação
        let nextCursor = "";
        // Se este não é o primeiro conjunto, chance de 70% de ter mais páginas
        if (params.cursor !== "*" && Math.random() < 0.7) {
            nextCursor = "nextpage_" + Math.floor(Math.random() * 1000);
        } 
        // Se este é o primeiro conjunto, 90% de chance de ter mais páginas
        else if (params.cursor === "*") {
            nextCursor = "nextpage_" + Math.floor(Math.random() * 1000);
        }
        
        // Construir objeto de resposta
        return {
            success: 1,
            query_summary: {
                num_reviews: reviews.length,
                review_score: 7, // 7 = Muito Positivo
                review_score_desc: "Muito Positivo",
                total_positive: totalPositive,
                total_negative: totalNegative,
                total_reviews: totalPositive + totalNegative
            },
            reviews: reviews,
            cursor: nextCursor
        };
    },
    
    /**
     * Gera texto simulado para reviews positivas
     * @param {string} language - Idioma da review
     * @returns {string} - Texto simulado
     */
    generatePositiveReviewText(language) {
        const positiveTexts = {
            'english': [
                "I really enjoy this game! The gameplay is fun and the graphics are beautiful. Definitely worth the price.",
                "This is one of the best games I've played this year. Interesting mechanics and great story.",
                "Highly recommended! I've spent hours playing and still find new things to do.",
                "The developers did an amazing job. Very polished and runs well on my system.",
                "A must-have for fans of the genre. I love the challenging gameplay and the art style."
            ],
            'brazilian': [
                "Estou realmente gostando deste jogo! A jogabilidade é divertida e os gráficos são lindos. Definitivamente vale o preço.",
                "Este é um dos melhores jogos que joguei este ano. Mecânicas interessantes e ótima história.",
                "Altamente recomendado! Passei horas jogando e ainda encontro coisas novas para fazer.",
                "Os desenvolvedores fizeram um trabalho incrível. Muito polido e roda bem no meu sistema.",
                "Um must-have para fãs do gênero. Adoro a jogabilidade desafiadora e o estilo artístico."
            ],
            'spanish': [
                "¡Realmente disfruto este juego! La jugabilidad es divertida y los gráficos son hermosos. Definitivamente vale el precio.",
                "Este es uno de los mejores juegos que he jugado este año. Mecánicas interesantes y gran historia.",
                "¡Muy recomendable! He pasado horas jugando y sigo encontrando cosas nuevas para hacer.",
                "Los desarrolladores hicieron un trabajo increíble. Muy pulido y funciona bien en mi sistema.",
                "Imprescindible para los fans del género. Me encanta la jugabilidad desafiante y el estilo artístico."
            ]
        };
        
        // Selecionar array de textos do idioma ou usar inglês como fallback
        const textsForLanguage = positiveTexts[language] || positiveTexts['english'];
        
        // Retornar um texto aleatório
        return textsForLanguage[Math.floor(Math.random() * textsForLanguage.length)];
    },
    
    /**
     * Gera texto simulado para reviews negativas
     * @param {string} language - Idioma da review
     * @returns {string} - Texto simulado
     */
    generateNegativeReviewText(language) {
        const negativeTexts = {
            'english': [
                "Not worth the price. Too many bugs and the gameplay gets repetitive fast.",
                "I expected more from this game. The graphics are good but everything else is mediocre.",
                "Can't recommend this game in its current state. Needs more updates and content.",
                "Disappointing experience. The game crashes frequently and the controls are frustrating.",
                "Save your money. This game doesn't deliver on what was promised in the trailers."
            ],
            'brazilian': [
                "Não vale o preço. Muitos bugs e a jogabilidade fica repetitiva rapidamente.",
                "Eu esperava mais deste jogo. Os gráficos são bons, mas todo o resto é medíocre.",
                "Não posso recomendar este jogo no estado atual. Precisa de mais atualizações e conteúdo.",
                "Experiência decepcionante. O jogo trava frequentemente e os controles são frustrantes.",
                "Economize seu dinheiro. Este jogo não entrega o que foi prometido nos trailers."
            ],
            'spanish': [
                "No vale el precio. Demasiados errores y la jugabilidad se vuelve repetitiva rápidamente.",
                "Esperaba más de este juego. Los gráficos son buenos pero todo lo demás es mediocre.",
                "No puedo recomendar este juego en su estado actual. Necesita más actualizaciones y contenido.",
                "Experiencia decepcionante. El juego se bloquea con frecuencia y los controles son frustrantes.",
                "Ahorra tu dinero. Este juego no cumple con lo que se prometió en los trailers."
            ]
        };
        
        // Selecionar array de textos do idioma ou usar inglês como fallback
        const textsForLanguage = negativeTexts[language] || negativeTexts['english'];
        
        // Retornar um texto aleatório
        return textsForLanguage[Math.floor(Math.random() * textsForLanguage.length)];
    },
    
    /**
     * Envia dados para análise com OpenAI (API direta)
     * @param {string} apiKey - Chave de API
     * @param {string} model - Modelo de IA
     * @param {Array} messages - Mensagens para a API
     * @returns {Promise<Object>} - Resposta da API
     */
    async sendToOpenAI(apiKey, model, messages) {
        try {
            // Verificar se a chave de API foi fornecida
            if (!apiKey) {
                throw new Error("Chave de API não fornecida");
            }
            
            // Fazer a requisição direta para a API da OpenAI
            const response = await fetch(CONFIG.API.OPENAI_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: CONFIG.LIMITS.MAX_TOKEN_LENGTH
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Erro na resposta da OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Erro ao enviar para OpenAI:", error);
            throw error;
        }
    },
    
    /**
     * Envia dados para análise com Anthropic (API direta)
     * @param {string} apiKey - Chave de API
     * @param {string} model - Modelo de IA
     * @param {Array} messages - Mensagens para a API
     * @returns {Promise<Object>} - Resposta da API
     */
    async sendToAnthropic(apiKey, model, messages) {
        try {
            // Verificar se a chave de API foi fornecida
            if (!apiKey) {
                throw new Error("Chave de API não fornecida");
            }
            
            // Converter mensagens do formato OpenAI para o formato Anthropic
            const anthropicMessages = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
            
            // Fazer a requisição direta para a API da Anthropic
            const response = await fetch(CONFIG.API.ANTHROPIC_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: model,
                    messages: anthropicMessages,
                    max_tokens: CONFIG.LIMITS.MAX_TOKEN_LENGTH
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Erro na resposta da Anthropic: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Erro ao enviar para Anthropic:", error);
            throw error;
        }
    },
    
    /**
     * Analisa reviews com IA
     * @param {string} provider - Provedor de IA (openai, anthropic)
     * @param {string} apiKey - Chave de API
     * @param {string} model - Modelo de IA
     * @param {string} prompt - Prompt para a IA
     * @param {Object} data - Dados para análise
     * @returns {Promise<Object>} - Resposta da IA
     */
    async analyzeWithAI(provider, apiKey, model, prompt, data) {
        try {
            // Preparar mensagens para a API
            const messages = [
                {
                    role: "system",
                    content: "Você é um assistente especializado em análise de reviews de jogos. Sua tarefa é analisar os dados fornecidos e extrair insights valiosos."
                },
                {
                    role: "user",
                    content: `${prompt}\n\nDados para análise: ${JSON.stringify(data)}`
                }
            ];
            
            // Enviar para a API apropriada
            let response;
            if (provider === 'openai') {
                response = await this.sendToOpenAI(apiKey, model, messages);
            } else if (provider === 'anthropic') {
                response = await this.sendToAnthropic(apiKey, model, messages);
            } else {
                throw new Error(`Provedor de IA não suportado: ${provider}`);
            }
            
            return response;
        } catch (error) {
            console.error(`Erro ao analisar com ${provider}:`, error);
            throw error;
        }
    },
    
    /**
     * Analisa sentimento das reviews
     * @param {Array} reviews - Reviews para análise
     * @param {string} apiKey - Chave de API
     * @param {string} provider - Provedor de IA
     * @param {string} model - Modelo de IA
     * @returns {Promise<Object>} - Resultado da análise
     */
    async analyzeSentiment(reviews, apiKey, provider, model) {
        // Prompt para análise de sentimento
        const prompt = `
            Analise o sentimento das seguintes reviews de um jogo. 
            Classifique cada review em uma das seguintes categorias:
            1. Muito Positivo
            2. Positivo
            3. Neutro
            4. Negativo
            5. Muito Negativo
            
            Forneça também as palavras-chave mais comuns associadas a sentimentos positivos e negativos.
            Apresente os resultados em um formato estruturado com contagens para cada categoria.
        `;
        
        // Enviar apenas um número limitado de reviews para não sobrecarregar a API
        const reviewSample = reviews.slice(0, CONFIG.LIMITS.MAX_REVIEWS_FOR_AI_ANALYSIS).map(review => ({
            voted_up: review.voted_up,
            text: review.review,
            language: review.language
        }));
        
        return await this.analyzeWithAI(provider, apiKey, model, prompt, reviewSample);
    },
    
    /**
     * Extrai tópicos das reviews
     * @param {Array} reviews - Reviews para análise
     * @param {string} apiKey - Chave de API
     * @param {string} provider - Provedor de IA
     * @param {string} model - Modelo de IA
     * @returns {Promise<Object>} - Resultado da análise
     */
    async extractTopics(reviews, apiKey, provider, model) {
        // Prompt para extração de tópicos
        const prompt = `
            Analise as seguintes reviews de um jogo e identifique os principais tópicos mencionados.
            Para cada tópico (Jogabilidade, Gráficos, História, Áudio, Valor, Desempenho), 
            conte quantas reviews mencionam esse tópico de forma positiva e quantas de forma negativa.
            
            Forneça os resultados em um formato estruturado que possa ser facilmente convertido em um gráfico radar,
            com contagens para menções positivas e negativas de cada tópico.
        `;
        
        // Enviar apenas um número limitado de reviews para não sobrecarregar a API
        const reviewSample = reviews.slice(0, CONFIG.LIMITS.MAX_REVIEWS_FOR_AI_ANALYSIS).map(review => ({
            voted_up: review.voted_up,
            text: review.review,
            language: review.language
        }));
        
        return await this.analyzeWithAI(provider, apiKey, model, prompt, reviewSample);
    },
    
    /**
     * Gera resumo das reviews
     * @param {Array} reviews - Reviews para análise
     * @param {string} apiKey - Chave de API
     * @param {string} provider - Provedor de IA
     * @param {string} model - Modelo de IA
     * @returns {Promise<Object>} - Resumo gerado
     */
    async generateSummary(reviews, apiKey, provider, model) {
        // Prompt para geração de resumo
        const prompt = `
            Crie um resumo das seguintes reviews de um jogo.
            Identifique os pontos fortes e fracos mais mencionados.
            Destaque os aspectos que os jogadores mais gostam e os que mais criticam.
            Forneça recomendações específicas para os desenvolvedores com base nesse feedback.
            Organize o resumo em seções claras.
        `;
        
        // Preparar estatísticas gerais
        const positiveCount = reviews.filter(r => r.voted_up).length;
        const totalCount = reviews.length;
        const positivePercentage = Math.round((positiveCount / totalCount) * 100);
        
        // Criar objeto com estatísticas e amostra de reviews
        const data = {
            stats: {
                total: totalCount,
                positive: positiveCount,
                negative: totalCount - positiveCount,
                positivePercentage: positivePercentage
            },
            reviewSample: reviews.slice(0, CONFIG.LIMITS.MAX_REVIEWS_FOR_AI_ANALYSIS).map(review => ({
                voted_up: review.voted_up,
                text: review.review,
                language: review.language
            }))
        };
        
        return await this.analyzeWithAI(provider, apiKey, model, prompt, data);
    },
    
    /**
     * Gera recomendações baseadas nas reviews
     * @param {Array} reviews - Reviews para análise
     * @param {string} apiKey - Chave de API
     * @param {string} provider - Provedor de IA
     * @param {string} model - Modelo de IA
     * @returns {Promise<Object>} - Recomendações geradas
     */
    async generateRecommendations(reviews, apiKey, provider, model) {
        // Prompt para geração de recomendações
        const prompt = `
            Com base nas seguintes reviews de um jogo, gere recomendações específicas para os desenvolvedores.
            Organize as recomendações em três categorias de prioridade:
            1. Prioridade Alta (problemas críticos que precisam ser resolvidos imediatamente)
            2. Prioridade Média (melhorias importantes mas não críticas)
            3. Considerações de Marketing (sugestões para comunicação e estratégia)
            
            Para cada recomendação, explique brevemente a justificativa com base nas reviews.
        `;
        
        // Enviar apenas um número limitado de reviews para não sobrecarregar a API
        const reviewSample = reviews.slice(0, CONFIG.LIMITS.MAX_REVIEWS_FOR_AI_ANALYSIS).map(review => ({
            voted_up: review.voted_up,
            text: review.review,
            language: review.language,
            playtime: review.author.playtime_forever,
            votes_up: review.votes_up
        }));
        
        return await this.analyzeWithAI(provider, apiKey, model, prompt, reviewSample);
    }
};

// Exportar como variável global
window.API = API;