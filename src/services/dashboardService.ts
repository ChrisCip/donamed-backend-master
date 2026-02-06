import prisma from '../config/prisma.js';

/**
 * Servicio para estadísticas del Dashboard
 */
class DashboardService {
  // ==========================================================
  // DASHBOARD / ESTADÍSTICAS
  // ==========================================================

  async getDashboardStats() {
    const [
      totalMedicamentos,
      totalSolicitudesPendientes,
      totalUsuarios,
      totalAlmacenes,
      medicamentosActivos,
      lotesProximosVencer,
    ] = await Promise.all([
      prisma.medicamento.count(),
      prisma.solicitud.count({ where: { estado: 'PENDIENTE' } }),
      prisma.usuario.count({ where: { estado: 'ACTIVO' } }),
      prisma.almacen.count({ where: { estado: 'ACTIVO' } }),
      prisma.medicamento.count({ where: { estado: 'ACTIVO' } }),
      prisma.lote.count({
        where: {
          fechavencimiento: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            gte: new Date(),
          },
        },
      }),
    ]);

    return {
      totalMedicamentos,
      medicamentosActivos,
      totalSolicitudesPendientes,
      totalUsuarios,
      totalAlmacenes,
      lotesProximosVencer,
    };
  }
}

export default new DashboardService();
