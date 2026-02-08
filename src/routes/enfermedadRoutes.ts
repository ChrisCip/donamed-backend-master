import { Router } from 'express';
import catalogoController from '../controllers/catalogoController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/enfermedades:
 *   get:
 *     summary: Listar enfermedades
 *     tags: [Admin - Enfermedades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de enfermedades
 *   post:
 *     summary: Crear enfermedad
 *     tags: [Admin - Enfermedades]
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
router.get('/', catalogoController.getEnfermedades);
router.post('/', catalogoController.createEnfermedad);

/**
 * @swagger
 * /api/v1/admin/enfermedades/{id}:
 *   put:
 *     summary: Actualizar enfermedad
 *     tags: [Admin - Enfermedades]
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
 *         description: Enfermedad actualizada
 *       404:
 *         description: Enfermedad no encontrada
 *   delete:
 *     summary: Eliminar enfermedad
 *     tags: [Admin - Enfermedades]
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
 *         description: Enfermedad eliminada
 *       404:
 *         description: Enfermedad no encontrada
 */
router.put('/:id', catalogoController.updateEnfermedad);
router.delete('/:id', catalogoController.deleteEnfermedad);

export default router;
