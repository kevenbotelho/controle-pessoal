// Funções para manipulação da interface do usuário

// Função para calcular percentual de gastos
function calcularPercentualGastos(totais) {
    if (totais.entradas === 0) return 0;
    return (totais.saidas / totais.entradas) * 100;
}

// Função para classificar status financeiro
function classificarStatusFinanceiro(percentualGastos, saldo) {
    if (saldo < 0 || percentualGastos > 75) {
        return 'critico';
    } else if (percentualGastos > 50) {
        return 'atencao';
    } else if (percentualGastos > 25) {
        return 'bom';
    } else {
        return 'excelente';
    }
}

// Função para obter emoji baseado no status
function obterEmojiStatus(status) {
    switch (status) {
        case 'excelente': return '✅';
        case 'bom': return '👍';
        case 'atencao': return '⚠️';
        case 'critico': return '🚨';
        default: return '❓';
    }
}

// Função para obter descrição do status
function obterDescricaoStatus(status) {
    switch (status) {
        case 'excelente': return 'Excelente! Continue assim!';
        case 'bom': return 'Bom trabalho! Mantenha o foco!';
        case 'atencao': return 'CUIDADO! Corte gastos desnecessários AGORA!';
        case 'critico': return 'PERIGO! Pare TODOS os gastos não essenciais!';
        default: return 'Sem dados';
    }
}

// Função para aplicar cores dinâmicas no dashboard
function aplicarCoresDashboard(totais, percentualGastos, statusFinanceiro) {
    // Remover classes anteriores
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('excelente', 'bom', 'atencao', 'critico', 'negative');
    });

    // Aplicar cores aos cards
    const saldoCard = document.querySelector('.card.saldo');
    const entradasCard = document.querySelector('.card.entradas');
    const saidasCard = document.querySelector('.card.saidas');
    const investimentosCard = document.querySelector('.card.investimentos');
    const resumoCard = document.querySelector('.card.resumo');

    // Saldo Atual - lógica especial
    if (totais.saldo < 0) {
        saldoCard.classList.add('critico');
    } else if (percentualGastos <= 50) {
        saldoCard.classList.add('excelente');
    } else if (percentualGastos <= 75) {
        saldoCard.classList.add('atencao');
    } else {
        saldoCard.classList.add('critico');
    }

    // Entradas - sempre verde (receitas são positivas)
    entradasCard.classList.add('excelente');

    // Investimentos - amarelo (investimentos são saídas mas positivas para poupança)
    investimentosCard.classList.add('bom');

    // Saídas - baseado no percentual
    if (percentualGastos <= 25) {
        saidasCard.classList.add('excelente');
    } else if (percentualGastos <= 50) {
        saidasCard.classList.add('bom');
    } else if (percentualGastos <= 75) {
        saidasCard.classList.add('atencao');
    } else {
        saidasCard.classList.add('critico');
    }

    // Resumo do mês - segue mesma lógica das saídas
    const resumoMes = obterResumoMesAtual();
    const percentualMes = resumoMes.entradas > 0 ? (resumoMes.saidas / resumoMes.entradas) * 100 : 0;

    if (percentualMes <= 25) {
        resumoCard.classList.add('excelente');
    } else if (percentualMes <= 50) {
        resumoCard.classList.add('bom');
    } else if (percentualMes <= 75) {
        resumoCard.classList.add('atencao');
    } else {
        resumoCard.classList.add('critico');
    }
}

// Função para atualizar dashboard
function atualizarDashboard() {
    const totais = calcularTotais();
    const resumoMes = obterResumoMesAtual();
    const percentualGastos = calcularPercentualGastos(totais);
    const statusFinanceiro = classificarStatusFinanceiro(percentualGastos, totais.saldo);

    // Atualizar valores
    document.getElementById('saldo-atual').textContent = formatarMoeda(totais.saldo);
    document.getElementById('total-entradas').textContent = formatarMoeda(totais.entradas);
    document.getElementById('total-saidas').textContent = formatarMoeda(totais.saidas);
    document.getElementById('total-investimentos').textContent = formatarMoeda(totais.investimentos);

    // Resumo do mês com cores
    const percentualMes = resumoMes.entradas > 0 ? (resumoMes.saidas / resumoMes.entradas) * 100 : 0;
    const statusMes = percentualMes <= 25 ? 'excelente' : percentualMes <= 50 ? 'bom' : percentualMes <= 75 ? 'atencao' : 'critico';

    document.getElementById('resumo-mes').innerHTML =
        `<span class="resumo-entradas">Entradas: ${formatarMoeda(resumoMes.entradas)}</span><br>` +
        `<span class="resumo-saidas">Saídas: ${formatarMoeda(resumoMes.saidas)}</span>` +
        `<br><small class="resumo-status">${obterEmojiStatus(statusMes)} ${obterDescricaoStatus(statusMes)}</small>`;

    // Aplicar cores dinâmicas
    aplicarCoresDashboard(totais, percentualGastos, statusFinanceiro);

    // Mostrar recomendação de poupança
    renderizarRecomendacaoPoupanca();
}

