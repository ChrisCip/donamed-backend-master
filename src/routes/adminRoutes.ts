import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import type { AuthenticatedRequest } from '../types/index.js';

// Importar rutas modulares
import authRoutes from './authRoutes.js';
import ubicacionRoutes from './ubicacionRoutes.js';
import catalogoRoutes from './catalogoRoutes.js';
import medicamentoRoutes from './medicamentoRoutes.js';
import loteRoutes from './loteRoutes.js';
import almacenRoutes from './almacenRoutes.js';
import donacionRoutes from './donacionRoutes.js';
import solicitudRoutes from './solicitudRoutes.js';
import personaRoutes from './personaRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import despachoRoutes from './despachoRoutes.js';
import proveedorRoutes from './proveedorRoutes.js';
import medicamentoSolicitadoRoutes from './medicamentoSolicitadoRoutes.js';
import enfermedadRoutes from './enfermedadRoutes.js';
import viaAdministracionRoutes from './viaAdministracionRoutes.js';
import formaFarmaceuticaRoutes from './formaFarmaceuticaRoutes.js';
import categoriaRoutes from './categoriaRoutes.js';

const router = Router();

// ==========================================================
// SWAGGER COMPONENTS
// ==========================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Provincia:
 *       type: object
 *       properties:
 *         CodigoProvincia:
 *           type: string
 *         nombre:
 *           type: string
 *     Ciudad:
 *       type: object
 *       properties:
 *         CodigoCiudad:
 *           type: string
 *         nombre:
 *           type: string
 *         CodigoProvincia:
 *           type: string
 *     Rol:
 *       type: object
 *       properties:
 *         CodigoRol:
 *           type: integer
 *         nombre:
 *           type: string
 *     Categoria:
 *       type: object
 *       properties:
 *         IDCategoria:
 *           type: integer
 *         nombre:
 *           type: string
 *     Medicamento:
 *       type: object
 *       properties:
 *         CodigoMedicamento:
 *           type: string
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         compuesto_principal:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *     Almacen:
 *       type: object
 *       properties:
 *         IDAlmacen:
 *           type: integer
 *         nombre:
 *           type: string
 *         direccion:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *     Proveedor:
 *       type: object
 *       properties:
 *         RNCProveedor:
 *           type: string
 *         nombre:
 *           type: string
 *         telefono:
 *           type: string
 *     Donacion:
 *       type: object
 *       properties:
 *         NumeroDonacion:
 *           type: integer
 *         fecha_recibida:
 *           type: string
 *           format: date-time
 *         descripcion:
 *           type: string
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalMedicamentos:
 *           type: integer
 *         totalAlmacenes:
 *           type: integer
 *         solicitudesPendientes:
 *           type: integer
 *         medicamentosProximosVencer:
 *           type: integer
 */

// ==========================================================
// RUTAS DE AUTENTICACIÓN (Sin middleware de auth)
// ==========================================================
router.use('/auth', authRoutes);

// ==========================================================
// APLICAR MIDDLEWARE DE AUTH A TODAS LAS RUTAS SIGUIENTES
// ==========================================================
router.use(authMiddleware);
router.use((req: Request, res: Response, next: NextFunction) => {
  adminMiddleware(req as AuthenticatedRequest, res, next);
});

// ==========================================================
// RUTAS PROTEGIDAS (Requieren autenticación de admin)
// ==========================================================

// Dashboard
router.use('/', dashboardRoutes);

// Geografía (Provincias, Ciudades)
router.use('/', ubicacionRoutes);

// Catálogos del sistema (Roles, Tipos Solicitud)
router.use('/', catalogoRoutes);

// Enfermedades
router.use('/enfermedades', enfermedadRoutes);

// Categorías de medicamentos
router.use('/categorias', categoriaRoutes);

// Vías de administración
router.use('/vias-administracion', viaAdministracionRoutes);

// Formas farmacéuticas
router.use('/formas-farmaceuticas', formaFarmaceuticaRoutes);

// Medicamentos e Inventario
router.use('/', medicamentoRoutes);

// Lotes
router.use('/lotes', loteRoutes);

// Almacenes, Centros Médicos
router.use('/', almacenRoutes);

// Proveedores (endpoint independiente)
router.use('/proveedores', proveedorRoutes);

// Donaciones
router.use('/donaciones', donacionRoutes);

// Solicitudes
router.use('/', solicitudRoutes);

// Despachos (endpoint independiente)
router.use('/despachos', despachoRoutes);

// Medicamentos Solicitados (texto libre del paciente)
router.use('/medicamentos-solicitados', medicamentoSolicitadoRoutes);

// Usuarios, Personas
router.use('/', personaRoutes);

export default router;
