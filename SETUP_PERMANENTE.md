# 🎯 Guia Passo a Passo: Deploy Permanente do HyperLoc

## 📌 Resumo Executivo

Este guia mostra como transformar o HyperLoc em um **site permanente 24/7** rodando no seu servidor cPanel em `hypersul.com.br`.

---

## ✅ Checklist de Preparação

- [ ] Acesso SSH ao servidor (ou acesso via cPanel Terminal)
- [ ] Banco de dados MySQL criado
- [ ] Node.js instalado no servidor
- [ ] Domínio apontando para o servidor
- [ ] Certificado SSL/HTTPS configurado

---

## 🚀 Passo 1: Conectar ao Servidor via SSH

```bash
# Abra um terminal no seu computador e execute:
ssh hypersul@hypersul.com.br

# Digite sua senha quando solicitado
```

**Se não tiver SSH, use o Terminal do cPanel:**
1. Acesse: https://hypersul.com.br:2083
2. Vá para: **Advanced** → **Terminal**
3. Execute os comandos lá

---

## 📥 Passo 2: Clonar o Repositório

```bash
# Navegar para o diretório web
cd /home/hypersul/public_html

# Clonar o repositório do GitHub
git clone https://github.com/armsoul/HyperLoc.git hyperloc

# Entrar na pasta
cd hyperloc
```

---

## 🗄️ Passo 3: Criar Banco de Dados

### Opção A: Via phpMyAdmin (Recomendado para iniciantes)

1. Acesse: https://hypersul.com.br:2083
2. Clique em **Databases** → **phpMyAdmin**
3. Clique em **SQL** no topo
4. Cole este código:

```sql
CREATE DATABASE hyperloc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hyperloc_user'@'localhost' IDENTIFIED BY 'HyperLoc@2024!';
GRANT ALL PRIVILEGES ON hyperloc_db.* TO 'hyperloc_user'@'localhost';
FLUSH PRIVILEGES;
```

5. Clique em **Go**

### Opção B: Via SSH (Mais rápido)

```bash
mysql -u root << 'EOF'
CREATE DATABASE hyperloc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hyperloc_user'@'localhost' IDENTIFIED BY 'HyperLoc@2024!';
GRANT ALL PRIVILEGES ON hyperloc_db.* TO 'hyperloc_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

```bash
# Ainda na pasta /home/hypersul/public_html/hyperloc

# Criar arquivo .env
cat > .env << 'EOF'
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=hyperloc_user
DB_PASSWORD=HyperLoc@2024!
DB_NAME=hyperloc_db

# JWT
JWT_SECRET=HyperLoc_JWT_Secret_Key_2024_Production_Mode_Secure

# Servidor
PORT=3000
NODE_ENV=production

# Frontend
VITE_API_URL=https://hypersul.com.br/api
EOF
```

---

## 📦 Passo 5: Instalar Dependências

```bash
# Instalar pacotes npm
npm install

# Compilar o frontend para produção
npm run build
```

⏱️ **Isso pode levar 5-10 minutos**

---

## 🗄️ Passo 6: Configurar Banco de Dados

```bash
# Executar migrações
npm run db:migrate

# Popular com dados de teste
npm run db:seed
```

---

## ⚙️ Passo 7: Instalar e Configurar PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicações com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar auto-startup (para reiniciar após reboot do servidor)
pm2 startup
pm2 save
```

---

## 🌐 Passo 8: Configurar Proxy (Apache/Nginx)

### Para cPanel com Apache

1. Acesse: https://hypersul.com.br:2083
2. Vá para: **Domains**
3. Clique em seu domínio
4. Vá para: **Redirects** ou **Addon Domains**
5. Configure para apontar para `localhost:3000`

**Ou via arquivo .htaccess:**

```bash
# Criar arquivo .htaccess na raiz
cat > /home/hypersul/public_html/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Não reescrever arquivos/diretórios existentes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Proxy para Node.js na porta 3000
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

---

## 🔒 Passo 9: Verificar SSL/HTTPS

1. Acesse: https://hypersul.com.br:2083
2. Vá para: **SSL/TLS**
3. Clique em **Manage SSL sites**
4. Se não tiver certificado, instale Let's Encrypt (gratuito)

---

## ✅ Passo 10: Testar o Sistema

```bash
# Ver status dos processos
pm2 list

# Ver logs em tempo real
pm2 logs

# Testar acesso local
curl http://localhost:3000

# Testar acesso remoto (no navegador)
# https://hypersul.com.br
```

---

## 🔗 Acessar o Sistema

Após completar todos os passos:

**URL**: https://hypersul.com.br

**Credenciais de Teste:**
- Email: `admin@hyperloc.com`
- Senha: `123456`

---

## 📊 Monitorar o Sistema

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Ver logs de um app específico
pm2 logs hyperloc-api

# Reiniciar tudo
pm2 restart all

# Parar tudo
pm2 stop all

# Iniciar tudo
pm2 start all

# Deletar um app
pm2 delete hyperloc-api
```

---

## 🔄 Atualizar o Sistema

Quando houver atualizações no GitHub:

```bash
cd /home/hypersul/public_html/hyperloc

# Puxar as atualizações
git pull origin main

# Reinstalar dependências (se necessário)
npm install

# Compilar frontend
npm run build

# Reiniciar aplicações
pm2 restart all
```

---

## 🛠️ Troubleshooting

### ❌ Erro: "Port 3000 is already in use"

```bash
# Encontrar processo na porta 3000
lsof -i :3000

# Matar processo (substitua PID pelo número)
kill -9 <PID>

# Reiniciar PM2
pm2 restart all
```

### ❌ Erro: "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart all
```

### ❌ Erro: "Database connection failed"

```bash
# Verificar credenciais do banco
mysql -u hyperloc_user -p -h localhost hyperloc_db

# Verificar arquivo .env
cat .env

# Testar conexão
npm run db:test
```

### ❌ Site não abre no navegador

```bash
# Verificar se PM2 está rodando
pm2 list

# Ver logs de erro
pm2 logs hyperloc-api
pm2 logs hyperloc-frontend

# Verificar se porta 3000 está escutando
netstat -tulpn | grep 3000
```

---

## 📞 Suporte

Para problemas ou dúvidas:

1. **Consulte os logs**: `pm2 logs`
2. **Verifique o README**: `/README.md`
3. **Veja a documentação**: `/docs/`
4. **Abra uma issue no GitHub**: https://github.com/armsoul/HyperLoc/issues

---

## 🎉 Parabéns!

Seu HyperLoc está agora **permanente e rodando 24/7** em produção!

**Próximas recomendações:**
- ✅ Fazer backup regular do banco de dados
- ✅ Monitorar logs regularmente
- ✅ Atualizar Node.js periodicamente
- ✅ Configurar alertas de erro
- ✅ Implementar HTTPS/SSL (já feito!)

---

**Desenvolvido com ❤️ por Manus**
