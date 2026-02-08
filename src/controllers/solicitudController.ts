import { Response, NextFunction, Request } from 'express';
import solicitudService from '../services/solicitudService.js';
import medicamentoSolicitadoService from '../services/medicamentoSolicitadoService.js';
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

  async updateSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await solicitudService.updateSolicitud(numerosolicitud, req.body);
      res.status(200).json({ success: true, data: solicitud, message: 'Solicitud actualizada exitosamente' });
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

  // Alias para evaluate - actualiza el estado con observaciones
  async evaluateSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await solicitudService.updateSolicitudEstado(numerosolicitud, req.body);
      res.status(200).json({ success: true, data: solicitud, message: 'Solicitud evaluada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async confirmarSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await solicitudService.confirmarSolicitud(numerosolicitud);
      res.status(200).json({ success: true, data: solicitud, message: 'Solicitud confirmada y enviada a revisión' });
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
  // DETALLE SOLICITUD (Medicamentos reales asignados por admin)
  // ==========================================================

  async addDetalleSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const detalle = await solicitudService.addDetalleSolicitud(numerosolicitud, req.body);
      res.status(201).json({ success: true, data: detalle, message: 'Medicamento asignado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async removeDetalleSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const { idalmacen, codigolote } = req.body;
      await solicitudService.removeDetalleSolicitud(numerosolicitud, idalmacen, codigolote);
      res.status(200).json({ success: true, message: 'Medicamento removido de la solicitud' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // MEDICAMENTOS SOLICITADOS (texto libre del paciente)
  // ==========================================================

  async getMedicamentosSolicitados(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const medicamentos = await medicamentoSolicitadoService.getMedicamentosBySolicitud(numerosolicitud);
      res.status(200).json({ success: true, data: medicamentos, count: medicamentos.length });
    } catch (error) {
      next(error);
    }
  }
}

export default new SolicitudController();
