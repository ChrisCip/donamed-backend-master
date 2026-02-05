import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger.js';

const logger = Logger.create('Prisma');

// Extender globalThis para incluir prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Singleton pattern for PrismaClient
// Prevents multiple instances during hot reloading in development
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ] 
    : [{ level: 'error', emit: 'event' }],
});

// Eventos de logging de Prisma
prisma.$on('query' as never, (e: { query: string; params: string; duration: number }) => {
  logger.debug(`Query: ${e.query}`, { params: e.params, duration: `${e.duration}ms` });
});

prisma.$on('error' as never, (e: { message: string }) => {
  logger.error(`Database Error: ${e.message}`);
});

prisma.$on('warn' as never, (e: { message: string }) => {
  logger.warn(`Database Warning: ${e.message}`);
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Verificar conexión a la base de datos
 * @returns Promise<boolean> - true si la conexión es exitosa
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('Probando conexión a la base de datos...');
    
    // Verificar que DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL no está configurada en el archivo .env');
      return false;
    }

    // Ocultar contraseña en el log
    const urlForLog = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
    logger.debug(`URL de conexión: ${urlForLog}`);

    // Intentar conectar
    await prisma.$connect();
    logger.info('✅ Conexión a base de datos establecida correctamente');
    
    // Hacer una query simple para verificar
    await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('✅ Query de prueba ejecutada correctamente');
    
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar con la base de datos:', error);
    
    // Proporcionar información útil según el tipo de error
    if (error instanceof Error) {
      if (error.message.includes('Authentication failed')) {
        logger.error('💡 SOLUCIÓN: Verifica que la contraseña en DATABASE_URL sea correcta');
        logger.error('   - No uses corchetes [ ] alrededor de la contraseña');
        logger.error('   - La contraseña la encuentras en Supabase Dashboard > Settings > Database');
      } else if (error.message.includes('Connection refused')) {
        logger.error('💡 SOLUCIÓN: El servidor de base de datos no está accesible');
        logger.error('   - Verifica que el host y puerto sean correctos');
        logger.error('   - Verifica tu conexión a internet');
      } else if (error.message.includes('timeout')) {
        logger.error('💡 SOLUCIÓN: La conexión tardó demasiado');
        logger.error('   - Verifica tu conexión a internet');
        logger.error('   - El servidor de Supabase podría estar lento');
      }
    }
    
    return false;
  }
}

/**
 * Desconectar de la base de datos
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Conexión a base de datos cerrada');
  } catch (error) {
    logger.error('Error al cerrar conexión:', error);
  }
}

export default prisma;
