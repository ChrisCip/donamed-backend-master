import { Router, Request, Response, NextFunction } from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import type { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// ==========================================================
// AUTENTICACIÓN ADMIN (Sin middleware de auth para login)
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: Inicio de sesión de administrador
 *     tags: [Admin - Autenticación]
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
 *                 example: admin@donamed.com
 *               contrasena:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna JWT + Info de Usuario.
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Acceso denegado (no es administrador)
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/v1/admin/auth/refresh:
 *   post:
 *     summary: Refrescar token expirado
 *     tags: [Admin - Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 */
router.post('/refresh', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  authController.refreshToken(req as AuthenticatedRequest, res, next);
});

/**
 * @swagger
 * /api/v1/admin/auth/me:
 *   get:
 *     summary: Obtener perfil del administrador logueado
 *     tags: [Admin - Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del administrador
 */
router.get('/me', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  // Verificar rol admin manualmente
  const adminRoleIds = [1, 2, 3];
  if (authReq.user?.rol === null || authReq.user?.rol === undefined || !adminRoleIds.includes(authReq.user.rol)) {
    res.status(403).json({ success: false, error: { message: 'Acceso denegado. Se requieren permisos de administrador.' } });
    return;
  }
  authController.getAdminProfile(authReq, res, next);
});

export default router;
