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
 *     tags: [Admin - Almacenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de almacenes
 *   post:
 *     summary: Crear almacén
 *     tags: [Admin - Almacenes]
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

export default router;
