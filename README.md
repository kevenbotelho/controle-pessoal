# CFP - Controle Financeiro Pessoal

Um aplicativo web completo para controle financeiro pessoal que funciona 100% offline no navegador, sem necessidade de backend ou banco de dados.

## Funcionalidades

### ✅ Dashboard
- Saldo atual atualizado automaticamente
- Total de entradas e saídas
- Resumo mensal
- Destaque visual para saldo negativo

### ✅ Gerenciamento de Transações
- Adicionar, editar e remover transações
- Campos: descrição, valor, tipo (entrada/saída), categoria, data
- Listagem organizada com ordenação por data
- Validação de formulários

### ✅ Categorias
- Categorias padrão (Alimentação, Transporte, Moradia, Lazer, Saúde, Outros)
- Possibilidade de criar, editar e remover categorias personalizadas
- Validação para não remover categorias em uso

### ✅ Filtros e Busca
- Filtrar por mês/ano, categoria ou tipo
- Campo de busca por descrição
- Filtros aplicados em tempo real

### ✅ Persistência de Dados
- Todos os dados salvos no LocalStorage
- Dados persistem entre sessões
- Estrutura organizada no LocalStorage

### ✅ Backup Automático CFP
- **Sistema inteligente de backup automático**
- Cria pasta "CFP" automaticamente no local escolhido
- **Botão "Escolher Local do Backup"** para alterar pasta a qualquer momento
- Backup automático a cada alteração nos dados
- Carregamento automático do último backup ao abrir o site
- Suporte a File System Access API (Chrome/Edge) e IndexedDB (fallback)
- Nunca perca seus dados novamente!

### ✅ Backup Manual (JSON)
- Exportar todos os dados para arquivo JSON
- Importar dados de arquivo JSON
- Validação de arquivos antes da importação
- Opção para limpar todos os dados

### ✅ Interface Responsiva
- Design moderno e intuitivo
- Compatível com desktop e mobile
- Modo claro e modo escuro
- Navegação lateral com menu hambúrguer

### ✅ Visualizações
- Gráfico circular mostrando saldo vs gastos (verde = dinheiro disponível, vermelho = gastos)
- Interface organizada por seções

### ✅ Caixinhas de Poupança 💰 (NOVO!)
- **Sistema completo de metas de poupança**
- Criar caixinhas com: nome, valor alvo, prazo (meses ou data final), frequência de contribuição
- Cálculo automático de valor por período e percentual da renda
- Acompanhamento de progresso com barra visual
- Contribuições manuais e histórico completo
- Status: Ativa/Pausada/Concluída
- Exportação e importação de caixinhas em JSON
- Integração com categorias existentes
- Notificações quando metas são atingidas
- Sugestões inteligentes baseadas na renda mensal
- Interface intuitiva com cards coloridos por status

### 📊 Funcionalidades das Caixinhas
- **Calculadora inteligente**: Calcula automaticamente quanto guardar por período
- **Acompanhamento visual**: Barra de progresso e cards informativos
- **Flexibilidade**: Contribuições manuais a qualquer momento
- **Gerenciamento completo**: Pausar, retomar, editar e excluir caixinhas
- **Backup integrado**: Caixinhas são salvas no LocalStorage e no sistema de backup
- **Relatórios**: Histórico detalhado de todas as contribuições
- **Notificações**: Alertas quando metas são atingidas ou quando percentuais são altos

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização responsiva com variáveis CSS para temas
- **JavaScript Puro**: Lógica da aplicação sem frameworks
- **LocalStorage**: Persistência de dados
- **Canvas API**: Gráficos nativos (sem dependências externas)

## Estrutura do Projeto

```
/home/keven/Documentos/PROJETOS/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos CSS
├── js/
│   ├── storage.js      # Funções de LocalStorage
│   ├── transactions.js # Gerenciamento de transações
│   ├── ui.js           # Funções de interface
│   └── app.js          # Lógica principal
└── README.md           # Este arquivo
```

## Como Usar

### Opção 1: Abrir diretamente no navegador
1. Baixe/clone este repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. O aplicativo funcionará imediatamente offline

### Opção 2: Usar servidor local (recomendado)
1. Instale Python 3 no seu sistema
2. Navegue até a pasta do projeto
3. Execute: `python -m http.server 8000`
4. Abra `http://localhost:8000` no navegador

### Opção 3: Usar Live Server (VS Code)
1. Instale a extensão "Live Server" no VS Code
2. Clique com o botão direito em `index.html`
3. Selecione "Open with Live Server"

## Funcionalidades Offline

- ✅ Não requer internet para funcionar
- ✅ Dados salvos localmente no navegador
- ✅ Funciona em qualquer dispositivo com navegador moderno
- ✅ Sem dependências externas

## Navegação

- **Menu Hambúrguer**: Abre/fecha o menu lateral
- **Dashboard**: Visão geral financeira
- **Transações**: Gerenciar entradas e saídas
- **Categorias**: Administrar categorias
- **Gráficos**: Visualização de gastos por categoria
- **Backup**: Exportar/importar dados

## Validações Implementadas

- Campos obrigatórios em formulários
- Valores numéricos positivos
- Verificação de categorias em uso antes da remoção
- Validação de arquivos JSON na importação

## Tema

- **Modo Claro**: Padrão
- **Modo Escuro**: Toggle no header
- Preferência salva no LocalStorage

## Compatibilidade

- Navegadores modernos com suporte a LocalStorage e ES6+
- Chrome, Firefox, Safari, Edge
- Dispositivos móveis e desktop

## Desenvolvimento

O código está bem comentado e organizado em módulos para facilitar a manutenção e extensão. Cada arquivo JavaScript tem responsabilidades claras:

- `storage.js`: Gerenciamento de dados no LocalStorage
- `transactions.js`: Lógica de negócio das transações
- `ui.js`: Manipulação da interface do usuário
- `app.js`: Coordenação e event listeners

## Backup de Dados

Os dados são salvos automaticamente no LocalStorage do navegador. Para backup manual:

1. Vá para a seção "Backup"
2. Clique em "Exportar Dados"
3. Salve o arquivo JSON gerado
4. Para restaurar, clique em "Importar Dados" e selecione o arquivo

## Limitações

- Dados armazenados apenas no navegador atual
- Não sincroniza entre dispositivos
- Dependente do espaço de LocalStorage do navegador (geralmente 5-10MB)

## Melhorias Futuras Possíveis

- Sincronização com nuvem (requereria backend)
- Relatórios mais detalhados
- Metas de economia
- Notificações
- Exportação para PDF

---

**Desenvolvido com JavaScript puro, sem frameworks ou dependências desnecessárias.**
