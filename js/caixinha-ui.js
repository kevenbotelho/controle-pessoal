/**
 * Caixinha UI - Interface para o sistema de poupança
 * Parte do CFP - Controle Financeiro Pessoal
 */

// Função para renderizar a lista de caixinhas
function renderizarListaCaixinhas() {
    const container = document.getElementById('lista-caixinhas');
    if (!container) return;

    const caixinhas = Caixinha.carregarCaixinhas();

    if (caixinhas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💰</div>
                <h3>Nenhuma caixinha criada ainda</h3>
                <p>Comece criando sua primeira meta de poupança!</p>
                <button id="btn-criar-primeira-caixinha" class="btn-primary">Criar Primeira Caixinha</button>
            </div>
        `;

        // Configurar botão para criar primeira caixinha
        document.getElementById('btn-criar-primeira-caixinha').addEventListener('click', () => {
            abrirModalCaixinha();
        });

        return;
    }

    // Agrupar por status
    const ativas = caixinhas.filter(c => c.status === 'ativa');
    const pausadas = caixinhas.filter(c => c.status === 'pausada');
    const concluidas = caixinhas.filter(c => c.status === 'concluida');

    let html = '';

    // Caixinhas ativas
    if (ativas.length > 0) {
        html += `
            <div class="caixinhas-grupo">
                <h3 class="grupo-titulo">🔄 Ativas (${ativas.length})</h3>
                <div class="caixinhas-lista">
        `;

        ativas.forEach(caixinha => {
            html += renderizarCaixinhaCard(caixinha);
        });

        html += '</div></div>';
    }

    // Caixinhas pausadas
    if (pausadas.length > 0) {
        html += `
            <div class="caixinhas-grupo">
                <h3 class="grupo-titulo">⏸️ Pausadas (${pausadas.length})</h3>
                <div class="caixinhas-lista">
        `;

        pausadas.forEach(caixinha => {
            html += renderizarCaixinhaCard(caixinha);
        });

        html += '</div></div>';
    }

    // Caixinhas concluídas
    if (concluidas.length > 0) {
        html += `
            <div class="caixinhas-grupo">
                <h3 class="grupo-titulo">✅ Concluídas (${concluidas.length})</h3>
                <div class="caixinhas-lista">
        `;

        concluidas.forEach(caixinha => {
            html += renderizarCaixinhaCard(caixinha);
        });

        html += '</div></div>';
    }

    container.innerHTML = html;

    // Configurar event listeners para os botões
    configurarEventListenersCaixinhas();
}

// Função para renderizar um card de caixinha
function renderizarCaixinhaCard(caixinha) {
    const progresso = Caixinha.calcularProgressoCaixinha(caixinha);
    const dataConclusao = Caixinha.calcularDataConclusao(caixinha);
    const dataConclusaoFormatada = dataConclusao.toLocaleDateString('pt-BR');

    // Definir classe de status
    const statusClasses = {
        ativa: 'caixinha-ativa',
        pausada: 'caixinha-pausada',
        concluida: 'caixinha-concluida'
    };

    // Definir ícone de status
    const statusIcons = {
        ativa: '🔄',
        pausada: '⏸️',
        concluida: '✅'
    };

    return `
        <div class="caixinha-card ${statusClasses[caixinha.status]}">
            <div class="caixinha-header">
                <h4>${statusIcons[caixinha.status]} ${caixinha.nome}</h4>
                <span class="caixinha-status">${caixinha.status.toUpperCase()}</span>
            </div>

            <div class="caixinha-progresso">
                <div class="progresso-bar">
                    <div class="progresso-fill" style="width: ${progresso}%"></div>
                </div>
                <span class="progresso-texto">${progresso}%</span>
            </div>

            <div class="caixinha-info">
                <div class="info-item">
                    <span class="label">Guardado:</span>
                    <span class="valor">${formatarMoeda(caixinha.valorGuardado)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Meta:</span>
                    <span class="valor">${formatarMoeda(caixinha.valorAlvo)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Conclusão:</span>
                    <span class="valor">${dataConclusaoFormatada}</span>
                </div>
                <div class="info-item">
                    <span class="label">Contribuição:</span>
                    <span class="valor">${formatarMoeda(caixinha.valorPorPeriodo)} / ${caixinha.frequencia}</span>
                </div>
            </div>

            <div class="caixinha-acoes">
                ${caixinha.status !== 'concluida' ? `
                <button class="btn-adicionar-contribuicao" data-id="${caixinha.id}" title="Adicionar contribuição manual">
                    ➕ Contribuir
                </button>
                ` : ''}

                <button class="btn-ver-detalhes" data-id="${caixinha.id}" title="Ver detalhes">
                    📊 Detalhes
                </button>

                ${caixinha.status !== 'concluida' ? `
                <button class="btn-alternar-status" data-id="${caixinha.id}" title="${caixinha.status === 'ativa' ? 'Pausar' : 'Retomar'}">
                    ${caixinha.status === 'ativa' ? '⏸️' : '▶️'}
                </button>
                ` : ''}

                <button class="btn-excluir-caixinha" data-id="${caixinha.id}" title="Excluir caixinha">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// Função para configurar event listeners das caixinhas
function configurarEventListenersCaixinhas() {
    // Botão de adicionar contribuição
    document.querySelectorAll('.btn-adicionar-contribuicao').forEach(btn => {
        btn.addEventListener('click', function() {
            const caixinhaId = this.getAttribute('data-id');
            abrirModalContribuicao(caixinhaId);
        });
    });

    // Botão de ver detalhes
    document.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
        btn.addEventListener('click', function() {
            const caixinhaId = this.getAttribute('data-id');
            abrirModalDetalhesCaixinha(caixinhaId);
        });
    });

    // Botão de alternar status
    document.querySelectorAll('.btn-alternar-status').forEach(btn => {
        btn.addEventListener('click', function() {
            const caixinhaId = this.getAttribute('data-id');
            alternarStatusCaixinhaUI(caixinhaId);
        });
    });

    // Botão de excluir caixinha
    document.querySelectorAll('.btn-excluir-caixinha').forEach(btn => {
        btn.addEventListener('click', function() {
            const caixinhaId = this.getAttribute('data-id');
            excluirCaixinhaUI(caixinhaId);
        });
    });
}

// Função para carregar categorias no select da caixinha
function carregarCategoriasCaixinha() {
    const selectCategoria = document.getElementById('categoria-caixinha');
    if (!selectCategoria) return;

    try {
        // Obter categorias do CFP
        const categorias = obterCategorias();

        // Limpar opções existentes (exceto a primeira)
        selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';

        // Adicionar categorias
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            selectCategoria.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar categorias para caixinha:', error);
        // Adicionar categorias padrão caso não consiga obter do CFP
        const categoriasPadrao = [
            { id: 'viagem', nome: 'Viagem' },
            { id: 'educacao', nome: 'Educação' },
            { id: 'emergencia', nome: 'Emergência' },
            { id: 'presentes', nome: 'Presentes' },
            { id: 'carro', nome: 'Carro' },
            { id: 'saude', nome: 'Saúde' },
            { id: 'lazer', nome: 'Lazer' },
            { id: 'moradia', nome: 'Moradia' }
        ];

        categoriasPadrao.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            selectCategoria.appendChild(option);
        });
    }
}

