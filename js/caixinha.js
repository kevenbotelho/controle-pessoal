/**
 * Caixinha - Sistema de Poupança e Metas Financeiras
 * Parte do CFP - Controle Financeiro Pessoal
 */

// Funções para gerenciamento de caixinhas

const CAIXINHA_STORAGE_KEY = 'cfp_caixinhas';
const CAIXINHA_BACKUP_KEY = 'cfp_caixinhas_backup';

// Função para gerar UUID simples
function gerarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Função para calcular diferença em meses entre duas datas
function calcularMesesEntreDatas(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    let meses = (fim.getFullYear() - inicio.getFullYear()) * 12;
    meses += fim.getMonth() - inicio.getMonth();

    // Se o dia do fim for antes do dia de início, contar como mês completo
    if (fim.getDate() < inicio.getDate()) {
        meses++;
    }

    return Math.max(1, meses); // Mínimo de 1 mês
}

// Função para calcular valor por período
function calcularValorPorPeriodo(valorAlvo, numeroPeriodos) {
    return parseFloat((valorAlvo / numeroPeriodos).toFixed(2));
}

// Função para calcular percentual da renda
function calcularPercentualRenda(valorPorPeriodo, rendaMensal) {
    if (rendaMensal <= 0) return 0;
    return parseFloat(((valorPorPeriodo / rendaMensal) * 100).toFixed(2));
}

// Função para validar caixinha
function validarCaixinha(caixinha) {
    const erros = [];

    if (!caixinha.nome || caixinha.nome.trim() === '') {
        erros.push('Nome da caixinha é obrigatório');
    }

    if (!caixinha.valorAlvo || caixinha.valorAlvo <= 0) {
        erros.push('Valor alvo deve ser maior que zero');
    }

    if (!caixinha.prazoTipo || !['meses', 'dataFinal'].includes(caixinha.prazoTipo)) {
        erros.push('Tipo de prazo inválido');
    }

    if (caixinha.prazoTipo === 'meses' && (!caixinha.prazoMeses || caixinha.prazoMeses < 1)) {
        erros.push('Prazo mínimo de 1 mês');
    }

    if (caixinha.prazoTipo === 'dataFinal' && (!caixinha.dataFim || new Date(caixinha.dataFim) <= new Date(caixinha.dataInicio))) {
        erros.push('Data final deve ser posterior à data de início');
    }

    if (!caixinha.frequencia || !['diaria', 'semanal', 'mensal'].includes(caixinha.frequencia)) {
        erros.push('Frequência inválida');
    }

    return erros;
}

// Função para calcular progresso da caixinha
function calcularProgressoCaixinha(caixinha) {
    if (caixinha.valorAlvo <= 0) return 0;
    return Math.min(100, parseFloat(((caixinha.valorGuardado / caixinha.valorAlvo) * 100).toFixed(2)));
}

// Função para calcular data de conclusão estimada
function calcularDataConclusao(caixinha) {
    const hoje = new Date();
    const inicio = new Date(caixinha.dataInicio);
    const valorFaltante = caixinha.valorAlvo - caixinha.valorGuardado;

    if (valorFaltante <= 0) {
        return hoje; // Já concluída
    }

    const valorPorPeriodo = caixinha.valorPorPeriodo || calcularValorPorPeriodo(caixinha.valorAlvo, caixinha.prazoMeses || 1);
    const periodosFaltantes = Math.ceil(valorFaltante / valorPorPeriodo);

    let dataConclusao = new Date(inicio);

    switch (caixinha.frequencia) {
        case 'diaria':
            dataConclusao.setDate(dataConclusao.getDate() + periodosFaltantes);
            break;
        case 'semanal':
            dataConclusao.setDate(dataConclusao.getDate() + (periodosFaltantes * 7));
            break;
        case 'mensal':
            dataConclusao.setMonth(dataConclusao.getMonth() + periodosFaltantes);
            break;
    }

    return dataConclusao;
}

// Função para salvar caixinhas
function salvarCaixinhas(caixinhas) {
    try {
        localStorage.setItem(CAIXINHA_STORAGE_KEY, JSON.stringify(caixinhas));
        salvarBackupCaixinhas(caixinhas);
        return true;
    } catch (error) {
        console.error('Erro ao salvar caixinhas:', error);
        return false;
    }
}

