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

class ListService {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3003;
        this.serviceName = 'list-service';
        this.serviceUrl = `http://localhost:${this.port}`;
        
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupDatabase() {
        const dbPath = path.join(__dirname, 'database');
        this.listsDb = new JsonDatabase(dbPath, 'lists');
        console.log('List Service: Banco NoSQL inicializado');
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
                const listCount = await this.listsDb.count();
                const activeLists = await this.listsDb.count({ status: 'active' });
                
                res.json({
                    service: this.serviceName,
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    version: '1.0.0',
                    database: {
                        type: 'JSON-NoSQL',
                        listCount: listCount,
                        activeLists: activeLists
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
                service: 'List Service',
                version: '1.0.0',
                description: 'Microsserviço para gerenciamento de listas de compras com NoSQL',
                database: 'JSON-NoSQL',
                endpoints: [
                    'POST /lists',
                    'GET /lists',
                    'GET /lists/:id',
                    'PUT /lists/:id',
                    'DELETE /lists/:id',
                    'POST /lists/:id/items',
                    'PUT /lists/:id/items/:itemId',
                    'DELETE /lists/:id/items/:itemId',
                    'GET /lists/:id/summary'
                ]
            });
        });

        // List routes (all protected)
        this.app.post('/lists', this.authMiddleware.bind(this), this.createList.bind(this));
        this.app.get('/lists', this.authMiddleware.bind(this), this.getUserLists.bind(this));
        this.app.get('/lists/:id', this.authMiddleware.bind(this), this.getList.bind(this));
        this.app.put('/lists/:id', this.authMiddleware.bind(this), this.updateList.bind(this));
        this.app.delete('/lists/:id', this.authMiddleware.bind(this), this.deleteList.bind(this));
        
        // List items routes
        this.app.post('/lists/:id/items', this.authMiddleware.bind(this), this.addItemToList.bind(this));
        this.app.put('/lists/:id/items/:itemId', this.authMiddleware.bind(this), this.updateListItem.bind(this));
        this.app.delete('/lists/:id/items/:itemId', this.authMiddleware.bind(this), this.removeItemFromList.bind(this));
        
        // List summary
        this.app.get('/lists/:id/summary', this.authMiddleware.bind(this), this.getListSummary.bind(this));
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
            console.error('List Service Error:', error);
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

