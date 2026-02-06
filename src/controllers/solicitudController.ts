import { Response, NextFunction, Request } from 'express';
import solicitudService from '../services/solicitudService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Solicitudes y Despachos
 */
class SolicitudController {
  // ==========================================================
  // SOLICITUDES
  // ==========================================================

  async getSolicitudes(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        estado: req.query.estado as 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | undefined,
      };
      const result = await solicitudService.getSolicitudes(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getSolicitudById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await solicitudService.getSolicitudById(numerosolicitud);
      res.status(200).json({ success: true, data: solicitud });
    } catch (error) {
      next(error);
    }
  }

  async updateSolicitudEstado(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await solicitudService.updateSolicitudEstado(numerosolicitud, req.body);
      res.status(200).json({ success: true, data: solicitud, message: 'Estado de solicitud actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // Alias para evaluate - actualiza el estado y puede asignar detalles
  async evaluateSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await solicitudService.updateSolicitudEstado(numerosolicitud, req.body);
      res.status(200).json({ success: true, data: solicitud, message: 'Solicitud evaluada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // ESTADÍSTICAS POR PATOLOGÍA
  // ==========================================================

  async getPathologiesStats(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const stats = await solicitudService.getPathologiesStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // DESPACHOS
  // ==========================================================

  async getDespachos(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const result = await solicitudService.getDespachos(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createDespacho(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const despacho = await solicitudService.createDespacho(req.body);
      res.status(201).json({ success: true, data: despacho, message: 'Despacho creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new SolicitudController();
