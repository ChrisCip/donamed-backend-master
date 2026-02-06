import { Router } from 'express';
import almacenController from '../controllers/almacenController.js';

const router = Router();

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
 *               - telefono
 *               - correo
 *             properties:
 *               nombre:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Almacén creado
 */
router.get('/almacenes', almacenController.getAlmacenes);
router.post('/almacenes', almacenController.createAlmacen);
router.get('/almacenes/:id', almacenController.getAlmacenById);
router.put('/almacenes/:id', almacenController.updateAlmacen);
router.delete('/almacenes/:id', almacenController.deleteAlmacen);

// Aliases en inglés
router.get('/warehouses', almacenController.getAlmacenes);
router.post('/warehouses', almacenController.createAlmacen);

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
 *               - rncproveedor
 *               - nombre
 *             properties:
 *               rncproveedor:
 *                 type: string
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proveedor creado
 */
router.get('/proveedores', almacenController.getProveedores);
router.post('/proveedores', almacenController.createProveedor);
router.get('/proveedores/:id', almacenController.getProveedorById);
router.put('/proveedores/:id', almacenController.updateProveedor);
router.delete('/proveedores/:id', almacenController.deleteProveedor);

// Aliases en inglés
router.get('/providers', almacenController.getProveedores);
router.post('/providers', almacenController.createProveedor);

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
 *     responses:
 *       201:
 *         description: Centro médico creado
 */
router.get('/centros-medicos', almacenController.getCentrosMedicos);
router.post('/centros-medicos', almacenController.createCentroMedico);
router.get('/centros-medicos/:id', almacenController.getCentroMedicoById);
router.put('/centros-medicos/:id', almacenController.updateCentroMedico);
router.delete('/centros-medicos/:id', almacenController.deleteCentroMedico);

// Aliases en inglés
router.get('/medical-centers', almacenController.getCentrosMedicos);
router.post('/medical-centers', almacenController.createCentroMedico);
router.put('/medical-centers/:id', almacenController.updateCentroMedico);

export default router;