// Função para renderizar tabela de transações
function renderizarTabelaTransacoes(transacoesParaMostrar = null) {
    const tbody = document.querySelector('#tabela-transacoes tbody');
    const tabelaContainer = document.querySelector('.tabela-responsive');
    const emptyState = document.getElementById('nenhuma-transacao');
    const transacoes = transacoesParaMostrar || filtrarTransacoes();

    tbody.innerHTML = '';

    if (transacoes.length === 0) {
        // Mostrar estado vazio
        tabelaContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        // Mostrar tabela
        tabelaContainer.style.display = 'block';
        emptyState.style.display = 'none';

        transacoes.forEach(transacao => {
            const categoria = obterCategoriaPorId(transacao.categoria);
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${formatarData(transacao.data)}</td>
                <td>${transacao.descricao}</td>
                <td>${categoria ? categoria.nome : 'N/A'}</td>
                <td>${transacao.tipo === 'entrada' ? 'Entrada (+)' : transacao.tipo === 'saida' ? 'Saída (-)' : 'Investimento (💰)'}</td>
                <td class="${transacao.tipo === 'entrada' ? 'positive' : 'negative'}">
                    ${formatarMoeda(transacao.valor)}
                </td>
                <td>
                    <button onclick="removerTransacaoComConfirmacao(${transacao.id})" class="danger">Remover</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    // Atualizar estatísticas
    atualizarEstatisticasTransacoes(transacoes);
}

// Função para renderizar lista de categorias
function renderizarListaCategorias() {
    const lista = document.getElementById('lista-categorias');
    const categorias = carregarCategorias();

    lista.innerHTML = '';

    categorias.forEach(categoria => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${categoria.nome}</span>
            <div>
                <button onclick="editarCategoria(${categoria.id})" class="secondary">Editar</button>
                <button onclick="removerCategoriaComConfirmacao(${categoria.id})" class="danger">Remover</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Função para renderizar opções de categoria nos selects
function renderizarOpcoesCategoria() {
    const selects = document.querySelectorAll('#categoria, #filtro-categoria');
    const categorias = carregarCategorias();

    selects.forEach(select => {
        select.innerHTML = '<option value="">Selecione uma categoria</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            select.appendChild(option);
        });
    });
}

// Função para mostrar modal
function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Função para fechar modal
function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Função para limpar formulário de transação
function limparFormularioTransacao() {
    document.getElementById('form-transacao').reset();
    document.getElementById('transacao-id').value = '';
    document.getElementById('modal-title').textContent = 'Adicionar Transação';
}

// Função para preencher formulário de transação para edição
function preencherFormularioTransacao(transacao) {
    console.log('=== PREENCHENDO FORMULÁRIO ===');
    console.log('Transação recebida:', transacao);
    console.log('ID da transação:', transacao.id);
    console.log('Valor da transação:', transacao.valor, 'Tipo:', typeof transacao.valor);

    // Preencher campos básicos
    const idCampo = document.getElementById('transacao-id');
    const dataCampo = document.getElementById('data');
    const descricaoCampo = document.getElementById('descricao');
    const categoriaCampo = document.getElementById('categoria');
    const tipoCampo = document.getElementById('tipo');
    const valorCampo = document.getElementById('valor');
    const tituloCampo = document.getElementById('modal-title');

    console.log('Campos encontrados no DOM:');
    console.log('- transacao-id:', idCampo ? 'OK' : 'NÃO ENCONTRADO');
    console.log('- data:', dataCampo ? 'OK' : 'NÃO ENCONTRADO');
    console.log('- descricao:', descricaoCampo ? 'OK' : 'NÃO ENCONTRADO');
    console.log('- categoria:', categoriaCampo ? 'OK' : 'NÃO ENCONTRADO');
    console.log('- tipo:', tipoCampo ? 'OK' : 'NÃO ENCONTRADO');
    console.log('- valor:', valorCampo ? 'OK' : 'NÃO ENCONTRADO');
    console.log('- modal-title:', tituloCampo ? 'OK' : 'NÃO ENCONTRADO');

    if (idCampo) idCampo.value = transacao.id || '';
    if (dataCampo) dataCampo.value = transacao.data || '';
    if (descricaoCampo) descricaoCampo.value = transacao.descricao || '';
    if (categoriaCampo) categoriaCampo.value = transacao.categoria || '';
    if (tipoCampo) tipoCampo.value = transacao.tipo || 'entrada';

    // Tratamento especial para o campo de valor
    if (valorCampo) {
        let valorFinal = 0;

        if (transacao.valor !== undefined && transacao.valor !== null) {
            // Converter para número se necessário
            if (typeof transacao.valor === 'string') {
                valorFinal = parseFloat(transacao.valor.replace(',', '.')) || 0;
            } else {
                valorFinal = parseFloat(transacao.valor) || 0;
            }
        }

        valorCampo.value = valorFinal.toFixed(2);
        console.log('Valor final definido no campo:', valorCampo.value, 'Tipo do valor original:', typeof transacao.valor);
    }

    if (tituloCampo) tituloCampo.textContent = 'Editar Transação';

    console.log('=== FORMULÁRIO PREENCHIDO ===');
}

// Função para limpar formulário de categoria
function limparFormularioCategoria() {
    document.getElementById('form-categoria').reset();
    document.getElementById('categoria-id').value = '';
    document.getElementById('modal-categoria-title').textContent = 'Adicionar Categoria';
}

// Função para preencher formulário de categoria para edição
function preencherFormularioCategoria(categoria) {
    document.getElementById('categoria-id').value = categoria.id;
    document.getElementById('nome-categoria').value = categoria.nome;
    document.getElementById('modal-categoria-title').textContent = 'Editar Categoria';
}

// Função para obter categoria por ID
function obterCategoriaPorId(id) {
    const categorias = carregarCategorias();
    return categorias.find(c => c.id === id);
}

// Função para aplicar filtros
function aplicarFiltros() {
    // Verificar se estamos na seção de transações
    const secaoTransacoes = document.getElementById('transacoes');
    if (!secaoTransacoes || !secaoTransacoes.classList.contains('active')) {
        return; // Não aplicar filtros se não estiver na seção de transações
    }

    const filtros = {
        busca: document.getElementById('busca').value,
        categoria: document.getElementById('filtro-categoria').value,
        tipo: document.getElementById('filtro-tipo').value,
        mes: document.getElementById('filtro-mes').value
    };

    console.log('Aplicando filtros:', filtros);

    const transacoesFiltradas = filtrarTransacoes(filtros);
    console.log('Transações filtradas:', transacoesFiltradas.length);

    renderizarTabelaTransacoes(transacoesFiltradas);

    // Atualizar estatísticas
    atualizarEstatisticasTransacoes(transacoesFiltradas);
}

// Função para renderizar gráfico
function renderizarGrafico() {
    try {
        const canvas = document.getElementById('grafico-gastos');
        if (!canvas) return;

        // Obter totais financeiros
        const totais = calcularTotais();

        // Verificar se Chart.js está carregado
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não carregado, tentando novamente...');
            setTimeout(renderizarGrafico, 1000);
            return;
        }

        // Destruir gráfico anterior se existir
        if (window.graficoFinanceiro) {
            window.graficoFinanceiro.destroy();
        }

        // Dados do gráfico
        const dados = [];
        const labels = [];
        const cores = [];
        const percentuais = [];

        // Calcular saídas normais (excluindo investimentos)
        const saidasNormais = totais.saidas - totais.investimentos;

        if (totais.entradas > 0) {
            if (totais.saidas <= totais.entradas) {
                // Caso normal: verde para disponível, vermelho para gastos normais, amarelo para investimentos
                const restante = totais.entradas - totais.saidas;
                dados.push(restante);
                labels.push('Disponível');
                cores.push('#28a745'); // Verde
                percentuais.push(((restante / totais.entradas) * 100).toFixed(1));

                if (saidasNormais > 0) {
                    dados.push(saidasNormais);
                    labels.push('Gastos');
                    cores.push('#dc3545'); // Vermelho
                    percentuais.push(((saidasNormais / totais.entradas) * 100).toFixed(1));
                }

                if (totais.investimentos > 0) {
                    dados.push(totais.investimentos);
                    labels.push('Investimentos');
                    cores.push('#ffc107'); // Amarelo
                    percentuais.push(((totais.investimentos / totais.entradas) * 100).toFixed(1));
                }
            } else {
                // Gastos excedem entradas: mostrar déficit
                dados.push(totais.saidas);
                labels.push('Déficit');
                cores.push('#dc3545'); // Vermelho
                percentuais.push(100);
            }
        } else if (totais.saidas > 0) {
            // Se não há entradas mas há saídas
            if (saidasNormais > 0) {
                dados.push(saidasNormais);
                labels.push('Gastos');
                cores.push('#dc3545'); // Vermelho
                percentuais.push(100);
            }
            if (totais.investimentos > 0) {
                dados.push(totais.investimentos);
                labels.push('Investimentos');
                cores.push('#ffc107'); // Amarelo
                percentuais.push(100);
            }
        }

        // Se não há dados
        if (dados.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Adicione transações para ver o gráfico', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Criar gráfico de doughnut (rosca)
        const ctx = canvas.getContext('2d');
        window.graficoFinanceiro = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: dados,
                    backgroundColor: cores,
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', // Espaço interno da rosca
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Seus Recursos Financeiros',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Atualizar informações separadas
        atualizarInformacoesGrafico(totais);

        console.log('Gráfico financeiro renderizado com sucesso');

    } catch (error) {
        console.error('Erro ao renderizar gráfico:', error);
        // Fallback: mostrar mensagem de erro
        const canvas = document.getElementById('grafico-gastos');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#dc3545';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Erro ao carregar gráfico', canvas.width / 2, canvas.height / 2);
        }
    }
}

// Função para atualizar informações separadas do gráfico
function atualizarInformacoesGrafico(totais) {
    // Saldo atual
    const saldoEl = document.getElementById('info-saldo');
    const saldoStatusEl = document.getElementById('info-saldo-status');

    if (saldoEl) {
        saldoEl.textContent = formatarMoeda(totais.saldo);
        if (totais.saldo > 0) {
            saldoStatusEl.textContent = 'Saldo positivo';
            saldoStatusEl.style.color = 'var(--success-color)';
        } else if (totais.saldo < 0) {
            saldoStatusEl.textContent = 'Saldo negativo';
            saldoStatusEl.style.color = 'var(--danger-color)';
        } else {
            saldoStatusEl.textContent = 'Sem saldo';
            saldoStatusEl.style.color = 'var(--text-color)';
        }
    }

    // Entradas
    const entradasEl = document.getElementById('info-entradas');
    if (entradasEl) {
        entradasEl.textContent = formatarMoeda(totais.entradas);
    }

    // Saídas
    const saidasEl = document.getElementById('info-saidas');
    if (saidasEl) {
        saidasEl.textContent = formatarMoeda(totais.saidas);
    }

    // Investimentos
    const investimentosEl = document.getElementById('info-investimentos');
    if (investimentosEl) {
        investimentosEl.textContent = formatarMoeda(totais.investimentos);
    }

    // Percentual gasto
    const percentualEl = document.getElementById('info-percentual');
    const percentualStatusEl = document.getElementById('info-percentual-status');

    if (percentualEl && percentualStatusEl) {
        if (totais.entradas > 0) {
            const percentual = ((totais.saidas / totais.entradas) * 100).toFixed(1);
            percentualEl.textContent = `${percentual}%`;

            // Alterar cor baseada no percentual
            if (percentual <= 25) {
                percentualEl.style.color = 'var(--success-color)';
                percentualStatusEl.textContent = 'Excelente controle!';
            } else if (percentual <= 50) {
                percentualEl.style.color = '#ffc107';
                percentualStatusEl.textContent = 'Bom controle';
            } else if (percentual <= 75) {
                percentualEl.style.color = '#fd7e14';
                percentualStatusEl.textContent = 'Atenção com gastos';
            } else {
                percentualEl.style.color = 'var(--danger-color)';
                percentualStatusEl.textContent = 'Cuidado! Muito gasto';
            }
        } else {
            percentualEl.textContent = '0%';
            percentualStatusEl.textContent = 'Adicione entradas primeiro';
        }
    }

    // Análise financeira
    const analiseEl = document.getElementById('analise-texto');
    if (analiseEl) {
        let analiseTexto = '';

        if (totais.entradas === 0 && totais.saidas === 0) {
            analiseTexto = 'Adicione algumas transações para ver sua análise financeira completa.';
        } else if (totais.entradas === 0) {
            analiseTexto = 'Você ainda não registrou nenhuma entrada. Adicione suas receitas para ter uma visão completa!';
        } else {
            const percentualGasto = ((totais.saidas / totais.entradas) * 100);
            const saldoPercentual = ((totais.saldo / totais.entradas) * 100);

            if (percentualGasto <= 25) {
                analiseTexto = `🎉 <strong class="status-excelente">EXCELENTE! Você é um mestre do controle financeiro!</strong> Gastou apenas ${percentualGasto.toFixed(1)}% dos seus recursos e mantém ${saldoPercentual.toFixed(1)}% em reserva. Você merece parabéns!`;
            } else if (percentualGasto <= 50) {
                analiseTexto = `👍 <strong class="status-bom">BOM TRABALHO! Você está no caminho certo!</strong> Gastou ${percentualGasto.toFixed(1)}% dos seus recursos. Ainda tem ${saldoPercentual.toFixed(1)}% disponível. Continue focado!`;
            } else if (percentualGasto <= 75) {
                analiseTexto = `⚠️ <strong class="status-atencao">CUIDADO! Seus gastos estão fora de controle!</strong> Você já queimou ${percentualGasto.toFixed(1)}% dos seus recursos. Restam apenas ${saldoPercentual.toFixed(1)}%. CORTE AGORA todos os gastos supérfluos!`;
            } else if (percentualGasto <= 100) {
                analiseTexto = `🚨 <strong class="status-cuidado">PERIGO! Você está no LIMITE do abismo financeiro!</strong> Queimou ${percentualGasto.toFixed(1)}% dos seus recursos. Seu saldo está em ${totais.saldo < 0 ? 'déficit CRÍTICO' : 'equilíbrio PRECÁRIO'}. PARE TUDO e revise URGENTEMENTE seus gastos!`;
            } else {
                analiseTexto = `🚨 <strong class="status-cuidado">SITUAÇÃO DESESPERADORA! Você está afundando no vermelho!</strong> Gastou ${percentualGasto.toFixed(1)}% dos seus recursos, criando um BURACO negro de ${formatarMoeda(Math.abs(totais.saldo))}. INTERROMPA IMEDIATAMENTE TODOS os gastos não essenciais! Procure ajuda profissional se necessário!`;
            }
        }

        analiseEl.innerHTML = `<p>${analiseTexto}</p>`;
    }
}

// Função para alternar tema
function alternarTema() {
    const body = document.body;
    const toggleButton = document.getElementById('toggle-theme');
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('tema', 'light');
        toggleButton.innerHTML = '<span class="material-symbols-outlined" title="Alternar para modo escuro">light_mode</span>';
        toggleButton.setAttribute('aria-label', 'Alternar para modo escuro');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('tema', 'dark');
        toggleButton.innerHTML = '<span class="material-symbols-outlined" title="Alternar para modo claro">dark_mode</span>';
        toggleButton.setAttribute('aria-label', 'Alternar para modo claro');
    }
}

// Função para carregar tema salvo
function carregarTema() {
    const tema = localStorage.getItem('tema');
    const toggleButton = document.getElementById('toggle-theme');

    if (tema === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        toggleButton.innerHTML = '<span class="material-symbols-outlined" title="Alternar para modo claro">dark_mode</span>';
        toggleButton.setAttribute('aria-label', 'Alternar para modo claro');
    } else {
        toggleButton.innerHTML = '<span class="material-symbols-outlined" title="Alternar para modo escuro">light_mode</span>';
        toggleButton.setAttribute('aria-label', 'Alternar para modo escuro');
    }
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = mensagem;

    // Estilizar notificação
    notificacao.style.position = 'fixed';
    notificacao.style.top = '80px';
    notificacao.style.right = '20px';
    notificacao.style.padding = '10px 20px';
    notificacao.style.borderRadius = '5px';
    notificacao.style.color = 'white';
    notificacao.style.zIndex = '1000';

    if (tipo === 'success') {
        notificacao.style.backgroundColor = 'var(--success-color)';
    } else if (tipo === 'error') {
        notificacao.style.backgroundColor = 'var(--danger-color)';
    } else {
        notificacao.style.backgroundColor = 'var(--primary-color)';
    }

    // Adicionar ao DOM
    document.body.appendChild(notificacao);

    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}

// Função para alternar sidebar
function alternarSidebar() {
    // Verificar se há modais abertos
    const modaisAbertos = document.querySelectorAll('.modal[style*="display: block"]');
    if (modaisAbertos.length > 0) {
        // Se há modais abertos, não permite abrir sidebar
        return;
    }

    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger-menu');
    const main = document.querySelector('main');

    const isActive = sidebar.classList.contains('active');

    if (isActive) {
        // Fechando sidebar
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
        main.classList.remove('sidebar-active');
    } else {
        // Abrindo sidebar
        sidebar.classList.add('active');
        hamburger.classList.add('active');
        main.classList.add('sidebar-active');
    }
}

// Função para fechar sidebar se clicar fora
function configurarFecharSidebarFora() {
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        const main = document.querySelector('main');

        // Verificar se sidebar está ativa
        if (sidebar.classList.contains('active')) {
            // Verificar se o clique foi fora da sidebar e do hamburger
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);

            if (!isClickInsideSidebar && !isClickOnHamburger) {
                // Fechar sidebar
                sidebar.classList.remove('active');
                hamburger.classList.remove('active');
                main.classList.remove('sidebar-active');
            }
        }
    });
}

