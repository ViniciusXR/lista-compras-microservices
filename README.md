# Lista de Compras - Microsserviços

Um sistema distribuído completo para gerenciamento de listas de compras utilizando arquitetura de microsserviços com API Gateway, Service Discovery e bancos NoSQL independentes.

## 📚 Índice

1. [🏗️ Arquitetura](#arquitetura)
2. [🎯 Funcionalidades](#funcionalidades)
   - [Gerenciamento de Usuários](#gerenciamento-de-usuarios)
   - [Catálogo de Itens](#catalogo-de-itens)
   - [Listas de Compras](#listas-de-compras)
   - [API Gateway](#api-gateway)
3. [🚀 Como Executar](#como-executar)
   - [Pré-requisitos](#pre-requisitos)
   - [Instalação Rápida](#instalacao-rapida)
   - [Execução Individual](#execucao-individual)
   - [Modo Desenvolvimento](#modo-desenvolvimento)
4. [🧪 Demonstração](#demonstracao)
   - [Cliente de Teste Completo](#cliente-de-teste-completo)
   - [Endpoints da API](#endpoints-da-api)
5. [🛠️ Tecnologias Utilizadas](#tecnologias-utilizadas)
6. [📊 Padrões Implementados](#padroes-implementados)
   - [Microsserviços](#microsservicos)
   - [NoSQL](#nosql)
7. [🗂️ Estrutura do Projeto](#estrutura-do-projeto)
8. [🔧 Configuração](#configuracao)
   - [Portas Padrão](#portas-padrao)
   - [Usuário Padrão](#usuario-padrao)
   - [Dados de Exemplo](#dados-de-exemplo)
9. [🏃‍♂️ Quick Start](#quick-start)
10. [📈 Health Monitoring](#health-monitoring)
11. [📄 Licença](#licenca)
12. [👨‍💻 Autor](#autor)

---

<a id="arquitetura"></a>
## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   User Service  │    │   Item Service   │    │   List Service   │  
│     :3001       │    │      :3002       │    │      :3003       │
│  Users Database │    │  Items Database  │    │  Lists Database  │
│   (JSON NoSQL)  │    │   (JSON NoSQL)   │    │   (JSON NoSQL)   │
└─────────────────┘    └──────────────────┘    └──────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │    API Gateway      │
                    │       :3000         │
                    │  Service Discovery  │
                    │  Circuit Breaker    │
                    │  Request Routing    │
                    │  Data Aggregation   │
                    └─────────────────────┘
```

<a id="funcionalidades"></a>
## 🎯 Funcionalidades

<a id="gerenciamento-de-usuarios"></a>
### Gerenciamento de Usuários
- ✅ Registro de novos usuários
- ✅ Autenticação JWT
- ✅ Validação de tokens entre serviços
- ✅ Preferências de usuário (loja padrão, moeda)

<a id="catalogo-de-itens"></a>
### Catálogo de Itens
- ✅ 20+ itens pré-cadastrados em 5 categorias
- ✅ Busca por nome, categoria, marca
- ✅ Gerenciamento de preços médios
- ✅ Códigos de barras e unidades

<a id="listas-de-compras"></a>
### Listas de Compras
- ✅ Criação e gerenciamento de listas
- ✅ Adição/remoção de itens
- ✅ Controle de quantidades e preços
- ✅ Resumos automáticos (total de itens, valor estimado)
- ✅ Status de compra (ativo, concluído, arquivado)

<a id="api-gateway"></a>
### API Gateway
- ✅ Roteamento inteligente
- ✅ Agregação de dados
- ✅ Circuit Breaker pattern
- ✅ Health checks distribuídos
- ✅ Dashboard consolidado
- ✅ Dashboard público (sem autenticação)

<a id="como-executar"></a>
## 🚀 Como Executar

<a id="pre-requisitos"></a>
### Pré-requisitos
- Node.js 16+ 
- npm 8+

<a id="instalacao-rapida"></a>
### Instalação Rápida
```bash
# Clonar o repositório
git clone https://github.com/ViniciusXR/lista-compras-microservices.git
cd lista-compras-microservices

# Instalar todas as dependências
npm run install:all

# Iniciar todos os serviços
npm start
```

<a id="execucao-individual"></a>
### Execução Individual
```bash
# User Service
cd services/user-service && npm start

# Item Service  
cd services/item-service && npm start

# List Service
cd services/list-service && npm start

# API Gateway
cd api-gateway && npm start
```

<a id="modo-desenvolvimento"></a>
### Modo Desenvolvimento
```bash
# Todos os serviços com auto-reload
npm run dev
```

<a id="demonstracao"></a>
## 🧪 Demonstração

<a id="cliente-de-teste-completo"></a>
### Cliente de Teste Completo
```bash
# Demonstração completa do sistema
npm run demo

# Verificar saúde dos serviços
node client-demo.js --health

# Listar itens disponíveis
node client-demo.js --items

# Buscar por termo específico
node client-demo.js --search=arroz

# Ver opções disponíveis
node client-demo.js --help
```

<a id="endpoints-da-api"></a>
### Endpoints da API

#### API Gateway (porta 3000)
```
GET  /health                    # Status do sistema
GET  /registry                  # Serviços registrados  
GET  /api/dashboard             # Dashboard agregado (requer auth)
GET  /api/dashboard/public      # Dashboard público (sem auth)
GET  /api/search?q=termo        # Busca global
```

#### Usuários
```
POST /api/users/auth/register   # Registrar usuário
POST /api/users/auth/login      # Fazer login
GET  /api/users                 # Listar usuários (auth)
GET  /api/users/search?q=termo  # Buscar usuários (auth)
```

#### Itens
```
GET  /api/items                 # Listar itens
GET  /api/items/:id             # Buscar item específico
POST /api/items                 # Criar item (auth)
GET  /api/items/categories      # Listar categorias
GET  /api/items/search?q=termo  # Buscar itens
```

#### Listas de Compras
```
GET  /api/lists               # Minhas listas (auth)
POST /api/lists               # Criar lista (auth)
GET  /api/lists/:id           # Detalhes da lista (auth)
POST /api/lists/:id/items     # Adicionar item à lista (auth)
GET  /api/lists/:id/summary   # Resumo da lista (auth)
```

### 🔓 Acesso Público (Sem Autenticação)

Para facilitar testes e demonstrações, algumas rotas estão disponíveis publicamente:

```bash
# Dashboard público - visão geral do sistema
GET /api/dashboard/public

# Catálogo de itens - produtos disponíveis
GET /api/items

# Categorias de produtos
GET /api/items/categories

# Busca de itens por termo
GET /api/items/search?q=termo

# Status dos serviços
GET /health
GET /registry
```

**Exemplo de uso:**
```bash
# Via curl
curl http://localhost:3000/api/dashboard/public

# Via navegador
http://localhost:3000/api/dashboard/public
```

<a id="tecnologias-utilizadas"></a>
## 🛠️ Tecnologias Utilizadas

- **Node.js + Express** - Runtime e framework web
- **JSON NoSQL** - Banco de dados baseado em arquivos
- **JWT** - Autenticação stateless
- **Axios** - Cliente HTTP para comunicação entre serviços
- **Morgan** - Logging de requisições
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Concurrently** - Execução paralela de serviços

<a id="padroes-implementados"></a>
## 📊 Padrões Implementados

<a id="microsservicos"></a>
### Microsserviços
- **Database per Service** - Cada serviço tem seu próprio banco
- **Service Discovery** - Registry baseado em arquivo
- **API Gateway** - Ponto único de entrada
- **Circuit Breaker** - Tolerância a falhas

<a id="nosql"></a>
### NoSQL
- **Document Store** - Armazenamento em JSON
- **Schema Flexibility** - Estruturas flexíveis
- **Full-text Search** - Busca em múltiplos campos
- **Indexing** - Índices automáticos para performance

<a id="estrutura-do-projeto"></a>
## 🗂️ Estrutura do Projeto

```
lista-compras-microservices/
├── services/
│   ├── user-service/        # Gerenciamento de usuários
│   │   ├── server.js
│   │   ├── package.json
│   │   └── database/        # JSON NoSQL
│   ├── item-service/        # Catálogo de itens
│   │   ├── server.js
│   │   ├── package.json
│   │   └── database/        # JSON NoSQL
│   └── list-service/        # Listas de compras
│       ├── server.js
│       ├── package.json
│       └── database/        # JSON NoSQL
├── api-gateway/             # Gateway principal
│   ├── server.js
│   └── package.json
├── shared/                  # Componentes compartilhados
│   ├── JsonDatabase.js      # NoSQL engine
│   └── serviceRegistry.js   # Service discovery
├── client-demo.js           # Cliente de demonstração
└── package.json             # Scripts do projeto
```

<a id="configuracao"></a>
## 🔧 Configuração

<a id="portas-padrao"></a>
### Portas Padrão
- **API Gateway:** 3000
- **User Service:** 3001  
- **Item Service:** 3002
- **List Service:** 3003

<a id="usuario-padrao"></a>
### Usuário Padrão
```
Email: admin@microservices.com
Password: admin123
```

<a id="dados-de-exemplo"></a>
### Dados de Exemplo
- **20 itens** distribuídos em 5 categorias
- **Categorias:** Alimentos, Limpeza, Higiene, Bebidas, Padaria
- **Usuário admin** pré-configurado

<a id="quick-start"></a>
## 🏃‍♂️ Quick Start

1. **Clone e instale:**
   ```bash
   git clone <repo-url>
   cd lista-compras-microservices
   npm run install:all
   ```

2. **Inicie os serviços:**
   ```bash
   npm start
   ```

3. **Teste a API:**
   ```bash
   curl http://localhost:3000/health
   ```

4. **Execute a demonstração:**
   ```bash
   npm run demo
   ```

5. **Acesse o dashboard:**
   ```
   # Dashboard com autenticação
   http://localhost:3000/api/dashboard
   
   # Dashboard público (sem autenticação)
   http://localhost:3000/api/dashboard/public
   ```

<a id="health-monitoring"></a>
## 📈 Health Monitoring

Todos os serviços expõem endpoints de health check:
- http://localhost:3000/health (Gateway)
- http://localhost:3000/registry (Service Registry)
- http://localhost:3000/api/dashboard/public (Dashboard Público)
- http://localhost:3001/health (Users)
- http://localhost:3002/health (Items)
- http://localhost:3003/health (Lists)

### Monitoramento Consolidado
O API Gateway oferece uma visão consolidada do sistema:
```bash
# Status geral do sistema
curl http://localhost:3000/health

# Serviços registrados
curl http://localhost:3000/registry

# Dashboard público com dados em tempo real
curl http://localhost:3000/api/dashboard/public
```

<a id="licenca"></a>
## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

<a id="autor"></a>
## 👨‍💻 Autor

**Vinicius Xavier Ramalho**  
Laboratório de Desenvolvimento - PUC Minas

---

### 🎯 Sistema Completo de Microsserviços para Lista de Compras

*Demonstrando padrões modernos de arquitetura distribuída com NoSQL*
