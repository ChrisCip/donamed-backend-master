import { Router } from 'express';
import catalogoController from '../controllers/catalogoController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/formas-farmaceuticas:
 *   get:
 *     summary: Listar formas farmacéuticas
 *     tags: [Admin - Formas Farmacéuticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de formas farmacéuticas
 *   post:
 *     summary: Crear forma farmacéutica
 *     tags: [Admin - Formas Farmacéuticas]
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
router.get('/', catalogoController.getFormasFarmaceuticas);
router.post('/', catalogoController.createFormaFarmaceutica);

/**
 * @swagger
 * /api/v1/admin/formas-farmaceuticas/{id}:
 *   put:
 *     summary: Actualizar forma farmacéutica
 *     tags: [Admin - Formas Farmacéuticas]
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
 *         description: Forma farmacéutica actualizada
 *       404:
 *         description: Forma no encontrada
 *   delete:
 *     summary: Eliminar forma farmacéutica
 *     tags: [Admin - Formas Farmacéuticas]
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
 *         description: Forma farmacéutica eliminada
 *       404:
 *         description: Forma no encontrada
 */
router.put('/:id', catalogoController.updateFormaFarmaceutica);
router.delete('/:id', catalogoController.deleteFormaFarmaceutica);

export default router;