// Função para abrir modal de caixinha
function abrirModalCaixinha(caixinhaId = null) {
    const modal = document.getElementById('modal-caixinha');
    const form = document.getElementById('form-caixinha');
    const title = document.getElementById('modal-caixinha-title');
    const btnCalcular = document.getElementById('btn-calcular-sugestao');
    const resultadoCalculo = document.getElementById('resultado-calculo-sugestao');

    // Carregar categorias no select
    carregarCategoriasCaixinha();

    // Limpar formulário
    form.reset();
    resultadoCalculo.style.display = 'none';

    if (caixinhaId) {
        // Editar caixinha existente
        const caixinha = Caixinha.obterCaixinhaPorId(caixinhaId);
        if (caixinha) {
            document.getElementById('caixinha-id').value = caixinha.id;
            document.getElementById('nome-caixinha').value = caixinha.nome;
            document.getElementById('valor-alvo').value = caixinha.valorAlvo;
            document.getElementById('prazo-tipo').value = caixinha.prazoTipo;

            if (caixinha.prazoTipo === 'meses') {
                document.getElementById('prazo-meses').value = caixinha.prazoMeses;
                document.getElementById('prazo-data-final').value = '';
                document.getElementById('prazo-meses-container').style.display = 'block';
                document.getElementById('prazo-data-final-container').style.display = 'none';
            } else {
                document.getElementById('prazo-data-final').value = caixinha.dataFim;
                document.getElementById('prazo-meses').value = '';
                document.getElementById('prazo-meses-container').style.display = 'none';
                document.getElementById('prazo-data-final-container').style.display = 'block';
            }

            document.getElementById('data-inicio').value = caixinha.dataInicio;
            document.getElementById('frequencia').value = caixinha.frequencia;
            document.getElementById('categoria-caixinha').value = caixinha.categoria || '';
            document.getElementById('nota-caixinha').value = caixinha.nota || '';

            title.textContent = 'Editar Caixinha';
        }
    } else {
        // Nova caixinha
        document.getElementById('caixinha-id').value = '';
        document.getElementById('data-inicio').value = new Date().toISOString().split('T')[0];
        title.textContent = 'Criar Nova Caixinha';
    }

    // Configurar event listener para cálculo de sugestão
    btnCalcular.onclick = function() {
        calcularSugestaoContribuicao();
    };

    // Configurar event listener para mudança de tipo de prazo
    document.getElementById('prazo-tipo').addEventListener('change', function() {
        const tipo = this.value;
        if (tipo === 'meses') {
            document.getElementById('prazo-meses-container').style.display = 'block';
            document.getElementById('prazo-data-final-container').style.display = 'none';
        } else {
            document.getElementById('prazo-meses-container').style.display = 'none';
            document.getElementById('prazo-data-final-container').style.display = 'block';
        }
    });

    // Mostrar modal
    modal.style.display = 'block';
}

