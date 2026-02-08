import { Response, NextFunction, Request } from 'express';
import medicamentoService from '../services/medicamentoService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Medicamentos e Inventario
 */
class MedicamentoController {
  // ==========================================================
  // MEDICAMENTOS
  // ==========================================================

  async getMedicamentos(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
      };
      const result = await medicamentoService.getMedicamentos(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getMedicamentoById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigomedicamento = req.params.codigo || req.params.id!;
      const medicamento = await medicamentoService.getMedicamentoById(codigomedicamento);
      res.status(200).json({ success: true, data: medicamento });
    } catch (error) {
      next(error);
    }
  }

  async createMedicamento(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      // Mapear nombres de campos del request a los nombres del servicio
      const { CodigoMedicamento, IDVia, IDForma_Farmaceutica, ...rest } = req.body;
      const data = {
        ...rest,
        codigomedicamento: CodigoMedicamento || req.body.codigomedicamento,
        idvia_administracion: IDVia || req.body.idvia_administracion,
        idforma_farmaceutica: IDForma_Farmaceutica || req.body.idforma_farmaceutica,
      };
      const medicamento = await medicamentoService.createMedicamento(data);
      res.status(201).json({ success: true, data: medicamento, message: 'Medicamento creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateMedicamento(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigomedicamento = req.params.codigo || req.params.id!;
      const medicamento = await medicamentoService.updateMedicamento(codigomedicamento, req.body);
      res.status(200).json({ success: true, data: medicamento, message: 'Medicamento actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMedicamento(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigomedicamento = req.params.codigo || req.params.id!;
      await medicamentoService.deleteMedicamento(codigomedicamento);
      res.status(200).json({ success: true, message: 'Medicamento eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // INVENTARIO
  // ==========================================================

  async getInventario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        idalmacen: req.query.almacen ? parseInt(req.query.almacen as string, 10) : undefined,
        codigomedicamento: req.query.medicamento as string | undefined,
      };
      const inventario = await medicamentoService.getInventario(query);
      res.status(200).json({ success: true, data: inventario, count: inventario.length });
    } catch (error) {
      next(error);
    }
  }

  async ajustarInventario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const inventario = await medicamentoService.ajustarInventario(req.body);
      res.status(200).json({ success: true, data: inventario, message: 'Inventario ajustado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // STOCK Y LOTES POR VENCER
  // ==========================================================

  async getConsolidatedStock(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const stock = await medicamentoService.getConsolidatedStock();
      res.status(200).json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringBatches(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const result = await medicamentoService.getExpiringBatches(days);
      res.status(200).json({ 
        success: true, 
        data: result.data, 
        count: result.count,
        message: `Lotes que vencen en los próximos ${days} días`
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MedicamentoController();
