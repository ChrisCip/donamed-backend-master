import 'dotenv/config';
import app from './app.js';
import { testDatabaseConnection, disconnectDatabase } from './config/prisma.js';
import { Logger } from './utils/logger.js';
import { Server } from 'http';

const logger = Logger.create('Server');
const PORT = process.env.PORT || 3000;

// ==========================================================
// INICIAR SERVIDOR
// ==========================================================

async function startServer(): Promise<void> {
  logger.info('Iniciando servidor DONAMED...');
  
  // Verificar configuración de entorno
  logger.info('Verificando variables de entorno...');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    logger.error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  logger.info('✅ Variables de entorno configuradas');

  // Probar conexión a la base de datos ANTES de iniciar el servidor
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    logger.error('❌ No se pudo conectar a la base de datos. El servidor NO se iniciará.');
    logger.error('Por favor, verifica tu archivo .env y las credenciales de la base de datos.');
    process.exit(1);
  }

  // Iniciar servidor HTTP
  const server: Server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🏥  DONAMED API - BACKEND SERVER 🏥            ║
║                                                           ║
║   Sistema de Gestión de Donaciones de Medicamentos        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅  Servidor ejecutándose en: http://localhost:${PORT}
✅  Entorno: ${process.env.NODE_ENV || 'development'}
✅  Base de datos: CONECTADA
✅  Health check: http://localhost:${PORT}/health

📚  Documentación API (Swagger): http://localhost:${PORT}/api-docs

📋  Endpoints disponibles:
   - GET  /api/v1/perfil        (Obtener perfil de usuario)
   - PUT  /api/v1/perfil        (Actualizar perfil)
   - GET  /api/v1/solicitudes   (Historial de solicitudes)

⏰  Iniciado: ${new Date().toLocaleString('es-DO')}
    `);
  });

  // Configurar manejo de cierre graceful
  setupGracefulShutdown(server);
}

// ==========================================================
// MANEJO DE CIERRE GRACEFUL
// ==========================================================

function setupGracefulShutdown(server: Server): void {
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.warn(`${signal} recibido. Cerrando servidor...`);
    
    server.close(async () => {
      logger.info('Servidor HTTP cerrado');
      
      // Desconectar Prisma
      await disconnectDatabase();
      
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      logger.error('No se pudo cerrar gracefully, forzando cierre...');
      process.exit(1);
    }, 10000);
  };

  // Escuchar señales de terminación
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Manejo de errores no capturados
  process.on('unhandledRejection', (err: Error) => {
    logger.error('Unhandled Rejection:', err);
    gracefulShutdown('UNHANDLED_REJECTION');
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
}

// Iniciar servidor
startServer().catch((err) => {
  logger.error('Error fatal al iniciar servidor:', err);
  process.exit(1);
});
