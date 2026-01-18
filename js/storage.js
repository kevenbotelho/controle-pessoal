// Funções para gerenciamento de dados no LocalStorage

const STORAGE_KEYS = {
    TRANSACTIONS: 'controle_financeiro_transactions',
    CATEGORIES: 'controle_financeiro_categories',
    TRASH: 'controle_financeiro_trash'
};

// Função para salvar dados no LocalStorage
function salvarDados(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

// Função para carregar dados do LocalStorage
function carregarDados(chave) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : [];
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return [];
    }
}

// Funções específicas para transações
function salvarTransacoes(transacoes) {
    return salvarDados(STORAGE_KEYS.TRANSACTIONS, transacoes);
}

function carregarTransacoes() {
    return carregarDados(STORAGE_KEYS.TRANSACTIONS);
}

// Funções específicas para categorias
function salvarCategorias(categorias) {
    return salvarDados(STORAGE_KEYS.CATEGORIES, categorias);
}

function carregarCategorias() {
    let categorias = carregarDados(STORAGE_KEYS.CATEGORIES);
    // Se não houver categorias salvas, inicializar com categorias padrão
    if (categorias.length === 0) {
        categorias = [
            { id: 1, nome: 'Alimentação' },
            { id: 2, nome: 'Transporte' },
            { id: 3, nome: 'Moradia' },
            { id: 4, nome: 'Lazer' },
            { id: 5, nome: 'Saúde' },
            { id: 6, nome: 'Outros' }
        ];
        salvarCategorias(categorias);
    }
    return categorias;
}

// Função para gerar novo ID
function gerarNovoId(dados) {
    if (dados.length === 0) return 1;
    return Math.max(...dados.map(item => item.id)) + 1;
}

// Função para exportar dados
function exportarDadosStorage() {
    const transacoes = carregarTransacoes();
    const categorias = carregarCategorias();

    // Incluir dados do perfil do usuário
    const nomeUsuario = localStorage.getItem('usuario_nome') || '';
    const fotoUsuario = localStorage.getItem('usuario_foto') || '';
    const dataCriacao = localStorage.getItem('data_criacao_conta') || '';

    // Incluir orçamentos
    const orcamentos = localStorage.getItem('orcamentos') || '{}';

    const dados = {
        transacoes: transacoes,
        categorias: categorias,
        perfil: {
            nome: nomeUsuario,
            foto: fotoUsuario,
            dataCriacao: dataCriacao
        },
        orcamentos: orcamentos,
        dataExportacao: new Date().toISOString(),
        versao: '1.2' // Versão atualizada para incluir orçamentos
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_controle_financeiro.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função para importar dados
function importarDadosStorage(arquivo) {
    console.log('Iniciando importação do arquivo:', arquivo.name, 'Tamanho:', arquivo.size, 'bytes');

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            console.log('Arquivo lido com sucesso, processando JSON...');
            try {
                const dados = JSON.parse(e.target.result);
                console.log('JSON parseado:', dados);

                if (dados.transacoes && dados.categorias) {
                    console.log('Salvando transações:', dados.transacoes.length);
                    salvarTransacoes(dados.transacoes);

                    console.log('Salvando categorias:', dados.categorias.length);
                    salvarCategorias(dados.categorias);

                    // Restaurar dados do perfil se existirem (versão 1.1+)
                    if (dados.perfil) {
                        console.log('Restaurando dados do perfil');
                        if (dados.perfil.nome) {
                            localStorage.setItem('usuario_nome', dados.perfil.nome);
                        }
                        if (dados.perfil.foto) {
                            localStorage.setItem('usuario_foto', dados.perfil.foto);
                        }
                        if (dados.perfil.dataCriacao) {
                            localStorage.setItem('data_criacao_conta', dados.perfil.dataCriacao);
                        }
                    }

                    // Restaurar orçamentos se existirem (versão 1.2+)
                    if (dados.orcamentos) {
                        console.log('Restaurando orçamentos');
                        localStorage.setItem('orcamentos', dados.orcamentos);
                    }

                    console.log('Importação concluída com sucesso');
                    resolve(true);
                } else {
                    console.error('Estrutura do arquivo inválida:', dados);
                    reject('Arquivo inválido: não contém transacoes e categorias');
                }
            } catch (error) {
                console.error('Erro ao processar JSON:', error);
                reject('Erro ao processar arquivo: ' + error.message);
            }
        };

        reader.onerror = function() {
            console.error('Erro ao ler arquivo');
            reject('Erro ao ler arquivo');
        };

        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                console.log('Progresso da leitura:', percentComplete + '%');
            }
        };

        console.log('Iniciando leitura do arquivo...');
        reader.readAsText(arquivo);
    });
}

