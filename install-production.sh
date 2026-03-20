#!/bin/bash

# ============================================================================
# Script de Instalação Automática do HyperLoc no cPanel
# ============================================================================

set -e

echo "🚀 Iniciando instalação do HyperLoc em produção..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ============================================================================

echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado${NC}"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
echo -e "${GREEN}✅ MySQL: $(mysql --version)${NC}"
echo ""

# ============================================================================
# 2. CRIAR BANCO DE DADOS
# ============================================================================

echo -e "${YELLOW}🗄️  Criando banco de dados...${NC}"

mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS hyperloc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'hyperloc_user'@'localhost' IDENTIFIED BY 'HyperLoc@2024!';
GRANT ALL PRIVILEGES ON hyperloc_db.* TO 'hyperloc_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✅ Banco de dados criado${NC}"
echo ""

# ============================================================================
# 3. INSTALAR DEPENDÊNCIAS
# ============================================================================

echo -e "${YELLOW}📦 Instalando dependências...${NC}"

npm install
npm run build

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# ============================================================================
# 4. CRIAR ARQUIVO .ENV
# ============================================================================

echo -e "${YELLOW}🔐 Configurando variáveis de ambiente...${NC}"

if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=hyperloc_user
DB_PASSWORD=HyperLoc@2024!
DB_NAME=hyperloc_db

# JWT
JWT_SECRET=HyperLoc_JWT_Secret_Key_2024_Production_Mode

# Servidor
PORT=3000
NODE_ENV=production

# Frontend
VITE_API_URL=https://hypersul.com.br/api
EOF
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env já existe, pulando...${NC}"
fi
echo ""

# ============================================================================
# 5. EXECUTAR MIGRAÇÕES
# ============================================================================

echo -e "${YELLOW}🔄 Executando migrações do banco de dados...${NC}"

npm run db:migrate || echo -e "${YELLOW}⚠️  Migrações podem já ter sido executadas${NC}"
npm run db:seed || echo -e "${YELLOW}⚠️  Seed pode já ter sido executado${NC}"

echo -e "${GREEN}✅ Banco de dados configurado${NC}"
echo ""

# ============================================================================
# 6. INSTALAR PM2
# ============================================================================

echo -e "${YELLOW}⚙️  Instalando PM2...${NC}"

npm install -g pm2

echo -e "${GREEN}✅ PM2 instalado${NC}"
echo ""

# ============================================================================
# 7. INICIAR APLICAÇÕES COM PM2
# ============================================================================

echo -e "${YELLOW}🚀 Iniciando aplicações com PM2...${NC}"

pm2 kill || true
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ Aplicações iniciadas${NC}"
echo ""

# ============================================================================
# 8. ATIVAR AUTO-STARTUP
# ============================================================================

echo -e "${YELLOW}🔄 Configurando auto-startup...${NC}"

pm2 startup
pm2 save

echo -e "${GREEN}✅ Auto-startup configurado${NC}"
echo ""

# ============================================================================
# 9. CRIAR DIRETÓRIOS NECESSÁRIOS
# ============================================================================

echo -e "${YELLOW}📁 Criando diretórios...${NC}"

mkdir -p logs
mkdir -p public/uploads
chmod -R 755 logs
chmod -R 755 public/uploads

echo -e "${GREEN}✅ Diretórios criados${NC}"
echo ""

# ============================================================================
# 10. VERIFICAÇÃO FINAL
# ============================================================================

echo -e "${YELLOW}✅ Verificando status...${NC}"
echo ""

pm2 list
echo ""

echo -e "${GREEN}🎉 Instalação concluída com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "1. Acesse: https://hypersul.com.br"
echo "2. Email: admin@hyperloc.com"
echo "3. Senha: 123456"
echo ""
echo -e "${YELLOW}📊 Ver logs:${NC}"
echo "  pm2 logs"
echo ""
echo -e "${YELLOW}🔄 Reiniciar:${NC}"
echo "  pm2 restart all"
echo ""
echo -e "${YELLOW}⛔ Parar:${NC}"
echo "  pm2 stop all"
echo ""
