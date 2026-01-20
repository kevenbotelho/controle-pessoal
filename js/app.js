// Arquivo principal da aplicação - controle financeiro

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacao();
});

// Função para inicializar a aplicação
async function inicializarAplicacao() {
    // Inicializar sistema de backup
    await inicializarSistemaBackup();

    // Tentar carregar último backup automaticamente
    const backupCarregado = await carregarUltimoBackup();
    if (backupCarregado) {
        mostrarNotificacao('Dados do último backup carregados automaticamente!', 'success');
    }

    carregarTema();
    renderizarOpcoesCategoria();
    atualizarDashboard();
    renderizarTabelaTransacoes();
    renderizarListaCategorias();
    renderizarGrafico();
    configurarEventListeners();
    configurarBotaoAjudaFlutuante();

    // Mostrar seção padrão (dashboard) e configurar botão de ajuda
    mostrarSecao('dashboard');
}

// Função para configurar event listeners
function configurarEventListeners() {
    console.log('Configurando event listeners...');

    // Tema
    const toggleTheme = document.getElementById('toggle-theme');
    if (toggleTheme) {
        toggleTheme.addEventListener('click', alternarTema);
        console.log('Event listener para toggle-theme configurado');
    }

    // Transações
    const btnAdicionarTransacao = document.getElementById('btn-adicionar-transacao');
    if (btnAdicionarTransacao) {
        btnAdicionarTransacao.addEventListener('click', () => {
            limparFormularioTransacao();
            mostrarModal('modal-transacao');
        });
        console.log('Event listener para btn-adicionar-transacao configurado');
    }

    const formTransacao = document.getElementById('form-transacao');
    if (formTransacao) {
        formTransacao.addEventListener('submit', salvarTransacao);
        console.log('Event listener para form-transacao configurado');
    }

    // Categorias
    const btnAdicionarCategoria = document.getElementById('btn-adicionar-categoria');
    if (btnAdicionarCategoria) {
        btnAdicionarCategoria.addEventListener('click', () => {
            limparFormularioCategoria();
            mostrarModal('modal-categoria');
        });
        console.log('Event listener para btn-adicionar-categoria configurado');
    }

    const formCategoria = document.getElementById('form-categoria');
    if (formCategoria) {
        formCategoria.addEventListener('submit', salvarCategoria);
        console.log('Event listener para form-categoria configurado');
    }

    // Filtros
    const busca = document.getElementById('busca');
    if (busca) {
        busca.addEventListener('input', aplicarFiltros);
        console.log('Event listener para busca configurado');
    }

    const filtroCategoria = document.getElementById('filtro-categoria');
    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', aplicarFiltros);
        console.log('Event listener para filtro-categoria configurado');
    }

    const filtroTipo = document.getElementById('filtro-tipo');
    if (filtroTipo) {
        filtroTipo.addEventListener('change', aplicarFiltros);
        console.log('Event listener para filtro-tipo configurado');
    }

    const filtroMes = document.getElementById('filtro-mes');
    if (filtroMes) {
        filtroMes.addEventListener('input', aplicarFiltros);
        filtroMes.addEventListener('change', aplicarFiltros);
        console.log('Event listeners para filtro-mes configurados');
    }

    // Backup
    const btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarDadosApp);
        console.log('Event listener para btn-exportar configurado');
    }

    const btnEscolherPasta = document.getElementById('btn-escolher-pasta');
    if (btnEscolherPasta) {
        btnEscolherPasta.addEventListener('click', escolherLocalBackup);
        console.log('Event listener para btn-escolher-pasta configurado');
    } else {
        console.error('Botão btn-escolher-pasta não encontrado!');
    }

    const inputImportar = document.getElementById('input-importar');
    if (inputImportar) {
        const btnImportar = document.getElementById('btn-importar');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                inputImportar.click();
            });
            console.log('Event listener para btn-importar configurado');
        }
        inputImportar.addEventListener('change', importarDadosApp);
        console.log('Event listener para input-importar configurado');
    }

    const btnLimparDados = document.getElementById('btn-limpar-dados');
    if (btnLimparDados) {
        btnLimparDados.addEventListener('click', limparDadosComConfirmacao);
        console.log('Event listener para btn-limpar-dados configurado');
    }

    // Fechar modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            fecharModal(modal.id);
        });
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            // Encontrar qual modal está aberta
            const modaisAbertas = document.querySelectorAll('.modal[style*="display: block"]');
            modaisAbertas.forEach(modal => {
                fecharModal(modal.id);
            });
        }
    });

    // Hamburger menu
    document.getElementById('hamburger-menu').addEventListener('click', alternarSidebar);

    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const secao = this.getAttribute('data-section');
            mostrarSecao(secao);
        });
    });

    // Botão "Adicionar Primeira Transação" no estado vazio
    document.getElementById('btn-adicionar-primeira').addEventListener('click', () => {
        limparFormularioTransacao();
        mostrarModal('modal-transacao');
    });



    // Configurar fechamento da sidebar ao clicar fora
    configurarFecharSidebarFora();
    console.log('Fechamento da sidebar ao clicar fora configurado');

    // Perfil do usuário
    const btnSalvarNome = document.getElementById('btn-salvar-nome');
    if (btnSalvarNome) {
        btnSalvarNome.addEventListener('click', salvarNomeUsuario);
        console.log('Event listener para btn-salvar-nome configurado');
    }

    const btnAlterarFoto = document.getElementById('btn-alterar-foto');
    if (btnAlterarFoto) {
        btnAlterarFoto.addEventListener('click', alterarFotoPerfil);
        console.log('Event listener para btn-alterar-foto configurado');
    }

    const inputFotoPerfil = document.getElementById('input-foto-perfil');
    if (inputFotoPerfil) {
        inputFotoPerfil.addEventListener('change', processarFotoPerfil);
        console.log('Event listener para input-foto-perfil configurado');
    }

    // Orçamentos
    const btnSalvarOrcamento = document.getElementById('btn-salvar-orcamento');
    if (btnSalvarOrcamento) {
        btnSalvarOrcamento.addEventListener('click', salvarOrcamento);
        console.log('Event listener para btn-salvar-orcamento configurado');
    }

    // Relatório
    const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener('click', gerarRelatorio);
        console.log('Event listener para btn-gerar-relatorio configurado');
    }

    const btnExportarRelatorio = document.getElementById('btn-exportar-relatorio');
    if (btnExportarRelatorio) {
        btnExportarRelatorio.addEventListener('click', exportarRelatorio);
        console.log('Event listener para btn-exportar-relatorio configurado');
    }
}

