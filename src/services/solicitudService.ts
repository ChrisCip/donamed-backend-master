import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio para gestión de Solicitudes y Despachos
 */
class SolicitudService {
  // ==========================================================
  // SOLICITUDES
  // ==========================================================

  async getSolicitudes(query: {
    page?: number;
    limit?: number;
    estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.estado ? { estado: query.estado } : undefined;

    const [solicitudes, total] = await Promise.all([
      prisma.solicitud.findMany({
        where,
        include: {
          usuario: { include: { persona: true } },
          persona: true,
          tipo_solicitud: true,
          centro_medico: true,
          detalle_solicitud: {
            include: {
              lote: { include: { medicamento: true } },
              almacen: true,
            },
          },
          despacho_despacho_solicitudTosolicitud: true,
        },
        skip,
        take: limit,
        orderBy: { creada_en: 'desc' },
      }),
      prisma.solicitud.count({ where }),
    ]);

    return {
      data: solicitudes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSolicitudById(numerosolicitud: number) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
      include: {
        usuario: { include: { persona: true } },
        persona: true,
        tipo_solicitud: true,
        centro_medico: true,
        detalle_solicitud: {
          include: {
            lote: { include: { medicamento: true } },
            almacen: true,
          },
        },
        despacho_despacho_solicitudTosolicitud: { include: { persona: true } },
      },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return solicitud;
  }

  async updateSolicitudEstado(
    numerosolicitud: number,
    data: { estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA' }
  ) {
    // Si se está aprobando la solicitud, verificar stock disponible
    if (data.estado === 'APROBADA') {
      await this.verificarStockDisponible(numerosolicitud);
    }

    return await prisma.solicitud.update({
      where: { numerosolicitud },
      data: { estado: data.estado, actualizado_en: new Date() },
      include: {
        usuario: { include: { persona: true } },
        tipo_solicitud: true,
        detalle_solicitud: {
          include: {
            lote: { include: { medicamento: true } },
            almacen: true,
          },
        },
      },
    });
  }

  /**
   * Verifica que hay stock suficiente para todos los medicamentos de una solicitud
   */
  private async verificarStockDisponible(numerosolicitud: number): Promise<void> {
    // Obtener los detalles de la solicitud
    const detalles = await prisma.detalle_solicitud.findMany({
      where: { numerosolicitud },
      include: {
        lote: { include: { medicamento: true } },
        almacen: true,
      },
    });

    if (detalles.length === 0) {
      const error: AppError = new Error('La solicitud no tiene medicamentos asociados');
      error.statusCode = 400;
      throw error;
    }

    const medicamentosSinStock: string[] = [];

    // Verificar stock para cada detalle
    for (const detalle of detalles) {
      const stockAlmacen = await prisma.almacen_medicamento.findFirst({
        where: {
          idalmacen: detalle.idalmacen,
          codigolote: detalle.codigolote,
        },
      });

      const stockDisponible = stockAlmacen?.cantidad || 0;
      
      if (stockDisponible < detalle.cantidad) {
        const nombreMedicamento = detalle.lote?.medicamento?.nombre || detalle.codigolote;
        const nombreAlmacen = detalle.almacen?.nombre || `Almacén ${detalle.idalmacen}`;
        medicamentosSinStock.push(
          `${nombreMedicamento} (solicitado: ${detalle.cantidad}, disponible: ${stockDisponible} en ${nombreAlmacen})`
        );
      }
    }

    if (medicamentosSinStock.length > 0) {
      const error: AppError = new Error(
        `No hay stock suficiente para aprobar esta solicitud:\n- ${medicamentosSinStock.join('\n- ')}`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // ==========================================================
  // ESTADÍSTICAS POR PATOLOGÍA
  // ==========================================================

  async getPathologiesStats() {
    const result = await this.getSolicitudes({});
    const pathologyCounts: Record<string, number> = {};
    
    result.data.forEach((solicitud: any) => {
      const patologia = solicitud.patologia || 'Sin patología';
      pathologyCounts[patologia] = (pathologyCounts[patologia] || 0) + 1;
    });

    return pathologyCounts;
  }

  // ==========================================================
  // DESPACHOS
  // ==========================================================

  async getDespachos(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [despachos, total] = await Promise.all([
      prisma.despacho.findMany({
        include: {
          solicitud_despacho_solicitudTosolicitud: {
            include: {
              usuario: { include: { persona: true } },
              detalle_solicitud: {
                include: {
                  lote: { include: { medicamento: true } },
                },
              },
            },
          },
          persona: true,
        },
        skip,
        take: limit,
        orderBy: { fecha_despacho: 'desc' },
      }),
      prisma.despacho.count(),
    ]);

    return {
      data: despachos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createDespacho(data: { solicitud: number; cedula_recibe?: string }) {
    // Verificar que la solicitud existe y está aprobada
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud: data.solicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== 'APROBADA') {
      const error: AppError = new Error('La solicitud debe estar aprobada para despachar');
      error.statusCode = 400;
      throw error;
    }

    // Crear despacho y actualizar estado de solicitud
    const [despacho] = await prisma.$transaction([
      prisma.despacho.create({
        data,
        include: {
          solicitud_despacho_solicitudTosolicitud: true,
          persona: true,
        },
      }),
      prisma.solicitud.update({
        where: { numerosolicitud: data.solicitud },
        data: { estado: 'DESPACHADA', actualizado_en: new Date() },
      }),
    ]);

    return despacho;
  }
}

export default new SolicitudService();