// Função para atualizar estatísticas das transações
function atualizarEstatisticasTransacoes(transacoes) {
    const totalTransacoesEl = document.getElementById('total-transacoes');
    const transacoesFiltradasEl = document.getElementById('transacoes-filtradas');
    const periodoAtualEl = document.getElementById('periodo-atual');

    // Total de transações
    const todasTransacoes = obterTransacoes();
    totalTransacoesEl.textContent = `${todasTransacoes.length} transações`;

    // Informações sobre filtro atual
    const filtroMes = document.getElementById('filtro-mes').value;
    const filtroCategoria = document.getElementById('filtro-categoria').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const busca = document.getElementById('busca').value;

    let filtroTexto = 'Mostrando todas';
    if (filtroMes) {
        const [ano, mes] = filtroMes.split('-');
        const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        filtroTexto = `Mês: ${nomeMes}`;
    } else {
        filtroTexto = 'Todos os períodos';
    }

    if (filtroCategoria) {
        const categoria = obterCategoriaPorId(parseInt(filtroCategoria));
        filtroTexto += ` | Categoria: ${categoria ? categoria.nome : 'N/A'}`;
    }

    if (filtroTipo) {
        filtroTexto += ` | Tipo: ${filtroTipo === 'entrada' ? 'Entradas' : filtroTipo === 'saida' ? 'Saídas' : 'Investimentos'}`;
    }

    if (busca) {
        filtroTexto += ` | Busca: "${busca}"`;
    }

    transacoesFiltradasEl.textContent = `${transacoes.length} de ${todasTransacoes.length} ${filtroTexto}`;

    // Período atual
    const hoje = new Date();
    const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    periodoAtualEl.textContent = mesAtual;
}