// Função para salvar transação (adicionar ou editar)
function salvarTransacao(event) {
    event.preventDefault();

    console.log('=== SALVANDO TRANSAÇÃO ===');

    const id = document.getElementById('transacao-id').value;
    const valorCampo = document.getElementById('valor');
    const valorDigitado = valorCampo.value;

    console.log('ID da transação:', id);
    console.log('Valor digitado no campo:', valorDigitado, 'Tipo:', typeof valorDigitado);

    const transacao = {
        data: document.getElementById('data').value,
        descricao: document.getElementById('descricao').value.trim(),
        categoria: parseInt(document.getElementById('categoria').value),
        tipo: document.getElementById('tipo').value,
        valor: parseFloat(valorDigitado)
    };

    console.log('Transação a ser salva:', transacao);

    // Validar transação
    const erros = validarTransacao(transacao);
    if (erros.length > 0) {
        mostrarNotificacao(erros.join('\n'), 'error');
        return;
    }

    try {
        if (id) {
            // Editar transação existente
            editarTransacao(parseInt(id), transacao);
            mostrarNotificacao('Transação editada com sucesso!', 'success');
        } else {
            // Adicionar nova transação
            adicionarTransacao(transacao);
            mostrarNotificacao('Transação adicionada com sucesso!', 'success');
        }

        fecharModal('modal-transacao');
        atualizarDashboard();
        renderizarTabelaTransacoes();
        renderizarGrafico();

        // Verificar alertas de orçamento após adicionar/editar transação
        verificarAlertasOrcamento();
    } catch (error) {
        mostrarNotificacao('Erro ao salvar transação: ' + error.message, 'error');
    }
}

