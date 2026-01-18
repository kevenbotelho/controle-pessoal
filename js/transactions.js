// Funções para gerenciamento de transações

let transacoes = carregarTransacoes();

// Função para adicionar transação
function adicionarTransacao(transacao) {
    transacao.id = gerarNovoId(transacoes);
    transacoes.push(transacao);
    salvarTransacoes(transacoes);
    salvarBackupAutomatico(); // Backup automático
    return transacao;
}

// Função para editar transação
function editarTransacao(id, novaTransacao) {
    console.log('=== EDITANDO TRANSAÇÃO ===');
    console.log('ID procurado:', id);
    console.log('Nova transação:', novaTransacao);
    console.log('Transações antes da edição:', transacoes.length);

    const index = transacoes.findIndex(t => t.id === id);
    console.log('Índice encontrado:', index);

    if (index !== -1) {
        console.log('Transação antiga:', transacoes[index]);
        transacoes[index] = { ...transacoes[index], ...novaTransacao };
        console.log('Transação nova:', transacoes[index]);

        salvarTransacoes(transacoes);
        salvarBackupAutomatico(); // Backup automático

        // Recarregar transações do localStorage para garantir sincronização
        transacoes = carregarTransacoes();
        console.log('Transações recarregadas do localStorage:', transacoes.length);

        console.log('Transação editada com sucesso!');
        return transacoes[index];
    } else {
        console.error('Transação com ID', id, 'não encontrada!');
        return null;
    }
}

// Função para remover transação (soft delete - move para lixeira)
function removerTransacao(id) {
    const index = transacoes.findIndex(t => t.id === id);
    if (index !== -1) {
        const transacaoRemovida = transacoes.splice(index, 1)[0];
        salvarTransacoes(transacoes);

        // Adicionar à lixeira
        adicionarALixeira(transacaoRemovida);

        return transacaoRemovida;
    }
    return null;
}

// Função para obter todas as transações
function obterTransacoes() {
    return transacoes;
}

// Função para filtrar transações
function filtrarTransacoes(filtros = {}) {
    let filtradas = [...transacoes];

    // Filtrar por descrição
    if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        filtradas = filtradas.filter(t => t.descricao.toLowerCase().includes(busca));
    }

    // Filtrar por categoria
    if (filtros.categoria) {
        const categoriaFiltro = parseInt(filtros.categoria);
        filtradas = filtradas.filter(t => t.categoria === categoriaFiltro);
    }

    // Filtrar por tipo
    if (filtros.tipo) {
        filtradas = filtradas.filter(t => t.tipo === filtros.tipo);
    }

    // Filtrar por mês/ano
    if (filtros.mes) {
        let anoFiltro, mesFiltro;

        // Verificar formato do filtro (pode vir como "2026-01" ou "01/2026")
        if (filtros.mes.includes('/')) {
            // Formato brasileiro: "01/2026"
            const [mes, ano] = filtros.mes.split('/');
            anoFiltro = parseInt(ano);
            mesFiltro = parseInt(mes) - 1; // JavaScript usa 0-11 para meses
        } else {
            // Formato internacional: "2026-01"
            const [ano, mes] = filtros.mes.split('-');
            anoFiltro = parseInt(ano);
            mesFiltro = parseInt(mes) - 1; // JavaScript usa 0-11 para meses
        }

        console.log('Filtrando por período:', { anoFiltro, mesFiltro, filtroOriginal: filtros.mes });

        filtradas = filtradas.filter(t => {
            // Garantir que a data está no formato correto
            let dataTransacao;
            try {
                // Se já for um objeto Date, usar diretamente
                if (t.data instanceof Date) {
                    dataTransacao = t.data;
                } else {
                    // Se for string, tentar parsear
                    dataTransacao = new Date(t.data + 'T00:00:00'); // Adicionar hora para evitar problemas de timezone
                }

                const anoTransacao = dataTransacao.getFullYear();
                const mesTransacao = dataTransacao.getMonth();

                const corresponde = anoTransacao === anoFiltro && mesTransacao === mesFiltro;

                if (!corresponde) {
                    console.log('Transação não corresponde:', {
                        id: t.id,
                        descricao: t.descricao,
                        dataOriginal: t.data,
                        dataParseada: dataTransacao.toISOString().split('T')[0],
                        anoTransacao,
                        mesTransacao,
                        filtro: { anoFiltro, mesFiltro }
                    });
                }

                return corresponde;
            } catch (error) {
                console.error('Erro ao processar data da transação:', t.data, error);
                return false;
            }
        });

        console.log('Transações após filtro de período:', filtradas.length);
    }

    // Ordenar por data (mais recente primeiro)
    filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));

    return filtradas;
}

// Função para calcular totais
function calcularTotais(transacoesFiltradas = transacoes) {
    let totalEntradas = 0;
    let totalSaidas = 0;

    transacoesFiltradas.forEach(transacao => {
        if (transacao.tipo === 'entrada') {
            totalEntradas += transacao.valor;
        } else if (transacao.tipo === 'saida') {
            totalSaidas += transacao.valor;
        }
    });

    const saldo = totalEntradas - totalSaidas;

    return {
        saldo: saldo,
        entradas: totalEntradas,
        saidas: totalSaidas
    };
}

// Função para obter resumo do mês atual
function obterResumoMesAtual() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const transacoesMes = transacoes.filter(t => {
        const data = new Date(t.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    return calcularTotais(transacoesMes);
}

// Função para obter dados para gráfico de gastos por categoria
function obterDadosGraficoGastos() {
    const categorias = carregarCategorias();
    const dadosGrafico = {};

    // Inicializar dados das categorias
    categorias.forEach(cat => {
        dadosGrafico[cat.nome] = 0;
    });

    // Somar gastos por categoria (apenas saídas)
    transacoes.filter(t => t.tipo === 'saida').forEach(transacao => {
        const categoria = categorias.find(c => c.id === transacao.categoria);
        if (categoria) {
            dadosGrafico[categoria.nome] += transacao.valor;
        }
    });

    // Converter para formato do Chart.js
    const labels = Object.keys(dadosGrafico);
    const data = Object.values(dadosGrafico);

    return { labels, data };
}

// Função para validar transação
function validarTransacao(transacao) {
    const erros = [];

    if (!transacao.descricao || transacao.descricao.trim() === '') {
        erros.push('Descrição é obrigatória');
    }

    if (!transacao.categoria) {
        erros.push('Categoria é obrigatória');
    }

    if (!transacao.tipo || !['entrada', 'saida'].includes(transacao.tipo)) {
        erros.push('Tipo deve ser entrada ou saída');
    }

    if (transacao.valor === undefined || transacao.valor === null || transacao.valor < 0) {
        erros.push('Valor deve ser um número positivo');
    }

    if (!transacao.data) {
        erros.push('Data é obrigatória');
    }

    return erros;
}

// Função para formatar valor monetário
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}