// Função para calcular sugestão de contribuição
function calcularSugestaoContribuicao() {
    const nome = document.getElementById('nome-caixinha').value.trim();
    const valorAlvo = parseFloat(document.getElementById('valor-alvo').value);
    const prazoTipo = document.getElementById('prazo-tipo').value;
    const prazoMeses = prazoTipo === 'meses' ? parseInt(document.getElementById('prazo-meses').value) : null;
    const dataFim = prazoTipo === 'dataFinal' ? document.getElementById('prazo-data-final').value : null;
    const dataInicio = document.getElementById('data-inicio').value;
    const frequencia = document.getElementById('frequencia').value;

    if (!nome) {
        mostrarNotificacao('Informe o nome da caixinha', 'error');
        return;
    }

    if (!valorAlvo || valorAlvo <= 0) {
        mostrarNotificacao('Informe um valor alvo válido', 'error');
        return;
    }

    if (prazoTipo === 'meses' && (!prazoMeses || prazoMeses < 1)) {
        mostrarNotificacao('Informe um prazo válido em meses', 'error');
        return;
    }

    if (prazoTipo === 'dataFinal' && !dataFim) {
        mostrarNotificacao('Informe uma data final válida', 'error');
        return;
    }

    const caixinhaData = {
        nome: nome,
        valorAlvo: valorAlvo,
        prazoTipo: prazoTipo,
        prazoMeses: prazoMeses,
        dataFim: dataFim,
        dataInicio: dataInicio,
        frequencia: frequencia
    };

    try {
        const sugestao = Caixinha.calcularSugestaoContribuicao(caixinhaData);
        const resultadoContainer = document.getElementById('resultado-calculo-sugestao');

        // Formatando valores por período
        const valoresFormatados = {
            mensal: formatarMoeda(sugestao.valoresPorPeriodo.mensal),
            semanal: formatarMoeda(sugestao.valoresPorPeriodo.semanal),
            diaria: formatarMoeda(sugestao.valoresPorPeriodo.diaria)
        };

        // Formatando renda mensal
        const rendaFormatada = sugestao.rendaMensal > 0 ? formatarMoeda(sugestao.rendaMensal) : 'Não disponível';

        resultadoContainer.innerHTML = `
            <div class="sugestao-resultado">
                <h4>💡 Sugestão de Contribuição</h4>

                <div class="sugestao-info">
                    <p><strong>Meta:</strong> ${formatarMoeda(sugestao.valorTotal)} em ${sugestao.numeroPeriodos} ${sugestao.frequencia === 'mensal' ? 'meses' : sugestao.frequencia === 'semanal' ? 'semanas' : 'dias'}</p>

                    <div class="valor-sugerido">
                        <p><strong>Valor sugerido por ${sugestao.frequencia}:</strong> ${valoresFormatados[sugestao.frequencia]}</p>
                        ${sugestao.rendaMensal > 0 ? `
                        <p><strong>Percentual da renda:</strong> ${sugestao.percentualRenda}% (de ${rendaFormatada})</p>
                        ` : `
                        <p class="aviso-renda">⚠️ Renda mensal não disponível. Informe sua renda para cálculo preciso.</p>
                        `}
                    </div>

                    <div class="outros-periodos">
                        <p><strong>Outras opções:</strong></p>
                        <p>📅 Mensal: ${valoresFormatados.mensal}</p>
                        <p>📆 Semanal: ${valoresFormatados.semanal}</p>
                        <p>📅 Diário: ${valoresFormatados.diaria}</p>
                    </div>

                    ${sugestao.percentualRenda > 30 ? `
                    <div class="aviso-percentual">
                        <p>⚠️ Esta meta requer ${sugestao.percentualRenda}% da sua renda. Considere estender o prazo ou reduzir o valor alvo.</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        resultadoContainer.style.display = 'block';

        // Rolagem suave para o resultado
        resultadoContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        mostrarNotificacao('Erro ao calcular sugestão: ' + error.message, 'error');
    }
}