// Função para editar transação
function editarTransacao(id) {
    const transacao = obterTransacoes().find(t => t.id === id);
    if (transacao) {
        preencherFormularioTransacao(transacao);
        mostrarModal('modal-transacao');
    }
}

// Função para remover transação com confirmação
function removerTransacaoComConfirmacao(id) {
    if (confirm('Tem certeza que deseja remover esta transação?')) {
        removerTransacao(id);
        mostrarNotificacao('Transação removida com sucesso!', 'success');
        atualizarDashboard();
        renderizarTabelaTransacoes();
        renderizarGrafico();
    }
}

// Função para salvar categoria (adicionar ou editar)
function salvarCategoria(event) {
    event.preventDefault();

    const id = document.getElementById('categoria-id').value;
    const nome = document.getElementById('nome-categoria').value.trim();

    if (!nome) {
        mostrarNotificacao('Nome da categoria é obrigatório', 'error');
        return;
    }

    try {
        if (id) {
            // Editar categoria existente
            editarCategoriaObjeto(parseInt(id), { nome: nome });
            mostrarNotificacao('Categoria editada com sucesso!', 'success');
        } else {
            // Adicionar nova categoria
            adicionarCategoria({ nome: nome });
            mostrarNotificacao('Categoria adicionada com sucesso!', 'success');
        }

        fecharModal('modal-categoria');
        renderizarListaCategorias();
        renderizarOpcoesCategoria();
    } catch (error) {
        mostrarNotificacao('Erro ao salvar categoria: ' + error.message, 'error');
    }
}

// Função para adicionar categoria
function adicionarCategoria(categoria) {
    const categorias = carregarCategorias();
    categoria.id = gerarNovoId(categorias);
    categorias.push(categoria);
    salvarCategorias(categorias);
    salvarBackupAutomatico(); // Backup automático
    return categoria;
}

// Função para editar categoria
function editarCategoriaObjeto(id, novaCategoria) {
    const categorias = carregarCategorias();
    const index = categorias.findIndex(c => c.id === id);
    if (index !== -1) {
        categorias[index] = { ...categorias[index], ...novaCategoria };
        salvarCategorias(categorias);
        salvarBackupAutomatico(); // Backup automático
        return categorias[index];
    }
    return null;
}

// Função para editar categoria (abrir modal)
function editarCategoria(id) {
    const categoria = carregarCategorias().find(c => c.id === id);
    if (categoria) {
        preencherFormularioCategoria(categoria);
        mostrarModal('modal-categoria');
    }
}

// Função para remover categoria com confirmação
function removerCategoriaComConfirmacao(id) {
    // Verificar se a categoria está sendo usada
    const transacoes = obterTransacoes();
    const categoriaEmUso = transacoes.some(t => t.categoria === id);

    if (categoriaEmUso) {
        mostrarNotificacao('Não é possível remover uma categoria que está sendo usada em transações.', 'error');
        return;
    }

    if (confirm('Tem certeza que deseja remover esta categoria?')) {
        const categorias = carregarCategorias();
        const index = categorias.findIndex(c => c.id === id);
        if (index !== -1) {
            categorias.splice(index, 1);
            salvarCategorias(categorias);
            salvarBackupAutomatico(); // Backup automático
            mostrarNotificacao('Categoria removida com sucesso!', 'success');
            renderizarListaCategorias();
            renderizarOpcoesCategoria();
        }
    }
}

