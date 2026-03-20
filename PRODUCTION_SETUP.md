# 🚀 HyperLoc - Configuração de Produção Permanente

## ✅ Status Atual

O HyperLoc está configurado como um **site permanente** 24/7 usando PM2.

### Processos em Execução

```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ hyperloc-api       │ fork     │ 30   │ online    │ 0%       │ 66.0mb   │
│ 2  │ hyperloc-frontend  │ fork     │ 0    │ online    │ 0%       │ 61.0mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

---

## 🌐 URLs de Acesso

### Frontend (Interface do Sistema)
```
https://5173-i2fqi2g7kvshbnj0lq5of-4033cc0a.us2.manus.computer
```

### Backend (API)
```
https://5000-i2fqi2g7kvshbnj0lq5of-4033cc0a.us2.manus.computer
```

---

## 🔐 Credenciais de Acesso

| Papel | Email | Senha |
|-------|-------|-------|
| **Admin Empresa** | admin@hyperloc.com | 123456 |
| **Super Admin** | super@hyperloc.com | admin123 |
| **Operador Comercial** | operador@hyperloc.com | 123456 |
| **Manutenção** | manutencao@hyperloc.com | 123456 |
| **Financeiro** | financeiro@hyperloc.com | 123456 |

---

## 📊 Monitoramento

### Ver Status dos Processos
```bash
pm2 list
```

### Ver Logs em Tempo Real
```bash
pm2 logs
```

### Ver Logs de um Processo Específico
```bash
pm2 logs hyperloc-api
pm2 logs hyperloc-frontend
```

### Ver Histórico de Logs
```bash
pm2 logs --lines 100
```

---

## 🔄 Gerenciamento de Processos

### Reiniciar Todos os Processos
```bash
pm2 restart all
```

### Reiniciar um Processo Específico
```bash
pm2 restart hyperloc-api
pm2 restart hyperloc-frontend
```

### Parar Todos os Processos
```bash
pm2 stop all
```

### Iniciar Todos os Processos
```bash
pm2 start all
```

### Deletar um Processo
```bash
pm2 delete hyperloc-api
```

---

## 💾 Auto-Startup

O PM2 foi configurado para **iniciar automaticamente** após reinicialização do servidor.

### Verificar Status do Auto-Startup
```bash
systemctl status pm2-ubuntu
```

### Desabilitar Auto-Startup
```bash
pm2 unstartup systemd
```

### Reabilitar Auto-Startup
```bash
pm2 startup
pm2 save
```

---

## 📈 Monitoramento Avançado

### Monitoramento em Tempo Real (Dashboard)
```bash
pm2 monit
```

### Estatísticas Detalhadas
```bash
pm2 info hyperloc-api
pm2 info hyperloc-frontend
```

### Histórico de Restarts
```bash
pm2 list
# Coluna "↺" mostra número de restarts
```

---

## 🔧 Troubleshooting

### Problema: Processo Não Inicia

**Verificar logs:**
```bash
pm2 logs hyperloc-api --lines 50
```

**Reiniciar:**
```bash
pm2 restart hyperloc-api
```

### Problema: Porta em Uso

**Encontrar processo usando a porta:**
```bash
lsof -i :5000
lsof -i :5173
```

**Matar processo:**
```bash
kill -9 <PID>
```

### Problema: Memória Muito Alta

**Verificar uso de memória:**
```bash
pm2 list
```

**Reiniciar processo:**
```bash
pm2 restart hyperloc-api
```

---

## 📝 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `server-demo.js` | API backend |
| `src/main.jsx` | Frontend entry point |
| `ecosystem.config.js` | Configuração PM2 |
| `/home/ubuntu/.pm2/dump.pm2` | Estado salvo do PM2 |
| `/home/ubuntu/.pm2/logs/` | Diretório de logs |

---

## 🚀 Próximos Passos

### 1. Configurar Banco de Dados Permanente
Atualmente usando dados em memória. Para produção:
```bash
npm run db:migrate
npm run db:seed
# Depois alterar server-demo.js para usar MySQL
```

### 2. Configurar HTTPS/SSL
Usar Nginx com Let's Encrypt para SSL

### 3. Configurar Domínio Customizado
Apontar domínio para o servidor

### 4. Backup Automático
Configurar backup diário do banco de dados

### 5. Monitoramento Externo
Integrar com serviço de monitoramento (ex: PM2 Plus)

---

## 📞 Comandos Úteis

```bash
# Ir para diretório do projeto
cd /home/ubuntu/hyperloc

# Ver status
pm2 list

# Ver logs
pm2 logs

# Reiniciar tudo
pm2 restart all

# Salvar estado
pm2 save

# Deletar tudo
pm2 delete all

# Parar daemon
pm2 kill
```

---

## 🎯 Resumo

✅ **Sistema rodando 24/7**  
✅ **Auto-restart em caso de falha**  
✅ **Auto-startup após reinicialização**  
✅ **Monitoramento de processos**  
✅ **Logs centralizados**  

---

**Desenvolvido com ❤️ por HyperLoc Team**  
**Data**: 20 de Março de 2026  
**Versão**: 1.0.0