// Função para salvar caixinha
function salvarCaixinha() {
    const caixinhaId = document.getElementById('caixinha-id').value;
    const nome = document.getElementById('nome-caixinha').value.trim();
    const valorAlvo = parseFloat(document.getElementById('valor-alvo').value);
    const prazoTipo = document.getElementById('prazo-tipo').value;
    const prazoMeses = prazoTipo === 'meses' ? parseInt(document.getElementById('prazo-meses').value) : null;
    const dataFim = prazoTipo === 'dataFinal' ? document.getElementById('prazo-data-final').value : null;
    const dataInicio = document.getElementById('data-inicio').value;
    const frequencia = document.getElementById('frequencia').value;
    const categoria = document.getElementById('categoria-caixinha').value || null;
    const nota = document.getElementById('nota-caixinha').value.trim();

    const caixinhaData = {
        nome: nome,
        valorAlvo: valorAlvo,
        prazoTipo: prazoTipo,
        prazoMeses: prazoMeses,
        dataFim: dataFim,
        dataInicio: dataInicio,
        frequencia: frequencia,
        categoria: categoria,
        nota: nota
    };

    try {
        let resultado;
        if (caixinhaId) {
            // Atualizar caixinha existente
            resultado = Caixinha.atualizarCaixinha(caixinhaId, caixinhaData);
            mostrarNotificacao('Caixinha atualizada com sucesso!', 'success');
        } else {
            // Criar nova caixinha
            resultado = Caixinha.criarCaixinha(caixinhaData);
            mostrarNotificacao('Caixinha criada com sucesso!', 'success');
        }

        // Fechar modal
        fecharModal('modal-caixinha');

        // Atualizar lista
        renderizarListaCaixinhas();

        // Verificar notificações
        verificarNotificacoesCaixinhasUI();

        return resultado;

    } catch (error) {
        mostrarNotificacao('Erro ao salvar caixinha: ' + error.message, 'error');
        throw error;
    }
}

// Função para abrir modal de contribuição
function abrirModalContribuicao(caixinhaId) {
    const caixinha = Caixinha.obterCaixinhaPorId(caixinhaId);
    if (!caixinha) {
        mostrarNotificacao('Caixinha não encontrada', 'error');
        return;
    }

    const modal = document.getElementById('modal-contribuicao');
    const form = document.getElementById('form-contribuicao');
    const title = document.getElementById('modal-contribuicao-title');
    const caixinhaInfo = document.getElementById('caixinha-info-contribuicao');

    // Limpar formulário
    form.reset();

    // Preencher informações da caixinha
    const progresso = Caixinha.calcularProgressoCaixinha(caixinha);
    caixinhaInfo.innerHTML = `
        <h4>💰 ${caixinha.nome}</h4>
        <p>Progresso: ${progresso}% (${formatarMoeda(caixinha.valorGuardado)} de ${formatarMoeda(caixinha.valorAlvo)})</p>
    `;

    // Configurar ID da caixinha
    document.getElementById('contribuicao-caixinha-id').value = caixinhaId;
    title.textContent = `Adicionar Contribuição - ${caixinha.nome}`;

    // Mostrar modal
    modal.style.display = 'block';
}

