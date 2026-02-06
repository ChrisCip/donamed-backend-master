import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = Router();

// ==========================================================
// DASHBOARD
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/dashboard', dashboardController.getDashboardStats);

export default router;
