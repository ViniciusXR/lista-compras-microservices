#!/usr/bin/env node

// scripts/clear-database.js
const fs = require('fs-extra');
const path = require('path');

/**
 * Script para limpar todos os dados do banco de dados JSON
 * Remove todos os registros mas mantém a estrutura dos arquivos
 */

const ROOT_DIR = path.join(__dirname, '..');

const DATABASE_PATHS = [
    'services/user-service/database',
    'services/item-service/database', 
    'services/list-service/database'
];

const DATABASE_FILES = [
    'users.json',
    'users_index.json',
    'items.json',
    'items_index.json',
    'lists.json',
    'lists_index.json'
];

async function clearDatabase() {
    console.log('🗑️  Iniciando limpeza do banco de dados...\n');

    try {
        for (const dbPath of DATABASE_PATHS) {
            const fullPath = path.join(ROOT_DIR, dbPath);
            
            console.log(`📁 Limpando: ${dbPath}`);
            
            // Verificar se o diretório existe
            if (!await fs.pathExists(fullPath)) {
                console.log(`   ⚠️  Diretório não encontrado: ${fullPath}`);
                continue;
            }

            // Listar arquivos no diretório
            const files = await fs.readdir(fullPath);
            
            for (const file of files) {
                const filePath = path.join(fullPath, file);
                
                if (file.endsWith('.json')) {
                    if (file.endsWith('_index.json')) {
                        // Arquivos de índice: limpar objeto
                        await fs.writeJson(filePath, {}, { spaces: 2 });
                        console.log(`   ✅ Índice limpo: ${file}`);
                    } else {
                        // Arquivos de dados: limpar array
                        await fs.writeJson(filePath, [], { spaces: 2 });
                        console.log(`   ✅ Dados limpos: ${file}`);
                    }
                }
            }
        }

        console.log('\n🎉 Limpeza do banco de dados concluída com sucesso!');
        console.log('\n📊 Status dos arquivos:');
        
        // Verificar o status final
        for (const dbPath of DATABASE_PATHS) {
            const fullPath = path.join(ROOT_DIR, dbPath);
            
            if (await fs.pathExists(fullPath)) {
                const files = await fs.readdir(fullPath);
                const jsonFiles = files.filter(f => f.endsWith('.json'));
                
                console.log(`   📁 ${dbPath}: ${jsonFiles.length} arquivos JSON`);
                
                for (const file of jsonFiles) {
                    const filePath = path.join(fullPath, file);
                    const data = await fs.readJson(filePath);
                    const isEmpty = Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0;
                    console.log(`      ${isEmpty ? '✅' : '❌'} ${file}: ${isEmpty ? 'vazio' : 'contém dados'}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Erro ao limpar banco de dados:', error.message);
        process.exit(1);
    }
}

async function confirmAction() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('⚠️  Esta ação irá remover TODOS os dados do banco. Confirma? (s/N): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
        });
    });
}

async function main() {
    console.log('🧹 Script de Limpeza do Banco de Dados');
    console.log('=====================================\n');
    
    // Verificar argumentos da linha de comando
    const forceMode = process.argv.includes('--force') || process.argv.includes('-f');
    
    if (!forceMode) {
        const confirmed = await confirmAction();
        if (!confirmed) {
            console.log('❌ Operação cancelada pelo usuário.');
            process.exit(0);
        }
    }

    await clearDatabase();
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Erro inesperado:', error);
        process.exit(1);
    });
}

module.exports = { clearDatabase };