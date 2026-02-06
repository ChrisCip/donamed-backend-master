import { Response, NextFunction, Request } from 'express';
import almacenService from '../services/almacenService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Almacenes, Proveedores y Centros Médicos
 */
class AlmacenController {
  // ==========================================================
  // ALMACENES
  // ==========================================================

  async getAlmacenes(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const almacenes = await almacenService.getAlmacenes();
      res.status(200).json({ success: true, data: almacenes, count: almacenes.length });
    } catch (error) {
      next(error);
    }
  }

  async getAlmacenById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idalmacen = parseInt(req.params.id!, 10);
      const almacen = await almacenService.getAlmacenById(idalmacen);
      res.status(200).json({ success: true, data: almacen });
    } catch (error) {
      next(error);
    }
  }

  async createAlmacen(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const almacen = await almacenService.createAlmacen(req.body);
      res.status(201).json({ success: true, data: almacen, message: 'Almacén creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateAlmacen(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idalmacen = parseInt(req.params.id!, 10);
      const almacen = await almacenService.updateAlmacen(idalmacen, req.body);
      res.status(200).json({ success: true, data: almacen, message: 'Almacén actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAlmacen(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idalmacen = parseInt(req.params.id!, 10);
      await almacenService.deleteAlmacen(idalmacen);
      res.status(200).json({ success: true, message: 'Almacén eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // PROVEEDORES
  // ==========================================================

  async getProveedores(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const proveedores = await almacenService.getProveedores();
      res.status(200).json({ success: true, data: proveedores, count: proveedores.length });
    } catch (error) {
      next(error);
    }
  }

  async getProveedorById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const proveedor = await almacenService.getProveedorById(rncproveedor);
      res.status(200).json({ success: true, data: proveedor });
    } catch (error) {
      next(error);
    }
  }

  async createProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const proveedor = await almacenService.createProveedor(req.body);
      res.status(201).json({ success: true, data: proveedor, message: 'Proveedor creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const proveedor = await almacenService.updateProveedor(rncproveedor, req.body);
      res.status(200).json({ success: true, data: proveedor, message: 'Proveedor actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      await almacenService.deleteProveedor(rncproveedor);
      res.status(200).json({ success: true, message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // CENTROS MÉDICOS
  // ==========================================================

  async getCentrosMedicos(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const centros = await almacenService.getCentrosMedicos();
      res.status(200).json({ success: true, data: centros, count: centros.length });
    } catch (error) {
      next(error);
    }
  }

  async getCentroMedicoById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcentro = parseInt(req.params.id!, 10);
      const centro = await almacenService.getCentroMedicoById(idcentro);
      res.status(200).json({ success: true, data: centro });
    } catch (error) {
      next(error);
    }
  }

  async createCentroMedico(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const centro = await almacenService.createCentroMedico(req.body);
      res.status(201).json({ success: true, data: centro, message: 'Centro médico creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateCentroMedico(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcentro = parseInt(req.params.id!, 10);
      const centro = await almacenService.updateCentroMedico(idcentro, req.body);
      res.status(200).json({ success: true, data: centro, message: 'Centro médico actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCentroMedico(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcentro = parseInt(req.params.id!, 10);
      await almacenService.deleteCentroMedico(idcentro);
      res.status(200).json({ success: true, message: 'Centro médico eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AlmacenController();
