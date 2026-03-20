# 🚀 Guia de Deploy do HyperLoc no cPanel

## 📋 Pré-requisitos

- Acesso SSH ao servidor cPanel
- Node.js 18+ instalado (ou disponível via cPanel)
- MySQL/MariaDB (já disponível no cPanel)
- PM2 para gerenciar processos

---

## 🔧 Passo 1: Criar Banco de Dados

### Via cPanel (phpMyAdmin)
1. Acesse: `https://hypersul.com.br:2083`
2. Vá para **Databases** → **phpMyAdmin**
3. Clique em **SQL** no topo
4. Cole o seguinte código:

```sql
CREATE DATABASE hyperloc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hyperloc_user'@'localhost' IDENTIFIED BY 'HyperLoc@2024!';
GRANT ALL PRIVILEGES ON hyperloc_db.* TO 'hyperloc_user'@'localhost';
FLUSH PRIVILEGES;
```

5. Clique em **Go** para executar

---

## 📥 Passo 2: Fazer Upload dos Arquivos

### Opção A: Via FTP/SFTP
1. Baixe o projeto do GitHub: `https://github.com/armsoul/HyperLoc`
2. Extraia o arquivo
3. Conecte via FTP usando:
   - **Host**: hypersul.com.br
   - **Usuário**: hypersul
   - **Senha**: xxalrm919091@@@
4. Faça upload da pasta `hyperloc` para `/home/hypersul/public_html/hyperloc`

### Opção B: Via SSH (Recomendado)
```bash
# Conectar ao servidor
ssh hypersul@hypersul.com.br

# Clonar repositório
cd /home/hypersul/public_html
git clone https://github.com/armsoul/HyperLoc.git hyperloc
cd hyperloc
```

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << 'EOF'
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=hyperloc_user
DB_PASSWORD=HyperLoc@2024!
DB_NAME=hyperloc_db

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456

# Servidor
PORT=3000
NODE_ENV=production

# Frontend
VITE_API_URL=https://hypersul.com.br/api
EOF
```

---

## 📦 Passo 4: Instalar Dependências

```bash
# Instalar Node.js (se não estiver instalado)
# cPanel geralmente já tem disponível

# Instalar dependências do projeto
npm install

# Compilar o frontend
npm run build
```

---

## 🗄️ Passo 5: Criar e Popular Banco de Dados

```bash
# Executar migrações
npm run db:migrate

# Popular com dados de teste
npm run db:seed
```

---

## ⚙️ Passo 6: Configurar PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicações com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Ativar auto-startup
pm2 startup
pm2 save
```

---

## 🌐 Passo 7: Configurar Nginx/Apache para Proxy

### Para Nginx (se disponível)
Criar arquivo `/etc/nginx/sites-available/hyperloc`:

```nginx
server {
    listen 80;
    server_name hypersul.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Para Apache (cPanel padrão)
Criar arquivo `.htaccess` em `/home/hypersul/public_html/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Proxy para Node.js
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

---

## 🔒 Passo 8: Configurar SSL/HTTPS

1. Acesse cPanel
2. Vá para **SSL/TLS**
3. Clique em **Manage SSL sites**
4. Selecione seu domínio
5. Instale certificado (cPanel oferece Let's Encrypt gratuito)

---

## ✅ Verificação Final

```bash
# Verificar status dos processos
pm2 list

# Ver logs
pm2 logs

# Testar acesso
curl http://localhost:3000
curl https://hypersul.com.br
```

---

## 🔗 Acessar o Sistema

Após completar todos os passos:

- **URL**: https://hypersul.com.br
- **Email**: admin@hyperloc.com
- **Senha**: 123456

---

## 🛠️ Troubleshooting

### Porta 3000 já em uso
```bash
# Encontrar processo na porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro de permissões
```bash
# Dar permissões corretas
chmod -R 755 /home/hypersul/public_html/hyperloc
chmod -R 777 /home/hypersul/public_html/hyperloc/logs
```

### Banco de dados não conecta
```bash
# Verificar credenciais
mysql -u hyperloc_user -p -h localhost hyperloc_db
```

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação: `/docs/`
- GitHub: https://github.com/armsoul/HyperLoc
- README: `/README.md`

---

**Deploy Concluído! 🎉**