// Função para atualizar status do backup
function atualizarStatusBackup() {
    const statusTexto = document.getElementById('status-texto');
    if (!statusTexto) return;

    // Verificar se o backup está habilitado
    if (typeof backupHabilitado !== 'undefined') {
        if (backupHabilitado) {
            statusTexto.textContent = 'Habilitado ✅';
            statusTexto.style.color = 'var(--success-color)';
        } else {
            statusTexto.textContent = 'Desabilitado ⚠️';
            statusTexto.style.color = 'var(--warning-color)';
        }
    } else {
        statusTexto.textContent = 'Carregando...';
        statusTexto.style.color = 'var(--text-color)';
    }
}

// Função para renderizar tabela da lixeira
function renderizarTabelaLixeira() {
    const tbody = document.querySelector('#tabela-lixeira tbody');
    const lixeiraVazia = document.getElementById('lixeira-vazia');
    const tabelaContainer = document.querySelector('.lixeira-container');
    const lixeira = carregarLixeira();

    tbody.innerHTML = '';

    // Atualizar contador
    const totalLixeira = document.getElementById('total-lixeira');
    if (totalLixeira) {
        totalLixeira.textContent = `${lixeira.length} itens na lixeira`;
    }

    if (lixeira.length === 0) {
        // Mostrar estado vazio
        tabelaContainer.style.display = 'none';
        lixeiraVazia.style.display = 'block';
    } else {
        // Mostrar tabela
        tabelaContainer.style.display = 'block';
        lixeiraVazia.style.display = 'none';

        lixeira.forEach(item => {
            const categoria = obterCategoriaPorId(item.categoria);
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${formatarData(item.data)}</td>
                <td>${item.descricao}</td>
                <td>${categoria ? categoria.nome : 'N/A'}</td>
                <td>${item.tipo === 'entrada' ? 'Entrada (+)' : item.tipo === 'saida' ? 'Saída (-)' : 'Investimento (💰)'}</td>
                <td class="${item.tipo === 'entrada' ? 'positive' : 'negative'}">
                    ${formatarMoeda(item.valor)}
                </td>
                <td>${formatarData(item.dataExclusao)}</td>
                <td>
                    <button onclick="restaurarDaLixeira(${item.id})" class="btn-secondary" title="Restaurar transação">
                        🔄 Restaurar
                    </button>
                    <button onclick="removerDaLixeiraPermanentemente(${item.id})" class="danger" title="Excluir permanentemente">
                        🗑️ Excluir
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }
}

// Função para restaurar item da lixeira
function restaurarDaLixeira(id) {
    const transacaoRestaurada = restaurarDaLixeira(id);
    if (transacaoRestaurada) {
        mostrarNotificacao('Transação restaurada com sucesso!', 'success');
        renderizarTabelaLixeira();
        atualizarDashboard();
        renderizarGrafico();
    } else {
        mostrarNotificacao('Erro ao restaurar transação.', 'error');
    }
}

// Função para remover permanentemente da lixeira
function removerDaLixeiraPermanentemente(id) {
    if (confirm('Tem certeza que deseja excluir permanentemente esta transação? Esta ação não pode ser desfeita.')) {
        removerDaLixeira(id);
        mostrarNotificacao('Transação excluída permanentemente!', 'success');
        renderizarTabelaLixeira();
    }
}



// Função para renderizar recomendação de poupança
function renderizarRecomendacaoPoupanca() {
    const recomendacaoContainer = document.getElementById('recomendacao-poupanca');
    const conteudoEl = document.getElementById('poupanca-conteudo');

    if (!recomendacaoContainer || !conteudoEl) return;

    const recomendacao = calcularRecomendacaoPoupanca();

    if (!recomendacao) {
        recomendacaoContainer.style.display = 'none';
        return;
    }

    let mensagem = '';

    if (recomendacao.metaAlcancada) {
        mensagem = `
            <div class="poupanca-meta-alcancada">
                <h4>🎉 Meta de Poupança Atingida!</h4>
                <p>Parabéns! Você já poupou <strong>${formatarMoeda(recomendacao.valorJaPoupado)}</strong> este mês, atingindo ou superando os <strong>${recomendacao.porcentagem}%</strong> recomendados (<strong>${formatarMoeda(recomendacao.valorRecomendado)}</strong>).</p>
                <p>Continue assim! O hábito de poupar é fundamental para sua saúde financeira.</p>
            </div>
        `;
    } else {
        const valorFaltante = recomendacao.valorFaltante;
        mensagem = `
            <div class="poupanca-meta-pendente">
                <h4>💡 Dica Importante de Poupança</h4>
                <p>Para manter uma saúde financeira sustentável, recomenda-se guardar pelo menos <strong>${recomendacao.porcentagem}%</strong> das suas receitas mensais.</p>
                <p>Com base nas suas entradas de <strong>${formatarMoeda(recomendacao.valorRecomendado / (recomendacao.porcentagem / 100))}</strong>, você deveria poupar pelo menos <strong>${formatarMoeda(recomendacao.valorRecomendado)}</strong>.</p>
                <p>Você já poupou <strong>${formatarMoeda(recomendacao.valorJaPoupado)}</strong> este mês. Ainda faltam <strong>${formatarMoeda(valorFaltante)}</strong> para atingir a meta recomendada.</p>
                <p class="dica-poupanca">💰 Considere registrar transações do tipo "Investimento" para acompanhar seu progresso na poupança!</p>
            </div>
        `;
    }

    conteudoEl.innerHTML = mensagem;
    recomendacaoContainer.style.display = 'block';
}

// Funções para o botão flutuante de ajuda
function configurarBotaoAjudaFlutuante() {
    const btnAjuda = document.getElementById('btn-ajuda-flutuante');
    const modalAjuda = document.getElementById('modal-ajuda');

    if (btnAjuda) {
        // Abrir modal ao clicar no botão
        btnAjuda.addEventListener('click', function() {
            mostrarModal('modal-ajuda');
        });
    }

    // Fechar modal ao clicar no X
    if (modalAjuda) {
        const closeBtn = modalAjuda.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                fecharModal('modal-ajuda');
            });
        }

        // Fechar modal ao clicar fora
        modalAjuda.addEventListener('click', function(event) {
            if (event.target === modalAjuda) {
                fecharModal('modal-ajuda');
            }
        });
    }
}

