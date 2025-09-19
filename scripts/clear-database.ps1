# scripts/clear-database.ps1
# Script PowerShell para limpar o banco de dados

param(
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host "🧹 Script de Limpeza do Banco de Dados" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USO:" -ForegroundColor Yellow
    Write-Host "  .\scripts\clear-database.ps1          # Com confirmação"
    Write-Host "  .\scripts\clear-database.ps1 -Force   # Sem confirmação"
    Write-Host "  .\scripts\clear-database.ps1 -Help    # Mostra esta ajuda"
    Write-Host ""
    Write-Host "DESCRIÇÃO:" -ForegroundColor Yellow
    Write-Host "  Remove todos os dados dos bancos JSON dos microsserviços"
    Write-Host "  Mantém a estrutura dos arquivos (arrays vazios e objetos vazios)"
    Write-Host ""
    exit 0
}

Write-Host "🧹 Script de Limpeza do Banco de Dados" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if (-not $Force) {
    $confirmation = Read-Host "⚠️  Esta ação irá remover TODOS os dados do banco. Confirma? (s/N)"
    if ($confirmation -ne "s" -and $confirmation -ne "sim" -and $confirmation -ne "S" -and $confirmation -ne "SIM") {
        Write-Host "❌ Operação cancelada pelo usuário." -ForegroundColor Red
        exit 0
    }
}

try {
    if ($Force) {
        node scripts/clear-database.js --force
    } else {
        node scripts/clear-database.js
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✨ Comando executado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
        Write-Host "  1. npm run demo     # Para popular com dados de exemplo"
        Write-Host "  2. npm start        # Para iniciar os serviços"
        Write-Host ""
    }
} catch {
    Write-Host "❌ Erro ao executar o script: $_" -ForegroundColor Red
    exit 1
}