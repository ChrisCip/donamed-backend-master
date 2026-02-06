import { Response, NextFunction, Request } from 'express';
import dashboardService from '../services/dashboardService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para estadísticas del Dashboard
 */
class DashboardController {
  // ==========================================================
  // DASHBOARD / ESTADÍSTICAS
  // ==========================================================

  async getDashboardStats(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
