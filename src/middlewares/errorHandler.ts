import { Request, Response, NextFunction } from 'express';
import type { ApiResponse, AppError } from '../types/index.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.create('ErrorHandler');

/**
 * Middleware centralizado para manejo de errores
 * Captura todos los errores y devuelve una respuesta consistente
 */
const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log detallado del error siempre
  logger.error(`Error capturado en ${_req.method} ${_req.path}:`, err);

  // Establecer código de estado (por defecto 500)
  const statusCode = err.statusCode || 500;

  // Preparar respuesta de error
  const errorResponse: ApiResponse = {
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // Errores específicos de Prisma
  if (err.code) {
    logger.warn(`Error de Prisma detectado - Código: ${err.code}`);
    
    switch (err.code) {
      case 'P2002':
        errorResponse.error = { message: 'Ya existe un registro con esos datos únicos' };
        res.status(409).json(errorResponse);
        return;
      case 'P2025':
        errorResponse.error = { message: 'Registro no encontrado' };
        res.status(404).json(errorResponse);
        return;
      case 'P2003':
        errorResponse.error = { message: 'Error de referencia: registro relacionado no existe' };
        res.status(400).json(errorResponse);
        return;
      case 'P2014':
        errorResponse.error = { message: 'Error de relación entre modelos' };
        res.status(400).json(errorResponse);
        return;
      case 'P1001':
        logger.error('💡 Error P1001: No se puede conectar al servidor de base de datos');
        errorResponse.error = { 
          message: 'No se puede conectar a la base de datos',
          ...(process.env.NODE_ENV === 'development' && { 
            hint: 'Verifica que el servidor de base de datos esté accesible' 
          })
        };
        res.status(503).json(errorResponse);
        return;
      case 'P1002':
        logger.error('💡 Error P1002: Tiempo de conexión agotado');
        errorResponse.error = { message: 'Tiempo de conexión a base de datos agotado' };
        res.status(503).json(errorResponse);
        return;
      case 'P1008':
        logger.error('💡 Error P1008: Operación agotó tiempo de espera');
        errorResponse.error = { message: 'La operación tardó demasiado tiempo' };
        res.status(503).json(errorResponse);
        return;
      case 'P1017':
        logger.error('💡 Error P1017: Servidor cerró la conexión');
        errorResponse.error = { message: 'Conexión a base de datos cerrada inesperadamente' };
        res.status(503).json(errorResponse);
        return;
      default:
        logger.warn(`Código de error Prisma no manejado: ${err.code}`);
        errorResponse.error = { 
          message: 'Error en la base de datos',
          ...(process.env.NODE_ENV === 'development' && { code: err.code })
        };
    }
  }

  // Detectar errores de autenticación de base de datos
  if (err.message && err.message.includes('Authentication failed')) {
    logger.error('❌ ERROR DE AUTENTICACIÓN DE BASE DE DATOS');
    logger.error('💡 SOLUCIÓN: Verifica las credenciales en el archivo .env');
    logger.error('   - La contraseña NO debe tener corchetes [ ]');
    logger.error('   - Obtén la contraseña correcta desde Supabase Dashboard > Settings > Database');
    
    errorResponse.error = { 
      message: 'Error de configuración de base de datos',
      ...(process.env.NODE_ENV === 'development' && { 
        hint: 'Credenciales de base de datos inválidas. Revisa DATABASE_URL en .env' 
      })
    };
    res.status(503).json(errorResponse);
    return;
  }

  // Enviar respuesta de error
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
