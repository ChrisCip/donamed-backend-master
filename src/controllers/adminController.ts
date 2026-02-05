import { Response, NextFunction, Request } from 'express';
import adminService from '../services/adminService.js';
import type { AuthenticatedRequest, ApiResponse } from '../types/index.js';

/**
 * Controlador administrativo para gestión completa del sistema DONAMED
 * Basado en el schema real de la base de datos
 */
class AdminController {
  // ==========================================================
  // AUTENTICACIÓN ADMIN
  // ==========================================================

  async login(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Inicio de sesión exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.refreshToken(req.user.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refrescado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminProfile(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const profile = await adminService.getAdminProfile(req.user.id);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // PROVINCIAS
  // ==========================================================

  async getProvincias(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const provincias = await adminService.getProvincias();
      res.status(200).json({ success: true, data: provincias, count: provincias.length });
    } catch (error) {
      next(error);
    }
  }

  async createProvincia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const provincia = await adminService.createProvincia(req.body);
      res.status(201).json({ success: true, data: provincia, message: 'Provincia creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateProvincia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigoprovincia = req.params.id!;
      const provincia = await adminService.updateProvincia(codigoprovincia, req.body);
      res.status(200).json({ success: true, data: provincia, message: 'Provincia actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteProvincia(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigoprovincia = req.params.id!;
      await adminService.deleteProvincia(codigoprovincia);
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
      const ciudades = await adminService.getCiudades(codigoprovincia);
      res.status(200).json({ success: true, data: ciudades, count: ciudades.length });
    } catch (error) {
      next(error);
    }
  }

  async createCiudad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const ciudad = await adminService.createCiudad(req.body);
      res.status(201).json({ success: true, data: ciudad, message: 'Ciudad creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateCiudad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigociudad = req.params.id!;
      const ciudad = await adminService.updateCiudad(codigociudad, req.body);
      res.status(200).json({ success: true, data: ciudad, message: 'Ciudad actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCiudad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigociudad = req.params.id!;
      await adminService.deleteCiudad(codigociudad);
      res.status(200).json({ success: true, message: 'Ciudad eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // ROLES
  // ==========================================================

  async getRoles(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const roles = await adminService.getRoles();
      res.status(200).json({ success: true, data: roles, count: roles.length });
    } catch (error) {
      next(error);
    }
  }

  async createRol(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rol = await adminService.createRol(req.body);
      res.status(201).json({ success: true, data: rol, message: 'Rol creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateRol(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigorol = parseInt(req.params.id!, 10);
      const rol = await adminService.updateRol(codigorol, req.body);
      res.status(200).json({ success: true, data: rol, message: 'Rol actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteRol(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigorol = parseInt(req.params.id!, 10);
      await adminService.deleteRol(codigorol);
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
      const categorias = await adminService.getCategorias();
      res.status(200).json({ success: true, data: categorias, count: categorias.length });
    } catch (error) {
      next(error);
    }
  }

  async createCategoria(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const categoria = await adminService.createCategoria(req.body);
      res.status(201).json({ success: true, data: categoria, message: 'Categoría creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateCategoria(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcategoria = parseInt(req.params.id!, 10);
      const categoria = await adminService.updateCategoria(idcategoria, req.body);
      res.status(200).json({ success: true, data: categoria, message: 'Categoría actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategoria(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcategoria = parseInt(req.params.id!, 10);
      await adminService.deleteCategoria(idcategoria);
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
      const enfermedades = await adminService.getEnfermedades();
      res.status(200).json({ success: true, data: enfermedades, count: enfermedades.length });
    } catch (error) {
      next(error);
    }
  }

  async createEnfermedad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const enfermedad = await adminService.createEnfermedad(req.body);
      res.status(201).json({ success: true, data: enfermedad, message: 'Enfermedad creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateEnfermedad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idenfermedad = parseInt(req.params.id!, 10);
      const enfermedad = await adminService.updateEnfermedad(idenfermedad, req.body);
      res.status(200).json({ success: true, data: enfermedad, message: 'Enfermedad actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteEnfermedad(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idenfermedad = parseInt(req.params.id!, 10);
      await adminService.deleteEnfermedad(idenfermedad);
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
      const vias = await adminService.getViasAdministracion();
      res.status(200).json({ success: true, data: vias, count: vias.length });
    } catch (error) {
      next(error);
    }
  }

  async createViaAdministracion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const via = await adminService.createViaAdministracion(req.body);
      res.status(201).json({ success: true, data: via, message: 'Vía de administración creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateViaAdministracion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idvia = parseInt(req.params.id!, 10);
      const via = await adminService.updateViaAdministracion(idvia, req.body);
      res.status(200).json({ success: true, data: via, message: 'Vía de administración actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteViaAdministracion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idvia = parseInt(req.params.id!, 10);
      await adminService.deleteViaAdministracion(idvia);
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
      const formas = await adminService.getFormasFarmaceuticas();
      res.status(200).json({ success: true, data: formas, count: formas.length });
    } catch (error) {
      next(error);
    }
  }

  async createFormaFarmaceutica(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const forma = await adminService.createFormaFarmaceutica(req.body);
      res.status(201).json({ success: true, data: forma, message: 'Forma farmacéutica creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateFormaFarmaceutica(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idformafarmaceutica = parseInt(req.params.id!, 10);
      const forma = await adminService.updateFormaFarmaceutica(idformafarmaceutica, req.body);
      res.status(200).json({ success: true, data: forma, message: 'Forma farmacéutica actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteFormaFarmaceutica(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idformafarmaceutica = parseInt(req.params.id!, 10);
      await adminService.deleteFormaFarmaceutica(idformafarmaceutica);
      res.status(200).json({ success: true, message: 'Forma farmacéutica eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

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
      const result = await adminService.getMedicamentos(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getMedicamentoById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigomedicamento = req.params.codigo || req.params.id;
      const medicamento = await adminService.getMedicamentoById(codigomedicamento);
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
      const medicamento = await adminService.createMedicamento(data);
      res.status(201).json({ success: true, data: medicamento, message: 'Medicamento creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateMedicamento(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigomedicamento = req.params.codigo || req.params.id;
      const medicamento = await adminService.updateMedicamento(codigomedicamento, req.body);
      res.status(200).json({ success: true, data: medicamento, message: 'Medicamento actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMedicamento(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigomedicamento = req.params.codigo || req.params.id;
      await adminService.deleteMedicamento(codigomedicamento);
      res.status(200).json({ success: true, message: 'Medicamento eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // LOTES
  // ==========================================================

  async getLotes(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        codigomedicamento: req.query.medicamento as string | undefined,
        vencidos: req.query.vencidos === 'true' ? true : req.query.vencidos === 'false' ? false : undefined,
      };
      const result = await adminService.getLotes(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createLote(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const lote = await adminService.createLote(req.body);
      res.status(201).json({ success: true, data: lote, message: 'Lote creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteLote(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigolote = req.params.id!;
      await adminService.deleteLote(codigolote);
      res.status(200).json({ success: true, message: 'Lote eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // ALMACENES
  // ==========================================================

  async getAlmacenes(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const almacenes = await adminService.getAlmacenes();
      res.status(200).json({ success: true, data: almacenes, count: almacenes.length });
    } catch (error) {
      next(error);
    }
  }

  async getAlmacenById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idalmacen = parseInt(req.params.id!, 10);
      const almacen = await adminService.getAlmacenById(idalmacen);
      res.status(200).json({ success: true, data: almacen });
    } catch (error) {
      next(error);
    }
  }

  async createAlmacen(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const almacen = await adminService.createAlmacen(req.body);
      res.status(201).json({ success: true, data: almacen, message: 'Almacén creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateAlmacen(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idalmacen = parseInt(req.params.id!, 10);
      const almacen = await adminService.updateAlmacen(idalmacen, req.body);
      res.status(200).json({ success: true, data: almacen, message: 'Almacén actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAlmacen(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idalmacen = parseInt(req.params.id!, 10);
      await adminService.deleteAlmacen(idalmacen);
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
      const proveedores = await adminService.getProveedores();
      res.status(200).json({ success: true, data: proveedores, count: proveedores.length });
    } catch (error) {
      next(error);
    }
  }

  async getProveedorById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const proveedor = await adminService.getProveedorById(rncproveedor);
      res.status(200).json({ success: true, data: proveedor });
    } catch (error) {
      next(error);
    }
  }

  async createProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const proveedor = await adminService.createProveedor(req.body);
      res.status(201).json({ success: true, data: proveedor, message: 'Proveedor creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      const proveedor = await adminService.updateProveedor(rncproveedor, req.body);
      res.status(200).json({ success: true, data: proveedor, message: 'Proveedor actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteProveedor(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rncproveedor = req.params.id!;
      await adminService.deleteProveedor(rncproveedor);
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
      const centros = await adminService.getCentrosMedicos();
      res.status(200).json({ success: true, data: centros, count: centros.length });
    } catch (error) {
      next(error);
    }
  }

  async getCentroMedicoById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcentro = parseInt(req.params.id!, 10);
      const centro = await adminService.getCentroMedicoById(idcentro);
      res.status(200).json({ success: true, data: centro });
    } catch (error) {
      next(error);
    }
  }

  async createCentroMedico(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const centro = await adminService.createCentroMedico(req.body);
      res.status(201).json({ success: true, data: centro, message: 'Centro médico creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateCentroMedico(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcentro = parseInt(req.params.id!, 10);
      const centro = await adminService.updateCentroMedico(idcentro, req.body);
      res.status(200).json({ success: true, data: centro, message: 'Centro médico actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCentroMedico(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idcentro = parseInt(req.params.id!, 10);
      await adminService.deleteCentroMedico(idcentro);
      res.status(200).json({ success: true, message: 'Centro médico eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // DONACIONES
  // ==========================================================

  async getDonaciones(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const result = await adminService.getDonaciones(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createDonacion(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const donacion = await adminService.createDonacion(req.body);
      res.status(201).json({ success: true, data: donacion, message: 'Donación registrada exitosamente' });
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
      const inventario = await adminService.getInventario(query);
      res.status(200).json({ success: true, data: inventario, count: inventario.length });
    } catch (error) {
      next(error);
    }
  }

  async ajustarInventario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const inventario = await adminService.ajustarInventario(req.body);
      res.status(200).json({ success: true, data: inventario, message: 'Inventario ajustado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // TIPOS DE SOLICITUD
  // ==========================================================

  async getTiposSolicitud(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const tipos = await adminService.getTiposSolicitud();
      res.status(200).json({ success: true, data: tipos, count: tipos.length });
    } catch (error) {
      next(error);
    }
  }

  async createTipoSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const tipo = await adminService.createTipoSolicitud(req.body);
      res.status(201).json({ success: true, data: tipo, message: 'Tipo de solicitud creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateTipoSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigotiposolicitud = req.params.id!;
      const tipo = await adminService.updateTipoSolicitud(codigotiposolicitud, req.body);
      res.status(200).json({ success: true, data: tipo, message: 'Tipo de solicitud actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTipoSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const codigotiposolicitud = req.params.id!;
      await adminService.deleteTipoSolicitud(codigotiposolicitud);
      res.status(200).json({ success: true, message: 'Tipo de solicitud eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // SOLICITUDES
  // ==========================================================

  async getSolicitudes(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        estado: req.query.estado as 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | undefined,
      };
      const result = await adminService.getSolicitudes(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getSolicitudById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await adminService.getSolicitudById(numerosolicitud);
      res.status(200).json({ success: true, data: solicitud });
    } catch (error) {
      next(error);
    }
  }

  async updateSolicitudEstado(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await adminService.updateSolicitudEstado(numerosolicitud, req.body);
      res.status(200).json({ success: true, data: solicitud, message: 'Estado de solicitud actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // Alias para evaluate - actualiza el estado y puede asignar detalles
  async evaluateSolicitud(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const numerosolicitud = parseInt(req.params.id!, 10);
      const solicitud = await adminService.updateSolicitudEstado(numerosolicitud, req.body);
      res.status(200).json({ success: true, data: solicitud, message: 'Solicitud evaluada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // DESPACHOS
  // ==========================================================

  async getDespachos(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      const result = await adminService.getDespachos(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createDespacho(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const despacho = await adminService.createDespacho(req.body);
      res.status(201).json({ success: true, data: despacho, message: 'Despacho creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

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
      const result = await adminService.getUsuarios(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getUsuarioById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idusuario = parseInt(req.params.id!, 10);
      const usuario = await adminService.getUsuarioById(idusuario);
      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async createUsuario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const usuario = await adminService.createUsuario(req.body);
      res.status(201).json({ success: true, data: usuario, message: 'Usuario creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updateUsuario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idusuario = parseInt(req.params.id!, 10);
      const usuario = await adminService.updateUsuario(idusuario, req.body);
      res.status(200).json({ success: true, data: usuario, message: 'Usuario actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUsuario(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const idusuario = parseInt(req.params.id!, 10);
      await adminService.deleteUsuario(idusuario);
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
      const result = await adminService.getPersonas(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPersonaByCedula(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const cedula = req.params.cedula!;
      const persona = await adminService.getPersonaByCedula(cedula);
      res.status(200).json({ success: true, data: persona });
    } catch (error) {
      next(error);
    }
  }

  async createPersona(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const persona = await adminService.createPersona(req.body);
      res.status(201).json({ success: true, data: persona, message: 'Persona creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async updatePersona(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const cedula = req.params.cedula!;
      const persona = await adminService.updatePersona(cedula, req.body);
      res.status(200).json({ success: true, data: persona, message: 'Persona actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================
  // DASHBOARD Y ESTADÍSTICAS
  // ==========================================================

  async getDashboardStats(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // Estadísticas de lotes por vencer
  async getExpiringBatches(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const result = await adminService.getLotes({ vencidos: false });
      // Filtrar los que vencen en los próximos 'days' días
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      const expiringBatches = result.data.filter((lote: any) => {
        const vencimiento = new Date(lote.fechavencimiento);
        return vencimiento >= today && vencimiento <= futureDate;
      });

      res.status(200).json({ 
        success: true, 
        data: expiringBatches, 
        count: expiringBatches.length,
        message: `Lotes que vencen en los próximos ${days} días`
      });
    } catch (error) {
      next(error);
    }
  }

  // Estadísticas de donaciones
  async getDonationsStats(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getDonaciones({});
      res.status(200).json({ 
        success: true, 
        data: { 
          total: result.pagination.total,
          donaciones: result.data 
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Estadísticas por patología
  async getPathologiesStats(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getSolicitudes({});
      // Agrupar por patología
      const pathologyCounts: Record<string, number> = {};
      result.data.forEach((solicitud: any) => {
        const patologia = solicitud.patologia || 'Sin patología';
        pathologyCounts[patologia] = (pathologyCounts[patologia] || 0) + 1;
      });

      res.status(200).json({ 
        success: true, 
        data: pathologyCounts
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener lotes con filtros
  async getBatchesWithFilters(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        codigomedicamento: req.query.medicamento as string | undefined,
        vencidos: req.query.vencidos === 'true' ? true : req.query.vencidos === 'false' ? false : undefined,
      };
      const result = await adminService.getLotes(query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  // Obtener stock consolidado
  async getConsolidatedStock(_req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const inventario = await adminService.getInventario({});
      // Consolidar por medicamento
      const stockByMedicamento: Record<string, { nombre: string; total: number; almacenes: any[] }> = {};
      
      inventario.forEach((item: any) => {
        const codigo = item.codigomedicamento;
        if (!stockByMedicamento[codigo]) {
          stockByMedicamento[codigo] = {
            nombre: item.medicamento?.nombre || codigo,
            total: 0,
            almacenes: []
          };
        }
        stockByMedicamento[codigo].total += item.cantidad;
        stockByMedicamento[codigo].almacenes.push({
          almacen: item.almacen?.nombre,
          lote: item.codigolote,
          cantidad: item.cantidad
        });
      });

      res.status(200).json({ 
        success: true, 
        data: Object.values(stockByMedicamento)
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
