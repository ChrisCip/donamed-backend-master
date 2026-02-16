import { Response, NextFunction, Request } from 'express';
import almacenService from '../services/almacenService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Almacenes y Proveedores
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

}

export default new AlmacenController();
