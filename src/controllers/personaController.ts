import { Response, NextFunction, Request } from 'express';
import personaService from '../services/personaService.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Controlador para gestión de Usuarios y Personas
 */
class PersonaController {
  // ==========================================================
  // USUARIOS
  // ==========================================================

  async getUsuarios(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
      };
      const result = await personaService.getUsuarios(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getUsuarioById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idusuario = parseInt(req.params.id!, 10);
      const usuario = await personaService.getUsuarioById(idusuario);
      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async createUsuario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const usuario = await personaService.createUsuario(req.body);
      res.status(201).json({ success: true, data: usuario, message: 'Usuario creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateUsuario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idusuario = parseInt(req.params.id!, 10);
      const usuario = await personaService.updateUsuario(idusuario, req.body);
      res.status(200).json({ success: true, data: usuario, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUsuario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idusuario = parseInt(req.params.id!, 10);
      await personaService.deleteUsuario(idusuario);
      res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // PERSONAS
  // ==========================================================

  async getPersonas(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
      };
      const result = await personaService.getPersonas(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPersonaByCedula(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const cedula = req.params.cedula!;
      const persona = await personaService.getPersonaByCedula(cedula);
      res.status(200).json({ success: true, data: persona });
    } catch (error) {
      next(error);
    }
  }

  async createPersona(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const persona = await personaService.createPersona(req.body);
      res.status(201).json({ success: true, data: persona, message: 'Persona creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updatePersona(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const cedula = req.params.cedula!;
      const persona = await personaService.updatePersona(cedula, req.body);
      res.status(200).json({ success: true, data: persona, message: 'Persona actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default new PersonaController();
