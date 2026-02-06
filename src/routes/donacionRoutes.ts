import { Router } from 'express';
import donacionController from '../controllers/donacionController.js';

const router = Router();

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
 *     description: Registra una donación con sus medicamentos
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
 *               proveedor:
 *                 type: string
 *                 description: RNC del proveedor
 *               descripcion:
 *                 type: string
 *               medicamentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idalmacen
 *                     - codigolote
 *                     - cantidad
 *                   properties:
 *                     idalmacen:
 *                       type: integer
 *                     codigolote:
 *                       type: string
 *                     cantidad:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Donación registrada
 */
router.get('/donaciones', donacionController.getDonaciones);
router.post('/donaciones', donacionController.createDonacion);

// Aliases en inglés
router.get('/donations', donacionController.getDonaciones);
router.post('/donations', donacionController.createDonacion);

/**
 * @swagger
 * /api/v1/admin/stats/donations:
 *   get:
 *     summary: Estadísticas de donaciones
 *     tags: [Admin - Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de donaciones
 */
router.get('/stats/donations', donacionController.getDonationsStats);

export default router;
