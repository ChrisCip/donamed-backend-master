import { Router } from 'express';
import despachoController from '../controllers/despachoController.js';

const router = Router();

// ==========================================================
// DESPACHOS - ENDPOINT INDEPENDIENTE
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/despachos:
 *   get:
 *     summary: Listar todos los despachos
 *     description: Obtiene la lista de despachos con paginación y filtros opcionales
 *     tags: [Admin - Despachos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: solicitud
 *         schema:
 *           type: integer
 *         description: Filtrar por número de solicitud
 *     responses:
 *       200:
 *         description: Lista de despachos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *   post:
 *     summary: Crear un nuevo despacho
 *     description: Crea un despacho para una solicitud aprobada y descuenta del inventario
 *     tags: [Admin - Despachos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - solicitud
 *             properties:
 *               solicitud:
 *                 type: integer
 *                 description: Número de la solicitud a despachar
 *               cedula_recibe:
 *                 type: string
 *                 description: Cédula de quien recibe (11 dígitos)
 *                 example: "00112233445"
 *     responses:
 *       201:
 *         description: Despacho creado exitosamente
 *       400:
 *         description: La solicitud no está aprobada o cédula inválida
 *       404:
 *         description: Solicitud no encontrada
 *       409:
 *         description: Ya existe un despacho para esta solicitud
 */
router.get('/', despachoController.getDespachos);
router.post('/', despachoController.createDespacho);

/**
 * @swagger
 * /api/v1/admin/despachos/{id}:
 *   get:
 *     summary: Obtener detalle de un despacho
 *     tags: [Admin - Despachos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de despacho
 *     responses:
 *       200:
 *         description: Detalle del despacho
 *       404:
 *         description: Despacho no encontrado
 *   put:
 *     summary: Actualizar un despacho
 *     tags: [Admin - Despachos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de despacho
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula_recibe:
 *                 type: string
 *                 description: Nueva cédula de quien recibe (11 dígitos)
 *     responses:
 *       200:
 *         description: Despacho actualizado
 *       404:
 *         description: Despacho no encontrado
 *   delete:
 *     summary: Eliminar un despacho
 *     description: Elimina el despacho y revierte el estado de la solicitud a APROBADA
 *     tags: [Admin - Despachos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de despacho
 *     responses:
 *       200:
 *         description: Despacho eliminado
 *       404:
 *         description: Despacho no encontrado
 */
router.get('/:id', despachoController.getDespachoById);
router.put('/:id', despachoController.updateDespacho);
router.delete('/:id', despachoController.deleteDespacho);

export default router;
