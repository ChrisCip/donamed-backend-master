import { Response, NextFunction, Request } from 'express';
import donacionService from '../services/donacionService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Donaciones
 */
class DonacionController {
  // ==========================================================
  // DONACIONES - CRUD COMPLETO
  // ==========================================================

  async getDonaciones(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        proveedor: req.query.proveedor as string | undefined,
      };
      const result = await donacionService.getDonaciones(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getDonacionById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodonacion = parseInt(req.params.id!, 10);
      const donacion = await donacionService.getDonacionById(numerodonacion);
      res.status(200).json({ success: true, data: donacion });
    } catch (error) {
      next(error);
    }
  }

  async createDonacion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const donacion = await donacionService.createDonacion(req.body);
      res.status(201).json({ success: true, data: donacion, message: 'Donación registrada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateDonacion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodonacion = parseInt(req.params.id!, 10);
      const donacion = await donacionService.updateDonacion(numerodonacion, req.body);
      res.status(200).json({ success: true, data: donacion, message: 'Donación actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDonacion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodonacion = parseInt(req.params.id!, 10);
      const result = await donacionService.deleteDonacion(numerodonacion);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async addMedicamentosToDonacion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodonacion = parseInt(req.params.id!, 10);
      const donacion = await donacionService.addMedicamentosToDonacion(numerodonacion, req.body.medicamentos);
      res.status(200).json({ success: true, data: donacion, message: 'Medicamentos agregados exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // ESTADÍSTICAS DE DONACIONES
  // ==========================================================

  async getDonationsStats(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const stats = await donacionService.getDonationsStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new DonacionController();
