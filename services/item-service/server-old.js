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
        this.serviceUrl = `http://127.0.0.1:${this.port}`;
        
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.seedInitialData();
    }

    setupDatabase() {
        const dbPath = path.join(__dirname, 'database');
        this.productsDb = new JsonDatabase(dbPath, 'products');
        console.log('Product Service: Banco NoSQL inicializado');
    }

    async seedInitialData() {
        // Aguardar inicialização e criar itens de exemplo para lista de compras
        setTimeout(async () => {
            try {
                const existingItems = await this.productsDb.find();
                
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
                            name: 'Papel Higiênico',
                            category: 'Limpeza',
                            brand: 'Personal',
                            unit: 'un',
                            averagePrice: 15.90,
                            barcode: '7891234567898',
                            description: 'Papel higiênico folha dupla, pacote com 12 rolos',
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
                        await this.productsDb.create(item);
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
                const productCount = await this.productsDb.count();
                const activeProducts = await this.productsDb.count({ active: true });
                
                res.json({
                    service: this.serviceName,
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: '1.0.0',
                    database: {
                        type: 'JSON-NoSQL',
                        productCount: productCount,
                        activeProducts: activeProducts
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
            console.error('Product Service Error:', error);
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

            const items = await this.productsDb.find(filter, {
                skip: skip,
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            });

            const total = await this.productsDb.count(filter);

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
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get product by ID
    async getProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await this.productsDb.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Create product (demonstrando schema NoSQL flexível)
    async createProduct(req, res) {
        try {
            const { 
                name, 
                description, 
                price, 
                stock, 
                category, 
                images, 
                tags, 
                specifications,
                featured = false
            } = req.body;

            if (!name || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome e preço são obrigatórios'
                });
            }

            // Criar produto com schema NoSQL flexível
            const newProduct = await this.productsDb.create({
                id: uuidv4(),
                name,
                description: description || '',
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                category: category || { name: 'Geral', slug: 'geral' },
                images: Array.isArray(images) ? images : (images ? [images] : []),
                tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
                specifications: specifications || {},
                active: true,
                featured: featured,
                metadata: {
                    createdBy: req.user.id,
                    createdByName: `${req.user.firstName} ${req.user.lastName}`
                }
            });

            res.status(201).json({
                success: true,
                message: 'Produto criado com sucesso',
                data: newProduct
            });
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Update product (demonstrando flexibilidade NoSQL)
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { 
                name, 
                description, 
                price, 
                stock, 
                category, 
                images, 
                tags, 
                specifications,
                active,
                featured
            } = req.body;

            const product = await this.productsDb.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            // Updates flexíveis com NoSQL
            const updates = {};
            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (price !== undefined) updates.price = parseFloat(price);
            if (stock !== undefined) updates.stock = parseInt(stock);
            if (category !== undefined) updates.category = category;
            if (images !== undefined) {
                updates.images = Array.isArray(images) ? images : (images ? [images] : []);
            }
            if (tags !== undefined) {
                updates.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
            }
            if (specifications !== undefined) {
                // Merge com especificações existentes
                updates.specifications = { ...product.specifications, ...specifications };
            }
            if (active !== undefined) updates.active = active;
            if (featured !== undefined) updates.featured = featured;

            // Adicionar metadata de atualização
            updates['metadata.lastUpdatedBy'] = req.user.id;
            updates['metadata.lastUpdatedByName'] = `${req.user.firstName} ${req.user.lastName}`;
            updates['metadata.lastUpdatedAt'] = new Date().toISOString();

            const updatedProduct = await this.productsDb.update(id, updates);

            res.json({
                success: true,
                message: 'Produto atualizado com sucesso',
                data: updatedProduct
            });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Delete product (soft delete)
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await this.productsDb.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            // Soft delete - desativar produto
            await this.productsDb.update(id, { 
                active: false,
                'metadata.deletedBy': req.user.id,
                'metadata.deletedByName': `${req.user.firstName} ${req.user.lastName}`,
                'metadata.deletedAt': new Date().toISOString()
            });

            res.json({
                success: true,
                message: 'Produto removido com sucesso'
            });
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Update stock
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, operation = 'set' } = req.body;

            const product = await this.productsDb.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            let newStock = product.stock;
            
            switch (operation) {
                case 'add':
                    newStock += parseInt(quantity);
                    break;
                case 'subtract':
                    newStock = Math.max(0, newStock - parseInt(quantity));
                    break;
                case 'set':
                default:
                    newStock = parseInt(quantity);
                    break;
            }

            await this.productsDb.update(id, { 
                stock: newStock,
                'metadata.lastStockUpdate': new Date().toISOString(),
                'metadata.lastStockUpdateBy': req.user.id
            });

            res.json({
                success: true,
                message: 'Estoque atualizado com sucesso',
                data: {
                    productId: id,
                    previousStock: product.stock,
                    newStock: newStock,
                    operation: operation,
                    quantity: parseInt(quantity)
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar estoque:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get categories (extraídas dos produtos)
    async getCategories(req, res) {
        try {
            const products = await this.productsDb.find({ active: true });
            
            // Extrair categorias únicas dos produtos (demonstrando flexibilidade NoSQL)
            const categoriesMap = new Map();
            products.forEach(product => {
                if (product.category) {
                    const key = product.category.slug || product.category.name;
                    if (!categoriesMap.has(key)) {
                        categoriesMap.set(key, {
                            name: product.category.name,
                            slug: product.category.slug || product.category.name.toLowerCase().replace(/\s+/g, '-'),
                            productCount: 0
                        });
                    }
                    categoriesMap.get(key).productCount++;
                }
            });

            const categories = Array.from(categoriesMap.values())
                .sort((a, b) => a.name.localeCompare(b.name));
            
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Search products (demonstrando busca NoSQL)
    async searchProducts(req, res) {
        try {
            const { q, limit = 20, category } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Parâmetro de busca "q" é obrigatório'
                });
            }

            // Busca full-text NoSQL
            let products = await this.productsDb.search(q, ['name', 'description', 'tags']);
            
            // Filtrar apenas produtos ativos
            products = products.filter(product => product.active);

            // Filtrar por categoria se especificada
            if (category) {
                products = products.filter(product => 
                    product.category?.slug === category || product.category?.name === category
                );
            }

            // Aplicar limite
            products = products.slice(0, parseInt(limit));

            res.json({
                success: true,
                data: {
                    query: q,
                    category: category || null,
                    results: products,
                    total: products.length
                }
            });
        } catch (error) {
            console.error('Erro na busca de produtos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Register with service registry
    registerWithRegistry() {
        serviceRegistry.register(this.serviceName, {
            url: this.serviceUrl,
            version: '1.0.0',
            database: 'JSON-NoSQL',
            endpoints: ['/health', '/products', '/categories', '/search']
        });
    }

    // Start health check reporting
    startHealthReporting() {
        setInterval(() => {
            serviceRegistry.updateHealth(this.serviceName, true);
        }, 30000);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('=====================================');
            console.log(`Product Service iniciado na porta ${this.port}`);
            console.log(`URL: ${this.serviceUrl}`);
            console.log(`Health: ${this.serviceUrl}/health`);
            console.log(`Database: JSON-NoSQL`);
            console.log('=====================================');
            
            // Register with service registry
            this.registerWithRegistry();
            this.startHealthReporting();
        });
    }
}

// Start service
if (require.main === module) {
    const productService = new ProductService();
    productService.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
        serviceRegistry.unregister('product-service');
        process.exit(0);
    });
    process.on('SIGINT', () => {
        serviceRegistry.unregister('product-service');
        process.exit(0);
    });
}

module.exports = ItemService;