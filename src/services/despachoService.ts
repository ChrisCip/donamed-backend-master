import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';
import { validarCedula } from '../utils/validators.js';

// Select de usuario sin contraseña
const usuarioSelectSinPassword = {
  idusuario: true,
  correo: true,
  cedula_usuario: true,
  codigo_rol: true,
  ultimo_ingreso: true,
  creado_en: true,
  actualizado_en: true,
  estado: true,
  foto_url: true,
  persona: true,
  rol: true,
};

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
              usuario: { select: usuarioSelectSinPassword },
              persona: true,
              tipo_solicitud: true,
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
            usuario: { select: usuarioSelectSinPassword },
            persona: true,
            tipo_solicitud: true,
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
   * Crear un nuevo despacho completo
   * Flujo: valida solicitud -> valida/crea detalles -> valida stock -> descuenta inventario -> crea despacho
   */
  async createDespacho(data: {
    solicitud: number;
    cedula_recibe: string;
    detalles?: Array<{
      idalmacen: number;
      codigolote: string;
      cantidad: number;
      dosis_indicada: string;
      tiempo_tratamiento: string;
    }>;
  }) {
    // 1. Validar cédula de quien recibe
    if (!data.cedula_recibe) {
      const error: AppError = new Error('La cédula de quien recibe es obligatoria');
      error.statusCode = 400;
      throw error;
    }

    if (!validarCedula(data.cedula_recibe)) {
      const error: AppError = new Error('La cédula debe tener exactamente 11 dígitos numéricos');
      error.statusCode = 400;
      throw error;
    }

    const persona = await prisma.persona.findUnique({
      where: { cedula: data.cedula_recibe },
    });

    if (!persona) {
      const error: AppError = new Error('La persona con la cédula proporcionada no existe en el sistema');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verificar que la solicitud existe y está aprobada
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud: data.solicitud },
      include: { detalle_solicitud: true },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== 'APROBADA') {
      const error: AppError = new Error('La solicitud debe estar aprobada para poder despachar');
      error.statusCode = 400;
      throw error;
    }

    // 3. Verificar que no exista ya un despacho para esta solicitud
    const despachoExistente = await prisma.despacho.findUnique({
      where: { solicitud: data.solicitud },
    });

    if (despachoExistente) {
      const error: AppError = new Error('Ya existe un despacho para esta solicitud');
      error.statusCode = 409;
      throw error;
    }

    // 4. Determinar los detalles a despachar (nuevos o existentes)
    const detallesADespachar = data.detalles || [];
    const tieneDetallesPrevios = solicitud.detalle_solicitud.length > 0;

    if (detallesADespachar.length === 0 && !tieneDetallesPrevios) {
      const error: AppError = new Error(
        'La solicitud no tiene medicamentos asignados. Proporcione los detalles del despacho (detalles) o asígnelos primero con PATCH /solicitudes/:id/detalles'
      );
      error.statusCode = 400;
      throw error;
    }

    // 5. Todo en una transacción: crear detalles (si vienen), validar stock, descontar, crear despacho
    const despacho = await prisma.$transaction(async (tx) => {
      // Si vienen detalles nuevos, reemplazar los existentes
      if (detallesADespachar.length > 0) {
        await tx.detalle_solicitud.deleteMany({
          where: { numerosolicitud: data.solicitud },
        });

        // Validar lote, stock y crear detalles
        for (const det of detallesADespachar) {
          const lote = await tx.lote.findUnique({
            where: { codigolote: det.codigolote },
            include: { medicamento: true },
          });
          if (!lote) {
            throw Object.assign(new Error(`Lote ${det.codigolote} no existe`), { statusCode: 400 });
          }

          const stock = await tx.almacen_medicamento.findUnique({
            where: {
              idalmacen_codigomedicamento_codigolote: {
                idalmacen: det.idalmacen,
                codigomedicamento: lote.codigomedicamento,
                codigolote: det.codigolote,
              },
            },
          });

          if (!stock || stock.cantidad < det.cantidad) {
            throw Object.assign(
              new Error(`Stock insuficiente para ${lote.medicamento.nombre} (lote ${det.codigolote}) en almacén ${det.idalmacen}. Disponible: ${stock?.cantidad || 0}, solicitado: ${det.cantidad}`),
              { statusCode: 400 }
            );
          }

          await tx.detalle_solicitud.create({
            data: {
              numerosolicitud: data.solicitud,
              idalmacen: det.idalmacen,
              codigolote: det.codigolote,
              cantidad: det.cantidad,
              dosis_indicada: det.dosis_indicada,
              tiempo_tratamiento: det.tiempo_tratamiento,
            },
          });
        }
      }

      // Obtener los detalles finales con lote y medicamento para descontar
      const detallesFinales = await tx.detalle_solicitud.findMany({
        where: { numerosolicitud: data.solicitud },
        include: {
          lote: { include: { medicamento: true } },
          almacen: true,
        },
      });

      // Validar stock de los detalles existentes (si no se proporcionaron nuevos)
      if (detallesADespachar.length === 0) {
        for (const det of detallesFinales) {
          const stock = await tx.almacen_medicamento.findUnique({
            where: {
              idalmacen_codigomedicamento_codigolote: {
                idalmacen: det.idalmacen,
                codigomedicamento: det.lote.codigomedicamento,
                codigolote: det.codigolote,
              },
            },
          });

          if (!stock || stock.cantidad < det.cantidad) {
            throw Object.assign(
              new Error(`Stock insuficiente para ${det.lote.medicamento.nombre} (lote ${det.codigolote}) en almacén ${det.almacen.nombre}. Disponible: ${stock?.cantidad || 0}, solicitado: ${det.cantidad}`),
              { statusCode: 400 }
            );
          }
        }
      }

      // Descontar inventario por almacén/lote/medicamento (PK compuesto exacto)
      const medicamentosAfectados = new Set<string>();

      for (const det of detallesFinales) {
        await tx.almacen_medicamento.update({
          where: {
            idalmacen_codigomedicamento_codigolote: {
              idalmacen: det.idalmacen,
              codigomedicamento: det.lote.codigomedicamento,
              codigolote: det.codigolote,
            },
          },
          data: {
            cantidad: { decrement: det.cantidad },
          },
        });

        medicamentosAfectados.add(det.lote.codigomedicamento);
      }

      // Recalcular stock global una sola vez por cada medicamento afectado
      for (const codigomedicamento of medicamentosAfectados) {
        const totalStock = await tx.almacen_medicamento.aggregate({
          where: { codigomedicamento },
          _sum: { cantidad: true },
        });

        await tx.medicamento.update({
          where: { codigomedicamento },
          data: {
            cantidad_disponible_global: totalStock._sum.cantidad || 0,
          },
        });
      }

      // Crear despacho
      const nuevoDespacho = await tx.despacho.create({
        data: {
          solicitud: data.solicitud,
          cedula_recibe: data.cedula_recibe,
          fecha_despacho: new Date(),
        },
        include: {
          solicitud_despacho_solicitudTosolicitud: {
            include: {
              usuario: { select: usuarioSelectSinPassword },
              persona: true,
              tipo_solicitud: true,
              medicamento_solicitado: true,
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
      });

      // Cambiar estado de solicitud a DESPACHADA
      await tx.solicitud.update({
        where: { numerosolicitud: data.solicitud },
        data: { estado: 'DESPACHADA', actualizado_en: new Date() },
      });

      return nuevoDespacho;
    });

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
   * Eliminar un despacho (revertir inventario y estado de la solicitud)
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

    // Revertir el inventario descontado
    if (despacho.solicitud) {
      await this.revertirInventario(despacho.solicitud);
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

    return { message: 'Despacho eliminado, inventario revertido y solicitud revertida a estado APROBADA' };
  }

  /**
   * Revertir inventario al eliminar un despacho
   */
  private async revertirInventario(numerosolicitud: number): Promise<void> {
    const detalles = await prisma.detalle_solicitud.findMany({
      where: { numerosolicitud },
      include: { lote: { include: { medicamento: true } } },
    });

    const medicamentosAfectados = new Set<string>();

    for (const detalle of detalles) {
      await prisma.almacen_medicamento.update({
        where: {
          idalmacen_codigomedicamento_codigolote: {
            idalmacen: detalle.idalmacen,
            codigomedicamento: detalle.lote.codigomedicamento,
            codigolote: detalle.codigolote,
          },
        },
        data: {
          cantidad: { increment: detalle.cantidad },
        },
      });

      medicamentosAfectados.add(detalle.lote.codigomedicamento);
    }

    // Recalcular stock global una sola vez por medicamento
    for (const codigomedicamento of medicamentosAfectados) {
      const totalStock = await prisma.almacen_medicamento.aggregate({
        where: { codigomedicamento },
        _sum: { cantidad: true },
      });

      await prisma.medicamento.update({
        where: { codigomedicamento },
        data: {
          cantidad_disponible_global: totalStock._sum.cantidad || 0,
        },
      });
    }
  }
}

export default new DespachoService();
