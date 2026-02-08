import prisma from '../config/prisma.js';

/**
 * Servicio para estadísticas del Dashboard Admin
 * Basado en el diseño Figma del panel administrativo
 */
class DashboardService {
  // ==========================================================
  // DASHBOARD COMPLETO
  // ==========================================================

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      // Cards principales
      totalDonaciones,
      solicitudesHoy,
      solicitudesAyer,
      aprobacionesHoy,
      aprobacionesAyer,
      nuevosRegistrosHoy,
      nuevosRegistrosAyer,
      
      // Solicitudes vs Medicamentos (pie chart)
      totalSolicitudes,
      totalMedicamentos,
      
      // Solicitudes recientes
      solicitudesRecientes,
      
      // Solicitudes entrantes (comparación mensual)
      solicitudesEsteMes,
      solicitudesMesAnterior,
      
      // Insights mensuales (últimos 12 meses)
      donacionesPorMes,
      usuariosPorMes,
      solicitudesPorMes,
      
      // Solicitudes por día de la semana
      solicitudesPorDia,
    ] = await Promise.all([
      // Total donaciones
      prisma.donaciones.count(),
      
      // Solicitudes hoy
      prisma.solicitud.count({
        where: { creada_en: { gte: today } }
      }),
      
      // Solicitudes ayer
      prisma.solicitud.count({
        where: { 
          creada_en: { 
            gte: yesterday,
            lt: today 
          } 
        }
      }),
      
      // Aprobaciones hoy
      prisma.solicitud.count({
        where: { 
          estado: 'APROBADA',
          actualizado_en: { gte: today }
        }
      }),
      
      // Aprobaciones ayer
      prisma.solicitud.count({
        where: { 
          estado: 'APROBADA',
          actualizado_en: { 
            gte: yesterday,
            lt: today 
          }
        }
      }),
      
      // Nuevos registros hoy
      prisma.usuario.count({
        where: { creado_en: { gte: today } }
      }),
      
      // Nuevos registros ayer
      prisma.usuario.count({
        where: { 
          creado_en: { 
            gte: yesterday,
            lt: today 
          } 
        }
      }),
      
      // Total solicitudes (para pie chart)
      prisma.solicitud.count(),
      
      // Total medicamentos (para pie chart)
      prisma.medicamento.count(),
      
      // Solicitudes recientes (últimas 10)
      prisma.solicitud.findMany({
        take: 10,
        orderBy: { creada_en: 'desc' },
        select: {
          numerosolicitud: true,
          creada_en: true,
          estado: true,
          usuario: {
            select: {
              persona: {
                select: {
                  nombre: true,
                  apellidos: true,
                }
              }
            }
          }
        }
      }),
      
      // Solicitudes este mes
      prisma.solicitud.count({
        where: { creada_en: { gte: startOfMonth } }
      }),
      
      // Solicitudes mes anterior
      prisma.solicitud.count({
        where: { 
          creada_en: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth 
          } 
        }
      }),
      
      // Donaciones por mes (últimos 12 meses)
      this.getMonthlyStats('donaciones'),
      
      // Usuarios por mes (últimos 12 meses)
      this.getMonthlyStats('usuario'),
      
      // Solicitudes por mes (últimos 12 meses)
      this.getMonthlyStats('solicitud'),
      
      // Solicitudes por día de la semana (última semana)
      this.getSolicitudesPorDiaSemana(),
    ]);

    // Calcular variaciones porcentuales
    const calcularVariacion = (hoy: number, ayer: number): number => {
      if (ayer === 0) return hoy > 0 ? 100 : 0;
      return Math.round(((hoy - ayer) / ayer) * 100);
    };

    return {
      // Cards principales (Solicitudes de hoy)
      cards: {
        totalDonaciones,
        solicitudes: {
          total: solicitudesHoy,
          variacion: calcularVariacion(solicitudesHoy, solicitudesAyer),
        },
        aprobaciones: {
          total: aprobacionesHoy,
          variacion: calcularVariacion(aprobacionesHoy, aprobacionesAyer),
        },
        nuevosRegistros: {
          total: nuevosRegistrosHoy,
          variacion: calcularVariacion(nuevosRegistrosHoy, nuevosRegistrosAyer),
        },
      },
      
      // Solicitudes vs Medicamentos (pie chart)
      solicitudesVsMedicamentos: {
        solicitudes: totalSolicitudes,
        medicamentos: totalMedicamentos,
      },
      
      // Solicitudes recientes (tabla)
      solicitudesRecientes: solicitudesRecientes.map((s, index) => ({
        numero: index + 1,
        numeroSolicitud: `S-${s.numerosolicitud.toString().padStart(9, '0')}`,
        fecha: s.creada_en,
        nombreSolicitante: s.usuario?.persona 
          ? `${s.usuario.persona.nombre} ${s.usuario.persona.apellidos}`
          : 'Sin nombre',
        estado: s.estado,
      })),
      
      // Solicitudes entrantes (comparación mensual)
      solicitudesEntrantes: {
        esteMes: solicitudesEsteMes,
        mesAnterior: solicitudesMesAnterior,
      },
      
      // Insights (gráfico de líneas por mes)
      insights: {
        donaciones: donacionesPorMes,
        usuarios: usuariosPorMes,
        solicitudes: solicitudesPorMes,
      },
      
      // Solicitudes por día de la semana
      solicitudesPorDia,
    };
  }

  /**
   * Obtiene estadísticas mensuales para los últimos 12 meses
   */
  private async getMonthlyStats(table: 'donaciones' | 'usuario' | 'solicitud'): Promise<{ mes: string; total: number }[]> {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const results: { mes: string; total: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      let count = 0;
      if (table === 'donaciones') {
        count = await prisma.donaciones.count({
          where: {
            fecha_recibida: { gte: startOfMonth, lte: endOfMonth }
          }
        });
      } else if (table === 'usuario') {
        count = await prisma.usuario.count({
          where: {
            creado_en: { gte: startOfMonth, lte: endOfMonth }
          }
        });
      } else {
        count = await prisma.solicitud.count({
          where: {
            creada_en: { gte: startOfMonth, lte: endOfMonth }
          }
        });
      }

      results.push({
        mes: meses[date.getMonth()]!,
        total: count,
      });
    }

    return results;
  }

  /**
   * Obtiene solicitudes por día de la semana (última semana)
   */
  private async getSolicitudesPorDiaSemana(): Promise<{ dia: string; solicitudes: number; medicamentos: number }[]> {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const now = new Date();
    const results: { dia: string; solicitudes: number; medicamentos: number }[] = [];

    // Obtener el lunes de esta semana
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const startOfDay = new Date(monday);
      startOfDay.setDate(monday.getDate() + i);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const [solicitudes, medicamentos] = await Promise.all([
        prisma.solicitud.count({
          where: {
            creada_en: { gte: startOfDay, lte: endOfDay }
          }
        }),
        // Contar medicamentos despachados ese día
        prisma.detalle_solicitud.count({
          where: {
            solicitud: {
              creada_en: { gte: startOfDay, lte: endOfDay }
            }
          }
        }),
      ]);

      // Ajustar índice para que empiece en Lunes
      const diaIndex = (i + 1) % 7;
      results.push({
        dia: dias[diaIndex === 0 ? 0 : diaIndex]!,
        solicitudes,
        medicamentos,
      });
    }

    // Reordenar para que empiece en Lunes
    return results;
  }
}

export default new DashboardService();
