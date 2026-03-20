#!/bin/bash

# HyperLoc - Script de Inicialização

echo "🚀 Iniciando HyperLoc..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "${BLUE}📦 Instalando dependências...${NC}"
  npm install --legacy-peer-deps
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo "${BLUE}⚙️  Criando arquivo .env...${NC}"
  cp .env.example .env
fi

echo ""
echo "${GREEN}✅ Sistema pronto para iniciar!${NC}"
echo ""
echo "Para iniciar o sistema, execute em dois terminais diferentes:"
echo ""
echo "${BLUE}Terminal 1 (Backend):${NC}"
echo "  npm run server"
echo ""
echo "${BLUE}Terminal 2 (Frontend):${NC}"
echo "  npm run dev"
echo ""
echo "Depois acesse: http://localhost:5173"
echo ""
echo "Credenciais de teste:"
echo "  Email: admin@hyperloc.com"
echo "  Senha: 123456"
echo ""
