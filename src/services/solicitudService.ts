import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';
import { validarCedula } from '../utils/validators.js';

/**
 * Servicio para gestión de Solicitudes
 */
class SolicitudService {
  // ==========================================================
  // SOLICITUDES
  // ==========================================================

  async getSolicitudes(query: {
    page?: number;
    limit?: number;
    estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA';
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
          medicamento_solicitado: true, // Medicamentos solicitados por paciente (texto libre)
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
        medicamento_solicitado: true, // Medicamentos solicitados por paciente (texto libre)
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

  /**
   * Crear una nueva solicitud
   */
  async createSolicitud(data: {
    idusuario?: number;
    cedularepresentante?: string;
    codigotiposolicitud?: string;
    numeroafiliado?: string;
    idcentro?: number;
    relacion_solicitante?: string;
    patologia?: string;
    documentos?: any;
    observaciones?: string;
    medicamentos_solicitados?: Array<{ nombre: string; dosis?: string }>;
  }) {
    // Validar cédula del representante si se proporciona
    if (data.cedularepresentante) {
      if (!validarCedula(data.cedularepresentante)) {
        const error: AppError = new Error('La cédula del representante debe tener exactamente 11 dígitos numéricos');
        error.statusCode = 400;
        throw error;
      }
    }

    const { medicamentos_solicitados, ...solicitudData } = data;

    return await prisma.solicitud.create({
      data: {
        ...solicitudData,
        estado: 'PENDIENTE',
        creada_en: new Date(),
        medicamento_solicitado: medicamentos_solicitados
          ? {
              create: medicamentos_solicitados.map((med) => ({
                nombre: med.nombre,
                dosis: med.dosis,
                creado_en: new Date(),
              })),
            }
          : undefined,
      },
      include: {
        usuario: { include: { persona: true } },
        persona: true,
        tipo_solicitud: true,
        centro_medico: true,
        medicamento_solicitado: true,
      },
    });
  }

  /**
   * Actualizar estado de solicitud con observaciones
   */
  async updateSolicitudEstado(
    numerosolicitud: number,
    data: {
      estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA';
      observaciones?: string;
    }
  ) {
    // Si se está aprobando la solicitud, verificar stock disponible
    if (data.estado === 'APROBADA') {
      await this.verificarStockDisponible(numerosolicitud);
    }

    return await prisma.solicitud.update({
      where: { numerosolicitud },
      data: {
        estado: data.estado,
        observaciones: data.observaciones,
        actualizado_en: new Date(),
      },
      include: {
        usuario: { include: { persona: true } },
        tipo_solicitud: true,
        medicamento_solicitado: true,
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
   * Actualizar campos de una solicitud (no solo estado)
   */
  async updateSolicitud(
    numerosolicitud: number,
    data: {
      cedularepresentante?: string;
      codigotiposolicitud?: string;
      numeroafiliado?: string;
      idcentro?: number;
      relacion_solicitante?: string;
      patologia?: string;
      documentos?: any;
      observaciones?: string;
    }
  ) {
    // Verificar que la solicitud existe
    const existente = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!existente) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar cédula del representante si se proporciona
    if (data.cedularepresentante) {
      if (!validarCedula(data.cedularepresentante)) {
        const error: AppError = new Error('La cédula del representante debe tener exactamente 11 dígitos numéricos');
        error.statusCode = 400;
        throw error;
      }
    }

    return await prisma.solicitud.update({
      where: { numerosolicitud },
      data: {
        ...data,
        actualizado_en: new Date(),
      },
      include: {
        usuario: { include: { persona: true } },
        persona: true,
        tipo_solicitud: true,
        centro_medico: true,
        medicamento_solicitado: true,
      },
    });
  }

  /**
   * Confirmar solicitud (cambiar de PENDIENTE a EN_REVISION)
   */
  async confirmarSolicitud(numerosolicitud: number) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
      include: { medicamento_solicitado: true },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== 'PENDIENTE') {
      const error: AppError = new Error('Solo se pueden confirmar solicitudes en estado PENDIENTE');
      error.statusCode = 400;
      throw error;
    }

    if (solicitud.medicamento_solicitado.length === 0) {
      const error: AppError = new Error('La solicitud debe tener al menos un medicamento solicitado');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.solicitud.update({
      where: { numerosolicitud },
      data: {
        estado: 'EN_REVISION',
        actualizado_en: new Date(),
      },
      include: {
        usuario: { include: { persona: true } },
        medicamento_solicitado: true,
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
  // DETALLE DE SOLICITUD (Medicamentos reales aprobados por admin)
  // ==========================================================

  /**
   * Agregar detalle a una solicitud (vincular lote real del inventario)
   * Usado por admin al aprobar solicitudes
   */
  async addDetalleSolicitud(
    numerosolicitud: number,
    data: {
      idalmacen: number;
      codigolote: string;
      cantidad: number;
      dosis_indicada?: string;
      tiempo_tratamiento?: string;
    }
  ) {
    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud esté en estado que permita agregar detalles
    if (solicitud.estado !== 'PENDIENTE' && solicitud.estado !== 'EN_REVISION') {
      const error: AppError = new Error('No se pueden agregar detalles a una solicitud en este estado');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el lote existe
    const lote = await prisma.lote.findUnique({
      where: { codigolote: data.codigolote },
      include: { medicamento: true },
    });

    if (!lote) {
      const error: AppError = new Error('El lote especificado no existe');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el almacén existe
    const almacen = await prisma.almacen.findUnique({
      where: { idalmacen: data.idalmacen },
    });

    if (!almacen) {
      const error: AppError = new Error('El almacén especificado no existe');
      error.statusCode = 400;
      throw error;
    }

    // Verificar stock disponible
    const stock = await prisma.almacen_medicamento.findFirst({
      where: {
        idalmacen: data.idalmacen,
        codigolote: data.codigolote,
      },
    });

    if (!stock || stock.cantidad < data.cantidad) {
      const error: AppError = new Error(
        `Stock insuficiente. Disponible: ${stock?.cantidad || 0}, Solicitado: ${data.cantidad}`
      );
      error.statusCode = 400;
      throw error;
    }

    return await prisma.detalle_solicitud.create({
      data: {
        numerosolicitud,
        ...data,
      },
      include: {
        lote: { include: { medicamento: true } },
        almacen: true,
      },
    });
  }

  /**
   * Eliminar detalle de una solicitud
   */
  async removeDetalleSolicitud(
    numerosolicitud: number,
    idalmacen: number,
    codigolote: string
  ) {
    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud esté en estado que permita modificaciones
    if (solicitud.estado !== 'PENDIENTE' && solicitud.estado !== 'EN_REVISION') {
      const error: AppError = new Error('No se pueden modificar detalles de una solicitud en este estado');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.detalle_solicitud.delete({
      where: {
        numerosolicitud_idalmacen_codigolote: {
          numerosolicitud,
          idalmacen,
          codigolote,
        },
      },
    });
  }
}

export default new SolicitudService();