// Sistema de backup automático
let pastaBackupHandle = null;
let backupHabilitado = false;

// Função para inicializar sistema de backup
async function inicializarSistemaBackup() {
    try {
        // Verificar se o navegador suporta File System Access API
        if ('showDirectoryPicker' in window) {
            await solicitarPermissaoPastaBackup();
        } else {
            console.log('File System Access API não suportado. Usando IndexedDB para backups.');
            inicializarIndexedDBBackup();
        }
    } catch (error) {
        console.log('Sistema de backup não pôde ser inicializado:', error);
        backupHabilitado = false;
    }
}

// Função para solicitar permissão da pasta CFP
async function solicitarPermissaoPastaBackup() {
    try {
        console.log('Solicitando permissão para pasta de backup...');

        const dirHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'downloads'
        });

        console.log('Pasta selecionada:', dirHandle);

        // Verificar se já existe uma pasta CFP ou criar uma
        try {
            pastaBackupHandle = await dirHandle.getDirectoryHandle('CFP', { create: true });
            console.log('Pasta CFP criada/acessada com sucesso');
        } catch (error) {
            console.warn('Não foi possível criar pasta CFP, usando pasta raiz:', error);
            // Se não conseguir criar, tentar usar a pasta raiz
            pastaBackupHandle = dirHandle;
        }

        backupHabilitado = true;
        console.log('Sistema de backup CFP habilitado com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao solicitar permissão da pasta:', error);
        backupHabilitado = false;

        // Lançar erro específico para tratamento no app.js
        throw error;
    }
}

// Função para salvar backup automático
async function salvarBackupAutomatico() {
    if (!backupHabilitado) return;

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const nomeArquivo = `backup_${timestamp}.json`;

        const dados = {
            transacoes: carregarTransacoes(),
            categorias: carregarCategorias(),
            orcamentos: localStorage.getItem('orcamentos') || '{}',
            dataExportacao: new Date().toISOString(),
            versao: '1.2'
        };

        if (pastaBackupHandle) {
            // Usar File System Access API
            await salvarBackupFileSystem(dados, nomeArquivo);
        } else {
            // Usar IndexedDB como alternativa
            await salvarBackupIndexedDB(dados, nomeArquivo);
        }

        // Salvar referência do último backup
        localStorage.setItem('ultimo_backup', nomeArquivo);
        console.log('Backup automático salvo:', nomeArquivo);

    } catch (error) {
        console.error('Erro ao salvar backup automático:', error);
    }
}

// Função para salvar backup usando File System Access API
async function salvarBackupFileSystem(dados, nomeArquivo) {
    const fileHandle = await pastaBackupHandle.getFileHandle(nomeArquivo, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(dados, null, 2));
    await writable.close();
}

// Função para carregar último backup automaticamente
async function carregarUltimoBackup() {
    try {
        const ultimoBackup = localStorage.getItem('ultimo_backup');
        if (!ultimoBackup) {
            console.log('Nenhum backup anterior encontrado.');
            return;
        }

        let dadosBackup = null;

        if (pastaBackupHandle) {
            // Carregar do sistema de arquivos
            dadosBackup = await carregarBackupFileSystem(ultimoBackup);
        } else {
            // Carregar do IndexedDB
            dadosBackup = await carregarBackupIndexedDB(ultimoBackup);
        }

        if (dadosBackup && dadosBackup.transacoes && dadosBackup.categorias) {
            // Aplicar os dados do backup
            salvarTransacoes(dadosBackup.transacoes);
            salvarCategorias(dadosBackup.categorias);

            // Restaurar orçamentos se existirem
            if (dadosBackup.orcamentos) {
                localStorage.setItem('orcamentos', dadosBackup.orcamentos);
            }

            console.log('Último backup carregado automaticamente:', ultimoBackup);
            return true;
        }

    } catch (error) {
        console.error('Erro ao carregar último backup:', error);
    }

    return false;
}

