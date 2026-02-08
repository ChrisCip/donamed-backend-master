import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio para gestión de Medicamentos Solicitados
 * Esta tabla almacena los medicamentos que el paciente solicita (texto libre)
 * antes de que el admin los vincule a lotes reales del inventario.
 */
class MedicamentoSolicitadoService {
  // ==========================================================
  // MEDICAMENTOS SOLICITADOS - CRUD
  // ==========================================================

  /**
   * Obtener todos los medicamentos solicitados (solo con filtros)
   * No se devuelven sin filtro por diseño
   */
  async getMedicamentosSolicitados(query: {
    page?: number;
    limit?: number;
    numerosolicitud?: number;
    nombre?: string;
  }) {
    // Solo permitir consultas con filtros
    if (!query.numerosolicitud && !query.nombre) {
      const error: AppError = new Error('Debe especificar un filtro: numerosolicitud o nombre');
      error.statusCode = 400;
      throw error;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.numerosolicitud) {
      where.numerosolicitud = query.numerosolicitud;
    }
    if (query.nombre) {
      where.nombre = { contains: query.nombre, mode: 'insensitive' };
    }

    const [medicamentos, total] = await Promise.all([
      prisma.medicamento_solicitado.findMany({
        where,
        include: {
          solicitud: {
            select: {
              numerosolicitud: true,
              estado: true,
              patologia: true,
              usuario: {
                select: {
                  persona: {
                    select: {
                      nombre: true,
                      apellidos: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.medicamento_solicitado.count({ where }),
    ]);

    // Formatear respuesta eliminando campos no deseados (nombre, fecha y hora)
    const data = medicamentos.map((med) => ({
      id: med.id,
      numerosolicitud: med.numerosolicitud,
      medicamento: med.nombre,
      dosis: med.dosis,
      solicitud: {
        numerosolicitud: med.solicitud.numerosolicitud,
        estado: med.solicitud.estado,
        patologia: med.solicitud.patologia,
        paciente: med.solicitud.usuario?.persona
          ? `${med.solicitud.usuario.persona.nombre} ${med.solicitud.usuario.persona.apellidos}`
          : null,
      },
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un medicamento solicitado por ID
   */
  async getMedicamentoSolicitadoById(id: number) {
    const medicamento = await prisma.medicamento_solicitado.findUnique({
      where: { id },
      include: {
        solicitud: {
          include: {
            usuario: { include: { persona: true } },
            tipo_solicitud: true,
            centro_medico: true,
          },
        },
      },
    });

    if (!medicamento) {
      const error: AppError = new Error('Medicamento solicitado no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return medicamento;
  }

  /**
   * Agregar un medicamento solicitado a una solicitud
   */
  async createMedicamentoSolicitado(data: {
    numerosolicitud: number;
    nombre: string;
    dosis?: string;
  }) {
    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud: data.numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud esté en estado que permita agregar medicamentos
    if (solicitud.estado !== 'PENDIENTE' && solicitud.estado !== 'EN_REVISION' && solicitud.estado !== 'INCOMPLETA') {
      const error: AppError = new Error('No se pueden agregar medicamentos a una solicitud en este estado');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.medicamento_solicitado.create({
      data: {
        numerosolicitud: data.numerosolicitud,
        nombre: data.nombre,
        dosis: data.dosis,
        creado_en: new Date(),
      },
      include: {
        solicitud: {
          select: {
            numerosolicitud: true,
            estado: true,
          },
        },
      },
    });
  }

  /**
   * Agregar múltiples medicamentos solicitados a una solicitud
   */
  async createManyMedicamentosSolicitados(data: {
    numerosolicitud: number;
    medicamentos: Array<{ nombre: string; dosis?: string }>;
  }) {
    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud: data.numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud esté en estado que permita agregar medicamentos
    if (solicitud.estado !== 'PENDIENTE' && solicitud.estado !== 'EN_REVISION' && solicitud.estado !== 'INCOMPLETA') {
      const error: AppError = new Error('No se pueden agregar medicamentos a una solicitud en este estado');
      error.statusCode = 400;
      throw error;
    }

    const medicamentosCreados = await prisma.medicamento_solicitado.createMany({
      data: data.medicamentos.map((med) => ({
        numerosolicitud: data.numerosolicitud,
        nombre: med.nombre,
        dosis: med.dosis,
        creado_en: new Date(),
      })),
    });

    return {
      count: medicamentosCreados.count,
      numerosolicitud: data.numerosolicitud,
    };
  }

  /**
   * Actualizar un medicamento solicitado
   */
  async updateMedicamentoSolicitado(
    id: number,
    data: { nombre?: string; dosis?: string }
  ) {
    // Verificar que existe
    const existente = await prisma.medicamento_solicitado.findUnique({
      where: { id },
      include: { solicitud: true },
    });

    if (!existente) {
      const error: AppError = new Error('Medicamento solicitado no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud permita modificaciones
    if (existente.solicitud.estado !== 'PENDIENTE' && existente.solicitud.estado !== 'EN_REVISION' && existente.solicitud.estado !== 'INCOMPLETA') {
      const error: AppError = new Error('No se puede modificar medicamentos de una solicitud en este estado');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.medicamento_solicitado.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar un medicamento solicitado
   */
  async deleteMedicamentoSolicitado(id: number) {
    // Verificar que existe
    const existente = await prisma.medicamento_solicitado.findUnique({
      where: { id },
      include: { solicitud: true },
    });

    if (!existente) {
      const error: AppError = new Error('Medicamento solicitado no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que la solicitud permita modificaciones
    if (existente.solicitud.estado !== 'PENDIENTE' && existente.solicitud.estado !== 'EN_REVISION' && existente.solicitud.estado !== 'INCOMPLETA') {
      const error: AppError = new Error('No se puede eliminar medicamentos de una solicitud en este estado');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.medicamento_solicitado.delete({
      where: { id },
    });
  }

  /**
   * Obtener medicamentos solicitados de una solicitud específica
   */
  async getMedicamentosBySolicitud(numerosolicitud: number) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.medicamento_solicitado.findMany({
      where: { numerosolicitud },
      orderBy: { id: 'asc' },
    });
  }
}

export default new MedicamentoSolicitadoService();
