import { Response, NextFunction, Request } from 'express';
import solicitudService from '../services/solicitudService.js';
import { sendSolicitudStatusEmail } from '../utils/email.js';
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
      const body = req.body as { estado: string; observaciones?: string; idalmacen_retiro?: number; solicitud_de_retiro?: number };
      const data = {
        estado: body.estado as 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA',
        observaciones: body.observaciones,
        idalmacen_retiro: body.idalmacen_retiro ?? body.solicitud_de_retiro,
      };
      const solicitud = await solicitudService.updateSolicitudEstado(numerosolicitud, data) as any;

      // Enviar notificación por email al paciente (no bloquea la respuesta)
      const ESTADOS_CON_EMAIL = ['APROBADA', 'RECHAZADA', 'DESPACHADA', 'CANCELADA'];
      if (ESTADOS_CON_EMAIL.includes(data.estado) && solicitud.usuario?.correo) {
        const nombreUsuario = solicitud.usuario?.persona?.nombre || 'Usuario';
        const almacenRetiro = solicitud.almacen_retiro
          ? `${solicitud.almacen_retiro.nombre}${solicitud.almacen_retiro.ciudad ? ` — ${solicitud.almacen_retiro.ciudad.nombre}` : ''}`
          : null;

        sendSolicitudStatusEmail({
          to: solicitud.usuario.correo,
          nombre: nombreUsuario,
          numerosolicitud,
          estado: data.estado,
          observaciones: solicitud.observaciones,
          almacenRetiro,
        }).catch((err) => {
          console.error('Error enviando email de notificación:', err);
        });
      }

      res.status(200).json({ success: true, data: solicitud, message: 'Estado de solicitud actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // DETALLE DE SOLICITUD (asignación de medicamentos reales)
  // ==========================================================

  async getDetallesSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const detalles = await solicitudService.getDetallesSolicitud(numerosolicitud);
      res.status(200).json({ success: true, data: detalles });
    } catch (error) {
      next(error);
    }
  }

  async asignarDetalles(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const detalles = await solicitudService.asignarDetalles(numerosolicitud, req.body.detalles);
      res.status(200).json({ success: true, data: detalles, message: 'Medicamentos asignados a la solicitud exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async eliminarDetalles(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const result = await solicitudService.eliminarDetalles(numerosolicitud);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

export default new SolicitudController();
