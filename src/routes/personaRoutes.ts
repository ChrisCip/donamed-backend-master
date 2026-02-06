import { Router, Request, Response, NextFunction } from 'express';
import personaController from '../controllers/personaController.js';

const router = Router();

// ==========================================================
// USUARIOS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/usuarios:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Admin - Usuarios]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crear usuario
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               cedula_usuario:
 *                 type: string
 *               codigo_rol:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.get('/usuarios', personaController.getUsuarios);
router.post('/usuarios', personaController.createUsuario);
router.get('/usuarios/:id', personaController.getUsuarioById);
router.put('/usuarios/:id', personaController.updateUsuario);
router.delete('/usuarios/:id', personaController.deleteUsuario);

// Aliases en inglés
router.get('/users', personaController.getUsuarios);
router.post('/users/staff', personaController.createUsuario);
router.patch('/users/:id/role', (req: Request, res: Response, next: NextFunction) => {
  personaController.updateUsuario(req, res, next);
});
router.patch('/users/:id/status', (req: Request, res: Response, next: NextFunction) => {
  personaController.updateUsuario(req, res, next);
});

// ==========================================================
// PERSONAS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/personas:
 *   get:
 *     summary: Listar personas
 *     tags: [Admin - Usuarios]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de personas
 *   post:
 *     summary: Crear persona
 *     tags: [Admin - Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cedula
 *               - nombre
 *               - apellidos
 *             properties:
 *               cedula:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               telefono:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Persona creada
 */
router.get('/personas', personaController.getPersonas);
router.post('/personas', personaController.createPersona);
router.get('/personas/:cedula', personaController.getPersonaByCedula);
router.put('/personas/:cedula', personaController.updatePersona);

export default router;
