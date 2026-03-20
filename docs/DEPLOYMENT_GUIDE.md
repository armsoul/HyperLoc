# Guia de Deployment - HyperLoc

## 📋 Índice

1. [Preparação para Produção](#preparação-para-produção)
2. [Deployment em Servidor Linux](#deployment-em-servidor-linux)
3. [Deployment com Docker](#deployment-com-docker)
4. [Deployment em Plataformas Cloud](#deployment-em-plataformas-cloud)
5. [Configuração de SSL/TLS](#configuração-de-ssltls)
6. [Backup e Recuperação](#backup-e-recuperação)
7. [Monitoramento](#monitoramento)

---

## Preparação para Produção

### 1. Variáveis de Ambiente

Criar arquivo `.env.production`:

```bash
NODE_ENV=production
PORT=5000
VITE_API_URL=https://api.hyperloc.com

# Database
DB_HOST=db.production.com
DB_PORT=3306
DB_USER=hyperloc_user
DB_PASSWORD=senha_super_segura_aqui
DB_NAME=hyperloc

# JWT
JWT_SECRET=chave_secreta_muito_segura_min_32_caracteres
JWT_EXPIRES_IN=24h

# App
APP_NAME=HyperLoc
APP_VERSION=1.0.0
APP_URL=https://hyperloc.com

# CORS
CORS_ORIGIN=https://hyperloc.com,https://www.hyperloc.com

# Logs
LOG_LEVEL=info
```

### 2. Build do Frontend

```bash
npm run build
# Resultado em: dist/
```

### 3. Verificação de Segurança

- [ ] JWT_SECRET tem pelo menos 32 caracteres
- [ ] NODE_ENV está definido como 'production'
- [ ] Senhas do banco de dados são fortes
- [ ] CORS está restritivo
- [ ] Variáveis sensíveis não estão no git

---

## Deployment em Servidor Linux

### 1. Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### 2. Clonar Repositório

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/hyperloc.git
cd hyperloc
sudo chown -R $USER:$USER /var/www/hyperloc
```

### 3. Instalar Dependências

```bash
npm install --production
npm run build
```

### 4. Configurar Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE hyperloc;
CREATE USER 'hyperloc_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON hyperloc.* TO 'hyperloc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Executar migrações
npm run db:migrate
npm run db:seed
```

### 5. Configurar PM2

```bash
# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'hyperloc-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configurar Nginx

```bash
# Criar arquivo de configuração
sudo cat > /etc/nginx/sites-available/hyperloc << 'EOF'
upstream hyperloc_backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name api.hyperloc.com;

  # Redirecionar HTTP para HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.hyperloc.com;

  ssl_certificate /etc/letsencrypt/live/api.hyperloc.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.hyperloc.com/privkey.pem;

  # Configurações SSL
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Logs
  access_log /var/log/nginx/hyperloc_access.log;
  error_log /var/log/nginx/hyperloc_error.log;

  # Proxy para backend
  location / {
    proxy_pass http://hyperloc_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Servir frontend estático
  location /static/ {
    alias /var/www/hyperloc/dist/;
    expires 1y;
  }
}

# Frontend
server {
  listen 443 ssl http2;
  server_name hyperloc.com www.hyperloc.com;

  ssl_certificate /etc/letsencrypt/live/hyperloc.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/hyperloc.com/privkey.pem;

  root /var/www/hyperloc/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://hyperloc_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
EOF

# Ativar configuração
sudo ln -s /etc/nginx/sites-available/hyperloc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot certonly --nginx -d api.hyperloc.com -d hyperloc.com -d www.hyperloc.com

# Renovação automática
sudo systemctl enable certbot.timer
```

---

## Deployment com Docker

### 1. Criar Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos
COPY package*.json ./
COPY . .

# Instalar dependências
RUN npm ci --only=production

# Build frontend
RUN npm run build

# Expor porta
EXPOSE 5000

# Comando de inicialização
CMD ["node", "server.js"]
```

### 2. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

volumes:
  db_data:
```

### 3. Build e Deploy

```bash
# Build image
docker build -t hyperloc:1.0 .

# Executar container
docker-compose up -d

# Verificar logs
docker-compose logs -f api
```

---

## Deployment em Plataformas Cloud

### Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create hyperloc-api

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_secreta
heroku config:set DB_HOST=seu_db_host
heroku config:set DB_USER=seu_db_user
heroku config:set DB_PASSWORD=sua_db_senha
heroku config:set DB_NAME=hyperloc

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### AWS EC2

```bash
# Lançar instância
# - Ubuntu 22.04 LTS
# - t3.medium ou superior
# - Security Group: 80, 443, 22

# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ip-publico

# Seguir passos de "Deployment em Servidor Linux"
```

### DigitalOcean App Platform

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Configurar banco de dados MySQL
4. Deploy automático

---

## Configuração de SSL/TLS

### Renovação Automática de Certificados

```bash
# Verificar status
sudo systemctl status certbot.timer

# Testar renovação
sudo certbot renew --dry-run

# Renovar manualmente
sudo certbot renew
```

### HSTS (HTTP Strict Transport Security)

Adicionar ao Nginx:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## Backup e Recuperação

### Backup do Banco de Dados

```bash
# Backup completo
mysqldump -u hyperloc_user -p hyperloc > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup com compressão
mysqldump -u hyperloc_user -p hyperloc | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup automático (cron)
0 2 * * * mysqldump -u hyperloc_user -p hyperloc | gzip > /backups/hyperloc_$(date +\%Y\%m\%d).sql.gz
```

### Restaurar Backup

```bash
# Restaurar de arquivo
mysql -u hyperloc_user -p hyperloc < backup_20260320.sql

# Restaurar de arquivo comprimido
gunzip < backup_20260320.sql.gz | mysql -u hyperloc_user -p hyperloc
```

### Backup de Arquivos

```bash
# Backup de código e configurações
tar -czf hyperloc_backup_$(date +%Y%m%d).tar.gz /var/www/hyperloc

# Enviar para S3
aws s3 cp hyperloc_backup_*.tar.gz s3://seu-bucket-backup/
```

---

## Monitoramento

### PM2 Monitoring

```bash
# Instalar PM2 Plus
pm2 install pm2-auto-pull

# Dashboard
pm2 monit

# Logs
pm2 logs hyperloc-api
```

### Nginx Monitoring

```bash
# Verificar status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/hyperloc_access.log
sudo tail -f /var/log/nginx/hyperloc_error.log
```

### Alertas

```bash
# Monitorar uso de CPU/Memória
watch -n 1 'ps aux | grep node'

# Monitorar conexões de banco de dados
mysql -u hyperloc_user -p -e "SHOW PROCESSLIST;"
```

### Health Check

```bash
# Verificar saúde da API
curl https://api.hyperloc.com/health

# Resposta esperada
{"status":"ok","message":"HyperLoc API is running"}
```

---

## Checklist de Deployment

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrado
- [ ] Frontend buildado
- [ ] SSL/TLS configurado
- [ ] Nginx configurado
- [ ] PM2 iniciado
- [ ] Backups configurados
- [ ] Monitoramento ativo
- [ ] Logs sendo registrados
- [ ] Health check funcionando
- [ ] Domínio apontando para servidor
- [ ] Firewall configurado
- [ ] Rate limiting ativo
- [ ] CORS restritivo
- [ ] Testes de segurança realizados

---

## Troubleshooting

### Problema: Conexão com Banco de Dados Falha

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais
mysql -u hyperloc_user -p -h db.production.com hyperloc

# Verificar logs
sudo tail -f /var/log/mysql/error.log
```

### Problema: Porta 5000 já em uso

```bash
# Encontrar processo
lsof -i :5000

# Matar processo
kill -9 <PID>
```

### Problema: Certificado SSL expirado

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

**Última atualização**: 2026-03-20  
**Versão**: 1.0
