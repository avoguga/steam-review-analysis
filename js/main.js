/**
 * Arquivo Principal do Steam Reviews Analyzer
 * Ponto de entrada da aplicação
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Steam Reviews Analyzer - Inicializando...');
    
    // Verificar disponibilidade das dependências
    if (!window.Chart) {
        console.error('Erro: Chart.js não encontrado. Verifique se a biblioteca está carregada corretamente.');
        alert('Erro: Dependência Chart.js não encontrada. A aplicação pode não funcionar corretamente.');
    }
    
    if (!window.XLSX) {
        console.error('Erro: SheetJS não encontrado. Verifique se a biblioteca está carregada corretamente.');
        alert('Erro: Dependência SheetJS não encontrada. A exportação para Excel não funcionará.');
    }
    
    try {
        // Inicializar módulos
        console.log('Inicializando módulos...');
        
        // 1. Inicializar gráficos
        CHARTS.init();
        console.log('Módulo de gráficos inicializado.');
        
        // 2. Inicializar interface do usuário
        UI.init();
        console.log('Módulo de interface do usuário inicializado.');
        
        // Verificar e criar diretório de cache se necessário
        if (typeof localStorage !== 'undefined') {
            console.log('Sistema de cache disponível.');
        } else {
            console.warn('LocalStorage não disponível. O cache de configurações não funcionará.');
        }
        
        // Verificar suporte a download de arquivos
        if ('download' in document.createElement('a')) {
            console.log('Suporte a download de arquivos disponível.');
        } else {
            console.warn('Este navegador pode não suportar o download direto de arquivos.');
        }
        
        // Adicionar função auxiliar para formatação de números
        window.formatNumber = function(number) {
            return new Intl.NumberFormat().format(number);
        };
        
        // Adicionar função auxiliar para formatação de tempo
        window.formatPlaytime = function(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        };
        
        // Verificar tema preferido
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        console.log(`Tema preferido do sistema: ${prefersDarkScheme.matches ? 'escuro' : 'claro'}`);
        
        // Adicionar event listener para mudança de tema do sistema
        prefersDarkScheme.addEventListener('change', function(e) {
            console.log(`Mudança de tema do sistema detectada: ${e.matches ? 'escuro' : 'claro'}`);
            // Se não houver tema personalizado definido, atualizar para o tema do sistema
            const currentTheme = localStorage.getItem(CONFIG.STORAGE.SETTINGS_KEY);
            if (!currentTheme) {
                UI.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Adicionar suporte a Service Worker para PWA se necessário
        if ('serviceWorker' in navigator) {
            console.log('Service Worker disponível. A aplicação pode ser instalada como PWA.');
            
            // Registro do Service Worker (descomentado em produção)
            /*
            navigator.serviceWorker.register('./service-worker.js')
                .then(function(registration) {
                    console.log('Service Worker registrado com sucesso:', registration);
                })
                .catch(function(error) {
                    console.error('Erro ao registrar Service Worker:', error);
                });
            */
        }
        
        // Exibir mensagem de boas-vindas
        console.log('Steam Reviews Analyzer inicializado com sucesso!');
        console.log('Versão: 1.0.0');
        console.log('Desenvolvido por: Steam Reviews Analyzer Team');
        
    } catch (error) {
        console.error('Erro durante a inicialização da aplicação:', error);
        alert(`Erro durante a inicialização: ${error.message}`);
    }
});

// Adicionar event listener para quando a página for completamente carregada
window.addEventListener('load', function() {
    // Remover loader de inicialização se existir
    const initialLoader = document.getElementById('initialLoader');
    if (initialLoader) {
        initialLoader.style.display = 'none';
    }
    
    // Verificar parâmetros da URL para pré-carregar dados
    const urlParams = new URLSearchParams(window.location.search);
    const appIdParam = urlParams.get('appid');
    
    if (appIdParam) {
        console.log(`AppID detectado na URL: ${appIdParam}`);
        document.getElementById('appId').value = appIdParam;
        
        // Se autoload=true, carregar reviews automaticamente
        if (urlParams.get('autoload') === 'true') {
            console.log('Autoload ativado. Carregando reviews automaticamente...');
            
            // Pequeno atraso para garantir que a UI esteja pronta
            setTimeout(() => {
                document.getElementById('getReviews').click();
            }, 500);
        }
    }
});

// Adicionar suporte a atalhos de teclado
document.addEventListener('keydown', function(event) {
    // Ctrl+Shift+S: Exportar para Excel
    if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        EXPORT.toExcel(UI.state.reviewsData);
    }
    
    // Ctrl+Shift+R: Gerar relatório
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        if (UI.state.reviewsData.length > 0) {
            UI.generateFullReport();
            
            // Mudar para a aba de relatórios
            document.querySelector('.tab[data-tab="reports"]').click();
        } else {
            alert('Carregue as reviews primeiro!');
        }
    }
    
    // Ctrl+Shift+F: Limpar formulários
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        document.getElementById('appId').value = CONFIG.DEFAULTS.APP_ID;
        document.getElementById('filter').value = 'all';
        document.getElementById('language').value = 'all';
        document.getElementById('review_type').value = 'all';
    }
});

// Adicionar suporte a mensagens de erro personalizadas
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Erro global capturado:', {
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        error: error
    });
    
    // Exibir mensagem de erro para o usuário apenas para erros não tratados
    if (!error || !error.handled) {
        // Criar elemento para exibir erro
        const errorContainer = document.createElement('div');
        errorContainer.style.position = 'fixed';
        errorContainer.style.bottom = '20px';
        errorContainer.style.right = '20px';
        errorContainer.style.padding = '15px';
        errorContainer.style.backgroundColor = '#c94a4a';
        errorContainer.style.color = 'white';
        errorContainer.style.borderRadius = '5px';
        errorContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        errorContainer.style.zIndex = '9999';
        errorContainer.style.maxWidth = '400px';
        
        errorContainer.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">Erro na aplicação</div>
            <div style="font-size: 14px;">${message}</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.8; text-align: right;">
                Clique para fechar
            </div>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(errorContainer);
        
        // Remover após clique
        errorContainer.addEventListener('click', function() {
            document.body.removeChild(errorContainer);
        });
        
        // Remover automaticamente após 10 segundos
        setTimeout(function() {
            if (document.body.contains(errorContainer)) {
                document.body.removeChild(errorContainer);
            }
        }, 10000);
    }
    
    // Permitir que o erro seja processado normalmente
    return false;
};

// Verificar disponibilidade de recursos do navegador
const BROWSER_CAPABILITIES = {
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    indexedDB: window.indexedDB !== undefined,
    webSQL: window.openDatabase !== undefined,
    webWorkers: window.Worker !== undefined,
    serviceWorker: 'serviceWorker' in navigator,
    webGL: (function() {
        try {
            return !!window.WebGLRenderingContext && 
                   !!document.createElement('canvas').getContext('experimental-webgl');
        } catch(e) {
            return false;
        }
    })(),
    canvas: !!document.createElement('canvas').getContext,
    audioAPI: window.AudioContext !== undefined || window.webkitAudioContext !== undefined,
    geolocation: navigator.geolocation !== undefined,
    // Mais recursos podem ser adicionados conforme necessário
};

console.log('Capacidades do navegador:', BROWSER_CAPABILITIES);