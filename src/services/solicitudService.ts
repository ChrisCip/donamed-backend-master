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

    const where: Record<string, unknown> = query.estado 
      ? { estado: query.estado } 
      : {};

    const [solicitudes, total] = await Promise.all([
      prisma.solicitud.findMany({
        where,
        include: {
          usuario: { select: usuarioSelectSinPassword },
          persona: true,
          tipo_solicitud: true,
          medicamento_solicitado: true,
          detalle_solicitud: true,
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
        usuario: { select: usuarioSelectSinPassword },
        persona: true,
        tipo_solicitud: true,
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
    centromedico?: string;
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
        actualizado_en: new Date(),
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
        usuario: { select: usuarioSelectSinPassword },
        persona: true,
        tipo_solicitud: true,
        medicamento_solicitado: true,
      },
    });
  }

  /**
   * Cambiar estado de solicitud con validación de transiciones
   * Flujo: PENDIENTE -> EN_REVISION -> APROBADA/RECHAZADA/INCOMPLETA -> DESPACHADA
   * CANCELADA puede ocurrir desde cualquier estado excepto DESPACHADA
   */
  async updateSolicitudEstado(
    numerosolicitud: number,
    data: {
      estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA';
      observaciones?: string;
    }
  ) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
      include: { 
        medicamento_solicitado: true,
        detalle_solicitud: true,
      },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const estadoActual = solicitud.estado as string;
    const nuevoEstado = data.estado;

    // Validar transiciones de estado permitidas
    const transicionesValidas: Record<string, string[]> = {
      'PENDIENTE': ['EN_REVISION', 'CANCELADA'],
      'EN_REVISION': ['APROBADA', 'RECHAZADA', 'INCOMPLETA', 'CANCELADA'],
      'INCOMPLETA': ['EN_REVISION', 'CANCELADA'],
      'APROBADA': ['DESPACHADA', 'CANCELADA'],
      'RECHAZADA': ['EN_REVISION', 'CANCELADA'],
      'DESPACHADA': [], // Estado final
      'CANCELADA': ['PENDIENTE', 'EN_REVISION'], // Se puede revertir
    };

    const transicionesPermitidas = transicionesValidas[estadoActual] || [];
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      const error: AppError = new Error(
        `Transición de estado inválida: no se puede cambiar de ${estadoActual} a ${nuevoEstado}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Validaciones específicas por estado
    if (nuevoEstado === 'EN_REVISION') {
      if (solicitud.medicamento_solicitado.length === 0) {
        const error: AppError = new Error('La solicitud debe tener al menos un medicamento solicitado para enviar a revisión');
        error.statusCode = 400;
        throw error;
      }
    }

    return await prisma.solicitud.update({
      where: { numerosolicitud },
      data: {
        estado: nuevoEstado,
        observaciones: data.observaciones,
        actualizado_en: new Date(),
      },
      include: {
        usuario: { select: usuarioSelectSinPassword },
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
  // DETALLE DE SOLICITUD (Medicamentos reales asignados por admin)
  // ==========================================================

  /**
   * Obtener detalles de una solicitud
   */
  async getDetallesSolicitud(numerosolicitud: number) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.detalle_solicitud.findMany({
      where: { numerosolicitud },
      include: {
        lote: { include: { medicamento: true } },
        almacen: true,
      },
    });
  }

  /**
   * Asignar medicamentos reales (lotes/almacenes) a una solicitud
   * Solo permitido cuando la solicitud está EN_REVISION
   */
  async asignarDetalles(
    numerosolicitud: number,
    detalles: Array<{
      idalmacen: number;
      codigolote: string;
      cantidad: number;
      dosis_indicada: string;
      tiempo_tratamiento: string;
    }>
  ) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== 'EN_REVISION') {
      const error: AppError = new Error('Solo se pueden asignar medicamentos a solicitudes EN_REVISION');
      error.statusCode = 400;
      throw error;
    }

    if (!detalles || detalles.length === 0) {
      const error: AppError = new Error('Debe proporcionar al menos un detalle');
      error.statusCode = 400;
      throw error;
    }

    // Validar que los lotes y almacenes existan y tengan stock suficiente
    for (const det of detalles) {
      const lote = await prisma.lote.findUnique({
        where: { codigolote: det.codigolote },
        include: { medicamento: true },
      });
      if (!lote) {
        const error: AppError = new Error(`Lote ${det.codigolote} no existe`);
        error.statusCode = 400;
        throw error;
      }

      const almacen = await prisma.almacen.findUnique({
        where: { idalmacen: det.idalmacen },
      });
      if (!almacen) {
        const error: AppError = new Error(`Almacén ${det.idalmacen} no existe`);
        error.statusCode = 400;
        throw error;
      }

      // Usar PK compuesto exacto de almacen_medicamento
      const stock = await prisma.almacen_medicamento.findUnique({
        where: {
          idalmacen_codigomedicamento_codigolote: {
            idalmacen: det.idalmacen,
            codigomedicamento: lote.codigomedicamento,
            codigolote: det.codigolote,
          },
        },
      });

      if (!stock || stock.cantidad < det.cantidad) {
        const error: AppError = new Error(
          `Stock insuficiente para ${lote.medicamento.nombre} (lote ${det.codigolote}) en almacén ${almacen.nombre}. Disponible: ${stock?.cantidad || 0}, solicitado: ${det.cantidad}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Eliminar detalles previos si los hubiera y crear los nuevos
    await prisma.$transaction(async (tx) => {
      await tx.detalle_solicitud.deleteMany({
        where: { numerosolicitud },
      });

      await tx.detalle_solicitud.createMany({
        data: detalles.map((det) => ({
          numerosolicitud,
          idalmacen: det.idalmacen,
          codigolote: det.codigolote,
          cantidad: det.cantidad,
          dosis_indicada: det.dosis_indicada,
          tiempo_tratamiento: det.tiempo_tratamiento,
        })),
      });
    });

    return await this.getDetallesSolicitud(numerosolicitud);
  }

  /**
   * Eliminar todos los detalles de una solicitud
   */
  async eliminarDetalles(numerosolicitud: number) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado === 'DESPACHADA') {
      const error: AppError = new Error('No se pueden eliminar detalles de una solicitud despachada');
      error.statusCode = 400;
      throw error;
    }

    await prisma.detalle_solicitud.deleteMany({
      where: { numerosolicitud },
    });

    return { message: 'Detalles eliminados exitosamente' };
  }
}

export default new SolicitudService();