// Função para carregar caixinhas
function carregarCaixinhas() {
    try {
        const dados = localStorage.getItem(CAIXINHA_STORAGE_KEY);
        return dados ? JSON.parse(dados) : [];
    } catch (error) {
        console.error('Erro ao carregar caixinhas:', error);
        return [];
    }
}

// Função para salvar backup de caixinhas
function salvarBackupCaixinhas(caixinhas) {
    try {
        const backup = {
            caixinhas: caixinhas,
            data: new Date().toISOString(),
            versao: '1.0'
        };
        localStorage.setItem(CAIXINHA_BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
        console.error('Erro ao salvar backup de caixinhas:', error);
    }
}

// Função para restaurar backup de caixinhas
function restaurarBackupCaixinhas() {
    try {
        const backup = localStorage.getItem(CAIXINHA_BACKUP_KEY);
        if (backup) {
            const dados = JSON.parse(backup);
            if (dados.caixinhas && dados.caixinhas.length > 0) {
                salvarCaixinhas(dados.caixinhas);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Erro ao restaurar backup de caixinhas:', error);
        return false;
    }
}

// Função para criar nova caixinha
function criarCaixinha(caixinhaData) {
    const erros = validarCaixinha(caixinhaData);
    if (erros.length > 0) {
        throw new Error('Validação falhou: ' + erros.join(', '));
    }

    const caixinhas = carregarCaixinhas();

    // Calcular número de períodos
    let numeroPeriodos = caixinhaData.prazoMeses || 1;
    if (caixinhaData.prazoTipo === 'dataFinal' && caixinhaData.dataFim) {
        numeroPeriodos = calcularMesesEntreDatas(caixinhaData.dataInicio, caixinhaData.dataFim);
    }

    // Calcular valor por período
    const valorPorPeriodo = calcularValorPorPeriodo(caixinhaData.valorAlvo, numeroPeriodos);

    // Obter renda mensal do CFP
    const rendaMensal = calcularTotais().entradas;

    // Calcular percentual da renda
    const percentualRenda = calcularPercentualRenda(valorPorPeriodo, rendaMensal);

    // Verificar se percentual é razoável
    if (percentualRenda > 100) {
        throw new Error('O valor por período excede 100% da sua renda mensal. Ajuste o valor alvo ou prazo.');
    }

    const novaCaixinha = {
        id: gerarUUID(),
        nome: caixinhaData.nome.trim(),
        valorAlvo: parseFloat(caixinhaData.valorAlvo),
        valorGuardado: 0,
        dataInicio: caixinhaData.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: caixinhaData.dataFim || null,
        prazoTipo: caixinhaData.prazoTipo,
        prazoMeses: caixinhaData.prazoMeses || numeroPeriodos,
        frequencia: caixinhaData.frequencia,
        valorPorPeriodo: valorPorPeriodo,
        percentualSugerido: percentualRenda,
        status: 'ativa',
        historico: [],
        categoria: caixinhaData.categoria || null,
        nota: caixinhaData.nota || '',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };

    caixinhas.push(novaCaixinha);
    salvarCaixinhas(caixinhas);

    return novaCaixinha;
}

// Função para atualizar caixinha
function atualizarCaixinha(id, atualizacoes) {
    const caixinhas = carregarCaixinhas();
    const index = caixinhas.findIndex(c => c.id === id);

    if (index === -1) {
        throw new Error('Caixinha não encontrada');
    }

    const caixinhaAtual = caixinhas[index];
    const caixinhaAtualizada = { ...caixinhaAtual, ...atualizacoes };
    caixinhaAtualizada.dataAtualizacao = new Date().toISOString();

    // Validar atualização
    const erros = validarCaixinha(caixinhaAtualizada);
    if (erros.length > 0) {
        throw new Error('Validação falhou: ' + erros.join(', '));
    }

    caixinhas[index] = caixinhaAtualizada;
    salvarCaixinhas(caixinhas);

    return caixinhaAtualizada;
}

// Função para adicionar contribuição manual
function adicionarContribuicaoManual(caixinhaId, valor, data = null) {
    const caixinhas = carregarCaixinhas();
    const caixinha = caixinhas.find(c => c.id === caixinhaId);

    if (!caixinha) {
        throw new Error('Caixinha não encontrada');
    }

    if (valor <= 0) {
        throw new Error('Valor da contribuição deve ser positivo');
    }

    const dataContribuicao = data || new Date().toISOString().split('T')[0];

    caixinha.valorGuardado = (caixinha.valorGuardado || 0) + parseFloat(valor);
    caixinha.historico.push({
        data: dataContribuicao,
        valor: parseFloat(valor),
        tipo: 'manual',
        dataRegistro: new Date().toISOString()
    });

    // Verificar se atingiu a meta
    if (caixinha.valorGuardado >= caixinha.valorAlvo) {
        caixinha.status = 'concluida';
        caixinha.dataConclusao = new Date().toISOString();
    }

    caixinha.dataAtualizacao = new Date().toISOString();

    salvarCaixinhas(caixinhas);

    return caixinha;
}

// Função para pausar/retomar caixinha
function alternarStatusCaixinha(id) {
    const caixinhas = carregarCaixinhas();
    const caixinha = caixinhas.find(c => c.id === id);

    if (!caixinha) {
        throw new Error('Caixinha não encontrada');
    }

    if (caixinha.status === 'concluida') {
        throw new Error('Não é possível pausar uma caixinha concluída');
    }

    caixinha.status = caixinha.status === 'ativa' ? 'pausada' : 'ativa';
    caixinha.dataAtualizacao = new Date().toISOString();

    salvarCaixinhas(caixinhas);

    return caixinha;
}

// Função para excluir caixinha (enviar para lixeira)
function excluirCaixinha(id) {
    const caixinhas = carregarCaixinhas();
    const index = caixinhas.findIndex(c => c.id === id);

    if (index === -1) {
        throw new Error('Caixinha não encontrada');
    }

    const caixinhaExcluida = caixinhas.splice(index, 1)[0];

    // Adicionar à lixeira do CFP
    const transacaoLixeira = {
        id: caixinhaExcluida.id,
        data: new Date().toISOString().split('T')[0],
        descricao: `[CAIXINHA] ${caixinhaExcluida.nome} - Excluída`,
        categoria: caixinhaExcluida.categoria || 6, // Categoria "Outros"
        tipo: 'saida',
        valor: caixinhaExcluida.valorGuardado || 0,
        dataExclusao: new Date().toISOString(),
        idOriginal: caixinhaExcluida.id,
        tipoOriginal: 'caixinha'
    };

    adicionarALixeira(transacaoLixeira);
    salvarCaixinhas(caixinhas);

    return caixinhaExcluida;
}

// Função para calcular sugestão de contribuição
function calcularSugestaoContribuicao(caixinhaData) {
    // Calcular número de períodos
    let numeroPeriodos = caixinhaData.prazoMeses || 1;
    if (caixinhaData.prazoTipo === 'dataFinal' && caixinhaData.dataFim) {
        numeroPeriodos = calcularMesesEntreDatas(caixinhaData.dataInicio, caixinhaData.dataFim);
    }

    // Calcular valor por período
    const valorPorPeriodo = calcularValorPorPeriodo(caixinhaData.valorAlvo, numeroPeriodos);

    // Obter renda mensal do CFP
    const rendaMensal = calcularTotais().entradas;

    // Calcular percentual da renda
    const percentualRenda = calcularPercentualRenda(valorPorPeriodo, rendaMensal);

    // Calcular valores por outros períodos para exibição
    const valoresPorPeriodo = {
        mensal: valorPorPeriodo,
        semanal: parseFloat((valorPorPeriodo / 4).toFixed(2)),
        diaria: parseFloat((valorPorPeriodo / 30).toFixed(2))
    };

    return {
        valorPorPeriodo: valorPorPeriodo,
        percentualRenda: percentualRenda,
        valoresPorPeriodo: valoresPorPeriodo,
        rendaMensal: rendaMensal,
        numeroPeriodos: numeroPeriodos,
        valorTotal: caixinhaData.valorAlvo,
        frequencia: caixinhaData.frequencia || 'mensal'
    };
}

// Função para obter caixinha por ID
function obterCaixinhaPorId(id) {
    const caixinhas = carregarCaixinhas();
    return caixinhas.find(c => c.id === id);
}

// Função para obter todas as caixinhas ativas
function obterCaixinhasAtivas() {
    const caixinhas = carregarCaixinhas();
    return caixinhas.filter(c => c.status === 'ativa');
}

// Função para obter todas as caixinhas concluídas
function obterCaixinhasConcluidas() {
    const caixinhas = carregarCaixinhas();
    return caixinhas.filter(c => c.status === 'concluida');
}

// Função para obter todas as caixinhas pausadas
function obterCaixinhasPausadas() {
    const caixinhas = carregarCaixinhas();
    return caixinhas.filter(c => c.status === 'pausada');
}

// Função para verificar notificações de caixinhas
function verificarNotificacoesCaixinhas() {
    const caixinhas = carregarCaixinhas();
    const notificacoes = [];

    caixinhas.forEach(caixinha => {
        const progresso = calcularProgressoCaixinha(caixinha);

        // Notificar quando meta atingida
        if (progresso >= 100 && caixinha.status !== 'concluida') {
            notificacoes.push({
                tipo: 'sucesso',
                mensagem: `🎉 Parabéns! Você atingiu a meta da caixinha "${caixinha.nome}"!`,
                caixinhaId: caixinha.id
            });
        }

        // Notificar quando percentual sugerido é alto
        if (caixinha.percentualSugerido > 30 && caixinha.status === 'ativa') {
            notificacoes.push({
                tipo: 'aviso',
                mensagem: `⚠️ A caixinha "${caixinha.nome}" requer ${caixinha.percentualSugerido}% da sua renda. Considere estender o prazo.`,
                caixinhaId: caixinha.id
            });
        }
    });

    return notificacoes;
}

// Função para exportar caixinhas para JSON
function exportarCaixinhasJSON() {
    const caixinhas = carregarCaixinhas();
    const dados = {
        caixinhas: caixinhas,
        dataExportacao: new Date().toISOString(),
        versao: '1.0'
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cfp_caixinhas_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função para importar caixinhas de JSON
function importarCaixinhasJSON(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const dados = JSON.parse(e.target.result);
                if (dados.caixinhas && Array.isArray(dados.caixinhas)) {
                    // Verificar se as caixinhas são válidas antes de importar
                    const caixinhasValidas = dados.caixinhas.filter(caixinha => {
                        try {
                            const erros = validarCaixinha(caixinha);
                            return erros.length === 0;
                        } catch (error) {
                            return false;
                        }
                    });

                    if (caixinhasValidas.length > 0) {
                        salvarCaixinhas(caixinhasValidas);
                        resolve(caixinhasValidas.length);
                    } else {
                        reject('Nenhuma caixinha válida encontrada no arquivo');
                    }
                } else {
                    reject('Formato de arquivo inválido');
                }
            } catch (error) {
                reject('Erro ao processar arquivo: ' + error.message);
            }
        };

        reader.onerror = function() {
            reject('Erro ao ler arquivo');
        };

        reader.readAsText(arquivo);
    });
}

// Função para inicializar caixinhas
function initCaixinhas() {
    // Restaurar backup se existir
    restaurarBackupCaixinhas();

    // Verificar notificações
    const notificacoes = verificarNotificacoesCaixinhas();

    // Retornar dados iniciais
    return {
        caixinhas: carregarCaixinhas(),
        notificacoes: notificacoes
    };
}

// Exportar funções públicas
window.Caixinha = {
    criarCaixinha,
    atualizarCaixinha,
    adicionarContribuicaoManual,
    alternarStatusCaixinha,
    excluirCaixinha,
    calcularSugestaoContribuicao,
    obterCaixinhaPorId,
    obterCaixinhasAtivas,
    obterCaixinhasConcluidas,
    obterCaixinhasPausadas,
    verificarNotificacoesCaixinhas,
    exportarCaixinhasJSON,
    importarCaixinhasJSON,
    initCaixinhas,
    calcularProgressoCaixinha,
    calcularDataConclusao,
    carregarCaixinhas
};