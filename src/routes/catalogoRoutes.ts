import { Router } from 'express';
import catalogoController from '../controllers/catalogoController.js';

const router = Router();

// ==========================================================
// ROLES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Admin - Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *   post:
 *     summary: Crear un rol
 *     tags: [Admin - Roles]
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
 *         description: Rol creado
 */
router.get('/roles', catalogoController.getRoles);
router.post('/roles', catalogoController.createRol);

/**
 * @swagger
 * /api/v1/admin/roles/{id}:
 *   put:
 *     summary: Actualizar rol
 *     tags: [Admin - Roles]
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
 *         description: Rol actualizado
 *       404:
 *         description: Rol no encontrado
 *   delete:
 *     summary: Eliminar rol
 *     tags: [Admin - Roles]
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
 *         description: Rol eliminado
 *       404:
 *         description: Rol no encontrado
 */
router.put('/roles/:id', catalogoController.updateRol);
router.delete('/roles/:id', catalogoController.deleteRol);

// ==========================================================
// TIPOS DE SOLICITUD
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/tipos-solicitud:
 *   get:
 *     summary: Listar tipos de solicitud
 *     tags: [Admin - Tipos de Solicitud]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de solicitud
 *   post:
 *     summary: Crear tipo de solicitud
 *     tags: [Admin - Tipos de Solicitud]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigotiposolicitud
 *               - descripcion
 *             properties:
 *               codigotiposolicitud:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de solicitud creado
 */
router.get('/tipos-solicitud', catalogoController.getTiposSolicitud);
router.post('/tipos-solicitud', catalogoController.createTipoSolicitud);

/**
 * @swagger
 * /api/v1/admin/tipos-solicitud/{id}:
 *   put:
 *     summary: Actualizar tipo de solicitud
 *     tags: [Admin - Tipos de Solicitud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo de solicitud actualizado
 *       404:
 *         description: Tipo no encontrado
 *   delete:
 *     summary: Eliminar tipo de solicitud
 *     tags: [Admin - Tipos de Solicitud]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tipo de solicitud eliminado
 *       404:
 *         description: Tipo no encontrado
 */
router.put('/tipos-solicitud/:id', catalogoController.updateTipoSolicitud);
router.delete('/tipos-solicitud/:id', catalogoController.deleteTipoSolicitud);

export default router;
