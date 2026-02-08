import { Response, NextFunction, Request } from 'express';
import medicamentoSolicitadoService from '../services/medicamentoSolicitadoService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Medicamentos Solicitados
 */
class MedicamentoSolicitadoController {
  /**
   * Listar medicamentos solicitados (solo con filtros)
   */
  async getMedicamentosSolicitados(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        numerosolicitud: req.query.numerosolicitud
          ? parseInt(req.query.numerosolicitud as string, 10)
          : undefined,
        nombre: req.query.nombre as string | undefined,
      };
      const result = await medicamentoSolicitadoService.getMedicamentosSolicitados(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un medicamento solicitado por ID
   */
  async getMedicamentoSolicitadoById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id!, 10);
      const medicamento = await medicamentoSolicitadoService.getMedicamentoSolicitadoById(id);
      res.status(200).json({ success: true, data: medicamento });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear un medicamento solicitado
   */
  async createMedicamentoSolicitado(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const medicamento = await medicamentoSolicitadoService.createMedicamentoSolicitado(req.body);
      res.status(201).json({
        success: true,
        data: medicamento,
        message: 'Medicamento solicitado agregado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear múltiples medicamentos solicitados
   */
  async createManyMedicamentosSolicitados(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await medicamentoSolicitadoService.createManyMedicamentosSolicitados(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: `${result.count} medicamentos agregados exitosamente`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un medicamento solicitado
   */
  async updateMedicamentoSolicitado(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id!, 10);
      const medicamento = await medicamentoSolicitadoService.updateMedicamentoSolicitado(id, req.body);
      res.status(200).json({
        success: true,
        data: medicamento,
        message: 'Medicamento solicitado actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un medicamento solicitado
   */
  async deleteMedicamentoSolicitado(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id!, 10);
      await medicamentoSolicitadoService.deleteMedicamentoSolicitado(id);
      res.status(200).json({ success: true, message: 'Medicamento solicitado eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener medicamentos solicitados de una solicitud
   */
  async getMedicamentosBySolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.numerosolicitud!, 10);
      const medicamentos = await medicamentoSolicitadoService.getMedicamentosBySolicitud(numerosolicitud);
      res.status(200).json({ success: true, data: medicamentos, count: medicamentos.length });
    } catch (error) {
      next(error);
    }
  }
}

export default new MedicamentoSolicitadoController();
