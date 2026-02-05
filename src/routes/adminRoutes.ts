import { Router, Request, Response, NextFunction } from 'express';
import adminController from '../controllers/adminController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import type { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// ==========================================================
// AUTENTICACIÓN ADMIN (Sin middleware de auth)
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: Inicio de sesión de administrador
 *     tags: [Admin - Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 example: admin@donamed.com
 *               contrasena:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna JWT + Info de Usuario.
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Acceso denegado (no es administrador)
 */
router.post('/auth/login', adminController.login);

/**
 * @swagger
 * /api/v1/admin/auth/refresh:
 *   post:
 *     summary: Refrescar token expirado
 *     tags: [Admin - Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 */
router.post('/auth/refresh', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  adminController.refreshToken(req as AuthenticatedRequest, res, next);
});

/**
 * @swagger
 * /api/v1/admin/auth/me:
 *   get:
 *     summary: Obtener perfil del administrador logueado
 *     tags: [Admin - Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del administrador
 */
router.get('/auth/me', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  // Verificar rol admin manualmente aquí (codigo_rol es ahora un número)
  // IDs de roles administrativos: 1 = Admin, 2 = SuperAdmin, 3 = Almacenista (ajustar según BD)
  const adminRoleIds = [1, 2, 3];
  if (authReq.user?.rol === null || authReq.user?.rol === undefined || !adminRoleIds.includes(authReq.user.rol)) {
    res.status(403).json({ success: false, error: { message: 'Acceso denegado. Se requieren permisos de administrador.' } });
    return;
  }
  adminController.getAdminProfile(authReq, res, next);
});

// Aplicar autenticación y verificación de rol admin a todas las rutas siguientes
router.use(authMiddleware);
router.use((req: Request, res: Response, next: NextFunction) => {
  adminMiddleware(req as AuthenticatedRequest, res, next);
});

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
 *           type: integer
 *         nombre:
 *           type: string
 *     Ciudad:
 *       type: object
 *       properties:
 *         CodigoCiudad:
 *           type: integer
 *         nombre:
 *           type: string
 *         CodigoProvincia:
 *           type: integer
 *     Rol:
 *       type: object
 *       properties:
 *         CodigoRol:
 *           type: string
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
 *         Cantidad_disponible_global:
 *           type: integer
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
 *         solicitudesHoy:
 *           type: integer
 *         medicamentosProximosVencer:
 *           type: integer
 *         inventarioTotal:
 *           type: integer
 */

// ==========================================================
// DASHBOARD
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/dashboard', adminController.getDashboardStats);

// ==========================================================
// PROVINCIAS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/provincias:
 *   get:
 *     summary: Listar todas las provincias
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de provincias
 *   post:
 *     summary: Crear una provincia
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoprovincia
 *               - nombre
 *             properties:
 *               codigoprovincia:
 *                 type: string
 *                 description: Código único de la provincia (ej. "DN", "SD", "VAL")
 *                 example: "VAL"
 *               nombre:
 *                 type: string
 *                 description: Nombre de la provincia
 *                 example: "Valverde"
 *           example:
 *             codigoprovincia: "VAL"
 *             nombre: "Valverde"
 *     responses:
 *       201:
 *         description: Provincia creada
 */
router.get('/provincias', adminController.getProvincias);
router.post('/provincias', adminController.createProvincia);

/**
 * @swagger
 * /api/v1/admin/provincias/{id}:
 *   put:
 *     summary: Actualizar una provincia
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provincia actualizada
 *   delete:
 *     summary: Eliminar una provincia
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Provincia eliminada
 */
router.put('/provincias/:id', adminController.updateProvincia);
router.delete('/provincias/:id', adminController.deleteProvincia);

