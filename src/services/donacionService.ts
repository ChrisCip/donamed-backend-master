import prisma from '../config/prisma.js';

/**
 * Servicio para gestión de Donaciones
 */
class DonacionService {
  // ==========================================================
  // DONACIONES
  // ==========================================================

  async getDonaciones(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [donaciones, total] = await Promise.all([
      prisma.donaciones.findMany({
        include: {
          proveedor_donaciones_proveedorToproveedor: true,
          donacion_medicamento: {
            include: {
              lote: { include: { medicamento: true } },
              almacen: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { fecha_recibida: 'desc' },
      }),
      prisma.donaciones.count(),
    ]);

    return {
      data: donaciones,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createDonacion(data: {
    proveedor?: string;
    descripcion?: string;
    medicamentos: Array<{
      idalmacen: number;
      codigolote: string;
      cantidad: number;
    }>;
  }) {
    const { medicamentos, ...donacionData } = data;

    return await prisma.donaciones.create({
      data: {
        ...donacionData,
        donacion_medicamento: {
          create: medicamentos,
        },
      },
      include: {
        proveedor_donaciones_proveedorToproveedor: true,
        donacion_medicamento: {
          include: {
            lote: { include: { medicamento: true } },
            almacen: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // ESTADÍSTICAS DE DONACIONES
  // ==========================================================

  async getDonationsStats() {
    const result = await this.getDonaciones({});
    return { 
      total: result.pagination.total,
      donaciones: result.data 
    };
  }
}

export default new DonacionService();
