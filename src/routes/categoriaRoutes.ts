import { Router } from 'express';
import catalogoController from '../controllers/catalogoController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/categorias:
 *   get:
 *     summary: Listar categorías de medicamentos
 *     tags: [Admin - Categorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *   post:
 *     summary: Crear categoría
 *     tags: [Admin - Categorías]
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
router.get('/', catalogoController.getCategorias);
router.post('/', catalogoController.createCategoria);

/**
 * @swagger
 * /api/v1/admin/categorias/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags: [Admin - Categorías]
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
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 *   delete:
 *     summary: Eliminar categoría
 *     tags: [Admin - Categorías]
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
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id', catalogoController.updateCategoria);
router.delete('/:id', catalogoController.deleteCategoria);

export default router;
