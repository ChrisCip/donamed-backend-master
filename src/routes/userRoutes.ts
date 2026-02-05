import { Router, Request, Response, NextFunction } from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import type { AuthenticatedRequest } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/v1/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna la información completa del perfil del usuario, incluyendo datos personales, ciudad, provincia y rol
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Perfil'
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/perfil',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    userController.getProfile(req as AuthenticatedRequest, res, next);
  }
);

/**
 * @swagger
 * /api/v1/perfil:
 *   put:
 *     summary: Actualizar información del perfil
 *     description: Permite actualizar nombre, apellidos, teléfono, correo, dirección y ciudad del usuario autenticado
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarPerfil'
 *           examples:
 *             completo:
 *               summary: Actualización completa
 *               value:
 *                 nombre: María
 *                 apellidos: Concepción
 *                 telefono: "809-555-1234"
 *                 correo: marianueva@ejemplo.com
 *                 direccion: Calle Nueva #456
 *                 CodigoCiudad: 2
 *             parcial:
 *               summary: Actualización parcial (solo teléfono)
 *               value:
 *                 telefono: "809-555-9999"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Perfil actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Perfil'
 *       400:
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto - El correo ya está en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/perfil',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    userController.updateProfile(req as AuthenticatedRequest, res, next);
  }
);

/**
 * @swagger
 * /api/v1/solicitudes:
 *   get:
 *     summary: Obtener historial de solicitudes
 *     description: Retorna todas las solicitudes realizadas por el usuario autenticado, ordenadas por fecha (más recientes primero)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Solicitud'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/solicitudes',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    userController.getUserRequests(req as AuthenticatedRequest, res, next);
  }
);

export default router;
