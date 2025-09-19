#!/usr/bin/env node

// scripts/populate-sample-data.js
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Script para popular o banco de dados com dados de exemplo
 * Útil após limpar o banco ou para demonstrações
 */

const ROOT_DIR = path.join(__dirname, '..');

// Dados de exemplo
const SAMPLE_DATA = {
    users: [
        {
            id: 'user-admin-001',
            name: 'Administrador',
            email: 'admin@listadecompras.com',
            password: '$2b$10$K7L8C5hG9nF4mQ2R7vY8jO.xW6V5bZ9cX2mN4pQ8rT5uI1yA3sD7f', // senha: admin123
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'user-test-001',
            name: 'Usuário Teste',
            email: 'teste@example.com',
            password: '$2b$10$abc123def456ghi789jkl012mno345pqr678stu901vwx234yzA567B', // senha: teste123
            role: 'user',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    
    items: [
        {
            id: 'item-001',
            name: 'Arroz Branco',
            category: 'Grãos e Cereais',
            description: 'Arroz branco tipo 1, pacote 5kg',
            brand: 'Camil',
            averagePrice: 18.50,
            barcode: '7891234567890',
            unit: 'kg',
            isActive: true,
            nutritionalInfo: {
                calories: 130,
                carbs: 28,
                protein: 2.7,
                fat: 0.3
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-002',
            name: 'Feijão Preto',
            category: 'Grãos e Cereais',
            description: 'Feijão preto tipo 1, pacote 1kg',
            brand: 'Kicaldo',
            averagePrice: 8.90,
            barcode: '7891234567891',
            unit: 'kg',
            isActive: true,
            nutritionalInfo: {
                calories: 339,
                carbs: 61,
                protein: 21,
                fat: 1.2
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-003',
            name: 'Leite Integral',
            category: 'Laticínios',
            description: 'Leite integral UHT, caixa 1L',
            brand: 'Itambé',
            averagePrice: 4.25,
            barcode: '7891234567892',
            unit: 'L',
            isActive: true,
            nutritionalInfo: {
                calories: 61,
                carbs: 4.8,
                protein: 3.2,
                fat: 3.5
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-004',
            name: 'Pão de Forma',
            category: 'Padaria',
            description: 'Pão de forma integral, pacote 500g',
            brand: 'Wickbold',
            averagePrice: 6.80,
            barcode: '7891234567893',
            unit: 'un',
            isActive: true,
            nutritionalInfo: {
                calories: 253,
                carbs: 45,
                protein: 9,
                fat: 4.5
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-005',
            name: 'Banana Prata',
            category: 'Frutas',
            description: 'Banana prata madura',
            brand: null,
            averagePrice: 5.50,
            barcode: null,
            unit: 'kg',
            isActive: true,
            nutritionalInfo: {
                calories: 89,
                carbs: 23,
                protein: 1.1,
                fat: 0.3
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    
    lists: [
        {
            id: 'list-001',
            userId: 'user-test-001',
            name: 'Compras da Semana',
            description: 'Lista de compras básicas para a semana',
            status: 'active',
            items: [
                {
                    itemId: 'item-001',
                    quantity: 1,
                    unit: 'kg',
                    estimatedPrice: 18.50,
                    notes: 'Arroz tipo 1',
                    completed: false,
                    addedAt: new Date().toISOString()
                },
                {
                    itemId: 'item-002',
                    quantity: 2,
                    unit: 'kg',
                    estimatedPrice: 17.80,
                    notes: 'Feijão preto',
                    completed: false,
                    addedAt: new Date().toISOString()
                },
                {
                    itemId: 'item-003',
                    quantity: 3,
                    unit: 'L',
                    estimatedPrice: 12.75,
                    notes: 'Leite integral',
                    completed: true,
                    addedAt: new Date().toISOString()
                }
            ],
            totalItems: 3,
            completedItems: 1,
            estimatedTotal: 49.05,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]
};

async function populateDatabase() {
    console.log('🌱 Iniciando população do banco de dados...\n');

    try {
        // Popular Users
        const usersPath = path.join(ROOT_DIR, 'services/user-service/database/users.json');
        const usersIndexPath = path.join(ROOT_DIR, 'services/user-service/database/users_index.json');
        
        await fs.writeJson(usersPath, SAMPLE_DATA.users, { spaces: 2 });
        
        const usersIndex = {};
        SAMPLE_DATA.users.forEach(user => {
            usersIndex[user.id] = {
                id: user.id,
                updatedAt: user.updatedAt
            };
        });
        await fs.writeJson(usersIndexPath, usersIndex, { spaces: 2 });
        
        console.log(`👥 Usuários: ${SAMPLE_DATA.users.length} registros adicionados`);

        // Popular Items
        const itemsPath = path.join(ROOT_DIR, 'services/item-service/database/items.json');
        const itemsIndexPath = path.join(ROOT_DIR, 'services/item-service/database/items_index.json');
        
        await fs.writeJson(itemsPath, SAMPLE_DATA.items, { spaces: 2 });
        
        const itemsIndex = {};
        SAMPLE_DATA.items.forEach(item => {
            itemsIndex[item.id] = {
                id: item.id,
                updatedAt: item.updatedAt
            };
        });
        await fs.writeJson(itemsIndexPath, itemsIndex, { spaces: 2 });
        
        console.log(`📦 Itens: ${SAMPLE_DATA.items.length} registros adicionados`);

        // Popular Lists
        const listsPath = path.join(ROOT_DIR, 'services/list-service/database/lists.json');
        const listsIndexPath = path.join(ROOT_DIR, 'services/list-service/database/lists_index.json');
        
        await fs.writeJson(listsPath, SAMPLE_DATA.lists, { spaces: 2 });
        
        const listsIndex = {};
        SAMPLE_DATA.lists.forEach(list => {
            listsIndex[list.id] = {
                id: list.id,
                updatedAt: list.updatedAt
            };
        });
        await fs.writeJson(listsIndexPath, listsIndex, { spaces: 2 });
        
        console.log(`📋 Listas: ${SAMPLE_DATA.lists.length} registros adicionados`);

        console.log('\n🎉 População do banco de dados concluída com sucesso!');
        console.log('\n📝 DADOS CRIADOS:');
        console.log('   👤 Usuários:');
        SAMPLE_DATA.users.forEach(user => {
            console.log(`      • ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        
        console.log('   📦 Itens:');
        SAMPLE_DATA.items.forEach(item => {
            console.log(`      • ${item.name} - ${item.category} - R$ ${item.averagePrice}`);
        });
        
        console.log('   📋 Listas:');
        SAMPLE_DATA.lists.forEach(list => {
            console.log(`      • ${list.name} - ${list.items.length} itens - R$ ${list.estimatedTotal}`);
        });

        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('   1. npm start        # Iniciar os serviços');
        console.log('   2. npm run demo     # Testar o sistema');
        console.log('   3. Acesse: http://localhost:3000/health');

    } catch (error) {
        console.error('❌ Erro ao popular banco de dados:', error.message);
        process.exit(1);
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    populateDatabase().catch(error => {
        console.error('❌ Erro inesperado:', error);
        process.exit(1);
    });
}

module.exports = { populateDatabase, SAMPLE_DATA };