// Função para salvar contribuição manual
function salvarContribuicao() {
    const caixinhaId = document.getElementById('contribuicao-caixinha-id').value;
    const valor = parseFloat(document.getElementById('valor-contribuicao').value);
    const data = document.getElementById('data-contribuicao').value;

    if (!valor || valor <= 0) {
        mostrarNotificacao('Informe um valor válido para contribuição', 'error');
        return;
    }

    try {
        const resultado = Caixinha.adicionarContribuicaoManual(caixinhaId, valor, data);

        // Fechar modal
        fecharModal('modal-contribuicao');

        // Atualizar lista
        renderizarListaCaixinhas();

        // Mostrar notificação de sucesso
        mostrarNotificacao(`Contribuição de ${formatarMoeda(valor)} adicionada com sucesso!`, 'success');

        // Verificar se atingiu a meta
        const progresso = Caixinha.calcularProgressoCaixinha(resultado);
        if (progresso >= 100) {
            mostrarNotificacao(`🎉 Parabéns! Você atingiu a meta da caixinha "${resultado.nome}"!`, 'success');
        }

    } catch (error) {
        mostrarNotificacao('Erro ao adicionar contribuição: ' + error.message, 'error');
    }
}

// Função para alternar status da caixinha
function alternarStatusCaixinhaUI(caixinhaId) {
    if (confirm('Tem certeza que deseja alterar o status desta caixinha?')) {
        try {
            const resultado = Caixinha.alternarStatusCaixinha(caixinhaId);

            // Atualizar lista
            renderizarListaCaixinhas();

            const statusTexto = resultado.status === 'ativa' ? 'retomada' : 'pausada';
            mostrarNotificacao(`Caixinha ${statusTexto} com sucesso!`, 'success');

        } catch (error) {
            mostrarNotificacao('Erro ao alterar status: ' + error.message, 'error');
        }
    }
}

