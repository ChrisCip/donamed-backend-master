import { Router } from 'express';
import catalogoController from '../controllers/catalogoController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/vias-administracion:
 *   get:
 *     summary: Listar vías de administración
 *     tags: [Admin - Vías de Administración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vías de administración
 *   post:
 *     summary: Crear vía de administración
 *     tags: [Admin - Vías de Administración]
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
router.get('/', catalogoController.getViasAdministracion);
router.post('/', catalogoController.createViaAdministracion);

/**
 * @swagger
 * /api/v1/admin/vias-administracion/{id}:
 *   put:
 *     summary: Actualizar vía de administración
 *     tags: [Admin - Vías de Administración]
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
 *         description: Vía de administración actualizada
 *       404:
 *         description: Vía no encontrada
 *   delete:
 *     summary: Eliminar vía de administración
 *     tags: [Admin - Vías de Administración]
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
 *         description: Vía de administración eliminada
 *       404:
 *         description: Vía no encontrada
 */
router.put('/:id', catalogoController.updateViaAdministracion);
router.delete('/:id', catalogoController.deleteViaAdministracion);

export default router;
