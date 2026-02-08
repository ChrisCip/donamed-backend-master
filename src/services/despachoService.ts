import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';
import { validarCedula } from '../utils/validators.js';

/**
 * Servicio para gestión de Despachos
 */
class DespachoService {
  // ==========================================================
  // DESPACHOS - CRUD
  // ==========================================================

  /**
   * Obtener todos los despachos con paginación
   */
  async getDespachos(query: { page?: number; limit?: number; solicitud?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.solicitud) {
      where.solicitud = query.solicitud;
    }

    const [despachos, total] = await Promise.all([
      prisma.despacho.findMany({
        where,
        include: {
          solicitud_despacho_solicitudTosolicitud: {
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
            },
          },
          persona: true,
        },
        skip,
        take: limit,
        orderBy: { fecha_despacho: 'desc' },
      }),
      prisma.despacho.count({ where }),
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

  /**
   * Obtener un despacho por su número
   */
  async getDespachoById(numerodespacho: number) {
    const despacho = await prisma.despacho.findUnique({
      where: { numerodespacho },
      include: {
        solicitud_despacho_solicitudTosolicitud: {
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
            medicamento_solicitado: true,
          },
        },
        persona: true,
      },
    });

    if (!despacho) {
      const error: AppError = new Error('Despacho no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return despacho;
  }

  /**
   * Crear un nuevo despacho
   */
  async createDespacho(data: { solicitud: number; cedula_recibe?: string }) {
    // Validar cédula si se proporciona
    if (data.cedula_recibe) {
      if (!validarCedula(data.cedula_recibe)) {
        const error: AppError = new Error('La cédula debe tener exactamente 11 dígitos numéricos');
        error.statusCode = 400;
        throw error;
      }

      // Verificar que la persona existe
      const persona = await prisma.persona.findUnique({
        where: { cedula: data.cedula_recibe },
      });

      if (!persona) {
        const error: AppError = new Error('La persona con la cédula proporcionada no existe en el sistema');
        error.statusCode = 404;
        throw error;
      }
    }

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud: data.solicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud esté aprobada
    if (solicitud.estado !== 'APROBADA') {
      const error: AppError = new Error('La solicitud debe estar aprobada para poder despachar');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que no exista ya un despacho para esta solicitud
    const despachoExistente = await prisma.despacho.findUnique({
      where: { solicitud: data.solicitud },
    });

    if (despachoExistente) {
      const error: AppError = new Error('Ya existe un despacho para esta solicitud');
      error.statusCode = 409;
      throw error;
    }

    // Crear despacho y actualizar estado de solicitud en una transacción
    const [despacho] = await prisma.$transaction([
      prisma.despacho.create({
        data: {
          solicitud: data.solicitud,
          cedula_recibe: data.cedula_recibe,
          fecha_despacho: new Date(),
        },
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
      }),
      prisma.solicitud.update({
        where: { numerosolicitud: data.solicitud },
        data: { estado: 'DESPACHADA', actualizado_en: new Date() },
      }),
    ]);

    // Descontar del inventario
    await this.descontarInventario(data.solicitud);

    return despacho;
  }

  /**
   * Actualizar un despacho existente
   */
  async updateDespacho(numerodespacho: number, data: { cedula_recibe?: string }) {
    // Verificar que el despacho existe
    const despachoExistente = await prisma.despacho.findUnique({
      where: { numerodespacho },
    });

    if (!despachoExistente) {
      const error: AppError = new Error('Despacho no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Validar cédula si se proporciona
    if (data.cedula_recibe) {
      if (!validarCedula(data.cedula_recibe)) {
        const error: AppError = new Error('La cédula debe tener exactamente 11 dígitos numéricos');
        error.statusCode = 400;
        throw error;
      }

      // Verificar que la persona existe
      const persona = await prisma.persona.findUnique({
        where: { cedula: data.cedula_recibe },
      });

      if (!persona) {
        const error: AppError = new Error('La persona con la cédula proporcionada no existe en el sistema');
        error.statusCode = 404;
        throw error;
      }
    }

    return await prisma.despacho.update({
      where: { numerodespacho },
      data,
      include: {
        solicitud_despacho_solicitudTosolicitud: true,
        persona: true,
      },
    });
  }

  /**
   * Eliminar un despacho (revertir el estado de la solicitud)
   */
  async deleteDespacho(numerodespacho: number) {
    const despacho = await prisma.despacho.findUnique({
      where: { numerodespacho },
    });

    if (!despacho) {
      const error: AppError = new Error('Despacho no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Eliminar despacho y revertir estado de solicitud
    await prisma.$transaction([
      prisma.despacho.delete({
        where: { numerodespacho },
      }),
      prisma.solicitud.update({
        where: { numerosolicitud: despacho.solicitud! },
        data: { estado: 'APROBADA', actualizado_en: new Date() },
      }),
    ]);

    return { message: 'Despacho eliminado y solicitud revertida a estado APROBADA' };
  }

  /**
   * Descontar del inventario los medicamentos despachados
   */
  private async descontarInventario(numerosolicitud: number): Promise<void> {
    const detalles = await prisma.detalle_solicitud.findMany({
      where: { numerosolicitud },
    });

    for (const detalle of detalles) {
      await prisma.almacen_medicamento.updateMany({
        where: {
          idalmacen: detalle.idalmacen,
          codigolote: detalle.codigolote,
        },
        data: {
          cantidad: {
            decrement: detalle.cantidad,
          },
        },
      });

      // Actualizar cantidad global del medicamento
      const lote = await prisma.lote.findUnique({
        where: { codigolote: detalle.codigolote },
      });

      if (lote) {
        await prisma.medicamento.update({
          where: { codigomedicamento: lote.codigomedicamento },
          data: {
            cantidad_disponible_global: {
              decrement: detalle.cantidad,
            },
          },
        });
      }
    }
  }
}

export default new DespachoService();
