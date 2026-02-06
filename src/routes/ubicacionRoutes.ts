import { Router } from 'express';
import ubicacionController from '../controllers/ubicacionController.js';

const router = Router();

// ==========================================================
// PROVINCIAS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/provincias:
 *   get:
 *     summary: Listar todas las provincias
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de provincias
 *   post:
 *     summary: Crear una provincia
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoprovincia
 *               - nombre
 *             properties:
 *               codigoprovincia:
 *                 type: string
 *                 example: "VAL"
 *               nombre:
 *                 type: string
 *                 example: "Valverde"
 *     responses:
 *       201:
 *         description: Provincia creada
 */
router.get('/provincias', ubicacionController.getProvincias);
router.post('/provincias', ubicacionController.createProvincia);

/**
 * @swagger
 * /api/v1/admin/provincias/{id}:
 *   put:
 *     summary: Actualizar una provincia
 *     tags: [Admin - Geografía]
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
 *         description: Provincia actualizada
 *   delete:
 *     summary: Eliminar una provincia
 *     tags: [Admin - Geografía]
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
 *         description: Provincia eliminada
 */
router.put('/provincias/:id', ubicacionController.updateProvincia);
router.delete('/provincias/:id', ubicacionController.deleteProvincia);

// ==========================================================
// CIUDADES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/ciudades:
 *   get:
 *     summary: Listar ciudades
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provinciaId
 *         schema:
 *           type: string
 *         description: Filtrar por provincia
 *     responses:
 *       200:
 *         description: Lista de ciudades
 *   post:
 *     summary: Crear una ciudad
 *     tags: [Admin - Geografía]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigociudad
 *               - nombre
 *               - codigoprovincia
 *             properties:
 *               codigociudad:
 *                 type: string
 *                 example: "MAO"
 *               nombre:
 *                 type: string
 *                 example: "Mao"
 *               codigoprovincia:
 *                 type: string
 *                 example: "VAL"
 *     responses:
 *       201:
 *         description: Ciudad creada
 */
router.get('/ciudades', ubicacionController.getCiudades);
router.post('/ciudades', ubicacionController.createCiudad);
router.put('/ciudades/:id', ubicacionController.updateCiudad);
router.delete('/ciudades/:id', ubicacionController.deleteCiudad);

// Aliases en inglés
router.get('/cities', ubicacionController.getCiudades);
router.post('/cities', ubicacionController.createCiudad);
router.put('/cities/:id', ubicacionController.updateCiudad);

export default router;