// ==========================================================
// CIUDADES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/ciudades:
 *   get:
 *     summary: Listar ciudades
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provinciaId
 *         schema:
 *           type: integer
 *         description: Filtrar por provincia
 *     responses:
 *       200:
 *         description: Lista de ciudades
 *   post:
 *     summary: Crear una ciudad
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigociudad
 *               - nombre
 *               - codigoprovincia
 *             properties:
 *               codigociudad:
 *                 type: string
 *                 description: Código único de la ciudad
 *                 example: "MAO"
 *               nombre:
 *                 type: string
 *                 description: Nombre de la ciudad
 *                 example: "Mao"
 *               codigoprovincia:
 *                 type: string
 *                 description: Código de la provincia a la que pertenece
 *                 example: "VAL"
 *           example:
 *             codigociudad: "MAO"
 *             nombre: "Mao"
 *             codigoprovincia: "VAL"
 *     responses:
 *       201:
 *         description: Ciudad creada
 */
router.get('/ciudades', adminController.getCiudades);
router.post('/ciudades', adminController.createCiudad);
router.put('/ciudades/:id', adminController.updateCiudad);
router.delete('/ciudades/:id', adminController.deleteCiudad);

// ==========================================================
// ROLES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Crear un rol
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CodigoRol
 *               - nombre
 *             properties:
 *               CodigoRol:
 *                 type: string
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rol creado
 */
router.get('/roles', adminController.getRoles);
router.post('/roles', adminController.createRol);
router.put('/roles/:codigo', adminController.updateRol);
router.delete('/roles/:codigo', adminController.deleteRol);

// ==========================================================
// CATEGORÍAS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/categorias:
 *   get:
 *     summary: Listar categorías de medicamentos
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *   post:
 *     summary: Crear categoría
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.get('/categorias', adminController.getCategorias);
router.post('/categorias', adminController.createCategoria);
router.put('/categorias/:id', adminController.updateCategoria);
router.delete('/categorias/:id', adminController.deleteCategoria);

// ==========================================================
// ENFERMEDADES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/enfermedades:
 *   get:
 *     summary: Listar enfermedades
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de enfermedades
 *   post:
 *     summary: Crear enfermedad
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enfermedad creada
 */
router.get('/enfermedades', adminController.getEnfermedades);
router.post('/enfermedades', adminController.createEnfermedad);
router.put('/enfermedades/:id', adminController.updateEnfermedad);
router.delete('/enfermedades/:id', adminController.deleteEnfermedad);

// ==========================================================
// VÍAS DE ADMINISTRACIÓN
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/vias-administracion:
 *   get:
 *     summary: Listar vías de administración
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vías de administración
 *   post:
 *     summary: Crear vía de administración
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vía de administración creada
 */
router.get('/vias-administracion', adminController.getViasAdministracion);
router.post('/vias-administracion', adminController.createViaAdministracion);
router.put('/vias-administracion/:id', adminController.updateViaAdministracion);
router.delete('/vias-administracion/:id', adminController.deleteViaAdministracion);

