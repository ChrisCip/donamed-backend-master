import { Response, NextFunction, Request } from 'express';
import solicitudService from '../services/solicitudService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Solicitudes
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
        estado: req.query.estado as 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA' | undefined,
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

  async createSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const solicitud = await solicitudService.createSolicitud(req.body);
      res.status(201).json({ success: true, data: solicitud, message: 'Solicitud creada exitosamente' });
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
}

export default new SolicitudController();
