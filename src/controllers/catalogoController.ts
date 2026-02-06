import { Response, NextFunction, Request } from 'express';
import catalogoService from '../services/catalogoService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de catálogos del sistema
 * (Roles, Categorías, Enfermedades, Vías de Administración, Formas Farmacéuticas, Tipos de Solicitud)
 */
class CatalogoController {
  // ==========================================================
  // ROLES
  // ==========================================================

  async getRoles(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const roles = await catalogoService.getRoles();
      res.status(200).json({ success: true, data: roles, count: roles.length });
    } catch (error) {
      next(error);
    }
  }

  async createRol(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rol = await catalogoService.createRol(req.body);
      res.status(201).json({ success: true, data: rol, message: 'Rol creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateRol(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigorol = parseInt(req.params.id!, 10);
      const rol = await catalogoService.updateRol(codigorol, req.body);
      res.status(200).json({ success: true, data: rol, message: 'Rol actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteRol(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigorol = parseInt(req.params.id!, 10);
      await catalogoService.deleteRol(codigorol);
      res.status(200).json({ success: true, message: 'Rol eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // CATEGORÍAS
  // ==========================================================

  async getCategorias(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const categorias = await catalogoService.getCategorias();
      res.status(200).json({ success: true, data: categorias, count: categorias.length });
    } catch (error) {
      next(error);
    }
  }

  async createCategoria(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const categoria = await catalogoService.createCategoria(req.body);
      res.status(201).json({ success: true, data: categoria, message: 'Categoría creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateCategoria(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcategoria = parseInt(req.params.id!, 10);
      const categoria = await catalogoService.updateCategoria(idcategoria, req.body);
      res.status(200).json({ success: true, data: categoria, message: 'Categoría actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategoria(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcategoria = parseInt(req.params.id!, 10);
      await catalogoService.deleteCategoria(idcategoria);
      res.status(200).json({ success: true, message: 'Categoría eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // ENFERMEDADES
  // ==========================================================

  async getEnfermedades(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const enfermedades = await catalogoService.getEnfermedades();
      res.status(200).json({ success: true, data: enfermedades, count: enfermedades.length });
    } catch (error) {
      next(error);
    }
  }

  async createEnfermedad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const enfermedad = await catalogoService.createEnfermedad(req.body);
      res.status(201).json({ success: true, data: enfermedad, message: 'Enfermedad creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateEnfermedad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idenfermedad = parseInt(req.params.id!, 10);
      const enfermedad = await catalogoService.updateEnfermedad(idenfermedad, req.body);
      res.status(200).json({ success: true, data: enfermedad, message: 'Enfermedad actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteEnfermedad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idenfermedad = parseInt(req.params.id!, 10);
      await catalogoService.deleteEnfermedad(idenfermedad);
      res.status(200).json({ success: true, message: 'Enfermedad eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // VÍAS DE ADMINISTRACIÓN
  // ==========================================================

  async getViasAdministracion(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const vias = await catalogoService.getViasAdministracion();
      res.status(200).json({ success: true, data: vias, count: vias.length });
    } catch (error) {
      next(error);
    }
  }

  async createViaAdministracion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const via = await catalogoService.createViaAdministracion(req.body);
      res.status(201).json({ success: true, data: via, message: 'Vía de administración creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateViaAdministracion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idvia = parseInt(req.params.id!, 10);
      const via = await catalogoService.updateViaAdministracion(idvia, req.body);
      res.status(200).json({ success: true, data: via, message: 'Vía de administración actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteViaAdministracion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idvia = parseInt(req.params.id!, 10);
      await catalogoService.deleteViaAdministracion(idvia);
      res.status(200).json({ success: true, message: 'Vía de administración eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // FORMAS FARMACÉUTICAS
  // ==========================================================

  async getFormasFarmaceuticas(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const formas = await catalogoService.getFormasFarmaceuticas();
      res.status(200).json({ success: true, data: formas, count: formas.length });
    } catch (error) {
      next(error);
    }
  }

  async createFormaFarmaceutica(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const forma = await catalogoService.createFormaFarmaceutica(req.body);
      res.status(201).json({ success: true, data: forma, message: 'Forma farmacéutica creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateFormaFarmaceutica(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idformafarmaceutica = parseInt(req.params.id!, 10);
      const forma = await catalogoService.updateFormaFarmaceutica(idformafarmaceutica, req.body);
      res.status(200).json({ success: true, data: forma, message: 'Forma farmacéutica actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteFormaFarmaceutica(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idformafarmaceutica = parseInt(req.params.id!, 10);
      await catalogoService.deleteFormaFarmaceutica(idformafarmaceutica);
      res.status(200).json({ success: true, message: 'Forma farmacéutica eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // TIPOS DE SOLICITUD
  // ==========================================================

  async getTiposSolicitud(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const tipos = await catalogoService.getTiposSolicitud();
      res.status(200).json({ success: true, data: tipos, count: tipos.length });
    } catch (error) {
      next(error);
    }
  }

  async createTipoSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const tipo = await catalogoService.createTipoSolicitud(req.body);
      res.status(201).json({ success: true, data: tipo, message: 'Tipo de solicitud creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateTipoSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigotiposolicitud = req.params.id!;
      const tipo = await catalogoService.updateTipoSolicitud(codigotiposolicitud, req.body);
      res.status(200).json({ success: true, data: tipo, message: 'Tipo de solicitud actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTipoSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigotiposolicitud = req.params.id!;
      await catalogoService.deleteTipoSolicitud(codigotiposolicitud);
      res.status(200).json({ success: true, message: 'Tipo de solicitud eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new CatalogoController();
