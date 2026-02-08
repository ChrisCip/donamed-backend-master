import { Response, NextFunction, Request } from 'express';
import proveedorService from '../services/proveedorService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Proveedores
 */
class ProveedorController {
  /**
   * Listar todos los proveedores con paginación
   */
  async getProveedores(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
      };
      const result = await proveedorService.getProveedores(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un proveedor por su RNC
   */
  async getProveedorById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const proveedor = await proveedorService.getProveedorById(rncproveedor);
      res.status(200).json({ success: true, data: proveedor });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear un nuevo proveedor
   */
  async createProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const proveedor = await proveedorService.createProveedor(req.body);
      res.status(201).json({ success: true, data: proveedor, message: 'Proveedor creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un proveedor existente
   */
  async updateProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const proveedor = await proveedorService.updateProveedor(rncproveedor, req.body);
      res.status(200).json({ success: true, data: proveedor, message: 'Proveedor actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un proveedor
   */
  async deleteProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      await proveedorService.deleteProveedor(rncproveedor);
      res.status(200).json({ success: true, message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de un proveedor
   */
  async getProveedorStats(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const stats = await proveedorService.getProveedorStats(rncproveedor);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProveedorController();
