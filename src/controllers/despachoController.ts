import { Response, NextFunction, Request } from 'express';
import despachoService from '../services/despachoService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Despachos
 */
class DespachoController {
  /**
   * Listar todos los despachos con paginación
   */
  async getDespachos(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        solicitud: req.query.solicitud ? parseInt(req.query.solicitud as string, 10) : undefined,
      };
      const result = await despachoService.getDespachos(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un despacho por su número
   */
  async getDespachoById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodespacho = parseInt(req.params.id!, 10);
      const despacho = await despachoService.getDespachoById(numerodespacho);
      res.status(200).json({ success: true, data: despacho });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear un nuevo despacho
   */
  async createDespacho(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const despacho = await despachoService.createDespacho(req.body);
      res.status(201).json({ success: true, data: despacho, message: 'Despacho creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un despacho existente
   */
  async updateDespacho(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodespacho = parseInt(req.params.id!, 10);
      const despacho = await despachoService.updateDespacho(numerodespacho, req.body);
      res.status(200).json({ success: true, data: despacho, message: 'Despacho actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un despacho
   */
  async deleteDespacho(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerodespacho = parseInt(req.params.id!, 10);
      const result = await despachoService.deleteDespacho(numerodespacho);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

export default new DespachoController();
