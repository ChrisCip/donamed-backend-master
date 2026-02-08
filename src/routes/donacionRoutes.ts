import { Router } from 'express';
import donacionController from '../controllers/donacionController.js';

const router = Router();

// ==========================================================
// DONACIONES - CRUD COMPLETO
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/donaciones:
 *   get:
 *     summary: Listar donaciones
 *     tags: [Admin - Donaciones]
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
 *         name: proveedor
 *         schema:
 *           type: string
 *         description: Filtrar por RNC del proveedor
 *     responses:
 *       200:
 *         description: Lista de donaciones
 *   post:
 *     summary: Registrar donación
 *     description: Registra una donación con sus medicamentos. Si se proporcionan medicamentos, se actualiza el inventario automáticamente.
 *     tags: [Admin - Donaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proveedor:
 *                 type: string
 *                 description: RNC del proveedor (9 dígitos) o cédula (11 dígitos)
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
 *       400:
 *         description: RNC/Cédula inválido o lote/almacén no existe
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/', donacionController.getDonaciones);
router.post('/', donacionController.createDonacion);

/**
 * @swagger
 * /api/v1/admin/donaciones/{id}:
 *   get:
 *     summary: Obtener detalle de donación
 *     tags: [Admin - Donaciones]
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
 *         description: Detalle de la donación
 *       404:
 *         description: Donación no encontrada
 *   put:
 *     summary: Actualizar donación
 *     description: Actualiza la descripción o proveedor de una donación existente
 *     tags: [Admin - Donaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proveedor:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Donación actualizada
 *       404:
 *         description: Donación no encontrada
 *   delete:
 *     summary: Eliminar donación
 *     description: Elimina la donación y revierte el inventario
 *     tags: [Admin - Donaciones]
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
 *         description: Donación eliminada
 *       404:
 *         description: Donación no encontrada
 */
router.get('/:id', donacionController.getDonacionById);
router.put('/:id', donacionController.updateDonacion);
router.delete('/:id', donacionController.deleteDonacion);

/**
 * @swagger
 * /api/v1/admin/donaciones/{id}/medicamentos:
 *   post:
 *     summary: Agregar medicamentos a una donación existente
 *     tags: [Admin - Donaciones]
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
 *               - medicamentos
 *             properties:
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
 *       200:
 *         description: Medicamentos agregados
 *       404:
 *         description: Donación no encontrada
 */
router.post('/:id/medicamentos', donacionController.addMedicamentosToDonacion);

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
