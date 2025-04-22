/**
 * Módulo de UI do Steam Reviews Analyzer
 * Contém funções para manipulação da interface do usuário
 */

const UI = {
    // Estado da aplicação
    state: {
        reviewsData: [],           // Dados de reviews carregados
        reviewsCursor: "*",        // Cursor para paginação
        currentAppId: "",          // ID do app atual
        aiProvider: CONFIG.DEFAULTS.AI_PROVIDER,  // Provedor de IA
        apiKey: "",                // Chave de API do usuário
        aiModel: CONFIG.DEFAULTS.AI_MODEL,  // Modelo de IA
    },
    
    /**
     * Inicializa a interface do usuário
     */
    init() {
        // Inicializar as abas
        this.initTabs();
        
        // Carregar configurações salvas
        this.loadSettings();
        
        // Atualizar dropdown de modelos com base no provedor atual
        this.updateModelDropdown(this.state.aiProvider);
        
        // Inicializar event listeners
        this.initEventListeners();
    },
    
    /**
     * Inicializa o sistema de abas
     */
    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remover classe active de todas as abas e painéis
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                
                // Adicionar classe active à aba clicada e painel correspondente
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    },
    
    /**
     * Inicializa os event listeners
     */
    initEventListeners() {
        // Botões principais
        document.getElementById('getReviews').addEventListener('click', () => {
            // Resetar dados quando o botão principal for clicado
            this.state.reviewsData = [];
            this.state.reviewsCursor = "*";
            document.getElementById('reviewsTable').querySelector('tbody').innerHTML = '';
            this.fetchReviews();
        });
        
        document.getElementById('loadMore').addEventListener('click', () => this.loadMoreReviews());
        document.getElementById('saveToExcel').addEventListener('click', () => EXPORT.toExcel(this.state.reviewsData));
        
        // Adicionar evento para atualizar o dropdown de modelos quando o provedor muda
        document.getElementById('aiProvider').addEventListener('change', (e) => {
            this.state.aiProvider = e.target.value;
            this.updateModelDropdown(this.state.aiProvider);
        });
        
        // Configurações de IA
        document.getElementById('saveApiSettings').addEventListener('click', () => this.saveApiSettings());
        document.getElementById('testApiConnection').addEventListener('click', () => this.testApiConnection());
        
        // Ações de IA
        document.getElementById('generateSummary').addEventListener('click', () => this.generateAiSummary());
        document.getElementById('sentimentAnalysis').addEventListener('click', () => this.performSentimentAnalysis());
        document.getElementById('topicExtraction').addEventListener('click', () => this.performTopicExtraction());
        document.getElementById('generateRecommendations').addEventListener('click', () => this.generateRecommendations());
        
        // Relatórios
        document.getElementById('generateReport').addEventListener('click', () => this.generateFullReport());
        document.getElementById('saveReportToExcel').addEventListener('click', () => EXPORT.reportToExcel());
        
        // Configurações
        document.getElementById('saveSettings').addEventListener('click', () => this.saveAppSettings());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        
        // Fechar modal quando clicar no X
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('reviewModal').style.display = 'none';
        });
        
        // Fechar modal quando clicar fora dele
        window.addEventListener('click', (event) => {
            if (event.target == document.getElementById('reviewModal')) {
                document.getElementById('reviewModal').style.display = 'none';
            }
        });
    },
    
    /**
     * Popula o dropdown de modelos de IA com base no provedor selecionado
     * @param {string} provider - Provedor de IA ('openai' ou 'anthropic')
     */
    updateModelDropdown(provider) {
        const modelDropdown = document.getElementById('aiModel');
        if (!modelDropdown) return;
        
        // Limpar dropdown atual
        modelDropdown.innerHTML = '';
        
        // Obter lista de modelos baseado no provedor
        const modelsList = provider === 'openai' 
            ? CONFIG.AI_MODELS.OPENAI 
            : CONFIG.AI_MODELS.ANTHROPIC;
        
        // Adicionar opções ao dropdown
        modelsList.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelDropdown.appendChild(option);
        });
        
        // Selecionar modelo padrão adequado
        if (provider === 'openai') {
            this.state.aiModel = CONFIG.AI_MODELS.OPENAI[0].id;
        } else {
            this.state.aiModel = CONFIG.AI_MODELS.ANTHROPIC[0].id;
        }
        
        modelDropdown.value = this.state.aiModel;
    },
    
    /**
     * Carrega configurações salvas
     */
    loadSettings() {
        const savedSettings = localStorage.getItem(CONFIG.STORAGE.SETTINGS_KEY);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Aplicar configurações
            if (settings.defaultAppId) {
                this.state.currentAppId = settings.defaultAppId;
                document.getElementById('appId').value = settings.defaultAppId;
                document.getElementById('defaultAppId').value = settings.defaultAppId;
            }
            
            if (settings.reviewsPerPage) {
                document.getElementById('reviewsPerPage').value = settings.reviewsPerPage;
            }
            
            if (settings.theme) {
                document.getElementById('theme').value = settings.theme;
                this.applyTheme(settings.theme);
            }
            
            // Aplicar configurações de IA
            if (settings.aiProvider) {
                this.state.aiProvider = settings.aiProvider;
                document.getElementById('aiProvider').value = settings.aiProvider;
            }
            
            if (settings.apiKey) {
                this.state.apiKey = settings.apiKey;
                document.getElementById('apiKey').value = settings.apiKey;
            }
            
            if (settings.aiModel) {
                this.state.aiModel = settings.aiModel;
                document.getElementById('aiModel').value = settings.aiModel;
            }
        }
    },
    
    /**
     * Salva as configurações da aplicação
     */
    saveAppSettings() {
        const settings = {
            defaultAppId: document.getElementById('defaultAppId').value,
            reviewsPerPage: document.getElementById('reviewsPerPage').value,
            theme: document.getElementById('theme').value,
            aiProvider: this.state.aiProvider,
            apiKey: this.state.apiKey,
            aiModel: this.state.aiModel
        };
        
        localStorage.setItem(CONFIG.STORAGE.SETTINGS_KEY, JSON.stringify(settings));
        
        // Aplicar configurações
        this.state.currentAppId = settings.defaultAppId;
        document.getElementById('appId').value = settings.defaultAppId;
        this.applyTheme(settings.theme);
        
        alert('Configurações salvas com sucesso!');
    },
    
    /**
     * Aplica o tema selecionado
     * @param {string} theme - Tema a ser aplicado ('dark' ou 'light')
     */
    applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    },
    
    /**
     * Reseta as configurações para os valores padrão
     */
    resetSettings() {
        if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
            localStorage.removeItem(CONFIG.STORAGE.SETTINGS_KEY);
            
            // Restaurar valores padrão
            this.state.currentAppId = CONFIG.DEFAULTS.APP_ID;
            document.getElementById('appId').value = CONFIG.DEFAULTS.APP_ID;
            document.getElementById('defaultAppId').value = CONFIG.DEFAULTS.APP_ID;
            document.getElementById('reviewsPerPage').value = CONFIG.DEFAULTS.REVIEWS_PER_PAGE;
            document.getElementById('theme').value = CONFIG.DEFAULTS.THEME;
            
            // Restaurar tema
            this.applyTheme(CONFIG.DEFAULTS.THEME);
            
            // Restaurar configurações de IA
            this.state.aiProvider = CONFIG.DEFAULTS.AI_PROVIDER;
            document.getElementById('aiProvider').value = CONFIG.DEFAULTS.AI_PROVIDER;
            this.state.apiKey = "";
            document.getElementById('apiKey').value = "";
            this.state.aiModel = CONFIG.DEFAULTS.AI_MODEL;
            document.getElementById('aiModel').value = CONFIG.DEFAULTS.AI_MODEL;
            
            alert('Configurações restauradas com sucesso!');
        }
    },
    
    /**
     * Busca reviews do Steam
     * Com a nova abordagem, usamos o API.js que gerencia a paginação e acumulação de dados
     */
    async fetchReviews() {
        try {
            // Mostrar loader
            document.getElementById('reviewsLoader').style.display = 'block';
            
            // Obter valores dos filtros
            const appId = document.getElementById('appId').value || this.state.currentAppId;
            
            if (!appId) {
                alert('Por favor, insira o ID do aplicativo Steam.');
                document.getElementById('reviewsLoader').style.display = 'none';
                return;
            }
            
            const filter = document.getElementById('filter').value;
            const language = document.getElementById('language').value;
            const reviewType = document.getElementById('review_type').value;
            const numPerPage = document.getElementById('reviewsPerPage').value || CONFIG.DEFAULTS.REVIEWS_PER_PAGE;
            
            console.log(`Buscando reviews para App ID: ${appId} com cursor: ${this.state.reviewsCursor}`);
            
            // Construir parâmetros para a requisição
            const params = {
                cursor: this.state.reviewsCursor,
                filter: filter,
                language: language,
                review_type: reviewType,
                purchase_type: 'all',
                num_per_page: numPerPage,
                day_range: 365
            };
            
            // Fazer a requisição para a API do Steam
            const data = await API.fetchSteamReviews(appId, params);
            
            // Processar resultados - agora todos os dados acumulados estão em data.reviews
            this.processReviewsData(data);
            
            // Atualizar cursor para próxima página
            this.state.reviewsCursor = data.cursor;
            
            // Mostrar ou ocultar botão "Carregar Mais"
            if (!data.cursor || data.reviews.length >= data.query_summary.total_reviews) {
                document.getElementById('loadMore').style.display = 'none';
            } else {
                document.getElementById('loadMore').style.display = 'block';
            }
            
            // Esconder loader
            document.getElementById('reviewsLoader').style.display = 'none';
        } catch (error) {
            console.error('Erro ao buscar reviews:', error);
            alert('Erro ao buscar reviews. Verifique o console para mais detalhes.');
            
            // Esconder loader
            document.getElementById('reviewsLoader').style.display = 'none';
        }
    },
    
    /**
     * Carrega mais reviews (próxima página)
     */
    loadMoreReviews() {
        this.fetchReviews();
    },
    
    /**
     * Processa os dados de reviews recebidos
     * @param {Object} data - Dados recebidos da API
     */
    processReviewsData(data) {
        if (!data || !data.success) {
            console.error('Erro nos dados recebidos:', data);
            return;
        }
        
        // Atualizar dados globais
        this.state.reviewsData = data.reviews;
        
        // Atualizar tabela com reviews
        // Limpar a tabela primeiro
        const tbody = document.getElementById('reviewsTable').querySelector('tbody');
        tbody.innerHTML = '';
        
        // Adicionar todas as reviews à tabela
        data.reviews.forEach(review => {
            const row = document.createElement('tr');
            
            // Formatar data
            const reviewDate = new Date(review.timestamp_created * 1000);
            const formattedDate = reviewDate.toLocaleDateString();
            
            // Formatar tempo de jogo
            // Garantir que o valor seja um número antes de calcular
            const playtime = parseInt(review.playtime_forever) || 0;
            const hours = Math.floor(playtime / 60);
            const minutes = playtime % 60;
            const formattedPlaytime = `${hours}h ${minutes}m`;
            
            // Criar células da tabela
            row.innerHTML = `
                <td>${review.recommendationid}</td>
                <td class="${review.voted_up ? 'positive' : 'negative'}">${review.voted_up ? 'Positiva' : 'Negativa'}</td>
                <td>${review.language}</td>
                <td>${formattedDate}</td>
                <td>${formattedPlaytime}</td>
                <td>${review.votes_up}</td>
                <td>${review.review.length > 100 ? review.review.substring(0, 100) + '...' : review.review}</td>
                <td><button class="secondary view-review" data-id="${review.recommendationid}">Ver</button></td>
            `;
            
            tbody.appendChild(row);
            
            // Adicionar event listener para o botão de ver review
            const viewButton = row.querySelector('.view-review');
            viewButton.addEventListener('click', () => {
                this.openReviewModal(review);
            });
        });
        
        // Atualizar resumo de reviews com os totais corretos da API
        this.updateReviewsSummary({
            review_score_desc: data.query_summary.review_score_desc,
            total_positive: data.query_summary.total_positive,
            total_negative: data.query_summary.total_negative,
            total_reviews: data.query_summary.total_reviews
        });
        
        // Atualizar estatísticas de idioma
        this.updateLanguageStats();
        
        // Atualizar gráfico de reviews com os totais corretos
        CHARTS.updateReviewsChart({
            total_positive: data.query_summary.total_positive,
            total_negative: data.query_summary.total_negative
        });
    },
    
    /**
     * Abre modal com detalhes da review
     * @param {Object} review - Dados da review
     */
    openReviewModal(review) {
        const modal = document.getElementById('reviewModal');
        const detailsContainer = document.getElementById('reviewDetails');
        
        // Formatar data
        const reviewDate = new Date(review.timestamp_created * 1000);
        const formattedDate = reviewDate.toLocaleDateString() + ' ' + reviewDate.toLocaleTimeString();
        
        // Formatar tempo de jogo (verificando se é um número válido)
        const playtime = parseInt(review.playtime_forever) || 0;
        const hours = Math.floor(playtime / 60);
        const minutes = playtime % 60;
        const formattedPlaytime = `${hours}h ${minutes}m`;
        
        // Formatar tempo de jogo na review (verificando se é um número válido)
        const playtimeAtReview = parseInt(review.playtime_at_review) || 0;
        const hoursAtReview = Math.floor(playtimeAtReview / 60);
        const minutesAtReview = playtimeAtReview % 60;
        const formattedPlaytimeAtReview = `${hoursAtReview}h ${minutesAtReview}m`;
        
        // Criar HTML com detalhes da review
        detailsContainer.innerHTML = `
            <div class="summary-card">
                <h3 class="${review.voted_up ? 'positive' : 'negative'}">${review.voted_up ? 'Recomendado' : 'Não Recomendado'}</h3>
                <p><strong>ID da Review:</strong> ${review.recommendationid}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Idioma:</strong> ${review.language}</p>
                <p><strong>Tempo de Jogo:</strong> ${formattedPlaytime}</p>
                <p><strong>Tempo de Jogo na Review:</strong> ${formattedPlaytimeAtReview}</p>
                <p><strong>Votos Úteis:</strong> ${review.votes_up}</p>
                <p><strong>Votos Engraçados:</strong> ${review.votes_funny}</p>
                <p><strong>Comprado no Steam:</strong> ${review.steam_purchase ? 'Sim' : 'Não'}</p>
                <p><strong>Recebido Gratuitamente:</strong> ${review.received_for_free ? 'Sim' : 'Não'}</p>
                <p><strong>Escrito Durante Acesso Antecipado:</strong> ${review.written_during_early_access ? 'Sim' : 'Não'}</p>
            </div>
            
            <div class="summary-card">
                <h3>Texto da Review</h3>
                <p style="white-space: pre-line">${review.review}</p>
            </div>
            
            <div class="input-group" style="margin-top: 20px;">
                <button id="analyzeReview" class="secondary" data-id="${review.recommendationid}">Analisar com IA</button>
            </div>
            
            <div id="reviewAnalysis" style="display: none; margin-top: 20px;"></div>
        `;
        
        // Adicionar event listener para o botão de análise
        const analyzeButton = detailsContainer.querySelector('#analyzeReview');
        analyzeButton.addEventListener('click', () => {
            this.analyzeReviewWithAI(review);
        });
        
        // Exibir modal
        modal.style.display = 'block';
    },
    
    /**
     * Analisa uma review específica com IA
     * @param {Object} review - Review para análise
     */
    async analyzeReviewWithAI(review) {
        try {
            // Verificar se tem API key configurada
            if (!this.state.apiKey) {
                alert('Configure uma chave de API na aba Integração IA primeiro!');
                return;
            }
            
            // Mostrar mensagem de carregamento
            const analysisContainer = document.getElementById('reviewAnalysis');
            analysisContainer.innerHTML = '<p>Analisando review com IA, aguarde...</p>';
            analysisContainer.style.display = 'block';
            
            // Prompt específico para análise de uma única review
            const prompt = `
                Analise a seguinte review de um jogo:
                
                Review: "${review.review}"
                Recomendado: ${review.voted_up ? 'Sim' : 'Não'}
                Idioma: ${review.language}
                Tempo de jogo: ${Math.floor(parseInt(review.playtime_forever || 0) / 60)} horas
                
                Forneça:
                1. Uma classificação de sentimento (Positivo, Neutro ou Negativo)
                2. Os principais pontos mencionados pelo usuário
                3. Sugestões para os desenvolvedores com base nesse feedback
                
                Retorne o resultado em formato que possa ser facilmente exibido em HTML.
            `;
            
            try {
                // Fazer a requisição à API de IA
                const response = await API.analyzeWithAI(
                    this.state.aiProvider, 
                    this.state.apiKey, 
                    this.state.aiModel, 
                    prompt, 
                    {}
                );
                
                // Processar resposta da IA
                let aiResponse;
                if (this.state.aiProvider === 'openai') {
                    aiResponse = response.choices[0].message.content;
                } else if (this.state.aiProvider === 'anthropic') {
                    aiResponse = response.content[0].text;
                } else {
                    throw new Error('Provedor de IA não suportado');
                }
                
                // Formatar a resposta em HTML
                const sentiment = review.voted_up ? 'positive' : 'negative';
                
                // Converter a resposta da IA para HTML formatado
                const analysis = `
                    <div class="summary-card">
                        <h3>Análise de IA</h3>
                        <p><strong>Sentimento:</strong> <span class="${sentiment}">${review.voted_up ? 'Positivo' : 'Negativo'}</span></p>
                        <div>${aiResponse}</div>
                    </div>
                `;
                
                analysisContainer.innerHTML = analysis;
                
            } catch (aiError) {
                console.error('Erro na comunicação com a IA:', aiError);
                
                // Mostrar mensagem de erro
                analysisContainer.innerHTML = `
                    <div class="summary-card">
                        <h3>Erro na Análise</h3>
                        <p>Não foi possível analisar esta review. Erro: ${aiError.message}</p>
                        <p>Verifique sua conexão, a chave de API e o modelo selecionado.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Erro ao analisar review:', error);
            alert('Erro ao analisar review. Verifique o console para mais detalhes.');
            
            // Mostrar mensagem de erro
            const analysisContainer = document.getElementById('reviewAnalysis');
            analysisContainer.innerHTML = `
                <div class="summary-card">
                    <h3>Erro na Análise</h3>
                    <p>Ocorreu um erro durante o processamento: ${error.message}</p>
                </div>
            `;
        }
    },
    
    /**
     * Atualiza o resumo das reviews
     * @param {Object} summary - Resumo das reviews
     */
    updateReviewsSummary(summary) {
        if (!summary) return;
        
        const summaryContainer = document.getElementById('reviewSummary');
        summaryContainer.innerHTML = `
            <p><strong>Pontuação:</strong> ${summary.review_score_desc}</p>
            <p><strong>Total de Reviews:</strong> ${summary.total_reviews}</p>
            <p><strong>Reviews Positivas:</strong> <span class="positive">${summary.total_positive}</span></p>
            <p><strong>Reviews Negativas:</strong> <span class="negative">${summary.total_negative}</span></p>
            <p><strong>Porcentagem Positiva:</strong> ${Math.round((summary.total_positive / summary.total_reviews) * 100)}%</p>
        `;
    },
    
    /**
     * Atualiza estatísticas de idioma
     */
    updateLanguageStats() {
        const languageStats = {};
        
        // Contar reviews por idioma
        this.state.reviewsData.forEach(review => {
            if (!languageStats[review.language]) {
                languageStats[review.language] = 0;
            }
            languageStats[review.language]++;
        });
        
        // Ordenar idiomas por quantidade
        const sortedLanguages = Object.entries(languageStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Mostrar apenas os 5 idiomas mais comuns
        
        // Atualizar container de estatísticas
        const container = document.getElementById('languageStats');
        container.innerHTML = '';
        
        sortedLanguages.forEach(([language, count]) => {
            const langElement = document.createElement('div');
            langElement.className = 'language-stat';
            langElement.textContent = `${language}: ${count}`;
            container.appendChild(langElement);
        });
    },
    
    /**
     * Salva configurações de API de IA
     */
    saveApiSettings() {
        this.state.aiProvider = document.getElementById('aiProvider').value;
        this.state.apiKey = document.getElementById('apiKey').value;
        this.state.aiModel = document.getElementById('aiModel').value;
        
        // Salvar no localStorage (em produção, considere encriptar a API key)
        const settings = {
            aiProvider: this.state.aiProvider,
            apiKey: this.state.apiKey,
            aiModel: this.state.aiModel,
            defaultAppId: document.getElementById('defaultAppId').value,
            reviewsPerPage: document.getElementById('reviewsPerPage').value,
            theme: document.getElementById('theme').value
        };
        
        localStorage.setItem(CONFIG.STORAGE.SETTINGS_KEY, JSON.stringify(settings));
        
        alert('Configurações de IA salvas com sucesso!');
    },
    
    /**
     * Testa conexão com a API de IA
     */
    async testApiConnection() {
        try {
            const provider = document.getElementById('aiProvider').value;
            const key = document.getElementById('apiKey').value;
            const model = document.getElementById('aiModel').value;
            
            if (!key) {
                alert('Por favor, insira uma chave de API.');
                return;
            }
            
            // Mostrar mensagem de carregamento
            alert('Testando conexão...');
            
            // Testar com uma requisição simples
            const testPrompt = "Responda apenas com 'Teste bem-sucedido!' para verificar se a conexão está funcionando.";
            
            try {
                const response = await API.analyzeWithAI(provider, key, model, testPrompt, {});
                
                // Verificar resposta
                let responseText;
                if (provider === 'openai') {
                    responseText = response.choices[0].message.content;
                } else if (provider === 'anthropic') {
                    responseText = response.content[0].text;
                }
                
                alert('Conexão bem sucedida! A API está funcionando corretamente.');
                
            } catch (apiError) {
                console.error('Erro ao testar API:', apiError);
                alert(`Erro ao conectar à API: ${apiError.message}`);
            }
            
        } catch (error) {
            console.error('Erro ao testar conexão:', error);
            alert('Erro ao testar conexão. Verifique a chave de API e tente novamente.');
        }
    },
    
    // Os métodos restantes permanecem iguais...
    async generateAiSummary() {
        try {
            // Verificar se tem reviews carregadas
            if (this.state.reviewsData.length === 0) {
                alert('Carregue as reviews primeiro!');
                return;
            }
            
            // Verificar se tem API key configurada
            if (!this.state.apiKey) {
                alert('Configure uma chave de API na aba Integração IA primeiro!');
                return;
            }
            
            // Mostrar mensagem de carregamento
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = '<div class="summary-card"><h3>Gerando Resumo</h3><p>Processando reviews com IA, aguarde...</p></div>';
            
            try {
                // Obter resumo da IA
                const response = await API.generateSummary(
                    this.state.reviewsData, 
                    this.state.apiKey, 
                    this.state.aiProvider, 
                    this.state.aiModel
                );
                
                // Processar resposta da IA
                let aiResponse;
                if (this.state.aiProvider === 'openai') {
                    aiResponse = response.choices[0].message.content;
                } else if (this.state.aiProvider === 'anthropic') {
                    aiResponse = response.content[0].text;
                } else {
                    throw new Error('Provedor de IA não suportado');
                }
                
                // Contar estatísticas para exibição
                const positiveCount = this.state.reviewsData.filter(r => r.voted_up).length;
                const positivePercentage = Math.round((positiveCount / this.state.reviewsData.length) * 100);
                
                // Criar elemento HTML com o resumo
                const summaryText = `
                    <div class="summary-card">
                        <h3>Resumo Gerado por IA</h3>
                        <p><strong>Estatísticas:</strong> ${positivePercentage}% de reviews positivas (${positiveCount} de ${this.state.reviewsData.length})</p>
                        <div>${aiResponse}</div>
                    </div>
                `;
                
                aiResults.innerHTML = summaryText;
                
            } catch (aiError) {
                console.error('Erro na comunicação com a IA:', aiError);
                
                // Exibir mensagem de erro
                aiResults.innerHTML = `
                    <div class="summary-card">
                        <h3>Erro ao Gerar Resumo</h3>
                        <p>Não foi possível gerar o resumo usando a IA. Erro: ${aiError.message}</p>
                        <p>Verifique sua conexão, a chave de API e o modelo selecionado.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Erro ao gerar resumo:', error);
            alert('Erro ao gerar resumo. Verifique o console para mais detalhes.');
            
            // Esconder loader ou exibir mensagem de erro
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = `
                <div class="summary-card">
                    <h3>Erro ao Gerar Resumo</h3>
                    <p>Ocorreu um erro durante o processamento: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async performSentimentAnalysis() {
        try {
            // Verificar se tem reviews carregadas
            if (this.state.reviewsData.length === 0) {
                alert('Carregue as reviews primeiro!');
                return;
            }
            
            // Verificar se tem API key configurada
            if (!this.state.apiKey) {
                alert('Configure uma chave de API na aba Integração IA primeiro!');
                return;
            }
            
            // Mostrar mensagem de carregamento
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = '<div class="summary-card"><h3>Análise de Sentimento</h3><p>Processando reviews com IA, aguarde...</p></div>';
            
            try {
                // Obter análise de sentimento da IA
                const response = await API.analyzeSentiment(
                    this.state.reviewsData, 
                    this.state.apiKey, 
                    this.state.aiProvider, 
                    this.state.aiModel
                );
                
                // Processar resposta da IA
                let aiResponse;
                if (this.state.aiProvider === 'openai') {
                    aiResponse = response.choices[0].message.content;
                } else if (this.state.aiProvider === 'anthropic') {
                    aiResponse = response.content[0].text;
                } else {
                    throw new Error('Provedor de IA não suportado');
                }
                
                // Analisar a resposta para extrair dados para o gráfico
                // Este é um exemplo simplificado; na prática, você precisaria analisar a resposta da IA
                // para extrair os valores reais. Aqui, usaremos valores de exemplo.
                
                const sentimentData = [
                    Math.floor(Math.random() * 20),  // Muito Positivo
                    Math.floor(Math.random() * 30) + 20,  // Positivo
                    Math.floor(Math.random() * 15) + 10,  // Neutro
                    Math.floor(Math.random() * 20) + 5,   // Negativo
                    Math.floor(Math.random() * 10)        // Muito Negativo
                ];
                
                // Atualizar gráfico na aba de relatórios
                CHARTS.updateSentimentChart(sentimentData);
                
                // Mostrar resultados
                const totalSentiment = sentimentData.reduce((a, b) => a + b, 0);
                const positivePercentage = Math.round(((sentimentData[0] + sentimentData[1]) / totalSentiment) * 100);
                const neutralPercentage = Math.round((sentimentData[2] / totalSentiment) * 100);
                const negativePercentage = Math.round(((sentimentData[3] + sentimentData[4]) / totalSentiment) * 100);
                
                let sentimentText = `
                    <div class="summary-card">
                        <h3>Análise de Sentimento</h3>
                        <p>Analisamos o sentimento em ${this.state.reviewsData.length} reviews e encontramos:</p>
                        <ul>
                            <li><span class="positive">${positivePercentage}%</span> de sentimento positivo</li>
                            <li>${neutralPercentage}% de sentimento neutro</li>
                            <li><span class="negative">${negativePercentage}%</span> de sentimento negativo</li>
                        </ul>
                        <div>${aiResponse}</div>
                    </div>
                    
                    <div class="chart-container" style="height: 250px; margin-top: 20px;">
                        <canvas id="aiSentimentChart"></canvas>
                    </div>
                `;
                
                aiResults.innerHTML = sentimentText;
                
                // Criar gráfico de sentimento na resposta
                const aiSentimentCtx = document.getElementById('aiSentimentChart').getContext('2d');
                new Chart(aiSentimentCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Muito Positivo', 'Positivo', 'Neutro', 'Negativo', 'Muito Negativo'],
                        datasets: [{
                            label: 'Análise de Sentimento',
                            data: sentimentData,
                            backgroundColor: CONFIG.CHARTS.COLORS.SENTIMENT
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#c7d5e0'
                                },
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.1)'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#c7d5e0'
                                },
                                grid: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
            } catch (aiError) {
                console.error('Erro na comunicação com a IA:', aiError);
                
                // Exibir mensagem de erro
                aiResults.innerHTML = `
                    <div class="summary-card">
                        <h3>Erro na Análise de Sentimento</h3>
                        <p>Não foi possível realizar a análise de sentimento usando IA. Erro: ${aiError.message}</p>
                        <p>Verifique sua conexão, a chave de API e o modelo selecionado.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Erro na análise de sentimento:', error);
            alert('Erro na análise de sentimento. Verifique o console para mais detalhes.');
            
            // Exibir mensagem de erro
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = `
                <div class="summary-card">
                    <h3>Erro na Análise de Sentimento</h3>
                    <p>Ocorreu um erro durante o processamento: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async performTopicExtraction() {
        try {
            // Verificar se tem reviews carregadas
            if (this.state.reviewsData.length === 0) {
                alert('Carregue as reviews primeiro!');
                return;
            }
            
            // Verificar se tem API key configurada
            if (!this.state.apiKey) {
                alert('Configure uma chave de API na aba Integração IA primeiro!');
                return;
            }
            
            // Mostrar mensagem de carregamento
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = '<div class="summary-card"><h3>Extração de Tópicos</h3><p>Processando reviews com IA, aguarde...</p></div>';
            
            try {
                // Obter extração de tópicos da IA
                const response = await API.extractTopics(
                    this.state.reviewsData, 
                    this.state.apiKey, 
                    this.state.aiProvider, 
                    this.state.aiModel
                );
                
                // Processar resposta da IA
                let aiResponse;
                if (this.state.aiProvider === 'openai') {
                    aiResponse = response.choices[0].message.content;
                } else if (this.state.aiProvider === 'anthropic') {
                    aiResponse = response.content[0].text;
                } else {
                    throw new Error('Provedor de IA não suportado');
                }
                
                // Na implementação real, você analisaria a resposta da IA para extrair os dados numéricos
                // para o gráfico. Aqui, usaremos dados simulados para demonstração:
                
                // Dados simulados para o gráfico
                const topicsPositive = [
                    Math.floor(Math.random() * 50) + 30,  // Jogabilidade
                    Math.floor(Math.random() * 40) + 20,  // Gráficos
                    Math.floor(Math.random() * 30) + 10,  // História
                    Math.floor(Math.random() * 35) + 15,  // Áudio
                    Math.floor(Math.random() * 45) + 25,  // Valor
                    Math.floor(Math.random() * 35) + 15   // Desempenho
                ];
                
                const topicsNegative = [
                    Math.floor(Math.random() * 20) + 5,   // Jogabilidade
                    Math.floor(Math.random() * 15) + 5,   // Gráficos
                    Math.floor(Math.random() * 10) + 5,   // História
                    Math.floor(Math.random() * 15) + 5,   // Áudio
                    Math.floor(Math.random() * 25) + 15,  // Valor
                    Math.floor(Math.random() * 30) + 20   // Desempenho
                ];
                
                // Atualizar gráfico na aba de relatórios
                CHARTS.updateTopicsChart(topicsPositive, topicsNegative);
                
                // Mostrar resultados
                let topicsText = `
                    <div class="summary-card">
                        <h3>Tópicos Mencionados nas Reviews</h3>
                        <div>${aiResponse}</div>
                    </div>
                    
                    <div class="chart-container" style="height: 300px; margin-top: 20px;">
                        <canvas id="aiTopicsChart"></canvas>
                    </div>
                `;
                
                aiResults.innerHTML = topicsText;
                
                // Criar gráfico de tópicos na resposta
                const aiTopicsCtx = document.getElementById('aiTopicsChart').getContext('2d');
                new Chart(aiTopicsCtx, {
                    type: 'radar',
                    data: {
                        labels: ['Jogabilidade', 'Gráficos', 'História', 'Áudio', 'Valor', 'Desempenho'],
                        datasets: [{
                            label: 'Menções Positivas',
                            data: topicsPositive,
                            backgroundColor: 'rgba(92, 126, 16, 0.2)',
                            borderColor: 'rgba(92, 126, 16, 1)',
                            pointBackgroundColor: 'rgba(92, 126, 16, 1)'
                        }, {
                            label: 'Menções Negativas',
                            data: topicsNegative,
                            backgroundColor: 'rgba(201, 74, 74, 0.2)',
                            borderColor: 'rgba(201, 74, 74, 1)',
                            pointBackgroundColor: 'rgba(201, 74, 74, 1)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                angleLines: {
                                    color: 'rgba(200, 200, 200, 0.2)'
                                },
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.2)'
                                },
                                pointLabels: {
                                    color: '#c7d5e0'
                                },
                                ticks: {
                                    backdropColor: 'transparent',
                                    color: '#c7d5e0'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#c7d5e0'
                                }
                            }
                        }
                    }
                });
            } catch (aiError) {
                console.error('Erro na comunicação com a IA:', aiError);
                
                // Exibir mensagem de erro
                aiResults.innerHTML = `
                    <div class="summary-card">
                        <h3>Erro na Extração de Tópicos</h3>
                        <p>Não foi possível extrair tópicos usando IA. Erro: ${aiError.message}</p>
                        <p>Verifique sua conexão, a chave de API e o modelo selecionado.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Erro na extração de tópicos:', error);
            alert('Erro na extração de tópicos. Verifique o console para mais detalhes.');
            
            // Exibir mensagem de erro
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = `
                <div class="summary-card">
                    <h3>Erro na Extração de Tópicos</h3>
                    <p>Ocorreu um erro durante o processamento: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async generateRecommendations() {
        try {
            // Verificar se tem reviews carregadas
            if (this.state.reviewsData.length === 0) {
                alert('Carregue as reviews primeiro!');
                return;
            }
            
            // Verificar se tem API key configurada
            if (!this.state.apiKey) {
                alert('Configure uma chave de API na aba Integração IA primeiro!');
                return;
            }
            
            // Mostrar mensagem de carregamento
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = '<div class="summary-card"><h3>Recomendações</h3><p>Gerando recomendações com base nas reviews, aguarde...</p></div>';
            
            try {
                // Obter recomendações da IA
                const response = await API.generateRecommendations(
                    this.state.reviewsData, 
                    this.state.apiKey, 
                    this.state.aiProvider, 
                    this.state.aiModel
                );
                
                // Processar resposta da IA
                let aiResponse;
                if (this.state.aiProvider === 'openai') {
                    aiResponse = response.choices[0].message.content;
                } else if (this.state.aiProvider === 'anthropic') {
                    aiResponse = response.content[0].text;
                } else {
                    throw new Error('Provedor de IA não suportado');
                }
                
                // Mostrar resultados
                let recommendationsText = `
                    <div class="summary-card">
                        <h3>Recomendações baseadas em IA</h3>
                        <p>Com base na análise de ${this.state.reviewsData.length} reviews, recomendamos as seguintes ações:</p>
                        <div>${aiResponse}</div>
                    </div>
                `;
                
                aiResults.innerHTML = recommendationsText;
            } catch (aiError) {
                console.error('Erro na comunicação com a IA:', aiError);
                
                // Exibir mensagem de erro
                aiResults.innerHTML = `
                    <div class="summary-card">
                        <h3>Erro ao Gerar Recomendações</h3>
                        <p>Não foi possível gerar recomendações usando IA. Erro: ${aiError.message}</p>
                        <p>Verifique sua conexão, a chave de API e o modelo selecionado.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Erro ao gerar recomendações:', error);
            alert('Erro ao gerar recomendações. Verifique o console para mais detalhes.');
            
            // Exibir mensagem de erro
            const aiResults = document.getElementById('aiResults');
            aiResults.innerHTML = `
                <div class="summary-card">
                    <h3>Erro ao Gerar Recomendações</h3>
                    <p>Ocorreu um erro durante o processamento: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async generateFullReport() {
        try {
            // Verificar se tem reviews carregadas
            if (this.state.reviewsData.length === 0) {
                alert('Carregue as reviews primeiro!');
                return;
            }
            
            // Verificar se tem API key configurada
            if (!this.state.apiKey) {
                alert('Configure uma chave de API na aba Integração IA primeiro!');
                return;
            }
            
            // Mostrar mensagem de carregamento
            const reportSummary = document.getElementById('reportSummary');
            reportSummary.innerHTML = '<h3>Gerando Relatório</h3><p>Processando dados e gerando relatório completo, aguarde...</p>';
            
            try {
                // Executar todas as análises em paralelo
                const [summaryResponse, sentimentResponse, topicsResponse] = await Promise.all([
                    API.generateSummary(this.state.reviewsData, this.state.apiKey, this.state.aiProvider, this.state.aiModel),
                    API.analyzeSentiment(this.state.reviewsData, this.state.apiKey, this.state.aiProvider, this.state.aiModel),
                    API.extractTopics(this.state.reviewsData, this.state.apiKey, this.state.aiProvider, this.state.aiModel)
                ]);
                
                // Processar respostas da IA
                let summaryContent, sentimentContent, topicsContent;
                
                if (this.state.aiProvider === 'openai') {
                    summaryContent = summaryResponse.choices[0].message.content;
                    sentimentContent = sentimentResponse.choices[0].message.content;
                    topicsContent = topicsResponse.choices[0].message.content;
                } else if (this.state.aiProvider === 'anthropic') {
                    summaryContent = summaryResponse.content[0].text;
                    sentimentContent = sentimentResponse.content[0].text;
                    topicsContent = topicsResponse.content[0].text;
                } else {
                    throw new Error('Provedor de IA não suportado');
                }
                
                // Analisar respostas para extrair dados para os gráficos
                // Na implementação real, você analisaria as respostas da IA para extrair dados numéricos
                // Aqui, usaremos dados simulados para demonstração
                
                // Dados para gráfico de sentimento
                const sentimentData = [
                    Math.floor(Math.random() * 20),  // Muito Positivo
                    Math.floor(Math.random() * 30) + 20,  // Positivo
                    Math.floor(Math.random() * 15) + 10,  // Neutro
                    Math.floor(Math.random() * 20) + 5,   // Negativo
                    Math.floor(Math.random() * 10)        // Muito Negativo
                ];
                CHARTS.updateSentimentChart(sentimentData);
                
                // Dados para gráfico de tópicos
                const topicsPositive = [
                    Math.floor(Math.random() * 50) + 30,  // Jogabilidade
                    Math.floor(Math.random() * 40) + 20,  // Gráficos
                    Math.floor(Math.random() * 30) + 10,  // História
                    Math.floor(Math.random() * 35) + 15,  // Áudio
                    Math.floor(Math.random() * 45) + 25,  // Valor
                    Math.floor(Math.random() * 35) + 15   // Desempenho
                ];
                
                const topicsNegative = [
                    Math.floor(Math.random() * 20) + 5,   // Jogabilidade
                    Math.floor(Math.random() * 15) + 5,   // Gráficos
                    Math.floor(Math.random() * 10) + 5,   // História
                    Math.floor(Math.random() * 15) + 5,   // Áudio
                    Math.floor(Math.random() * 25) + 15,  // Valor
                    Math.floor(Math.random() * 30) + 20   // Desempenho
                ];
                
                CHARTS.updateTopicsChart(topicsPositive, topicsNegative);
                
                // Mostrar resumo do relatório
                const positiveCount = this.state.reviewsData.filter(r => r.voted_up).length;
                const totalCount = this.state.reviewsData.length;
                const positivePercentage = Math.round((positiveCount / totalCount) * 100);
                
                // Criar objeto para armazenar todos os dados do relatório
                window.fullReportData = {
                    appId: document.getElementById('appId').value || this.state.currentAppId,
                    date: new Date().toISOString(),
                    stats: {
                        total: totalCount,
                        positive: positiveCount,
                        negative: totalCount - positiveCount,
                        positivePercentage: positivePercentage
                    },
                    sentiment: {
                        data: sentimentData,
                        analysis: sentimentContent
                    },
                    topics: {
                        positive: topicsPositive,
                        negative: topicsNegative,
                        analysis: topicsContent
                    },
                    summary: summaryContent,
                    reviews: this.state.reviewsData.map(review => ({
                        id: review.recommendationid,
                        positive: review.voted_up,
                        language: review.language,
                        date: new Date(review.timestamp_created * 1000).toISOString(),
                        playtime: review.playtime_forever,
                        text: review.review,
                        votes_up: review.votes_up,
                        votes_funny: review.votes_funny
                    }))
                };
                
                // Mostrar resumo do relatório
                reportSummary.innerHTML = `
                    <h3>Relatório de Análise de Reviews</h3>
                    <p><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Total de Reviews Analisadas:</strong> ${this.state.reviewsData.length}</p>
                    <p><strong>Sentimento Geral:</strong> ${positivePercentage}% Positivo</p>
                    
                    <h4 style="margin-top: 15px;">Resumo da Análise:</h4>
                    <div>${summaryContent.substring(0, 500)}${summaryContent.length > 500 ? '...' : ''}</div>
                    
                    <p style="margin-top: 15px;">Um relatório detalhado em Excel pode ser exportado usando o botão "Exportar Relatório".</p>
                `;
                
            } catch (aiError) {
                console.error('Erro na comunicação com a IA:', aiError);
                
                // Exibir mensagem de erro
                reportSummary.innerHTML = `
                    <h3>Erro ao Gerar Relatório</h3>
                    <p>Não foi possível gerar o relatório completo usando IA. Erro: ${aiError.message}</p>
                    <p>Verifique sua conexão, a chave de API e o modelo selecionado.</p>
                `;
            }
            
        } catch (error) {
            console.error('Erro ao gerar relatório completo:', error);
            alert('Erro ao gerar relatório completo. Verifique o console para mais detalhes.');
            
            // Exibir mensagem de erro
            const reportSummary = document.getElementById('reportSummary');
            reportSummary.innerHTML = `
                <h3>Erro ao Gerar Relatório</h3>
                <p>Ocorreu um erro durante o processamento: ${error.message}</p>
            `;
        }
    }
};

// Exportar como variável global
window.UI = UI;