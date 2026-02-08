import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = Router();

// ==========================================================
// DASHBOARD ADMIN
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Obtener todos los datos del dashboard admin
 *     description: Retorna cards, gráficos y tabla de solicitudes recientes
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: object
 *                       properties:
 *                         totalDonaciones:
 *                           type: integer
 *                         solicitudes:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                         aprobaciones:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                         nuevosRegistros:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             variacion:
 *                               type: number
 *                     solicitudesVsMedicamentos:
 *                       type: object
 *                       properties:
 *                         solicitudes:
 *                           type: integer
 *                         medicamentos:
 *                           type: integer
 *                     solicitudesRecientes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           numero:
 *                             type: integer
 *                           numeroSolicitud:
 *                             type: string
 *                           fecha:
 *                             type: string
 *                             format: date-time
 *                           nombreSolicitante:
 *                             type: string
 *                           estado:
 *                             type: string
 *                     solicitudesEntrantes:
 *                       type: object
 *                       properties:
 *                         esteMes:
 *                           type: integer
 *                         mesAnterior:
 *                           type: integer
 *                     insights:
 *                       type: object
 *                       properties:
 *                         donaciones:
 *                           type: array
 *                         usuarios:
 *                           type: array
 *                         solicitudes:
 *                           type: array
 *                     solicitudesPorDia:
 *                       type: array
 */
router.get('/dashboard', dashboardController.getDashboardStats);

export default router;
