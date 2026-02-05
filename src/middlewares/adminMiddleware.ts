import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, AppError } from '../types/index.js';

/**
 * Middleware para verificar que el usuario tiene rol de administrador
 * Debe usarse después de authMiddleware
 * 
 * NOTA: El campo codigo_rol es ahora un número entero en la base de datos
 * Los IDs de roles administrativos deben configurarse según la base de datos
 */

// IDs de roles con permisos administrativos (ajustar según los datos reales de la BD)
// Típicamente: 1 = Admin, 2 = Super Admin, 3 = Almacenista, etc.
const ADMIN_ROLE_IDS = [1, 2, 3]; // Ajustar según los codigorol reales de la BD

export const adminMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const userRolId = req.user?.rol;

    // Verificar si el rol del usuario está en la lista de roles administrativos
    if (userRolId === null || userRolId === undefined || !ADMIN_ROLE_IDS.includes(userRolId)) {
      const error: AppError = new Error('Acceso denegado. Se requieren permisos de administrador.');
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar roles específicos por ID
 * @param allowedRoleIds - Array de IDs de roles permitidos
 */
export const roleMiddleware = (allowedRoleIds: number[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    try {
      const userRolId = req.user?.rol;

      if (userRolId === null || userRolId === undefined || !allowedRoleIds.includes(userRolId)) {
        const error: AppError = new Error('Acceso denegado. No tiene los permisos necesarios.');
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware que permite el acceso a cualquier usuario autenticado
 * pero agrega información sobre si es admin o no
 */
export const optionalAdminMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const userRolId = req.user?.rol;
    
    // Agregar información al request sobre si es admin
    (req as AuthenticatedRequest & { isAdmin: boolean }).isAdmin = 
      userRolId !== null && userRolId !== undefined && ADMIN_ROLE_IDS.includes(userRolId);

    next();
  } catch (error) {
    next(error);
  }
};

export default adminMiddleware;