// Função para excluir caixinha
function excluirCaixinhaUI(caixinhaId) {
    const caixinha = Caixinha.obterCaixinhaPorId(caixinhaId);
    if (!caixinha) {
        mostrarNotificacao('Caixinha não encontrada', 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja excluir a caixinha "${caixinha.nome}"? Esta ação não pode ser desfeita.`)) {
        try {
            Caixinha.excluirCaixinha(caixinhaId);

            // Atualizar lista
            renderizarListaCaixinhas();

            mostrarNotificacao('Caixinha excluída com sucesso!', 'success');

        } catch (error) {
            mostrarNotificacao('Erro ao excluir caixinha: ' + error.message, 'error');
        }
    }
}

// Função para abrir modal de detalhes da caixinha
function abrirModalDetalhesCaixinha(caixinhaId) {
    const caixinha = Caixinha.obterCaixinhaPorId(caixinhaId);
    if (!caixinha) {
        mostrarNotificacao('Caixinha não encontrada', 'error');
        return;
    }

    const modal = document.getElementById('modal-detalhes-caixinha');
    const progresso = Caixinha.calcularProgressoCaixinha(caixinha);
    const dataConclusao = Caixinha.calcularDataConclusao(caixinha);
    const dataConclusaoFormatada = dataConclusao.toLocaleDateString('pt-BR');

    // Preencher informações básicas
    document.getElementById('detalhes-caixinha-nome').textContent = caixinha.nome;
    document.getElementById('detalhes-caixinha-status').textContent = caixinha.status.toUpperCase();
    document.getElementById('detalhes-caixinha-progresso').textContent = `${progresso}%`;
    document.getElementById('detalhes-caixinha-progresso-bar').style.width = `${progresso}%`;
    document.getElementById('detalhes-caixinha-valor-guardado').textContent = formatarMoeda(caixinha.valorGuardado);
    document.getElementById('detalhes-caixinha-valor-alvo').textContent = formatarMoeda(caixinha.valorAlvo);
    document.getElementById('detalhes-caixinha-data-conclusao').textContent = dataConclusaoFormatada;
    document.getElementById('detalhes-caixinha-contribuicao').textContent = `${formatarMoeda(caixinha.valorPorPeriodo)} / ${caixinha.frequencia}`;
    document.getElementById('detalhes-caixinha-percentual').textContent = `${caixinha.percentualSugerido}% da renda`;

    // Preencher histórico de contribuições
    const historicoContainer = document.getElementById('detalhes-caixinha-historico');
    if (caixinha.historico && caixinha.historico.length > 0) {
        let historicoHTML = '<table><thead><tr><th>Data</th><th>Valor</th><th>Tipo</th></tr></thead><tbody>';

        caixinha.historico.forEach(item => {
            historicoHTML += `
                <tr>
                    <td>${formatarData(item.data)}</td>
                    <td>${formatarMoeda(item.valor)}</td>
                    <td>${item.tipo === 'manual' ? 'Manual' : 'Automática'}</td>
                </tr>
            `;
        });

        historicoHTML += '</tbody></table>';
        historicoContainer.innerHTML = historicoHTML;
    } else {
        historicoContainer.innerHTML = '<p>Nenhuma contribuição registrada ainda.</p>';
    }

    // Preencher informações adicionais
    document.getElementById('detalhes-caixinha-categoria').textContent = caixinha.categoria || 'Nenhuma';
    document.getElementById('detalhes-caixinha-nota').textContent = caixinha.nota || 'Nenhuma nota';
    document.getElementById('detalhes-caixinha-data-criacao').textContent = new Date(caixinha.dataCriacao).toLocaleDateString('pt-BR');

    // Mostrar modal
    modal.style.display = 'block';
}

// Função para verificar e mostrar notificações de caixinhas
function verificarNotificacoesCaixinhasUI() {
    const notificacoes = Caixinha.verificarNotificacoesCaixinhas();

    if (notificacoes.length > 0) {
        notificacoes.forEach(notificacao => {
            mostrarNotificacao(notificacao.mensagem, notificacao.tipo);
        });
    }
}

// Função para exportar caixinhas
function exportarCaixinhas() {
    try {
        Caixinha.exportarCaixinhasJSON();
        mostrarNotificacao('Caixinhas exportadas com sucesso!', 'success');
    } catch (error) {
        mostrarNotificacao('Erro ao exportar caixinhas: ' + error.message, 'error');
    }
}

// Função para importar caixinhas
function importarCaixinhas(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    Caixinha.importarCaixinhasJSON(arquivo)
        .then(qtdImportadas => {
            mostrarNotificacao(`${qtdImportadas} caixinhas importadas com sucesso!`, 'success');
            renderizarListaCaixinhas();
        })
        .catch(error => {
            mostrarNotificacao('Erro ao importar caixinhas: ' + error, 'error');
        });

    // Limpar input de arquivo
    event.target.value = '';
}

// Função para inicializar a seção de caixinhas
function initCaixinhasUI() {
    // Verificar se a seção existe
    const secaoCaixinhas = document.getElementById('caixinhas');
    if (!secaoCaixinhas) return;

    // Inicializar caixinhas
    Caixinha.initCaixinhas();

    // Renderizar lista de caixinhas
    renderizarListaCaixinhas();

    // Configurar botão de criar caixinha
    const btnCriarCaixinha = document.getElementById('btn-criar-caixinha');
    if (btnCriarCaixinha) {
        btnCriarCaixinha.addEventListener('click', abrirModalCaixinha);
    }

    // Configurar botão de exportar caixinhas
    const btnExportarCaixinhas = document.getElementById('btn-exportar-caixinhas');
    if (btnExportarCaixinhas) {
        btnExportarCaixinhas.addEventListener('click', exportarCaixinhas);
    }

    // Configurar botão de importar caixinhas
    const btnImportarCaixinhas = document.getElementById('btn-importar-caixinhas');
    const inputImportarCaixinhas = document.getElementById('input-importar-caixinhas');
    if (btnImportarCaixinhas && inputImportarCaixinhas) {
        btnImportarCaixinhas.addEventListener('click', () => {
            inputImportarCaixinhas.click();
        });
        inputImportarCaixinhas.addEventListener('change', importarCaixinhas);
    }

    // Configurar formulário de caixinha
    const formCaixinha = document.getElementById('form-caixinha');
    if (formCaixinha) {
        formCaixinha.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarCaixinha();
        });
    }

    // Configurar formulário de contribuição
    const formContribuicao = document.getElementById('form-contribuicao');
    if (formContribuicao) {
        formContribuicao.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarContribuicao();
        });
    }

    // Configurar botão de data de hoje para contribuição
    const btnDataHojeContribuicao = document.getElementById('btn-data-hoje-contribuicao');
    if (btnDataHojeContribuicao) {
        btnDataHojeContribuicao.addEventListener('click', function() {
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('data-contribuicao').value = hoje;
        });
    }

    console.log('Caixinhas UI inicializado com sucesso');
}

// Exportar funções públicas
window.CaixinhaUI = {
    renderizarListaCaixinhas,
    abrirModalCaixinha,
    initCaixinhasUI,
    verificarNotificacoesCaixinhasUI
};
