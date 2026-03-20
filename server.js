import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, createDatabaseIfNotExists } from './src/db/connection.js';
import authRoutes from './src/routes/auth.js';
import tenantsRoutes from './src/routes/tenants.js';
import clientesRoutes from './src/routes/clientes.js';
import equipamentosRoutes from './src/routes/equipamentos.js';
import comercialRoutes from './src/routes/comercial.js';
import manutencaoRoutes from './src/routes/manutencao.js';
import financeiroRoutes from './src/routes/financeiro.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HyperLoc API is running' });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/tenants', tenantsRoutes);
app.use('/clientes', clientesRoutes);
app.use('/equipamentos', equipamentosRoutes);
app.use('/comercial', comercialRoutes);
app.use('/manutencao', manutencaoRoutes);
app.use('/financeiro', financeiroRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Inicializar servidor
async function startServer() {
  try {
    console.log('🚀 Starting HyperLoc API Server...');
    
    // Criar banco de dados se não existir
    await createDatabaseIfNotExists();
    
    // Inicializar conexão com banco
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Endpoints disponíveis`);
      console.log(`   - POST   /auth/login`);
      console.log(`   - GET    /tenants (super admin)`);
      console.log(`   - GET    /clientes`);
      console.log(`   - GET    /equipamentos`);
      console.log(`   - GET    /comercial/orcamentos`);
      console.log(`   - GET    /comercial/pedidos`);
      console.log(`   - GET    /manutencao`);
      console.log(`   - GET    /financeiro/lancamentos`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