// Funções para o relatório
function gerarRelatorio() {
    const mesSelecionado = document.getElementById('relatorio-mes').value;

    if (!mesSelecionado) {
        mostrarNotificacao('Por favor, selecione um mês e ano para gerar o relatório!', 'error');
        return;
    }

    // Extrair ano e mês do formato "YYYY-MM"
    const [ano, mes] = mesSelecionado.split('-');
    const mesNumero = parseInt(mes);
    const anoNumero = parseInt(ano);

    // Obter transações do mês selecionado
    const transacoesMes = obterTransacoesPorMes(mesNumero, anoNumero);

    if (transacoesMes.length === 0) {
        mostrarNotificacao('Não há transações para o período selecionado!', 'error');
        return;
    }

    // Calcular totais
    const totais = calcularTotaisMes(transacoesMes);

    // Mostrar resultado primeiro
    document.getElementById('relatorio-resultado').style.display = 'block';
    document.getElementById('btn-exportar-relatorio').style.display = 'inline-block';

    // Atualizar interface (incluindo gráfico) após o resultado estar visível
    setTimeout(() => {
        atualizarInterfaceRelatorio(mesNumero, anoNumero, totais, transacoesMes);

        // Scroll para o resultado
        document.getElementById('relatorio-resultado').scrollIntoView({ behavior: 'smooth' });

        mostrarNotificacao('Relatório gerado com sucesso!', 'success');
    }, 100);
}