// Função para exportar dados
function exportarDadosApp() {
    try {
        exportarDadosStorage();
        mostrarNotificacao('Dados exportados com sucesso!', 'success');
    } catch (error) {
        mostrarNotificacao('Erro ao exportar dados: ' + error.message, 'error');
    }
}

// Função para importar dados
function importarDadosApp(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) {
        console.log('Nenhum arquivo selecionado');
        return;
    }

    console.log('=== INÍCIO DA IMPORTAÇÃO ===');
    console.log('Arquivo selecionado para importação:', arquivo.name, 'Tipo:', arquivo.type, 'Tamanho:', arquivo.size);

    // Verificar se é um arquivo JSON
    if (!arquivo.name.endsWith('.json') && arquivo.type !== 'application/json') {
        console.error('Arquivo não é JSON');
        mostrarNotificacao('Erro: Selecione um arquivo JSON válido (.json)', 'error');
        return;
    }

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';

    // Mostrar indicador de carregamento
    mostrarNotificacao('Importando dados...', 'info');

    // Usar a função do storage.js
    importarDadosStorage(arquivo)
        .then(() => {
            console.log('=== IMPORTAÇÃO CONCLUÍDA ===');
            mostrarNotificacao('Dados importados com sucesso! Recarregando...', 'success');
            // Recarregar página após um pequeno delay para mostrar a notificação
            setTimeout(() => {
                console.log('Recarregando página...');
                location.reload();
            }, 2000);
        })
        .catch(error => {
            console.error('=== ERRO NA IMPORTAÇÃO ===', error);
            mostrarNotificacao('Erro ao importar dados: ' + error, 'error');
        });
}

// Função para escolher local do backup (versão compatível com todos os navegadores)
function escolherLocalBackup() {
    console.log('Botão "Escolher Local do Backup" clicado');

    // Como a maioria dos navegadores não suporta File System Access API,
    // vamos usar uma abordagem mais simples e compatível

    const mensagem = `📁 Sistema de Backup CFP

O backup automático funciona da seguinte forma:

1. Todos os seus dados são salvos automaticamente no navegador
2. Para backup manual, use o botão "Exportar Dados"
3. Para restaurar, use o botão "Importar Dados"

💡 Funciona em TODOS os navegadores!

Deseja fazer um backup manual agora?`;

    if (confirm(mensagem)) {
        // Executar backup manual (exportar)
        exportarDadosApp();
        mostrarNotificacao('Backup manual realizado! Arquivo baixado automaticamente.', 'success');
    }

    // Atualizar status para mostrar que funciona com alternativa
    atualizarStatusBackupAlternativo();
}

// Função para atualizar status do backup (versão compatível)
function atualizarStatusBackupAlternativo() {
    const statusTexto = document.getElementById('status-texto');
    if (!statusTexto) return;

    // Sempre mostra como disponível (funciona via export/import)
    statusTexto.textContent = 'Disponível ✅';
    statusTexto.style.color = 'var(--success-color)';
}

// Função para limpar dados com confirmação
function limparDadosComConfirmacao() {
    if (confirm('ATENÇÃO: Esta ação irá remover TODOS os dados permanentemente. Tem certeza?')) {
        if (confirm('Esta ação não pode ser desfeita. Deseja continuar?')) {
            limparTodosDados();
            // Também limpar a referência do último backup para evitar recarregamento automático
            localStorage.removeItem('ultimo_backup');
            mostrarNotificacao('Todos os dados foram removidos!', 'success');
            location.reload(); // Recarregar página
        }
    }
}

