/**
 * Módulo de Gráficos do Steam Reviews Analyzer
 * Contém funções para criação e atualização de gráficos
 */

const CHARTS = {
    // Instâncias de gráficos
    instances: {
        reviewsChart: null,
        sentimentChart: null,
        topicsChart: null
    },
    
    /**
     * Inicializa todos os gráficos
     */
    init() {
        this.initReviewsChart();
        this.initSentimentChart();
        this.initTopicsChart();
    },
    
    /**
     * Inicializa o gráfico de distribuição de reviews
     */
    initReviewsChart() {
        const reviewsCtx = document.getElementById('reviewsChart').getContext('2d');
        this.instances.reviewsChart = new Chart(reviewsCtx, {
            type: 'pie',
            data: {
                labels: ['Positivas', 'Negativas'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        CONFIG.CHARTS.COLORS.POSITIVE, // Verde para positivas
                        CONFIG.CHARTS.COLORS.NEGATIVE  // Vermelho para negativas
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição de Reviews',
                        color: '#c7d5e0',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#c7d5e0'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Inicializa o gráfico de análise de sentimento
     */
    initSentimentChart() {
        const sentimentCtx = document.getElementById('sentimentChart').getContext('2d');
        this.instances.sentimentChart = new Chart(sentimentCtx, {
            type: 'bar',
            data: {
                labels: ['Muito Positivo', 'Positivo', 'Neutro', 'Negativo', 'Muito Negativo'],
                datasets: [{
                    label: 'Análise de Sentimento',
                    data: [0, 0, 0, 0, 0],
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
                    title: {
                        display: true,
                        text: 'Análise de Sentimento',
                        color: '#c7d5e0',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${value} reviews (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Inicializa o gráfico de tópicos
     */
    initTopicsChart() {
        const topicsCtx = document.getElementById('topicsChart').getContext('2d');
        this.instances.topicsChart = new Chart(topicsCtx, {
            type: 'radar',
            data: {
                labels: ['Jogabilidade', 'Gráficos', 'História', 'Áudio', 'Valor', 'Desempenho'],
                datasets: [{
                    label: 'Menções Positivas',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(92, 126, 16, 0.2)',
                    borderColor: 'rgba(92, 126, 16, 1)',
                    pointBackgroundColor: 'rgba(92, 126, 16, 1)'
                }, {
                    label: 'Menções Negativas',
                    data: [0, 0, 0, 0, 0, 0],
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
                    title: {
                        display: true,
                        text: 'Tópicos Mencionados',
                        color: '#c7d5e0',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#c7d5e0'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Atualiza o gráfico de reviews
     * @param {Object} summary - Resumo das reviews
     */
    updateReviewsChart(summary) {
        if (!summary) return;
        
        // Atualizar dados
        this.instances.reviewsChart.data.datasets[0].data = [
            summary.total_positive, 
            summary.total_negative
        ];
        
        // Atualizar gráfico
        this.instances.reviewsChart.update();
    },
    
    /**
     * Atualiza o gráfico de análise de sentimento
     * @param {Array} sentimentData - Dados de sentimento [muitoPositivo, positivo, neutro, negativo, muitoNegativo]
     */
    updateSentimentChart(sentimentData) {
        // Validar dados
        if (!sentimentData || !Array.isArray(sentimentData) || sentimentData.length !== 5) {
            console.error('Dados de sentimento inválidos:', sentimentData);
            return;
        }
        
        // Atualizar dados
        this.instances.sentimentChart.data.datasets[0].data = sentimentData;
        
        // Atualizar gráfico
        this.instances.sentimentChart.update();
    },
    
    /**
     * Atualiza o gráfico de tópicos
     * @param {Array} topicsPositive - Dados de tópicos positivos
     * @param {Array} topicsNegative - Dados de tópicos negativos
     */
    updateTopicsChart(topicsPositive, topicsNegative) {
        // Validar dados
        if (!topicsPositive || !Array.isArray(topicsPositive) || topicsPositive.length !== 6 ||
            !topicsNegative || !Array.isArray(topicsNegative) || topicsNegative.length !== 6) {
            console.error('Dados de tópicos inválidos:', { topicsPositive, topicsNegative });
            return;
        }
        
        // Atualizar dados
        this.instances.topicsChart.data.datasets[0].data = topicsPositive;
        this.instances.topicsChart.data.datasets[1].data = topicsNegative;
        
        // Atualizar gráfico
        this.instances.topicsChart.update();
    },
    
    /**
     * Cria um novo gráfico
     * @param {string} elementId - ID do elemento canvas
     * @param {string} type - Tipo de gráfico (pie, bar, radar, etc)
     * @param {Object} data - Dados do gráfico
     * @param {Object} options - Opções do gráfico
     * @returns {Chart} - Instância do gráfico
     */
    createChart(elementId, type, data, options) {
        const ctx = document.getElementById(elementId).getContext('2d');
        return new Chart(ctx, {
            type: type,
            data: data,
            options: options
        });
    },
    
    /**
     * Limpa todos os gráficos
     */
    clearAllCharts() {
        // Limpar gráfico de reviews
        this.instances.reviewsChart.data.datasets[0].data = [0, 0];
        this.instances.reviewsChart.update();
        
        // Limpar gráfico de sentimento
        this.instances.sentimentChart.data.datasets[0].data = [0, 0, 0, 0, 0];
        this.instances.sentimentChart.update();
        
        // Limpar gráfico de tópicos
        this.instances.topicsChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
        this.instances.topicsChart.data.datasets[1].data = [0, 0, 0, 0, 0, 0];
        this.instances.topicsChart.update();
    }
};

// Exportar como variável global
window.CHARTS = CHARTS;