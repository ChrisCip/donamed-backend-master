import { Response, NextFunction, Request } from 'express';
import authService from '../services/authService.js';
import type { AuthenticatedRequest, ApiResponse } from '../types/index.js';

/**
 * Controlador de Autenticación para Administradores
 */
class AuthController {
  // ==========================================================
  // AUTENTICACIÓN ADMIN
  // ==========================================================

  async login(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Inicio de sesión exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await authService.refreshToken(req.user.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refrescado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminProfile(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getAdminProfile(req.user.id);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