// Funções para gerenciar perfil do usuário
function carregarPerfilUsuario() {
    // Carregar nome
    const nomeSalvo = localStorage.getItem('usuario_nome') || '';
    document.getElementById('nome-usuario').value = nomeSalvo;

    // Carregar foto de perfil
    const fotoSalva = localStorage.getItem('usuario_foto');
    if (fotoSalva) {
        document.getElementById('foto-perfil').src = fotoSalva;
        document.getElementById('foto-perfil').style.display = 'block';
        document.getElementById('placeholder-foto').style.display = 'none';
    } else {
        // Resetar foto para placeholder
        document.getElementById('foto-perfil').style.display = 'none';
        document.getElementById('placeholder-foto').style.display = 'block';
        document.getElementById('foto-perfil').src = '';
    }

    // Mostrar data de criação da conta
    const dataCriacao = localStorage.getItem('data_criacao_conta');
    const dataCriacaoEl = document.getElementById('data-criacao');

    if (dataCriacao) {
        const data = new Date(dataCriacao);
        dataCriacaoEl.textContent = data.toLocaleDateString('pt-BR');
    } else {
        // Se não existe data de criação, mostrar mensagem padrão
        dataCriacaoEl.textContent = 'Conta nova';
    }

    // Atualizar status da conta baseado na existência de dados
    atualizarStatusConta();
}

function atualizarStatusConta() {
    const statusContaEl = document.querySelector('.info-conta p:last-child span');
    const transacoes = carregarTransacoes();
    const categorias = carregarCategorias();

    // Se tem dados, conta está ativa
    if (transacoes.length > 0 || categorias.length > 6) {
        statusContaEl.textContent = 'Ativa ✅';
        statusContaEl.style.color = 'var(--success-color)';
    } else {
        // Se não tem dados além dos padrões, conta está vazia
        statusContaEl.textContent = 'Vazia 🔄';
        statusContaEl.style.color = 'var(--warning-color)';
    }
}

function salvarNomeUsuario() {
    const nomeInput = document.getElementById('nome-usuario');
    const nome = nomeInput.value.trim();

    if (nome.length === 0) {
        mostrarNotificacao('Nome não pode estar vazio!', 'error');
        return;
    }

    if (nome.length > 50) {
        mostrarNotificacao('Nome deve ter no máximo 50 caracteres!', 'error');
        return;
    }

    localStorage.setItem('usuario_nome', nome);
    mostrarNotificacao('Nome salvo com sucesso!', 'success');
}

function alterarFotoPerfil() {
    document.getElementById('input-foto-perfil').click();
}

