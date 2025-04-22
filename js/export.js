/**
 * Módulo de Exportação do Steam Reviews Analyzer
 * Contém funções para exportação de dados para Excel e outros formatos
 */

const EXPORT = {
    /**
     * Exporta reviews para Excel
     * @param {Array} reviews - Array de reviews para exportar
     */
    toExcel(reviews) {
        try {
            // Verificar se tem reviews para exportar
            if (!reviews || reviews.length === 0) {
                alert('Não há reviews para exportar. Carregue as reviews primeiro!');
                return;
            }
            
            // Preparar dados para Excel
            const workbook = XLSX.utils.book_new();
            
            // Planilha de Reviews
            const reviewsSheet = [];
            
            // Adicionar cabeçalho
            reviewsSheet.push([
                'ID', 'Recomendado', 'Idioma', 'Data', 'Tempo de Jogo', 
                'Votos Úteis', 'Votos Engraçados', 'Texto da Review', 
                'Comprado no Steam', 'Recebido Gratuitamente', 'Escrito Durante Acesso Antecipado'
            ]);
            
            // Adicionar dados
            reviews.forEach(review => {
                const reviewDate = new Date(review.timestamp_created * 1000);
                const formattedDate = reviewDate.toLocaleDateString() + ' ' + reviewDate.toLocaleTimeString();
                
                reviewsSheet.push([
                    review.recommendationid,
                    review.voted_up ? 'Sim' : 'Não',
                    review.language,
                    formattedDate,
                    Math.floor(review.playtime_forever / 60) + 'h ' + (review.playtime_forever % 60) + 'm',
                    review.votes_up,
                    review.votes_funny,
                    review.review,
                    review.steam_purchase ? 'Sim' : 'Não',
                    review.received_for_free ? 'Sim' : 'Não',
                    review.written_during_early_access ? 'Sim' : 'Não'
                ]);
            });
            
            // Criar planilha
            const reviewsWs = XLSX.utils.aoa_to_sheet(reviewsSheet);
            
            // Ajustar largura das colunas
            const colWidths = [
                { wch: 15 },  // ID
                { wch: 12 },  // Recomendado
                { wch: 10 },  // Idioma
                { wch: 20 },  // Data
                { wch: 15 },  // Tempo de Jogo
                { wch: 12 },  // Votos Úteis
                { wch: 15 },  // Votos Engraçados
                { wch: 100 }, // Texto da Review
                { wch: 15 },  // Comprado no Steam
                { wch: 20 },  // Recebido Gratuitamente
                { wch: 25 }   // Escrito Durante Acesso Antecipado
            ];
            
            reviewsWs['!cols'] = colWidths;
            
            // Adicionar planilha ao workbook
            XLSX.utils.book_append_sheet(workbook, reviewsWs, 'Reviews');
            
            // Obter o app ID para o nome do arquivo
            const appId = document.getElementById('appId').value || UI.state.currentAppId;
            
            // Salvar arquivo
            XLSX.writeFile(workbook, `Steam_Reviews_${appId}.xlsx`);
            
            console.log(`Exportadas ${reviews.length} reviews para Excel`);
            
        } catch (error) {
            console.error('Erro ao exportar para Excel:', error);
            alert('Erro ao exportar para Excel. Verifique o console para mais detalhes.');
        }
    },
    
    /**
     * Exporta relatório completo para Excel
     */
    reportToExcel() {
        try {
            // Verificar se tem dados do relatório
            if (!window.fullReportData) {
                alert('Não há dados de relatório para exportar. Gere um relatório completo primeiro!');
                return;
            }
            
            const reportData = window.fullReportData;
            
            // Preparar dados para Excel
            const workbook = XLSX.utils.book_new();
            
            // 1. Planilha de Resumo
            const summarySheet = [];
            
            // Adicionar dados de resumo
            summarySheet.push(['Relatório de Análise de Reviews - Steam App ID: ' + reportData.appId]);
            summarySheet.push(['Data do Relatório', new Date(reportData.date).toLocaleDateString()]);
            summarySheet.push(['Total de Reviews Analisadas', reportData.stats.total]);
            summarySheet.push(['Reviews Positivas', reportData.stats.positive, `${reportData.stats.positivePercentage}%`]);
            summarySheet.push(['Reviews Negativas', reportData.stats.negative, `${100 - reportData.stats.positivePercentage}%`]);
            summarySheet.push([]);
            summarySheet.push(['Resumo da Análise']);
            
            // Dividir o resumo em linhas
            const summaryLines = reportData.summary.split('\n');
            summaryLines.forEach(line => {
                if (line.trim()) {
                    summarySheet.push([line.trim()]);
                }
            });
            
            // Criar planilha de resumo
            const summaryWs = XLSX.utils.aoa_to_sheet(summarySheet);
            
            // Ajustar largura das colunas
            summaryWs['!cols'] = [
                { wch: 30 },
                { wch: 50 },
                { wch: 15 }
            ];
            
            // Adicionar planilha ao workbook
            XLSX.utils.book_append_sheet(workbook, summaryWs, 'Resumo');
            
            // 2. Planilha de Análise de Sentimento
            const sentimentSheet = [];
            sentimentSheet.push(['Categoria', 'Contagem']);
            sentimentSheet.push(['Muito Positivo', reportData.sentiment.data[0]]);
            sentimentSheet.push(['Positivo', reportData.sentiment.data[1]]);
            sentimentSheet.push(['Neutro', reportData.sentiment.data[2]]);
            sentimentSheet.push(['Negativo', reportData.sentiment.data[3]]);
            sentimentSheet.push(['Muito Negativo', reportData.sentiment.data[4]]);
            sentimentSheet.push([]);
            sentimentSheet.push(['Análise Detalhada']);
            
            // Dividir a análise de sentimento em linhas
            const sentimentLines = reportData.sentiment.analysis.split('\n');
            sentimentLines.forEach(line => {
                if (line.trim()) {
                    sentimentSheet.push([line.trim()]);
                }
            });
            
            // Criar planilha de sentimento
            const sentimentWs = XLSX.utils.aoa_to_sheet(sentimentSheet);
            
            // Ajustar largura das colunas
            sentimentWs['!cols'] = [
                { wch: 30 },
                { wch: 15 }
            ];
            
            // Adicionar planilha ao workbook
            XLSX.utils.book_append_sheet(workbook, sentimentWs, 'Análise de Sentimento');
            
            // 3. Planilha de Tópicos
            const topicsSheet = [];
            topicsSheet.push(['Tópico', 'Menções Positivas', 'Menções Negativas']);
            
            const topics = ['Jogabilidade', 'Gráficos', 'História', 'Áudio', 'Valor', 'Desempenho'];
            for (let i = 0; i < topics.length; i++) {
                topicsSheet.push([
                    topics[i],
                    reportData.topics.positive[i],
                    reportData.topics.negative[i]
                ]);
            }
            
            topicsSheet.push([]);
            topicsSheet.push(['Análise Detalhada de Tópicos']);
            
            // Dividir a análise de tópicos em linhas
            const topicsLines = reportData.topics.analysis.split('\n');
            topicsLines.forEach(line => {
                if (line.trim()) {
                    topicsSheet.push([line.trim()]);
                }
            });
            
            // Criar planilha de tópicos
            const topicsWs = XLSX.utils.aoa_to_sheet(topicsSheet);
            
            // Ajustar largura das colunas
            topicsWs['!cols'] = [
                { wch: 30 },
                { wch: 15 },
                { wch: 15 }
            ];
            
            // Adicionar planilha ao workbook
            XLSX.utils.book_append_sheet(workbook, topicsWs, 'Tópicos Mencionados');
            
            // 4. Planilha de Reviews
            const reviewsSheet = [];
            
            // Adicionar cabeçalho
            reviewsSheet.push([
                'ID', 'Recomendado', 'Idioma', 'Data', 'Tempo de Jogo', 
                'Votos Úteis', 'Votos Engraçados', 'Texto da Review'
            ]);
            
            // Adicionar dados
            reportData.reviews.forEach(review => {
                const reviewDate = new Date(review.date);
                const formattedDate = reviewDate.toLocaleDateString() + ' ' + reviewDate.toLocaleTimeString();
                
                // Calcular tempo de jogo formatado
                const hours = Math.floor(review.playtime / 60);
                const minutes = review.playtime % 60;
                const formattedPlaytime = `${hours}h ${minutes}m`;
                
                reviewsSheet.push([
                    review.id,
                    review.positive ? 'Sim' : 'Não',
                    review.language,
                    formattedDate,
                    formattedPlaytime,
                    review.votes_up,
                    review.votes_funny,
                    review.text
                ]);
            });
            
            // Criar planilha de reviews
            const reviewsWs = XLSX.utils.aoa_to_sheet(reviewsSheet);
            
            // Ajustar largura das colunas
            reviewsWs['!cols'] = [
                { wch: 15 },  // ID
                { wch: 12 },  // Recomendado
                { wch: 10 },  // Idioma
                { wch: 20 },  // Data
                { wch: 15 },  // Tempo de Jogo
                { wch: 12 },  // Votos Úteis
                { wch: 15 },  // Votos Engraçados
                { wch: 100 }  // Texto da Review
            ];
            
            // Adicionar planilha ao workbook
            XLSX.utils.book_append_sheet(workbook, reviewsWs, 'Reviews');
            
            // Salvar arquivo
            XLSX.writeFile(workbook, `Steam_Relatório_Completo_${reportData.appId}.xlsx`);
            
            console.log('Relatório completo exportado para Excel');
            
        } catch (error) {
            console.error('Erro ao exportar relatório para Excel:', error);
            alert('Erro ao exportar relatório para Excel. Verifique o console para mais detalhes.');
        }
    },
    
    /**
     * Exporta dados para JSON
     * @param {Array} reviews - Array de reviews para exportar
     * @returns {string} - String JSON
     */
    toJSON(reviews) {
        try {
            // Verificar se tem reviews para exportar
            if (!reviews || reviews.length === 0) {
                alert('Não há reviews para exportar. Carregue as reviews primeiro!');
                return null;
            }
            
            // Formatar dados para JSON
            const exportData = {
                app_id: document.getElementById('appId').value || UI.state.currentAppId,
                export_date: new Date().toISOString(),
                reviews_count: reviews.length,
                reviews: reviews.map(review => ({
                    id: review.recommendationid,
                    positive: review.voted_up,
                    language: review.language,
                    created_at: new Date(review.timestamp_created * 1000).toISOString(),
                    updated_at: new Date(review.timestamp_updated * 1000).toISOString(),
                    playtime: {
                        total_minutes: review.playtime_forever,
                        at_review_minutes: review.playtime_at_review,
                        last_two_weeks_minutes: review.playtime_last_two_weeks
                    },
                    votes: {
                        helpful: review.votes_up,
                        funny: review.votes_funny
                    },
                    text: review.review,
                    purchase_info: {
                        steam_purchase: review.steam_purchase,
                        received_for_free: review.received_for_free,
                        written_during_early_access: review.written_during_early_access
                    },
                    author: {
                        steam_id: review.author.steamid,
                        games_owned: review.author.num_games_owned,
                        reviews_count: review.author.num_reviews
                    }
                }))
            };
            
            // Converter para string JSON
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Criar elemento para download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Steam_Reviews_${exportData.app_id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Exportadas ${reviews.length} reviews para JSON`);
            
            return jsonString;
            
        } catch (error) {
            console.error('Erro ao exportar para JSON:', error);
            alert('Erro ao exportar para JSON. Verifique o console para mais detalhes.');
            return null;
        }
    },
    
    /**
     * Exporta dados para CSV
     * @param {Array} reviews - Array de reviews para exportar
     * @returns {string} - String CSV
     */
    toCSV(reviews) {
        try {
            // Verificar se tem reviews para exportar
            if (!reviews || reviews.length === 0) {
                alert('Não há reviews para exportar. Carregue as reviews primeiro!');
                return null;
            }
            
            // Definir colunas
            const columns = [
                'ID',
                'Recomendado',
                'Idioma',
                'Data',
                'Tempo de Jogo (min)',
                'Votos Úteis',
                'Votos Engraçados',
                'Review',
                'Compra Steam',
                'Gratuito',
                'Early Access'
            ];
            
            // Criar cabeçalho
            let csvContent = columns.join(',') + '\n';
            
            // Adicionar linhas
            reviews.forEach(review => {
                // Formatar data
                const formattedDate = new Date(review.timestamp_created * 1000).toISOString();
                
                // Escapar texto da review para CSV
                const escapedReview = review.review.replace(/"/g, '""').replace(/\n/g, ' ');
                
                const row = [
                    review.recommendationid,
                    review.voted_up ? 'Sim' : 'Não',
                    review.language,
                    formattedDate,
                    review.playtime_forever,
                    review.votes_up,
                    review.votes_funny,
                    `"${escapedReview}"`,
                    review.steam_purchase ? 'Sim' : 'Não',
                    review.received_for_free ? 'Sim' : 'Não',
                    review.written_during_early_access ? 'Sim' : 'Não'
                ];
                
                csvContent += row.join(',') + '\n';
            });
            
            // Criar elemento para download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Steam_Reviews_${document.getElementById('appId').value || UI.state.currentAppId}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Exportadas ${reviews.length} reviews para CSV`);
            
            return csvContent;
            
        } catch (error) {
            console.error('Erro ao exportar para CSV:', error);
            alert('Erro ao exportar para CSV. Verifique o console para mais detalhes.');
            return null;
        }
    }
};

// Exportar como variável global
window.EXPORT = EXPORT;