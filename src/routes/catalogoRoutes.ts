import { Router } from 'express';
import catalogoController from '../controllers/catalogoController.js';

const router = Router();

// ==========================================================
// ROLES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Admin - Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Crear un rol
 *     tags: [Admin - Catálogos]
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
 *         description: Rol creado
 */
router.get('/roles', catalogoController.getRoles);
router.post('/roles', catalogoController.createRol);
router.put('/roles/:id', catalogoController.updateRol);
router.delete('/roles/:id', catalogoController.deleteRol);

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
router.get('/categorias', catalogoController.getCategorias);
router.post('/categorias', catalogoController.createCategoria);
router.put('/categorias/:id', catalogoController.updateCategoria);
router.delete('/categorias/:id', catalogoController.deleteCategoria);

// Aliases en inglés
router.get('/categories', catalogoController.getCategorias);
router.post('/categories', catalogoController.createCategoria);
router.put('/categories/:id', catalogoController.updateCategoria);

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
router.get('/enfermedades', catalogoController.getEnfermedades);
router.post('/enfermedades', catalogoController.createEnfermedad);
router.put('/enfermedades/:id', catalogoController.updateEnfermedad);
router.delete('/enfermedades/:id', catalogoController.deleteEnfermedad);

// Aliases en inglés
router.get('/diseases', catalogoController.getEnfermedades);
router.post('/diseases', catalogoController.createEnfermedad);
router.put('/diseases/:id', catalogoController.updateEnfermedad);

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
router.get('/vias-administracion', catalogoController.getViasAdministracion);
router.post('/vias-administracion', catalogoController.createViaAdministracion);
router.put('/vias-administracion/:id', catalogoController.updateViaAdministracion);
router.delete('/vias-administracion/:id', catalogoController.deleteViaAdministracion);

// Aliases en inglés
router.get('/admin-routes', catalogoController.getViasAdministracion);
router.post('/admin-routes', catalogoController.createViaAdministracion);
router.put('/admin-routes/:id', catalogoController.updateViaAdministracion);

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
router.get('/formas-farmaceuticas', catalogoController.getFormasFarmaceuticas);
router.post('/formas-farmaceuticas', catalogoController.createFormaFarmaceutica);
router.put('/formas-farmaceuticas/:id', catalogoController.updateFormaFarmaceutica);
router.delete('/formas-farmaceuticas/:id', catalogoController.deleteFormaFarmaceutica);

// Aliases en inglés
router.get('/pharma-forms', catalogoController.getFormasFarmaceuticas);
router.post('/pharma-forms', catalogoController.createFormaFarmaceutica);
router.put('/pharma-forms/:id', catalogoController.updateFormaFarmaceutica);

// ==========================================================
// TIPOS DE SOLICITUD
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/tipos-solicitud:
 *   get:
 *     summary: Listar tipos de solicitud
 *     tags: [Admin - Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de solicitud
 *   post:
 *     summary: Crear tipo de solicitud
 *     tags: [Admin - Catálogos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigotiposolicitud
 *               - descripcion
 *             properties:
 *               codigotiposolicitud:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de solicitud creado
 */
router.get('/tipos-solicitud', catalogoController.getTiposSolicitud);
router.post('/tipos-solicitud', catalogoController.createTipoSolicitud);
router.put('/tipos-solicitud/:id', catalogoController.updateTipoSolicitud);
router.delete('/tipos-solicitud/:id', catalogoController.deleteTipoSolicitud);

export default router;