function processarFotoPerfil(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    // Verificar se é uma imagem
    if (!arquivo.type.startsWith('image/')) {
        mostrarNotificacao('Por favor, selecione uma imagem válida!', 'error');
        return;
    }

    // Verificar tamanho (máximo 2MB)
    if (arquivo.size > 2 * 1024 * 1024) {
        mostrarNotificacao('Imagem muito grande! Máximo 2MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const fotoBase64 = e.target.result;

        // Salvar no localStorage
        localStorage.setItem('usuario_foto', fotoBase64);

        // Atualizar interface
        document.getElementById('foto-perfil').src = fotoBase64;
        document.getElementById('foto-perfil').style.display = 'block';
        document.getElementById('placeholder-foto').style.display = 'none';

        mostrarNotificacao('Foto de perfil atualizada!', 'success');
    };

    reader.onerror = function() {
        mostrarNotificacao('Erro ao processar imagem!', 'error');
    };

    reader.readAsDataURL(arquivo);
}

// Funções para gerenciar orçamentos
function carregarOrcamentos() {
    const orcamentosSalvos = localStorage.getItem('orcamentos');
    return orcamentosSalvos ? JSON.parse(orcamentosSalvos) : { total: 0, categorias: {} };
}

function salvarOrcamentos(orcamentos) {
    localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
}

function renderizarOrcamentos() {
    const categorias = carregarCategorias();
    const orcamentos = carregarOrcamentos();
    const lista = document.getElementById('orcamento-categorias-list');

    // Preencher orçamento total
    document.getElementById('orcamento-total').value = orcamentos.total || '';

    // Renderizar orçamentos por categoria
    lista.innerHTML = '';

    categorias.forEach(categoria => {
        const item = document.createElement('div');
        item.className = 'orcamento-categoria-item';

        item.innerHTML = `
            <label for="orcamento-${categoria.id}">${categoria.nome}:</label>
            <input type="number" id="orcamento-${categoria.id}" value="${orcamentos.categorias[categoria.id] || ''}" placeholder="0,00" step="0.01" min="0">
        `;

        lista.appendChild(item);
    });
}

function salvarOrcamento() {
    const orcamentoTotal = parseFloat(document.getElementById('orcamento-total').value) || 0;
    const orcamentos = { total: orcamentoTotal, categorias: {} };

    // Coletar orçamentos por categoria
    const categorias = carregarCategorias();
    categorias.forEach(categoria => {
        const valor = parseFloat(document.getElementById(`orcamento-${categoria.id}`).value) || 0;
        if (valor > 0) {
            orcamentos.categorias[categoria.id] = valor;
        }
    });

    // Salvar orçamentos
    salvarOrcamentos(orcamentos);

    // Backup automático após salvar orçamentos
    salvarBackupAutomatico();

    // Verificar alertas imediatamente
    verificarAlertasOrcamento();

    mostrarNotificacao('Orçamento salvo com sucesso!', 'success');
}

function verificarAlertasOrcamento() {
    const orcamentos = carregarOrcamentos();
    const totais = calcularTotais();
    const resumoMes = obterResumoMesAtual();

    // Usar dados do mês atual para alertas
    const gastosMes = resumoMes.saidas;
    const orcamentoTotal = orcamentos.total || 0;

    // Remover alertas anteriores
    document.querySelectorAll('.orcamento-alerta, .orcamento-warning, .orcamento-danger').forEach(el => {
        el.classList.remove('orcamento-alerta', 'orcamento-warning', 'orcamento-danger');
    });

    // Verificar orçamento total
    if (orcamentoTotal > 0) {
        const percentualGasto = (gastosMes / orcamentoTotal) * 100;

        if (percentualGasto >= 100) {
            // Ultrapassou o orçamento
            mostrarNotificacao(`🚨 ALERTA: Você ultrapassou seu orçamento mensal! Gastou R$ ${gastosMes.toFixed(2)} de R$ ${orcamentoTotal.toFixed(2)}`, 'error');
            document.querySelector('.card.resumo').classList.add('orcamento-danger');
        } else if (percentualGasto >= 80) {
            // Próximo do limite (80%)
            mostrarNotificacao(`⚠️ ATENÇÃO: Você já gastou ${percentualGasto.toFixed(1)}% do seu orçamento mensal!`, 'warning');
            document.querySelector('.card.resumo').classList.add('orcamento-warning');
        } else if (percentualGasto >= 50) {
            // Metade do orçamento
            document.querySelector('.card.resumo').classList.add('orcamento-alerta');
        }
    }

    // Verificar orçamentos por categoria
    const categorias = carregarCategorias();
    categorias.forEach(categoria => {
        const orcamentoCategoria = orcamentos.categorias[categoria.id];
        if (orcamentoCategoria) {
            // Calcular gastos da categoria no mês atual
            const gastosCategoria = obterTransacoesPorCategoriaMes(categoria.id);
            const percentualCategoria = (gastosCategoria / orcamentoCategoria) * 100;

            if (percentualCategoria >= 100) {
                mostrarNotificacao(`🚨 ALERTA: Você ultrapassou o orçamento de "${categoria.nome}"!`, 'error');
            } else if (percentualCategoria >= 80) {
                mostrarNotificacao(`⚠️ ATENÇÃO: Você já gastou ${percentualCategoria.toFixed(1)}% do orçamento de "${categoria.nome}"!`, 'warning');
            }
        }
    });
}

function obterTransacoesPorCategoriaMes(categoriaId) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const transacoes = obterTransacoes();
    return transacoes
        .filter(t => t.categoria === categoriaId && t.tipo === 'saida')
        .filter(t => {
            const data = new Date(t.data);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        })
        .reduce((total, t) => total + t.valor, 0);
}
