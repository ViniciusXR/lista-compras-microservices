const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const axios = require('axios');

// Importar banco NoSQL e service registry
const JsonDatabase = require('../../shared/JsonDatabase');
const serviceRegistry = require('../../shared/serviceRegistry');

class ItemService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3002;
        this.serviceName = 'item-service';
        this.serviceUrl = `http://localhost:${this.port}`;
        
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.seedInitialData();
    }

    setupDatabase() {
        const dbPath = path.join(__dirname, 'database');
        this.itemsDb = new JsonDatabase(dbPath, 'items');
        console.log('Item Service: Banco NoSQL inicializado');
    }

    async seedInitialData() {
        // Aguardar inicialização e criar itens de exemplo para lista de compras
        setTimeout(async () => {
            try {
                const existingItems = await this.itemsDb.find();
                
                if (existingItems.length === 0) {
                    const sampleItems = [
                        // Alimentos
                        {
                            id: uuidv4(),
                            name: 'Arroz Branco Tipo 1',
                            category: 'Alimentos',
                            brand: 'Camil',
                            unit: 'kg',
                            averagePrice: 4.50,
                            barcode: '7891234567890',
                            description: 'Arroz branco tipo 1, pacote de 1kg',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Feijão Preto',
                            category: 'Alimentos',
                            brand: 'Kicaldo',
                            unit: 'kg',
                            averagePrice: 8.90,
                            barcode: '7891234567891',
                            description: 'Feijão preto tipo 1, pacote de 1kg',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Açúcar Cristal',
                            category: 'Alimentos',
                            brand: 'União',
                            unit: 'kg',
                            averagePrice: 3.20,
                            barcode: '7891234567892',
                            description: 'Açúcar cristal refinado, pacote de 1kg',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Óleo de Soja',
                            category: 'Alimentos',
                            brand: 'Soya',
                            unit: 'litro',
                            averagePrice: 5.80,
                            barcode: '7891234567893',
                            description: 'Óleo de soja refinado, garrafa de 900ml',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Macarrão Espaguete',
                            category: 'Alimentos',
                            brand: 'Barilla',
                            unit: 'un',
                            averagePrice: 4.20,
                            barcode: '7891234567894',
                            description: 'Macarrão espaguete, pacote de 500g',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        // Limpeza
                        {
                            id: uuidv4(),
                            name: 'Detergente Líquido',
                            category: 'Limpeza',
                            brand: 'Ypê',
                            unit: 'un',
                            averagePrice: 2.50,
                            barcode: '7891234567895',
                            description: 'Detergente líquido neutro, frasco de 500ml',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Água Sanitária',
                            category: 'Limpeza',
                            brand: 'Candida',
                            unit: 'litro',
                            averagePrice: 3.90,
                            barcode: '7891234567896',
                            description: 'Água sanitária, frasco de 1 litro',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Sabão em Pó',
                            category: 'Limpeza',
                            brand: 'OMO',
                            unit: 'kg',
                            averagePrice: 12.90,
                            barcode: '7891234567897',
                            description: 'Sabão em pó concentrado, caixa de 1kg',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Escova de dentes',
                            category: 'Limpeza',
                            brand: 'Flosserbrush',
                            unit: 'un',
                            averagePrice: 15.90,
                            barcode: '7891234567898',
                            description: 'Escova de dentes, embalagem com 1 unidade',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        // Higiene
                        {
                            id: uuidv4(),
                            name: 'Shampoo Anticaspa',
                            category: 'Higiene',
                            brand: 'Head & Shoulders',
                            unit: 'un',
                            averagePrice: 18.90,
                            barcode: '7891234567899',
                            description: 'Shampoo anticaspa, frasco de 400ml',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Pasta de Dente',
                            category: 'Higiene',
                            brand: 'Colgate',
                            unit: 'un',
                            averagePrice: 5.90,
                            barcode: '7891234567900',
                            description: 'Pasta de dente total 12, tubo de 90g',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Sabonete Líquido',
                            category: 'Higiene',
                            brand: 'Dove',
                            unit: 'un',
                            averagePrice: 12.50,
                            barcode: '7891234567901',
                            description: 'Sabonete líquido hidratante, refil de 250ml',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Desodorante Aerosol',
                            category: 'Higiene',
                            brand: 'Rexona',
                            unit: 'un',
                            averagePrice: 8.90,
                            barcode: '7891234567902',
                            description: 'Desodorante aerosol masculino, 150ml',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        // Bebidas
                        {
                            id: uuidv4(),
                            name: 'Refrigerante Cola',
                            category: 'Bebidas',
                            brand: 'Coca-Cola',
                            unit: 'litro',
                            averagePrice: 6.50,
                            barcode: '7891234567903',
                            description: 'Refrigerante de cola, garrafa de 2 litros',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Suco de Laranja',
                            category: 'Bebidas',
                            brand: 'Del Valle',
                            unit: 'litro',
                            averagePrice: 4.20,
                            barcode: '7891234567904',
                            description: 'Suco de laranja natural, caixa de 1 litro',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Água Mineral',
                            category: 'Bebidas',
                            brand: 'Crystal',
                            unit: 'litro',
                            averagePrice: 2.80,
                            barcode: '7891234567905',
                            description: 'Água mineral sem gás, garrafa de 1,5 litros',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        // Padaria
                        {
                            id: uuidv4(),
                            name: 'Pão Francês',
                            category: 'Padaria',
                            brand: 'Padaria Local',
                            unit: 'kg',
                            averagePrice: 8.50,
                            barcode: '7891234567906',
                            description: 'Pão francês fresco, vendido por kg',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Pão de Forma Integral',
                            category: 'Padaria',
                            brand: 'Wickbold',
                            unit: 'un',
                            averagePrice: 7.90,
                            barcode: '7891234567907',
                            description: 'Pão de forma integral, pacote com 20 fatias',
                            active: true,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: uuidv4(),
                            name: 'Bolo de Chocolate',
                            category: 'Padaria',
                            brand: 'Padaria Local',
                            unit: 'un',
                            averagePrice: 15.90,
                            barcode: '7891234567908',
                            description: 'Bolo de chocolate caseiro, fatia individual',
                            active: true,
                            createdAt: new Date().toISOString()
                        }
                    ];

                    for (const item of sampleItems) {
                        await this.itemsDb.create(item);
                    }

                    console.log('20 itens de lista de compras criados no Item Service');
                }
            } catch (error) {
                console.error('Erro ao criar dados iniciais:', error);
            }
        }, 1000);
    }

    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('combined'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Service info headers
        this.app.use((req, res, next) => {
            res.setHeader('X-Service', this.serviceName);
            res.setHeader('X-Service-Version', '1.0.0');
            res.setHeader('X-Database', 'JSON-NoSQL');
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', async (req, res) => {
            try {
                const itemCount = await this.itemsDb.count();
                const activeItems = await this.itemsDb.count({ active: true });
                
                res.json({
                    service: this.serviceName,
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: '1.0.0',
                    database: {
                        type: 'JSON-NoSQL',
                        itemCount: itemCount,
                        activeItems: activeItems
                    }
                });
            } catch (error) {
                res.status(503).json({
                    service: this.serviceName,
                    status: 'unhealthy',
                    error: error.message
                });
            }
        });

        // Service info
        this.app.get('/', (req, res) => {
            res.json({
                service: 'Item Service',
                version: '1.0.0',
                description: 'Microsserviço para catálogo de itens/produtos para lista de compras',
                database: 'JSON-NoSQL',
                endpoints: [
                    'GET /items',
                    'GET /items/:id',
                    'POST /items',
                    'PUT /items/:id',
                    'GET /categories',
                    'GET /search'
                ]
            });
        });

        // Item routes (seguindo especificação)
        this.app.get('/items', this.getItems.bind(this));
        this.app.get('/items/:id', this.getItem.bind(this));
        this.app.post('/items', this.authMiddleware.bind(this), this.createItem.bind(this));
        this.app.put('/items/:id', this.authMiddleware.bind(this), this.updateItem.bind(this));

        // Category routes
        this.app.get('/categories', this.getCategories.bind(this));

        // Search route
        this.app.get('/search', this.searchItems.bind(this));
    }

    setupErrorHandling() {
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint não encontrado',
                service: this.serviceName
            });
        });

        this.app.use((error, req, res, next) => {
            console.error('Item Service Error:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do serviço',
                service: this.serviceName
            });
        });
    }

    // Auth middleware (valida token com User Service)
    async authMiddleware(req, res, next) {
        const authHeader = req.header('Authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token obrigatório'
            });
        }

        try {
            // Descobrir User Service
            const userService = serviceRegistry.discover('user-service');
            
            // Validar token com User Service
            const response = await axios.post(`${userService.url}/auth/validate`, {
                token: authHeader.replace('Bearer ', '')
            }, { timeout: 5000 });

            if (response.data.success) {
                req.user = response.data.data.user;
                next();
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }
        } catch (error) {
            console.error('Erro na validação do token:', error.message);
            res.status(503).json({
                success: false,
                message: 'Serviço de autenticação indisponível'
            });
        }
    }

    // Get items com filtros (categoria, nome)
    async getItems(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                name,
                active = true
            } = req.query;
            
            const skip = (page - 1) * parseInt(limit);
            
            // Filtros para itens
            const filter = { active: active === 'true' };

            // Filtrar por categoria
            if (category) {
                filter.category = category;
            }

            // Filtrar por nome (busca parcial)
            if (name) {
                filter.name = { $regex: name, $options: 'i' };
            }

            const items = await this.itemsDb.find(filter, {
                skip: skip,
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            });

            const total = await this.itemsDb.count(filter);

            res.json({
                success: true,
                data: items,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get item específico
    async getItem(req, res) {
        try {
            const { id } = req.params;
            const item = await this.itemsDb.findOne({ id: id });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Item não encontrado'
                });
            }

            res.json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error('Erro ao buscar item:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Criar novo item
    async createItem(req, res) {
        try {
            const { name, category, brand, unit, averagePrice, barcode, description } = req.body;

            if (!name || !category || !brand || !unit || averagePrice === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obrigatórios: name, category, brand, unit, averagePrice'
                });
            }

            // Verificar se categoria é válida
            const validCategories = ['Alimentos', 'Limpeza', 'Higiene', 'Bebidas', 'Padaria'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria deve ser uma das: ' + validCategories.join(', ')
                });
            }

            const newItem = await this.itemsDb.create({
                id: uuidv4(),
                name: name,
                category: category,
                brand: brand,
                unit: unit,
                averagePrice: parseFloat(averagePrice),
                barcode: barcode || '',
                description: description || '',
                active: true,
                createdAt: new Date().toISOString()
            });

            res.status(201).json({
                success: true,
                message: 'Item criado com sucesso',
                data: newItem
            });
        } catch (error) {
            console.error('Erro ao criar item:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar item
    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const { name, category, brand, unit, averagePrice, barcode, description, active } = req.body;

            const item = await this.itemsDb.findOne({ id: id });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Item não encontrado'
                });
            }

            const updates = {};
            if (name !== undefined) updates.name = name;
            if (category !== undefined) {
                // Validar categoria
                const validCategories = ['Alimentos', 'Limpeza', 'Higiene', 'Bebidas', 'Padaria'];
                if (!validCategories.includes(category)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Categoria deve ser uma das: ' + validCategories.join(', ')
                    });
                }
                updates.category = category;
            }
            if (brand !== undefined) updates.brand = brand;
            if (unit !== undefined) updates.unit = unit;
            if (averagePrice !== undefined) updates.averagePrice = parseFloat(averagePrice);
            if (barcode !== undefined) updates.barcode = barcode;
            if (description !== undefined) updates.description = description;
            if (active !== undefined) updates.active = active;

            const updatedItem = await this.itemsDb.update({ id: id }, updates);

            res.json({
                success: true,
                message: 'Item atualizado com sucesso',
                data: updatedItem
            });
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get categories
    async getCategories(req, res) {
        try {
            const categories = [
                'Alimentos',
                'Limpeza', 
                'Higiene',
                'Bebidas',
                'Padaria'
            ];

            // Contar itens por categoria
            const categoriesWithCount = [];
            for (const category of categories) {
                const count = await this.itemsDb.count({ category: category, active: true });
                categoriesWithCount.push({
                    name: category,
                    slug: category.toLowerCase(),
                    itemCount: count
                });
            }

            res.json({
                success: true,
                data: categoriesWithCount
            });
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Search items
    async searchItems(req, res) {
        try {
            const { q, limit = 10 } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Parâmetro de busca "q" é obrigatório'
                });
            }

            // Buscar itens que contenham o termo no nome ou descrição
            const items = await this.itemsDb.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { brand: { $regex: q, $options: 'i' } }
                ],
                active: true
            }, {
                limit: parseInt(limit),
                sort: { name: 1 }
            });

            res.json({
                success: true,
                data: {
                    query: q,
                    results: items,
                    count: items.length
                }
            });
        } catch (error) {
            console.error('Erro na busca de itens:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Start server
    start() {
        this.app.listen(this.port, () => {
            console.log(`Item Service running on port ${this.port}`);
            
            // Registrar no service registry
            serviceRegistry.register(this.serviceName, {
                url: this.serviceUrl,
                version: '1.0.0',
                description: 'Microsserviço para catálogo de itens/produtos'
            });
        });
    }
}

// Inicializar e startar o serviço
const itemService = new ItemService();
itemService.start();

module.exports = ItemService;