// Função para carregar backup do sistema de arquivos
async function carregarBackupFileSystem(nomeArquivo) {
    try {
        const fileHandle = await pastaBackupHandle.getFileHandle(nomeArquivo);
        const file = await fileHandle.getFile();
        const contents = await file.text();
        return JSON.parse(contents);
    } catch (error) {
        console.error('Erro ao carregar backup do sistema de arquivos:', error);
        return null;
    }
}

// IndexedDB como alternativa para backups
let dbBackup = null;

function inicializarIndexedDBBackup() {
    const request = indexedDB.open('CFP_Backups', 1);

    request.onerror = () => {
        console.error('Erro ao abrir IndexedDB para backups');
    };

    request.onsuccess = (event) => {
        dbBackup = event.target.result;
        console.log('IndexedDB para backups inicializado');
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups', { keyPath: 'nome' });
        }
    };
}

async function salvarBackupIndexedDB(dados, nomeArquivo) {
    return new Promise((resolve, reject) => {
        if (!dbBackup) {
            reject('IndexedDB não inicializado');
            return;
        }

        const transaction = dbBackup.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');

        const backupData = {
            nome: nomeArquivo,
            dados: dados,
            timestamp: Date.now()
        };

        const request = store.put(backupData);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function carregarBackupIndexedDB(nomeArquivo) {
    return new Promise((resolve, reject) => {
        if (!dbBackup) {
            reject('IndexedDB não inicializado');
            return;
        }

        const transaction = dbBackup.transaction(['backups'], 'readonly');
        const store = transaction.objectStore('backups');
        const request = store.get(nomeArquivo);

        request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.dados : null);
        };
        request.onerror = () => reject(request.error);
    });
}

// Funções para gerenciar a lixeira
function salvarLixeira(lixeira) {
    return salvarDados(STORAGE_KEYS.TRASH, lixeira);
}

function carregarLixeira() {
    return carregarDados(STORAGE_KEYS.TRASH);
}

function adicionarALixeira(transacao) {
    const lixeira = carregarLixeira();
    const itemLixeira = {
        ...transacao,
        dataExclusao: new Date().toISOString(),
        idOriginal: transacao.id
    };
    lixeira.push(itemLixeira);
    salvarLixeira(lixeira);
    salvarBackupAutomatico(); // Backup automático
}

function removerDaLixeira(id) {
    const lixeira = carregarLixeira();
    const novaLixeira = lixeira.filter(item => item.id !== id);
    salvarLixeira(novaLixeira);
    salvarBackupAutomatico(); // Backup automático
}

function restaurarDaLixeira(id) {
    const lixeira = carregarLixeira();
    const item = lixeira.find(item => item.id === id);
    if (item) {
        // Remover da lixeira
        removerDaLixeira(id);

        // Restaurar para transações (gerar novo ID para evitar conflitos)
        const transacoes = carregarTransacoes();
        const novaTransacao = {
            ...item,
            id: gerarNovoId(transacoes)
        };
        delete novaTransacao.dataExclusao;
        delete novaTransacao.idOriginal;

        transacoes.push(novaTransacao);
        salvarTransacoes(transacoes);
        salvarBackupAutomatico(); // Backup automático

        return novaTransacao;
    }
    return null;
}

function esvaziarLixeira() {
    console.log('=== ESVAZIANDO LIXEIRA ===');
    console.log('Itens na lixeira antes:', carregarLixeira().length);

    salvarLixeira([]);
    salvarBackupAutomatico(); // Backup automático

    console.log('Itens na lixeira depois:', carregarLixeira().length);
    console.log('=== LIXEIRA ESVAZIADA ===');
}

// Função para limpar todos os dados
function limparTodosDados() {
    // Limpar dados financeiros
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TRASH);
    localStorage.removeItem('ultimo_backup');

    // Limpar dados do perfil do usuário
    localStorage.removeItem('usuario_nome');
    localStorage.removeItem('usuario_foto');
    localStorage.removeItem('data_criacao_conta');

    // Limpar orçamentos
    localStorage.removeItem('orcamentos');

    // Limpar configurações gerais
    localStorage.removeItem('tema');
}
