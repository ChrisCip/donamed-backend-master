import { Router } from 'express';
import loteController from '../controllers/loteController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin - Lotes
 *   description: Gestión de lotes de medicamentos
 */

/**
 * @swagger
 * /api/v1/admin/lotes:
 *   get:
 *     summary: Listar lotes
 *     tags: [Admin - Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: medicamento
 *         schema:
 *           type: string
 *         description: Filtrar por código de medicamento
 *       - in: query
 *         name: vencidos
 *         schema:
 *           type: boolean
 *         description: true=vencidos, false=vigentes
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de lotes
 *   post:
 *     summary: Crear lote
 *     tags: [Admin - Lotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigolote
 *               - codigomedicamento
 *               - fechavencimiento
 *               - fechafabricacion
 *             properties:
 *               codigolote:
 *                 type: string
 *                 example: "L-2026-003"
 *               codigomedicamento:
 *                 type: string
 *                 example: "MED-001"
 *               fechavencimiento:
 *                 type: string
 *                 format: date
 *                 example: "2027-12-31"
 *               fechafabricacion:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *     responses:
 *       201:
 *         description: Lote creado
 */
router.get('/', loteController.getLotes);
router.post('/', loteController.createLote);

/**
 * @swagger
 * /api/v1/admin/lotes/{id}:
 *   delete:
 *     summary: Eliminar lote
 *     tags: [Admin - Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del lote
 *     responses:
 *       200:
 *         description: Lote eliminado
 */
router.delete('/:id', loteController.deleteLote);

export default router;
