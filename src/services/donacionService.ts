import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';
import { validarRNC, validarCedula } from '../utils/validators.js';

/**
 * Servicio para gestión de Donaciones
 */
class DonacionService {
  // ==========================================================
  // DONACIONES - CRUD COMPLETO
  // ==========================================================

  async getDonaciones(query: { page?: number; limit?: number; proveedor?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.proveedor) {
      where.proveedor = query.proveedor;
    }

    const [donaciones, total] = await Promise.all([
      prisma.donaciones.findMany({
        where,
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
      prisma.donaciones.count({ where }),
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

  /**
   * Obtener una donación por número
   */
  async getDonacionById(numerodonacion: number) {
    const donacion = await prisma.donaciones.findUnique({
      where: { numerodonacion },
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

    if (!donacion) {
      const error: AppError = new Error('Donación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return donacion;
  }

  /**
   * Crear una nueva donación
   */
  async createDonacion(data: {
    proveedor?: string;
    descripcion?: string;
    medicamentos?: Array<{
      idalmacen: number;
      codigolote: string;
      cantidad: number;
    }>;
  }) {
    // Validar proveedor (RNC o cédula) si se proporciona
    if (data.proveedor) {
      if (!validarRNC(data.proveedor) && !validarCedula(data.proveedor)) {
        const error: AppError = new Error('El proveedor debe ser un RNC válido (9 dígitos) o una cédula válida (11 dígitos)');
        error.statusCode = 400;
        throw error;
      }

      // Verificar que el proveedor existe
      const proveedorExiste = await prisma.proveedor.findUnique({
        where: { rncproveedor: data.proveedor },
      });

      if (!proveedorExiste) {
        const error: AppError = new Error('El proveedor especificado no existe en el sistema');
        error.statusCode = 404;
        throw error;
      }
    }

    const { medicamentos, ...donacionData } = data;

    // Validar lotes existen si hay medicamentos
    if (medicamentos && medicamentos.length > 0) {
      for (const med of medicamentos) {
        const lote = await prisma.lote.findUnique({
          where: { codigolote: med.codigolote },
        });

        if (!lote) {
          const error: AppError = new Error(`El lote ${med.codigolote} no existe`);
          error.statusCode = 400;
          throw error;
        }

        const almacen = await prisma.almacen.findUnique({
          where: { idalmacen: med.idalmacen },
        });

        if (!almacen) {
          const error: AppError = new Error(`El almacén ${med.idalmacen} no existe`);
          error.statusCode = 400;
          throw error;
        }
      }
    }

    // Crear la donación en una transacción
    const donacion = await prisma.$transaction(async (tx) => {
      // Crear la donación
      const nuevaDonacion = await tx.donaciones.create({
        data: {
          ...donacionData,
          fecha_recibida: new Date(),
          donacion_medicamento: medicamentos
            ? {
                create: medicamentos,
              }
            : undefined,
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

      // Actualizar inventario para cada medicamento donado
      if (medicamentos && medicamentos.length > 0) {
        for (const med of medicamentos) {
          // Obtener el código del medicamento del lote
          const lote = await tx.lote.findUnique({
            where: { codigolote: med.codigolote },
          });

          if (lote) {
            // Upsert en almacen_medicamento
            await tx.almacen_medicamento.upsert({
              where: {
                idalmacen_codigomedicamento_codigolote: {
                  idalmacen: med.idalmacen,
                  codigomedicamento: lote.codigomedicamento,
                  codigolote: med.codigolote,
                },
              },
              update: {
                cantidad: { increment: med.cantidad },
              },
              create: {
                idalmacen: med.idalmacen,
                codigomedicamento: lote.codigomedicamento,
                codigolote: med.codigolote,
                cantidad: med.cantidad,
              },
            });

            // Actualizar cantidad global del medicamento
            await tx.medicamento.update({
              where: { codigomedicamento: lote.codigomedicamento },
              data: {
                cantidad_disponible_global: { increment: med.cantidad },
              },
            });
          }
        }
      }

      return nuevaDonacion;
    });

    return donacion;
  }

  /**
   * Actualizar una donación existente (solo descripción y proveedor)
   */
  async updateDonacion(
    numerodonacion: number,
    data: {
      proveedor?: string;
      descripcion?: string;
    }
  ) {
    // Verificar que la donación existe
    const existente = await prisma.donaciones.findUnique({
      where: { numerodonacion },
    });

    if (!existente) {
      const error: AppError = new Error('Donación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar proveedor si se proporciona
    if (data.proveedor) {
      if (!validarRNC(data.proveedor) && !validarCedula(data.proveedor)) {
        const error: AppError = new Error('El proveedor debe ser un RNC válido (9 dígitos) o una cédula válida (11 dígitos)');
        error.statusCode = 400;
        throw error;
      }

      // Verificar que el proveedor existe
      const proveedorExiste = await prisma.proveedor.findUnique({
        where: { rncproveedor: data.proveedor },
      });

      if (!proveedorExiste) {
        const error: AppError = new Error('El proveedor especificado no existe en el sistema');
        error.statusCode = 404;
        throw error;
      }
    }

    return await prisma.donaciones.update({
      where: { numerodonacion },
      data,
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

  /**
   * Eliminar una donación (también revierte el inventario)
   */
  async deleteDonacion(numerodonacion: number) {
    // Verificar que la donación existe
    const donacion = await prisma.donaciones.findUnique({
      where: { numerodonacion },
      include: {
        donacion_medicamento: {
          include: { lote: true },
        },
      },
    });

    if (!donacion) {
      const error: AppError = new Error('Donación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Eliminar y revertir inventario en transacción
    await prisma.$transaction(async (tx) => {
      // Revertir inventario
      for (const med of donacion.donacion_medicamento) {
        await tx.almacen_medicamento.updateMany({
          where: {
            idalmacen: med.idalmacen,
            codigolote: med.codigolote,
          },
          data: {
            cantidad: { decrement: med.cantidad },
          },
        });

        // Actualizar cantidad global del medicamento
        if (med.lote) {
          await tx.medicamento.update({
            where: { codigomedicamento: med.lote.codigomedicamento },
            data: {
              cantidad_disponible_global: { decrement: med.cantidad },
            },
          });
        }
      }

      // Eliminar medicamentos de la donación
      await tx.donacion_medicamento.deleteMany({
        where: { numerodonacion },
      });

      // Eliminar la donación
      await tx.donaciones.delete({
        where: { numerodonacion },
      });
    });

    return { message: 'Donación eliminada y inventario revertido' };
  }

  /**
   * Agregar medicamentos a una donación existente
   */
  async addMedicamentosToDonacion(
    numerodonacion: number,
    medicamentos: Array<{
      idalmacen: number;
      codigolote: string;
      cantidad: number;
    }>
  ) {
    // Verificar que la donación existe
    const donacion = await prisma.donaciones.findUnique({
      where: { numerodonacion },
    });

    if (!donacion) {
      const error: AppError = new Error('Donación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar lotes y almacenes
    for (const med of medicamentos) {
      const lote = await prisma.lote.findUnique({
        where: { codigolote: med.codigolote },
      });

      if (!lote) {
        const error: AppError = new Error(`El lote ${med.codigolote} no existe`);
        error.statusCode = 400;
        throw error;
      }

      const almacen = await prisma.almacen.findUnique({
        where: { idalmacen: med.idalmacen },
      });

      if (!almacen) {
        const error: AppError = new Error(`El almacén ${med.idalmacen} no existe`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Agregar medicamentos e incrementar inventario
    await prisma.$transaction(async (tx) => {
      for (const med of medicamentos) {
        const lote = await tx.lote.findUnique({
          where: { codigolote: med.codigolote },
        });

        if (lote) {
          // Crear registro en donacion_medicamento
          await tx.donacion_medicamento.create({
            data: {
              numerodonacion,
              idalmacen: med.idalmacen,
              codigolote: med.codigolote,
              cantidad: med.cantidad,
            },
          });

          // Upsert en almacen_medicamento
          await tx.almacen_medicamento.upsert({
            where: {
              idalmacen_codigomedicamento_codigolote: {
                idalmacen: med.idalmacen,
                codigomedicamento: lote.codigomedicamento,
                codigolote: med.codigolote,
              },
            },
            update: {
              cantidad: { increment: med.cantidad },
            },
            create: {
              idalmacen: med.idalmacen,
              codigomedicamento: lote.codigomedicamento,
              codigolote: med.codigolote,
              cantidad: med.cantidad,
            },
          });

          // Actualizar cantidad global
          await tx.medicamento.update({
            where: { codigomedicamento: lote.codigomedicamento },
            data: {
              cantidad_disponible_global: { increment: med.cantidad },
            },
          });
        }
      }
    });

    return await this.getDonacionById(numerodonacion);
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
