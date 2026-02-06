import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import type { AuthenticatedRequest } from '../types/index.js';

// Importar rutas modulares
import authRoutes from './authRoutes.js';
import ubicacionRoutes from './ubicacionRoutes.js';
import catalogoRoutes from './catalogoRoutes.js';
import medicamentoRoutes from './medicamentoRoutes.js';
import almacenRoutes from './almacenRoutes.js';
import donacionRoutes from './donacionRoutes.js';
import solicitudRoutes from './solicitudRoutes.js';
import personaRoutes from './personaRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

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

// Catálogos (Roles, Categorías, Enfermedades, Vías, Formas, Tipos Solicitud)
router.use('/', catalogoRoutes);

// Medicamentos, Lotes, Inventario
router.use('/', medicamentoRoutes);

// Almacenes, Proveedores, Centros Médicos
router.use('/', almacenRoutes);

// Donaciones
router.use('/', donacionRoutes);

// Solicitudes, Despachos
router.use('/', solicitudRoutes);

// Usuarios, Personas
router.use('/', personaRoutes);

export default router;