function popularSelecaoMesesRelatorio() {
    const select = document.getElementById('relatorio-mes');
    if (!select) return;

    // Obter todos os meses disponíveis
    const mesesDisponiveis = obterMesesDisponiveis();

    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um mês</option>';

    // Adicionar opções para cada mês disponível
    mesesDisponiveis.forEach(({ ano, mes, nomeMes, valor }) => {
        const option = document.createElement('option');
        option.value = valor; // formato YYYY-MM
        option.textContent = `${nomeMes} ${ano}`;
        select.appendChild(option);
    });

    // Selecionar o mês mais recente por padrão
    if (mesesDisponiveis.length > 0) {
        select.value = mesesDisponiveis[0].valor;
    }
}

function obterMesesDisponiveis() {
    const transacoes = obterTransacoes();
    const mesesUnicos = new Set();

    // Coletar todos os meses únicos
    transacoes.forEach(transacao => {
        const data = new Date(transacao.data);
        const ano = data.getFullYear();
        const mes = data.getMonth() + 1; // getMonth() retorna 0-11
        const chave = `${ano}-${mes.toString().padStart(2, '0')}`;
        mesesUnicos.add(chave);
    });

    // Converter para array e ordenar (mais recente primeiro)
    const mesesOrdenados = Array.from(mesesUnicos)
        .map(chave => {
            const [ano, mes] = chave.split('-');
            const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
            return {
                ano: parseInt(ano),
                mes: parseInt(mes),
                nomeMes: data.toLocaleDateString('pt-BR', { month: 'long' }),
                valor: chave
            };
        })
        .sort((a, b) => {
            // Ordenar por ano descendente, depois por mês descendente
            if (a.ano !== b.ano) {
                return b.ano - a.ano;
            }
            return b.mes - a.mes;
        });

    return mesesOrdenados;
}

function obterTransacoesPorMes(mes, ano) {
    const transacoes = obterTransacoes();

    return transacoes.filter(transacao => {
        const dataTransacao = new Date(transacao.data);
        return dataTransacao.getMonth() === (mes - 1) && dataTransacao.getFullYear() === ano;
    });
}

function calcularTotaisMes(transacoes) {
    let entradas = 0;
    let saidas = 0;
    let investimentos = 0;

    transacoes.forEach(transacao => {
        switch (transacao.tipo) {
            case 'entrada':
                entradas += transacao.valor;
                break;
            case 'saida':
                saidas += transacao.valor;
                break;
            case 'investimento':
                investimentos += transacao.valor;
                saidas += transacao.valor; // Investimentos também contam como saída
                break;
        }
    });

    const saldo = entradas - saidas;

    return {
        entradas,
        saidas,
        investimentos,
        saldo,
        totalTransacoes: transacoes.length
    };
}

