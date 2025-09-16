const axios = require('axios');

class MicroservicesClient {
    constructor(gatewayUrl = 'http://127.0.0.1:3000') {
        this.gatewayUrl = gatewayUrl;
        this.authToken = null;
        this.user = null;
        
        // Configurar axios
        this.api = axios.create({
            baseURL: gatewayUrl,
            timeout: 10000,
            family: 4  // Forçar IPv4
        });

        // Interceptor para adicionar token automaticamente
        this.api.interceptors.request.use(config => {
            if (this.authToken) {
                config.headers.Authorization = `Bearer ${this.authToken}`;
            }
            return config;
        });

        // Interceptor para log de erros
        this.api.interceptors.response.use(
            response => response,
            error => {
                console.error('Erro na requisição:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message
                });
                return Promise.reject(error);
            }
        );
    }

    // Registrar usuário
    async register(userData) {
        try {
            console.log('\nRegistrando usuário...');
            const response = await this.api.post('/api/users/auth/register', userData);
            
            if (response.data.success) {
                this.authToken = response.data.data.token;
                this.user = response.data.data.user;
                console.log('Usuário registrado:', this.user.username);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha no registro');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro no registro:', message);
            throw error;
        }
    }

    // Fazer login
    async login(credentials) {
        try {
            console.log('\nFazendo login...');
            const response = await this.api.post('/api/users/auth/login', credentials);
            
            if (response.data.success) {
                this.authToken = response.data.data.token;
                this.user = response.data.data.user;
                console.log('Login realizado:', this.user.username);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha no login');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro no login:', message);
            throw error;
        }
    }

    // Buscar itens
    async getItems(filters = {}) {
        try {
            console.log('\nBuscando itens...');
            const response = await this.api.get('/api/items', { params: filters });
            
            if (response.data.success) {
                const items = response.data.data;
                console.log(`Encontrados ${items.length} itens`);
                items.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.name} - ${item.brand} (${item.category}) - R$ ${item.averagePrice}/${item.unit}`);
                });
                return response.data;
            } else {
                console.log('Resposta inválida do servidor');
                return { data: [] };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao buscar itens:', message);
            return { data: [] };
        }
    }

    // Criar lista de compras
    async createList(listData) {
        try {
            console.log('\nCriando lista de compras...');
            
            if (!this.authToken) {
                throw new Error('Token de autenticação necessário');
            }

            const response = await this.api.post('/api/lists', listData);
            
            if (response.data.success) {
                console.log('Lista criada:', response.data.data.name);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha na criação da lista');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao criar lista:', message);
            throw error;
        }
    }

    // Buscar listas do usuário
    async getLists() {
        try {
            console.log('\nBuscando listas de compras...');
            
            if (!this.authToken) {
                throw new Error('Token de autenticação necessário');
            }

            const response = await this.api.get('/api/lists');
            
            if (response.data.success) {
                const lists = response.data.data.lists;
                console.log(`Encontradas ${lists.length} listas`);
                lists.forEach((list, index) => {
                    console.log(`  ${index + 1}. ${list.name} - ${list.summary.totalItems} itens - Status: ${list.status}`);
                });
                return response.data;
            } else {
                console.log('Resposta inválida do servidor');
                return { data: { lists: [] } };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao buscar listas:', message);
            return { data: { lists: [] } };
        }
    }

    // Adicionar item à lista
    async addItemToList(listId, itemData) {
        try {
            console.log(`\nAdicionando item à lista ${listId}...`);
            
            if (!this.authToken) {
                throw new Error('Token de autenticação necessário');
            }

            const response = await this.api.post(`/api/lists/${listId}/items`, itemData);
            
            if (response.data.success) {
                console.log('Item adicionado à lista com sucesso');
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha ao adicionar item à lista');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao adicionar item à lista:', message);
            throw error;
        }
    }

    // Criar item (requer autenticação)
    async createItem(itemData) {
        try {
            console.log('\nCriando item...');
            
            if (!this.authToken) {
                throw new Error('Token de autenticação necessário');
            }

            const response = await this.api.post('/api/items', itemData);
            
            if (response.data.success) {
                console.log('Item criado:', response.data.data.name);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha na criação do item');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao criar item:', message);
            throw error;
        }
    }

    // Buscar categorias
    async getCategories() {
        try {
            console.log('\nBuscando categorias...');
            const response = await this.api.get('/api/items/categories');
            
            if (response.data.success) {
                const categories = response.data.data;
                console.log(`Encontradas ${categories.length} categorias`);
                categories.forEach((category, index) => {
                    console.log(`  ${index + 1}. ${category.name} - ${category.itemCount} itens`);
                });
                return response.data;
            } else {
                console.log('Resposta inválida do servidor');
                return { data: [] };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao buscar categorias:', message);
            return { data: [] };
        }
    }

    // Dashboard agregado
    async getDashboard() {
        try {
            console.log('\nBuscando dashboard...');
            
            if (!this.authToken) {
                throw new Error('Token de autenticação necessário para o dashboard');
            }

            const response = await this.api.get('/api/dashboard');
            
            if (response.data.success) {
                const dashboard = response.data.data;
                console.log('Dashboard carregado:');
                console.log(`   Timestamp: ${dashboard.timestamp}`);
                console.log(`   Arquitetura: ${dashboard.architecture}`);
                console.log(`   Banco de Dados: ${dashboard.database_approach}`);
                console.log(`   Status dos Serviços:`);
                
                if (dashboard.services_status) {
                    Object.entries(dashboard.services_status).forEach(([serviceName, serviceInfo]) => {
                        const status = serviceInfo.healthy ? 'SAUDÁVEL' : 'INDISPONÍVEL';
                        console.log(`     ${serviceName}: ${status} (${serviceInfo.url})`);
                    });
                }

                console.log(`   Usuários disponíveis: ${dashboard.data?.users?.available ? 'Sim' : 'Não'}`);
                console.log(`   Itens disponíveis: ${dashboard.data?.items?.available ? 'Sim' : 'Não'}`);
                console.log(`   Listas disponíveis: ${dashboard.data?.lists?.available ? 'Sim' : 'Não'}`);
                console.log(`   Categorias disponíveis: ${dashboard.data?.categories?.available ? 'Sim' : 'Não'}`);
                
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha ao carregar dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro ao buscar dashboard:', message);
            throw error;
        }
    }

    // Busca global
    async search(query) {
        try {
            console.log(`\nBuscando por: "${query}"`);
            const response = await this.api.get('/api/search', { params: { q: query } });
            
            if (response.data.success) {
                const results = response.data.data;
                console.log(`Resultados para "${results.query}":`);
                
                if (results.items?.available) {
                    console.log(`   Itens encontrados: ${results.items.results.length}`);
                    results.items.results.forEach((item, index) => {
                        console.log(`     ${index + 1}. ${item.name} - ${item.category} - R$ ${item.averagePrice}/${item.unit}`);
                    });
                } else {
                    console.log('   Serviço de itens indisponível');
                }

                if (results.users?.available) {
                    console.log(`   Usuários encontrados: ${results.users.results.length}`);
                    results.users.results.forEach((user, index) => {
                        console.log(`     ${index + 1}. ${user.firstName} ${user.lastName} (@${user.username})`);
                    });
                } else if (results.users?.error) {
                    console.log('   Busca de usuários requer autenticação');
                }
                
                return response.data;
            } else {
                throw new Error(response.data.message || 'Falha na busca');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            console.log('Erro na busca:', message);
            throw error;
        }
    }

    // Verificar saúde dos serviços
    async checkHealth() {
        try {
            console.log('\nVerificando saúde dos serviços...');
            
            const [gatewayHealth, registryInfo] = await Promise.allSettled([
                this.api.get('/health'),
                this.api.get('/registry')
            ]);

            if (gatewayHealth.status === 'fulfilled') {
                const health = gatewayHealth.value.data;
                console.log('API Gateway: healthy');
                console.log(`Arquitetura: ${health.architecture}`);
                
                if (registryInfo.status === 'fulfilled') {
                    const services = registryInfo.value.data.services;
                    console.log('Serviços registrados:');
                    
                    Object.entries(services).forEach(([name, info]) => {
                        const status = info.healthy ? 'SAUDÁVEL' : 'INDISPONÍVEL';
                        const uptime = Math.floor(info.uptime / 1000);
                        console.log(`   ${name}: ${status} (${info.url}) - uptime: ${uptime}s`);
                    });
                } else {
                    console.log('   Erro ao buscar registry:', registryInfo.reason?.message);
                }
            } else {
                console.log('API Gateway indisponível:', gatewayHealth.reason?.message);
            }
            
            return { gatewayHealth, registryInfo };
        } catch (error) {
            console.log('Erro ao verificar saúde:', error.message);
            throw error;
        }
    }

    // Demonstração completa
    async runDemo() {
        console.log('=====================================');
        console.log('Demo: Microsserviços com NoSQL');
        console.log('=====================================');

        try {
            // 1. Verificar saúde dos serviços
            await this.checkHealth();
            await this.delay(2000);

            // 2. Registrar usuário
            const uniqueId = Date.now();
            const userData = {
                email: `demo${uniqueId}@microservices.com`,
                username: `demo${uniqueId}`,
                password: 'demo123456',
                firstName: 'Demo',
                lastName: 'User'
            };

            let authSuccessful = false;
            try {
                await this.register(userData);
                authSuccessful = true;
            } catch (error) {
                // Se registro falhar, tentar login com admin
                console.log('\nTentando login com usuário admin...');
                try {
                    await this.login({
                        identifier: 'admin@microservices.com',
                        password: 'admin123'
                    });
                    authSuccessful = true;
                } catch (loginError) {
                    console.log('Login com admin falhou, continuando sem autenticação...');
                    authSuccessful = false;
                }
            }

            await this.delay(1000);

            // 3. Buscar itens
            const itemsResponse = await this.getItems({ limit: 5 });
            await this.delay(1000);

            // 4. Buscar categorias
            await this.getCategories();
            await this.delay(1000);

            // 5. Fazer busca de itens
            await this.search('arroz');
            await this.delay(1000);

            // 6. Se autenticado, fazer operações que requerem auth
            if (authSuccessful && this.authToken) {
                // Buscar dashboard
                try {
                    await this.getDashboard();
                    await this.delay(1000);
                } catch (error) {
                    console.log('Dashboard não disponível:', error.message);
                }

                // Criar lista de compras
                let createdList = null;
                try {
                    const listResponse = await this.createList({
                        name: 'Lista de Compras Demo',
                        description: 'Lista criada durante demonstração do sistema'
                    });

                    if (listResponse.success) {
                        createdList = listResponse.data;
                        await this.delay(1000);
                        console.log(`Lista criada: ${createdList.name} (ID: ${createdList.id})`);
                    }
                } catch (error) {
                    console.log('Criação de lista falhou:', error.message);
                }

                // Adicionar itens à lista
                if (createdList && itemsResponse.data && itemsResponse.data.length > 0) {
                    try {
                        const firstItem = itemsResponse.data[0];
                        await this.addItemToList(createdList.id, {
                            itemId: firstItem.id,
                            quantity: 2,
                            unit: firstItem.unit,
                            estimatedPrice: firstItem.averagePrice,
                            notes: 'Adicionado via demo'
                        });

                        await this.delay(1000);

                        // Buscar listas atualizadas
                        await this.getLists();
                        await this.delay(1000);
                    } catch (error) {
                        console.log('Erro ao adicionar item à lista:', error.message);
                    }
                }

                // Criar item de teste
                try {
                    const newItem = await this.createItem({
                        name: 'Item Demo NoSQL',
                        category: 'Alimentos',
                        brand: 'Demo Brand',
                        unit: 'un',
                        averagePrice: 9.99,
                        barcode: '1234567890123',
                        description: 'Item criado via demo com banco NoSQL'
                    });

                    if (newItem.success) {
                        await this.delay(1000);
                        console.log(`Item criado: ${newItem.data.name} (ID: ${newItem.data.id})`);
                    }
                } catch (error) {
                    console.log('Criação de item falhou:', error.message);
                }
            } else {
                console.log('\nOperações autenticadas puladas (sem token válido)');
            }

            console.log('\n=====================================');
            console.log('Demonstração concluída com sucesso!');
            console.log('=====================================');
            console.log('Padrões demonstrados:');
            console.log('   ✅ Service Discovery via Registry');
            console.log('   ✅ API Gateway com roteamento');
            console.log('   ✅ Circuit Breaker pattern');
            console.log('   ✅ Comunicação inter-service');
            console.log('   ✅ Aggregated endpoints');
            console.log('   ✅ Health checks distribuídos');
            console.log('   ✅ Database per Service (NoSQL)');
            console.log('   ✅ JSON-based document storage');
            console.log('   ✅ Full-text search capabilities');
            console.log('   ✅ Schema flexível com documentos aninhados');
            console.log('   ✅ Autenticação JWT entre serviços');
            console.log('   ✅ CRUD de listas de compras');
            console.log('   ✅ Gerenciamento de itens');
            console.log('   ✅ Sistema de categorias');

        } catch (error) {
            console.error('Erro na demonstração:', error.message);
            console.log('\nVerifique se todos os serviços estão rodando:');
            console.log('   User Service: http://127.0.0.1:3001/health');
            console.log('   Item Service: http://127.0.0.1:3002/health');
            console.log('   List Service: http://127.0.0.1:3003/health');
            console.log('   API Gateway: http://127.0.0.1:3000/health');
        }
    }

    // Helper para delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Executar demonstração
async function main() {
    // Verificar se os argumentos foram passados
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Uso: node client-demo.js [opções]');
        console.log('');
        console.log('Opções:');
        console.log('  --health    Verificar apenas saúde dos serviços');
        console.log('  --items     Listar apenas itens');
        console.log('  --lists     Listar listas de compras (requer auth)');
        console.log('  --search    Fazer busca (requer termo: --search=termo)');
        console.log('  --help      Mostrar esta ajuda');
        console.log('');
        console.log('Sem argumentos: Executar demonstração completa');
        return;
    }

    const client = new MicroservicesClient();
    
    try {
        if (args.includes('--health')) {
            await client.checkHealth();
        } else if (args.includes('--items')) {
            await client.getItems();
        } else if (args.includes('--lists')) {
            // Para listas, vamos tentar fazer login primeiro
            try {
                await client.login({
                    identifier: 'admin@microservices.com',
                    password: 'admin123'
                });
                await client.getLists();
            } catch (error) {
                console.log('Erro: Funcionalidade de listas requer autenticação');
                console.log('Use a demonstração completa para testar: node client-demo.js');
            }
        } else if (args.some(arg => arg.startsWith('--search'))) {
            const searchArg = args.find(arg => arg.startsWith('--search'));
            const searchTerm = searchArg.includes('=') ? searchArg.split('=')[1] : 'arroz';
            await client.search(searchTerm);
        } else {
            // Demonstração completa
            await client.runDemo();
        }
    } catch (error) {
        console.error('Erro na execução:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        console.error('Erro crítico:', error.message);
        process.exit(1);
    });
}

module.exports = MicroservicesClient;