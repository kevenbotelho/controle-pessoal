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

    // Resumo do mês com cores
    const percentualMes = resumoMes.entradas > 0 ? (resumoMes.saidas / resumoMes.entradas) * 100 : 0;
    const statusMes = percentualMes <= 25 ? 'excelente' : percentualMes <= 50 ? 'bom' : percentualMes <= 75 ? 'atencao' : 'critico';

    document.getElementById('resumo-mes').innerHTML =
        `<span class="resumo-entradas">Entradas: ${formatarMoeda(resumoMes.entradas)}</span><br>` +
        `<span class="resumo-saidas">Saídas: ${formatarMoeda(resumoMes.saidas)}</span>` +
        `<br><small class="resumo-status">${obterEmojiStatus(statusMes)} ${obterDescricaoStatus(statusMes)}</small>`;

    // Aplicar cores dinâmicas
    aplicarCoresDashboard(totais, percentualGastos, statusFinanceiro);
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
                <td>${transacao.tipo === 'entrada' ? 'Entrada (+)' : 'Saída (-)'}</td>
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

        if (totais.entradas > 0) {
            dados.push(totais.entradas);
            labels.push('Disponível');
            cores.push('#28a745'); // Verde
            percentuais.push(100);
        }

        if (totais.saidas > 0) {
            dados.push(totais.saidas);
            labels.push('Gasto');
            cores.push('#dc3545'); // Vermelho
            const percentual = totais.entradas > 0 ? ((totais.saidas / totais.entradas) * 100).toFixed(1) : 0;
            percentuais.push(percentual);
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
        filtroTexto += ` | Tipo: ${filtroTipo === 'entrada' ? 'Entradas' : 'Saídas'}`;
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
                <td>${item.tipo === 'entrada' ? 'Entrada (+)' : 'Saída (-)'}</td>
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
}
