import prisma from '../config/prisma.js';

/**
 * Servicio para gestión de Lotes
 */
class LoteService {
  /**
   * Listar lotes con filtros y paginación
   */
  async getLotes(query: { page?: number; limit?: number; codigomedicamento?: string; vencidos?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.codigomedicamento) {
      where.codigomedicamento = query.codigomedicamento;
    }
    if (query.vencidos === true) {
      where.fechavencimiento = { lt: new Date() };
    } else if (query.vencidos === false) {
      where.fechavencimiento = { gte: new Date() };
    }

    const [lotes, total] = await Promise.all([
      prisma.lote.findMany({
        where,
        include: {
          medicamento: true,
          almacen_medicamento: { include: { almacen: true } },
        },
        skip,
        take: limit,
        orderBy: { fechavencimiento: 'asc' },
      }),
      prisma.lote.count({ where }),
    ]);

    return {
      data: lotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crear un nuevo lote
   */
  async createLote(data: {
    codigolote: string;
    codigomedicamento: string;
    fechavencimiento: string | Date;
    fechafabricacion: string | Date;
  }) {
    return await prisma.lote.create({
      data: {
        ...data,
        fechavencimiento: new Date(data.fechavencimiento),
        fechafabricacion: new Date(data.fechafabricacion),
      },
      include: { medicamento: true },
    });
  }

  /**
   * Eliminar un lote
   */
  async deleteLote(codigolote: string) {
    return await prisma.lote.delete({
      where: { codigolote },
    });
  }
}

export default new LoteService();