function atualizarInterfaceRelatorio(mes, ano, totais, transacoes) {
    // Nome do mês
    const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Atualizar título
    document.getElementById('relatorio-titulo').textContent = `Relatório Financeiro - ${nomeMes}`;

    // Atualizar resumo
    document.getElementById('relatorio-entradas').textContent = formatarMoeda(totais.entradas);
    document.getElementById('relatorio-entradas').className = 'valor positivo';

    document.getElementById('relatorio-saidas').textContent = formatarMoeda(totais.saidas);
    document.getElementById('relatorio-saidas').className = 'valor negativo';

    document.getElementById('relatorio-investimentos').textContent = formatarMoeda(totais.investimentos);
    document.getElementById('relatorio-investimentos').className = 'valor valor-amarelo';

    document.getElementById('relatorio-saldo').textContent = formatarMoeda(totais.saldo);
    document.getElementById('relatorio-saldo').className = `valor ${totais.saldo >= 0 ? 'positivo' : 'negativo'}`;

    document.getElementById('relatorio-total-transacoes').textContent = totais.totalTransacoes;

    // Renderizar gráfico
    renderizarGraficoRelatorio(totais);

    // Preencher tabela
    preencherTabelaRelatorio(transacoes);
}

function renderizarGraficoRelatorio(totais) {
    const canvas = document.getElementById('grafico-relatorio');
    if (!canvas) return;

    // Destruir gráfico anterior se existir
    if (window.graficoRelatorio) {
        window.graficoRelatorio.destroy();
    }

    // Dados do gráfico
    const dados = [];
    const labels = [];
    const cores = [];

    // Calcular valores proporcionais
    if (totais.entradas > 0) {
        const restante = totais.entradas - totais.saidas;
        if (restante > 0) {
            dados.push(restante);
            labels.push('Disponível');
            cores.push('#28a745'); // Verde
        }

        if (totais.saidas > totais.investimentos) {
            dados.push(totais.saidas - totais.investimentos);
            labels.push('Gastos');
            cores.push('#dc3545'); // Vermelho
        }

        if (totais.investimentos > 0) {
            dados.push(totais.investimentos);
            labels.push('Investimentos');
            cores.push('#ffc107'); // Amarelo
        }
    }

    // Criar gráfico
    const ctx = canvas.getContext('2d');
    window.graficoRelatorio = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderColor: '#fff',
                borderWidth: 3,
                hoverBorderWidth: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 14 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function preencherTabelaRelatorio(transacoes) {
    const tbody = document.getElementById('relatorio-transacoes-body');
    tbody.innerHTML = '';

    // Ordenar transações por data
    transacoes.sort((a, b) => new Date(a.data) - new Date(b.data));

    transacoes.forEach(transacao => {
        const categoria = obterCategoriaPorId(transacao.categoria);
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td>${categoria ? categoria.nome : 'N/A'}</td>
            <td>${transacao.tipo === 'entrada' ? 'Entrada (+)' : transacao.tipo === 'saida' ? 'Saída (-)' : 'Investimento (💰)'}</td>
            <td class="${transacao.tipo === 'entrada' ? 'positive' : 'negative'}">${formatarMoeda(transacao.valor)}</td>
        `;

        tbody.appendChild(row);
    });
}

function exportarRelatorio() {
    const mesSelecionado = document.getElementById('relatorio-mes').value;

    if (!mesSelecionado) {
        mostrarNotificacao('Selecione um mês para exportar!', 'error');
        return;
    }

    // Obter dados do relatório atual
    const [ano, mes] = mesSelecionado.split('-');
    const mesNumero = parseInt(mes);
    const anoNumero = parseInt(ano);
    const transacoesMes = obterTransacoesPorMes(mesNumero, anoNumero);
    const totais = calcularTotaisMes(transacoesMes);
    const nomeMes = new Date(anoNumero, mesNumero - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Criar conteúdo HTML para impressão
    const conteudoImpressao = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CFP - Relatório Financeiro</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                    color: #333;
                }

                .titulo-principal {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 10px;
                }

                .secao {
                    margin-bottom: 40px;
                    page-break-inside: avoid;
                }

                .secao h2 {
                    color: #007bff;
                    font-size: 18px;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }

                .tabela-relatorio {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    font-size: 12px;
                }

                .tabela-relatorio th,
                .tabela-relatorio td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                    vertical-align: top;
                }

                .tabela-relatorio th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    color: #333;
                }

                .tabela-relatorio tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }

                .valor-positivo {
                    color: #28a745;
                    font-weight: bold;
                }

                .valor-negativo {
                    color: #dc3545;
                    font-weight: bold;
                }

                .grafico-container {
                    text-align: center;
                    margin: 30px 0;
                    page-break-inside: avoid;
                }

                .grafico-container img {
                    max-width: 100%;
                    height: auto;
                }

                .resumo-financeiro {
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                }

                .resumo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .resumo-item {
                    text-align: center;
                    padding: 10px;
                    background: white;
                    border-radius: 5px;
                    border: 1px solid #dee2e6;
                }

                .resumo-item .label {
                    font-weight: bold;
                    color: #666;
                    font-size: 12px;
                    margin-bottom: 5px;
                }

                .resumo-item .valor {
                    font-size: 16px;
                    font-weight: bold;
                }

                .resumo-item .valor.positivo {
                    color: #28a745;
                }

                .resumo-item .valor.negativo {
                    color: #dc3545;
                }

                .data-geracao {
                    text-align: center;
                    margin-top: 40px;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }

                @media print {
                    body {
                        margin: 0;
                        padding: 15mm;
                    }

                    .secao {
                        page-break-inside: avoid;
                    }

                    .tabela-relatorio {
                        font-size: 10px;
                    }

                    .tabela-relatorio th,
                    .tabela-relatorio td {
                        padding: 4px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="titulo-principal">
                CFP - Relatório Financeiro ${nomeMes}
            </div>

            <div class="secao">
                <h2>📋 Detalhes das Transações</h2>
                <table class="tabela-relatorio">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Tipo</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transacoesMes.sort((a, b) => new Date(a.data) - new Date(b.data)).map(transacao => {
                            const categoria = obterCategoriaPorId(transacao.categoria);
                            return `
                                <tr>
                                    <td>${formatarData(transacao.data)}</td>
                                    <td>${transacao.descricao}</td>
                                    <td>${categoria ? categoria.nome : 'N/A'}</td>
                                    <td>${transacao.tipo === 'entrada' ? 'Entrada (+)' : transacao.tipo === 'saida' ? 'Saída (-)' : 'Investimento (💰)'}</td>
                                    <td class="${transacao.tipo === 'entrada' ? 'valor-positivo' : 'valor-negativo'}">${formatarMoeda(transacao.valor)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="secao">
                <h2>📊 Gráfico de Movimentações Financeiras</h2>
                <div class="grafico-container">
                    <canvas id="grafico-impressao" width="400" height="300"></canvas>
                </div>
            </div>

            <div class="resumo-financeiro">
                <h2>💰 Resumo Financeiro - ${nomeMes}</h2>
                <div class="resumo-grid">
                    <div class="resumo-item">
                        <div class="label">Total de Entradas</div>
                        <div class="valor positivo">${formatarMoeda(totais.entradas)}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="label">Total de Saídas</div>
                        <div class="valor negativo">${formatarMoeda(totais.saidas)}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="label">Total de Investimentos</div>
                        <div class="valor positivo">${formatarMoeda(totais.investimentos)}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="label">Saldo do Mês</div>
                        <div class="valor ${totais.saldo >= 0 ? 'positivo' : 'negativo'}">${formatarMoeda(totais.saldo)}</div>
                    </div>
                    <div class="resumo-item">
                        <div class="label">Total de Transações</div>
                        <div class="valor">${totais.totalTransacoes}</div>
                    </div>
                </div>
            </div>

            <div class="acoes-impressao">
                <button onclick="imprimirRelatorio()" class="btn-imprimir">
                    🖨️ Imprimir Relatório
                </button>
            </div>

            <div class="data-geracao">
                Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </div>

            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
                // Função para imprimir relatório
                function imprimirRelatorio() {
                    window.print();
                }

                // Renderizar gráfico na janela de impressão
                document.addEventListener('DOMContentLoaded', function() {
                    const canvas = document.getElementById('grafico-impressao');
                    if (!canvas) return;

                    const dados = [];
                    const labels = [];
                    const cores = [];

                    // Calcular valores proporcionais
                    const totais = ${JSON.stringify(totais)};

                    if (totais.entradas > 0) {
                        const restante = totais.entradas - totais.saidas;
                        if (restante > 0) {
                            dados.push(restante);
                            labels.push('Disponível');
                            cores.push('#28a745');
                        }

                        if (totais.saidas > totais.investimentos) {
                            dados.push(totais.saidas - totais.investimentos);
                            labels.push('Gastos');
                            cores.push('#dc3545');
                        }

                        if (totais.investimentos > 0) {
                            dados.push(totais.investimentos);
                            labels.push('Investimentos');
                            cores.push('#ffc107');
                        }
                    }

                    const ctx = canvas.getContext('2d');
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: dados,
                                backgroundColor: cores,
                                borderColor: '#fff',
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: false,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 10,
                                        font: { size: 12 }
                                    }
                                }
                            }
                        }
                    });
                });
            </script>
        </body>
        </html>
    `;

    // Abrir nova janela para visualização e impressão
    const janelaImpressao = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');

    if (janelaImpressao) {
        janelaImpressao.document.write(conteudoImpressao);
        janelaImpressao.document.close();

        mostrarNotificacao('Relatório aberto em nova aba! Clique em "Imprimir Relatório" para imprimir.', 'success');
    } else {
        mostrarNotificacao('Erro ao abrir janela do relatório. Verifique se o bloqueador de pop-ups está desabilitado.', 'error');
    }
}

// Função para mostrar seção
function mostrarSecao(secaoId) {
    // Fechar todos os modais abertos antes de mudar de seção
    const modaisAbertos = document.querySelectorAll('.modal[style*="display: block"]');
    modaisAbertos.forEach(modal => {
        fecharModal(modal.id);
    });

    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(secao => {
        secao.classList.remove('active');
    });

    // Remover classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Mostrar seção selecionada
    document.getElementById(secaoId).classList.add('active');

    // Adicionar classe active ao link correspondente
    document.querySelector(`[data-section="${secaoId}"]`).classList.add('active');

    // Controlar visibilidade do botão de ajuda
    const btnAjuda = document.getElementById('btn-ajuda-flutuante');
    if (btnAjuda) {
        if (secaoId === 'transacoes') {
            btnAjuda.classList.add('visible');
        } else {
            btnAjuda.classList.remove('visible');
        }
    }

    // Fechar sidebar automaticamente apenas em dispositivos móveis
    if (window.innerWidth <= 768) {
        alternarSidebar();
    }

    // Atualizar gráficos se necessário
    if (secaoId === 'graficos') {
        renderizarGrafico();
    }

    // Atualizar estatísticas quando mostrar a seção de transações
    if (secaoId === 'transacoes') {
        const transacoes = filtrarTransacoes();
        atualizarEstatisticasTransacoes(transacoes);
    }

    // Atualizar status do backup quando mostrar a seção de backup
    if (secaoId === 'backup') {
        atualizarStatusBackup();
    }

    // Atualizar lixeira quando mostrar a seção da lixeira
    if (secaoId === 'lixeira') {
        renderizarTabelaLixeira();
    }

    // Carregar perfil do usuário quando mostrar a seção da conta
    if (secaoId === 'conta') {
        carregarPerfilUsuario();
        renderizarOrcamentos();
    }

    // Popular seleção de meses quando mostrar a seção de relatório
    if (secaoId === 'relatorio') {
        popularSelecaoMesesRelatorio();
    }
}