// ==========================================================
// FORMAS FARMACÉUTICAS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/formas-farmaceuticas:
 *   get:
 *     summary: Listar formas farmacéuticas
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de formas farmacéuticas
 *   post:
 *     summary: Crear forma farmacéutica
 *     tags: [Admin - Catálogos Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Forma farmacéutica creada
 */
router.get('/formas-farmaceuticas', adminController.getFormasFarmaceuticas);
router.post('/formas-farmaceuticas', adminController.createFormaFarmaceutica);
router.put('/formas-farmaceuticas/:id', adminController.updateFormaFarmaceutica);
router.delete('/formas-farmaceuticas/:id', adminController.deleteFormaFarmaceutica);

// ==========================================================
// MEDICAMENTOS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/medicamentos:
 *   get:
 *     summary: Listar medicamentos con paginación
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, código o compuesto
 *     responses:
 *       200:
 *         description: Lista de medicamentos paginada
 *   post:
 *     summary: Crear medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CodigoMedicamento
 *               - nombre
 *             properties:
 *               CodigoMedicamento:
 *                 type: string
 *                 description: Código único del medicamento
 *                 example: "MED-001"
 *               nombre:
 *                 type: string
 *                 example: "Ibuprofeno 400mg"
 *               descripcion:
 *                 type: string
 *                 example: "Antiinflamatorio no esteroideo"
 *               compuesto_principal:
 *                 type: string
 *                 example: "Ibuprofeno"
 *               IDVia:
 *                 type: integer
 *                 description: ID de la vía de administración (debe existir)
 *                 example: 1
 *               IDForma_Farmaceutica:
 *                 type: integer
 *                 description: ID de la forma farmacéutica (debe existir)
 *                 example: 1
 *               categorias:
 *                 type: array
 *                 description: Array de IDs de categorías (deben existir)
 *                 items:
 *                   type: integer
 *                 example: [1]
 *               enfermedades:
 *                 type: array
 *                 description: Array de IDs de enfermedades (deben existir)
 *                 items:
 *                   type: integer
 *                 example: [1]
 *           example:
 *             CodigoMedicamento: "MED-001"
 *             nombre: "Ibuprofeno 400mg"
 *             descripcion: "Antiinflamatorio no esteroideo para dolor y fiebre"
 *             compuesto_principal: "Ibuprofeno"
 *             IDVia: 1
 *             IDForma_Farmaceutica: 1
 *             categorias: [1]
 *             enfermedades: [1]
 *     responses:
 *       201:
 *         description: Medicamento creado
 */
router.get('/medicamentos', adminController.getMedicamentos);
router.post('/medicamentos', adminController.createMedicamento);

/**
 * @swagger
 * /api/v1/admin/medicamentos/{codigo}:
 *   get:
 *     summary: Obtener detalle de medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del medicamento
 *   put:
 *     summary: Actualizar medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Medicamento actualizado
 *   delete:
 *     summary: Eliminar medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento eliminado
 */
router.get('/medicamentos/:codigo', adminController.getMedicamentoById);
router.put('/medicamentos/:codigo', adminController.updateMedicamento);
router.delete('/medicamentos/:codigo', adminController.deleteMedicamento);

// ==========================================================
// LOTES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/lotes:
 *   get:
 *     summary: Listar lotes
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: medicamentoId
 *         schema:
 *           type: string
 *         description: Filtrar por medicamento
 *     responses:
 *       200:
 *         description: Lista de lotes
 *   post:
 *     summary: Crear lote
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CodigoMedicamento
 *               - NumeroLoteFabricante
 *               - FechaVencimiento
 *             properties:
 *               CodigoMedicamento:
 *                 type: string
 *               NumeroLoteFabricante:
 *                 type: string
 *               FechaVencimiento:
 *                 type: string
 *                 format: date
 *               FechaFabricacion:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Lote creado
 */
router.get('/lotes', adminController.getLotes);
router.post('/lotes', adminController.createLote);
router.delete('/lotes/:id', adminController.deleteLote);

// ==========================================================
// ALMACENES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/almacenes:
 *   get:
 *     summary: Listar almacenes
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de almacenes
 *   post:
 *     summary: Crear almacén
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               CodigoCiudad:
 *                 type: integer
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Almacén creado
 */
router.get('/almacenes', adminController.getAlmacenes);
router.post('/almacenes', adminController.createAlmacen);
router.get('/almacenes/:id', adminController.getAlmacenById);
router.put('/almacenes/:id', adminController.updateAlmacen);
router.delete('/almacenes/:id', adminController.deleteAlmacen);

// ==========================================================
// INVENTARIO
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/inventario:
 *   get:
 *     summary: Ver inventario
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: almacenId
 *         schema:
 *           type: integer
 *         description: Filtrar por almacén
 *     responses:
 *       200:
 *         description: Lista de inventario
 *   post:
 *     summary: Ajustar inventario
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - IDAlmacen
 *               - CodigoLote
 *               - CodigoMedicamento
 *               - Cantidad
 *             properties:
 *               IDAlmacen:
 *                 type: integer
 *               CodigoLote:
 *                 type: integer
 *               CodigoMedicamento:
 *                 type: string
 *               Cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Inventario ajustado
 */
router.get('/inventario', adminController.getInventario);
router.post('/inventario', adminController.ajustarInventario);

// ==========================================================
// PROVEEDORES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/proveedores:
 *   get:
 *     summary: Listar proveedores
 *     tags: [Admin - Proveedores y Donaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *   post:
 *     summary: Crear proveedor
 *     tags: [Admin - Proveedores y Donaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - RNCProveedor
 *               - nombre
 *             properties:
 *               RNCProveedor:
 *                 type: string
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               CodigoCiudad:
 *                 type: integer
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proveedor creado
 */
router.get('/proveedores', adminController.getProveedores);
router.post('/proveedores', adminController.createProveedor);
router.put('/proveedores/:rnc', adminController.updateProveedor);
router.delete('/proveedores/:rnc', adminController.deleteProveedor);

// ==========================================================
// CENTROS MÉDICOS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/centros-medicos:
 *   get:
 *     summary: Listar centros médicos
 *     tags: [Admin - Centros Médicos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de centros médicos
 *   post:
 *     summary: Crear centro médico
 *     tags: [Admin - Centros Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               CodigoCiudad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Centro médico creado
 */
router.get('/centros-medicos', adminController.getCentrosMedicos);
router.post('/centros-medicos', adminController.createCentroMedico);
router.put('/centros-medicos/:id', adminController.updateCentroMedico);
router.delete('/centros-medicos/:id', adminController.deleteCentroMedico);

// ==========================================================
// TIPOS DE SOLICITUD
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/tipos-solicitud:
 *   get:
 *     summary: Listar tipos de solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de solicitud
 *   post:
 *     summary: Crear tipo de solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CodigoTipoSolicitud
 *               - Descripcion
 *             properties:
 *               CodigoTipoSolicitud:
 *                 type: string
 *               Descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de solicitud creado
 */
router.get('/tipos-solicitud', adminController.getTiposSolicitud);
router.post('/tipos-solicitud', adminController.createTipoSolicitud);
router.delete('/tipos-solicitud/:codigo', adminController.deleteTipoSolicitud);

// ==========================================================
// DONACIONES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/donaciones:
 *   get:
 *     summary: Listar donaciones
 *     tags: [Admin - Proveedores y Donaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de donaciones
 *   post:
 *     summary: Registrar donación
 *     description: Registra una donación con sus medicamentos. Crea lotes automáticamente si no existen y actualiza el inventario.
 *     tags: [Admin - Proveedores y Donaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicamentos
 *             properties:
 *               Proveedor:
 *                 type: string
 *                 description: RNC del proveedor
 *               descripcion:
 *                 type: string
 *               medicamentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - IDAlmacen
 *                     - CodigoMedicamento
 *                     - NumeroLoteFabricante
 *                     - FechaVencimiento
 *                     - Cantidad
 *                   properties:
 *                     IDAlmacen:
 *                       type: integer
 *                     CodigoMedicamento:
 *                       type: string
 *                     NumeroLoteFabricante:
 *                       type: string
 *                     FechaVencimiento:
 *                       type: string
 *                       format: date
 *                     FechaFabricacion:
 *                       type: string
 *                       format: date
 *                     Cantidad:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Donación registrada
 */
router.get('/donaciones', adminController.getDonaciones);
router.post('/donaciones', adminController.createDonacion);

// ==========================================================
// SOLICITUDES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/solicitudes:
 *   get:
 *     summary: Listar solicitudes
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, APROBADA, RECHAZADA, DESPACHADA]
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get('/solicitudes', adminController.getSolicitudes);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}:
 *   get:
 *     summary: Obtener detalle de solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de solicitud (incluye docs JSON y relación con Persona)
 */
router.get('/solicitudes/:id', adminController.getSolicitudById);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/evaluate:
 *   patch:
 *     summary: Evaluar solicitud (Aprobar/Rechazar)
 *     description: Aprobar o rechazar una solicitud. Si se aprueba, debe reservar stock específico de un Lote y Almacén.
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [APROBADA, RECHAZADA]
 *               detalles:
 *                 type: array
 *                 description: Requerido si estado es APROBADA. Especifica los lotes y almacenes para reservar stock.
 *                 items:
 *                   type: object
 *                   required:
 *                     - IDAlmacen
 *                     - CodigoLote
 *                     - Cantidad
 *                   properties:
 *                     IDAlmacen:
 *                       type: integer
 *                     CodigoLote:
 *                       type: integer
 *                     Cantidad:
 *                       type: integer
 *                     Dosis_Indicada:
 *                       type: string
 *                     Tiempo_Tratamiento:
 *                       type: string
 *     responses:
 *       200:
 *         description: Solicitud evaluada exitosamente
 *       400:
 *         description: Solo se pueden evaluar solicitudes pendientes o stock insuficiente
 *       404:
 *         description: Solicitud o lote no encontrado
 */
router.patch('/solicitudes/:id/evaluate', adminController.evaluateSolicitud);

// Alias para compatibilidad con spec: /api/v1/admin/requests/:id/evaluate
router.patch('/requests/:id/evaluate', adminController.evaluateSolicitud);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/dispatch:
 *   post:
 *     summary: Generar despacho para una solicitud aprobada
 *     description: Finaliza el flujo de la solicitud generando un registro en Tabla Despacho.
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula_recibido_por:
 *                 type: string
 *                 description: Cédula de quien recibe el despacho
 *     responses:
 *       201:
 *         description: Despacho creado exitosamente
 */
router.post('/solicitudes/:id/dispatch', (req, res, next) => {
  req.body.NumeroSolicitud = parseInt(req.params.id);
  req.body.Cedula_Recibe = req.body.cedula_recibido_por;
  adminController.createDespacho(req, res, next);
});

// Alias para compatibilidad con spec: /api/v1/admin/requests/:id/dispatch
router.post('/requests/:id/dispatch', (req, res, next) => {
  req.body.NumeroSolicitud = parseInt(req.params.id);
  req.body.Cedula_Recibe = req.body.cedula_recibido_por;
  adminController.createDespacho(req, res, next);
});

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, APROBADA, RECHAZADA, DESPACHADA]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/solicitudes/:id/estado', adminController.updateSolicitudEstado);

/**
 * @swagger
 * /api/v1/admin/despachos:
 *   post:
 *     summary: Crear despacho
 *     description: Crea un despacho para una solicitud aprobada. Descuenta del inventario automáticamente.
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - NumeroSolicitud
 *             properties:
 *               NumeroSolicitud:
 *                 type: integer
 *               Cedula_Recibe:
 *                 type: string
 *     responses:
 *       201:
 *         description: Despacho creado
 */
router.post('/despachos', adminController.createDespacho);

// ==========================================================
// USUARIOS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/usuarios:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crear usuario
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               cedula_usuario:
 *                 type: string
 *               codigo_rol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.get('/usuarios', adminController.getUsuarios);
router.post('/usuarios', adminController.createUsuario);

/**
 * @swagger
 * /api/v1/admin/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               codigo_rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.put('/usuarios/:id', adminController.updateUsuario);
router.delete('/usuarios/:id', adminController.deleteUsuario);

// ==========================================================
// ESTADÍSTICAS Y REPORTES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/stats/expiring:
 *   get:
 *     summary: Lotes próximos a vencer
 *     description: Obtiene lotes que vencerán en los próximos días (30/60/90)
 *     tags: [Admin - Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Días para filtrar (30, 60, 90)
 *     responses:
 *       200:
 *         description: Lista de lotes próximos a vencer con información de stock
 */
router.get('/stats/expiring', adminController.getExpiringBatches);

/**
 * @swagger
 * /api/v1/admin/stats/donations:
 *   get:
 *     summary: Estadísticas de donaciones vs despachos
 *     description: Total donado vs Total despachado con desglose mensual
 *     tags: [Admin - Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de donaciones y despachos
 */
router.get('/stats/donations', adminController.getDonationsStats);

/**
 * @swagger
 * /api/v1/admin/stats/pathologies:
 *   get:
 *     summary: Top enfermedades/patologías solicitadas
 *     description: Ranking de patologías más solicitadas
 *     tags: [Admin - Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados
 *     responses:
 *       200:
 *         description: Top patologías solicitadas
 */
router.get('/stats/pathologies', adminController.getPathologiesStats);

// ==========================================================
// INVENTARIO - LOTES Y STOCK
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/inventory/batches:
 *   get:
 *     summary: Ver lotes con filtros
 *     description: Obtener lotes filtrados por fecha de vencimiento para alertas
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: FechaVencimiento
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar lotes que vencen antes de esta fecha
 *       - in: query
 *         name: CodigoMedicamento
 *         schema:
 *           type: string
 *         description: Filtrar por medicamento
 *       - in: query
 *         name: diasParaVencer
 *         schema:
 *           type: integer
 *         description: Filtrar lotes que vencen en los próximos X días
 *     responses:
 *       200:
 *         description: Lista de lotes
 */
router.get('/inventory/batches', adminController.getBatchesWithFilters);

/**
 * @swagger
 * /api/v1/admin/inventory/stock:
 *   get:
 *     summary: Vista consolidada de stock
 *     description: Stock consolidado de Almacen_Medicamento agrupado por almacén y medicamento
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: almacenId
 *         schema:
 *           type: integer
 *         description: Filtrar por almacén específico
 *     responses:
 *       200:
 *         description: Stock consolidado
 */
router.get('/inventory/stock', adminController.getConsolidatedStock);

// ==========================================================
// ALIASES PARA COMPATIBILIDAD CON API SPEC
// ==========================================================

// Requests (alias de solicitudes)
router.get('/requests', adminController.getSolicitudes);
router.get('/requests/:id', adminController.getSolicitudById);

// Medicines (alias de medicamentos)
router.get('/medicines', adminController.getMedicamentos);
router.post('/medicines', adminController.createMedicamento);
router.get('/medicines/:code', (req, res, next) => {
  (req.params as any).codigo = req.params.code;
  adminController.getMedicamentoById(req, res, next);
});
router.put('/medicines/:code', (req, res, next) => {
  (req.params as any).codigo = req.params.code;
  adminController.updateMedicamento(req, res, next);
});
router.delete('/medicines/:code', (req, res, next) => {
  (req.params as any).codigo = req.params.code;
  adminController.deleteMedicamento(req, res, next);
});

// Categories (alias de categorias)
router.get('/categories', adminController.getCategorias);
router.post('/categories', adminController.createCategoria);
router.put('/categories/:id', adminController.updateCategoria);

// Pharma forms (alias de formas-farmaceuticas)
router.get('/pharma-forms', adminController.getFormasFarmaceuticas);
router.post('/pharma-forms', adminController.createFormaFarmaceutica);
router.put('/pharma-forms/:id', adminController.updateFormaFarmaceutica);

// Admin routes (alias de vias-administracion)
router.get('/admin-routes', adminController.getViasAdministracion);
router.post('/admin-routes', adminController.createViaAdministracion);
router.put('/admin-routes/:id', adminController.updateViaAdministracion);

// Providers (alias de proveedores)
router.get('/providers', adminController.getProveedores);
router.post('/providers', adminController.createProveedor);

// Donations (alias de donaciones)
router.get('/donations', adminController.getDonaciones);
router.post('/donations', adminController.createDonacion);

// Warehouses (alias de almacenes)
router.get('/warehouses', adminController.getAlmacenes);
router.post('/warehouses', adminController.createAlmacen);

// Diseases (alias de enfermedades)
router.get('/diseases', adminController.getEnfermedades);
router.post('/diseases', adminController.createEnfermedad);
router.put('/diseases/:id', adminController.updateEnfermedad);

// Medical centers (alias de centros-medicos)
router.get('/medical-centers', adminController.getCentrosMedicos);
router.post('/medical-centers', adminController.createCentroMedico);
router.put('/medical-centers/:id', adminController.updateCentroMedico);

// Cities (alias de ciudades para gestión geográfica)
router.get('/cities', adminController.getCiudades);
router.post('/cities', adminController.createCiudad);
router.put('/cities/:id', adminController.updateCiudad);

// Users management
router.get('/users', adminController.getUsuarios);
router.post('/users/staff', adminController.createUsuario);
router.patch('/users/:id/role', (req, res, next) => {
  adminController.updateUsuario(req, res, next);
});
router.patch('/users/:id/status', (req, res, next) => {
  // Para banear/activar usuario, actualizar el rol o algún campo de estado
  adminController.updateUsuario(req, res, next);
});

export default router;
