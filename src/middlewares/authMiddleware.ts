import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest, JwtPayload, AppError } from '../types/index.js';

/**
 * Middleware de autenticación
 * Verifica el token JWT y adjunta los datos del usuario a req.user
 */
const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: AppError = new Error('No se proporcionó un token de autenticación');
      error.statusCode = 401;
      throw error;
    }

    // Extraer el token (formato: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];

    if (!token) {
      const error: AppError = new Error('Token inválido');
      error.statusCode = 401;
      throw error;
    }

    // Verificar el token
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Adjuntar información del usuario al request
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol
    };

    // Continuar con el siguiente middleware/controlador
    next();
  } catch (error) {
    // Si el error es de JWT (token expirado, inválido, etc.)
    const appError = error as AppError;
    
    if (appError.name === 'JsonWebTokenError') {
      appError.message = 'Token inválido';
      appError.statusCode = 401;
    } else if (appError.name === 'TokenExpiredError') {
      appError.message = 'Token expirado';
      appError.statusCode = 401;
    }

    // Pasar el error al middleware de manejo de errores
    next(appError);
  }
};

export default authMiddleware;
