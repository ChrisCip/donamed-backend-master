import { Response, NextFunction, Request } from 'express';
import loteService from '../services/loteService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Lotes
 */
class LoteController {
  /**
   * Listar lotes con filtros
   */
  async getLotes(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        codigomedicamento: req.query.medicamento as string | undefined,
        vencidos: req.query.vencidos === 'true' ? true : req.query.vencidos === 'false' ? false : undefined,
      };
      const result = await loteService.getLotes(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear un nuevo lote
   */
  async createLote(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const lote = await loteService.createLote(req.body);
      res.status(201).json({ success: true, data: lote, message: 'Lote creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un lote
   */
  async deleteLote(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigolote = req.params.id!;
      await loteService.deleteLote(codigolote);
      res.status(200).json({ success: true, message: 'Lote eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new LoteController();