    // Criar nova lista
    async createList(req, res) {
        try {
            const { name, description } = req.body;
            const userId = req.user.id;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome da lista é obrigatório'
                });
            }

            const newList = await this.listsDb.create({
                id: uuidv4(),
                userId: userId,
                name: name,
                description: description || '',
                status: 'active',
                items: [],
                summary: {
                    totalItems: 0,
                    purchasedItems: 0,
                    estimatedTotal: 0
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            res.status(201).json({
                success: true,
                message: 'Lista criada com sucesso',
                data: newList
            });
        } catch (error) {
            console.error('Erro ao criar lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Listar listas do usuário
    async getUserLists(req, res) {
        try {
            const userId = req.user.id;
            const { status = 'active', page = 1, limit = 10 } = req.query;
            
            const filter = { userId: userId };
            if (status && status !== 'all') {
                filter.status = status;
            }

            const skip = (page - 1) * parseInt(limit);
            const lists = await this.listsDb.find(filter, {
                skip: skip,
                limit: parseInt(limit),
                sort: { updatedAt: -1 }
            });

            const total = await this.listsDb.count(filter);

            res.json({
                success: true,
                data: {
                    lists: lists,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao buscar listas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar lista específica
    async getList(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            res.json({
                success: true,
                data: list
            });
        } catch (error) {
            console.error('Erro ao buscar lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar lista
    async updateList(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { name, description, status } = req.body;

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            const updates = {
                updatedAt: new Date().toISOString()
            };

            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (status !== undefined && ['active', 'completed', 'archived'].includes(status)) {
                updates.status = status;
            }

            const updatedList = await this.listsDb.update({ id: id, userId: userId }, updates);

            res.json({
                success: true,
                message: 'Lista atualizada com sucesso',
                data: updatedList
            });
        } catch (error) {
            console.error('Erro ao atualizar lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Deletar lista
    async deleteList(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            await this.listsDb.delete({ id: id, userId: userId });

            res.json({
                success: true,
                message: 'Lista removida com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Adicionar item à lista
    async addItemToList(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { itemId, quantity, unit, estimatedPrice, notes } = req.body;

            if (!itemId || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'ItemId e quantity são obrigatórios'
                });
            }

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            // Buscar dados do item no Item Service
            let itemName = 'Item';
            let itemUnit = unit || 'un';
            let itemPrice = estimatedPrice || 0;

            try {
                const itemService = serviceRegistry.discover('item-service');
                const itemResponse = await axios.get(`${itemService.url}/items/${itemId}`, { timeout: 5000 });
                
                if (itemResponse.data.success) {
                    const item = itemResponse.data.data;
                    itemName = item.name;
                    itemUnit = item.unit || itemUnit;
                    itemPrice = estimatedPrice || item.averagePrice || 0;
                }
            } catch (error) {
                console.warn('Não foi possível buscar dados do item:', error.message);
            }

            // Verificar se item já existe na lista
            const existingItemIndex = list.items.findIndex(item => item.itemId === itemId);
            
            if (existingItemIndex !== -1) {
                // Atualizar item existente
                list.items[existingItemIndex].quantity = quantity;
                list.items[existingItemIndex].unit = itemUnit;
                list.items[existingItemIndex].estimatedPrice = itemPrice;
                list.items[existingItemIndex].notes = notes || '';
            } else {
                // Adicionar novo item
                list.items.push({
                    itemId: itemId,
                    itemName: itemName,
                    quantity: quantity,
                    unit: itemUnit,
                    estimatedPrice: itemPrice,
                    purchased: false,
                    notes: notes || '',
                    addedAt: new Date().toISOString()
                });
            }

            // Recalcular summary
            this.calculateSummary(list);

            // Salvar lista atualizada
            const updatedList = await this.listsDb.update(
                { id: id, userId: userId },
                {
                    items: list.items,
                    summary: list.summary,
                    updatedAt: new Date().toISOString()
                }
            );

            res.json({
                success: true,
                message: 'Item adicionado à lista com sucesso',
                data: updatedList
            });
        } catch (error) {
            console.error('Erro ao adicionar item à lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar item na lista
    async updateListItem(req, res) {
        try {
            const { id, itemId } = req.params;
            const userId = req.user.id;
            const { quantity, unit, estimatedPrice, purchased, notes } = req.body;

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            const itemIndex = list.items.findIndex(item => item.itemId === itemId);

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Item não encontrado na lista'
                });
            }

            // Atualizar item
            if (quantity !== undefined) list.items[itemIndex].quantity = quantity;
            if (unit !== undefined) list.items[itemIndex].unit = unit;
            if (estimatedPrice !== undefined) list.items[itemIndex].estimatedPrice = estimatedPrice;
            if (purchased !== undefined) list.items[itemIndex].purchased = purchased;
            if (notes !== undefined) list.items[itemIndex].notes = notes;

            // Recalcular summary
            this.calculateSummary(list);

            // Salvar lista atualizada
            const updatedList = await this.listsDb.update(
                { id: id, userId: userId },
                {
                    items: list.items,
                    summary: list.summary,
                    updatedAt: new Date().toISOString()
                }
            );

            res.json({
                success: true,
                message: 'Item atualizado com sucesso',
                data: updatedList
            });
        } catch (error) {
            console.error('Erro ao atualizar item na lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Remover item da lista
    async removeItemFromList(req, res) {
        try {
            const { id, itemId } = req.params;
            const userId = req.user.id;

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            const itemIndex = list.items.findIndex(item => item.itemId === itemId);

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Item não encontrado na lista'
                });
            }

            // Remover item
            list.items.splice(itemIndex, 1);

            // Recalcular summary
            this.calculateSummary(list);

            // Salvar lista atualizada
            const updatedList = await this.listsDb.update(
                { id: id, userId: userId },
                {
                    items: list.items,
                    summary: list.summary,
                    updatedAt: new Date().toISOString()
                }
            );

            res.json({
                success: true,
                message: 'Item removido da lista com sucesso',
                data: updatedList
            });
        } catch (error) {
            console.error('Erro ao remover item da lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Resumo da lista
    async getListSummary(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const list = await this.listsDb.findOne({ id: id, userId: userId });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'Lista não encontrada'
                });
            }

            // Recalcular summary para garantir dados atualizados
            this.calculateSummary(list);

            res.json({
                success: true,
                data: {
                    listId: list.id,
                    listName: list.name,
                    status: list.status,
                    summary: list.summary,
                    lastUpdated: list.updatedAt
                }
            });
        } catch (error) {
            console.error('Erro ao buscar resumo da lista:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Helper para calcular summary
    calculateSummary(list) {
        const totalItems = list.items.length;
        const purchasedItems = list.items.filter(item => item.purchased).length;
        const estimatedTotal = list.items.reduce((total, item) => {
            return total + (item.quantity * item.estimatedPrice);
        }, 0);

        list.summary = {
            totalItems: totalItems,
            purchasedItems: purchasedItems,
            estimatedTotal: Math.round(estimatedTotal * 100) / 100 // Arredondar para 2 casas decimais
        };
    }

    // Start server
    start() {
        this.app.listen(this.port, () => {
            console.log(`List Service running on port ${this.port}`);
            
            // Registrar no service registry
            serviceRegistry.register(this.serviceName, {
                url: this.serviceUrl,
                version: '1.0.0',
                description: 'Microsserviço para gerenciamento de listas de compras'
            });
        });
    }
}

// Inicializar e startar o serviço
const listService = new ListService();
listService.start();

module.exports = ListService;