import { Response, NextFunction, Request } from 'express';
import ubicacionService from '../services/ubicacionService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Provincias y Ciudades
 */
class UbicacionController {
  // ==========================================================
  // PROVINCIAS
  // ==========================================================

  async getProvincias(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const provincias = await ubicacionService.getProvincias();
      res.status(200).json({ success: true, data: provincias, count: provincias.length });
    } catch (error) {
      next(error);
    }
  }

  async createProvincia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const provincia = await ubicacionService.createProvincia(req.body);
      res.status(201).json({ success: true, data: provincia, message: 'Provincia creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateProvincia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigoprovincia = req.params.id!;
      const provincia = await ubicacionService.updateProvincia(codigoprovincia, req.body);
      res.status(200).json({ success: true, data: provincia, message: 'Provincia actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteProvincia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigoprovincia = req.params.id!;
      await ubicacionService.deleteProvincia(codigoprovincia);
      res.status(200).json({ success: true, message: 'Provincia eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // CIUDADES
  // ==========================================================

  async getCiudades(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigoprovincia = req.query.provinciaId as string | undefined;
      const ciudades = await ubicacionService.getCiudades(codigoprovincia);
      res.status(200).json({ success: true, data: ciudades, count: ciudades.length });
    } catch (error) {
      next(error);
    }
  }

  async createCiudad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const ciudad = await ubicacionService.createCiudad(req.body);
      res.status(201).json({ success: true, data: ciudad, message: 'Ciudad creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateCiudad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigociudad = req.params.id!;
      const ciudad = await ubicacionService.updateCiudad(codigociudad, req.body);
      res.status(200).json({ success: true, data: ciudad, message: 'Ciudad actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCiudad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigociudad = req.params.id!;
      await ubicacionService.deleteCiudad(codigociudad);
      res.status(200).json({ success: true, message: 'Ciudad eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new UbicacionController();
