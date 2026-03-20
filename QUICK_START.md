# 🚀 HyperLoc - Guia Rápido de Início

## ⚡ Inicialização Rápida (3 passos)

### Passo 1: Preparar o Ambiente
```bash
cd /home/ubuntu/hyperloc
./start.sh
```

### Passo 2: Iniciar Backend (Terminal 1)
```bash
npm run server
```

Você verá:
```
✅ Servidor Express iniciado na porta 5000
```

### Passo 3: Iniciar Frontend (Terminal 2)
```bash
npm run dev
```

Você verá:
```
  VITE v5.4.21  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🌐 Acessar o Sistema

Abra seu navegador em: **http://localhost:5173**

---

## 🔐 Login

### Credenciais Disponíveis

| Papel | Email | Senha |
|-------|-------|-------|
| **Super Admin** | super@hyperloc.com | admin123 |
| **Admin Empresa** | admin@hyperloc.com | 123456 |
| **Operador Comercial** | operador@hyperloc.com | 123456 |
| **Manutenção** | manutencao@hyperloc.com | 123456 |
| **Financeiro** | financeiro@hyperloc.com | 123456 |

---

## 📊 Primeiro Acesso

1. **Faça login** com: `admin@hyperloc.com` / `123456`
2. **Veja o Dashboard** com métricas
3. **Explore os módulos**:
   - 👥 Clientes
   - 🔧 Equipamentos
   - 📋 Orçamentos
   - 📦 Pedidos
   - 🔨 Manutenção
   - 💰 Financeiro

---

## 🗄️ Banco de Dados

### Criar/Resetar Banco de Dados

```bash
# Criar tabelas
npm run db:migrate

# Popular com dados de teste
npm run db:seed
```

### Credenciais do Banco

```
Host: localhost
Port: 3306
User: root
Password: root
Database: hyperloc
```

---

## 🐛 Troubleshooting

### Problema: "Vite está compilando há muito tempo"

**Solução:**
```bash
# Parar o processo (Ctrl+C)
# Depois execute:
rm -rf node_modules .vite dist
npm install --legacy-peer-deps
npm run dev
```

### Problema: "Erro de conexão com banco de dados"

**Solução:**
```bash
# Verificar se MySQL está rodando
# Criar banco de dados:
mysql -u root -p
CREATE DATABASE hyperloc;
EXIT;

# Executar migrações
npm run db:migrate
npm run db:seed
```

### Problema: "Porta 5000 ou 5173 já em uso"

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :5000
lsof -i :5173

# Matar processo
kill -9 <PID>
```

---

## 📚 Próximos Passos

1. **Explore a documentação**: `docs/README.md`
2. **Veja a API**: `docs/API_REFERENCE.md`
3. **Entenda a arquitetura**: `docs/MULTI_TENANT_ARCHITECTURE.md`
4. **Guia de desenvolvimento**: `docs/DEVELOPMENT_GUIDE.md`

---

## 💡 Dicas Úteis

### Limpar Cache do Navegador
Se tiver problemas visuais, limpe o cache:
- Chrome: `Ctrl+Shift+Delete`
- Safari: `Cmd+Shift+Delete`
- Firefox: `Ctrl+Shift+Delete`

### Modo de Desenvolvimento
O Vite oferece hot reload automático. Qualquer mudança no código é refletida instantaneamente no navegador.

### Verificar Logs
- **Backend**: Veja o terminal onde rodou `npm run server`
- **Frontend**: Abra o DevTools do navegador (F12)

---

## 🎯 Funcionalidades Principais

### Dashboard
- Métricas em tempo real
- Últimas transações
- Alertas de manutenção

### Clientes
- CRUD completo
- Filtros por tipo (PF/PJ)
- Status ativo/inativo

### Equipamentos
- Cadastro com múltiplos campos
- Categorização
- Tabelas de preço

### Orçamentos
- Criação com cliente
- Adição de itens
- Conversão em pedido

### Pedidos
- Contratos de locação
- Acompanhamento de status
- Integração com financeiro

### Manutenção
- Ordens preventiva/corretiva
- Histórico por equipamento
- Custos reais vs estimados

### Financeiro
- Lançamentos receber/pagar
- Contas bancárias
- Fluxo de caixa
- Relatório de inadimplência

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o arquivo `QUICK_START.md` (este arquivo)
2. Consulte `docs/DEVELOPMENT_GUIDE.md`
3. Veja `docs/API_REFERENCE.md` para endpoints

---

**Desenvolvido com ❤️ por HyperLoc Team**  
**Versão**: 1.0.0  
**Data**: 20 de Março de 2026
