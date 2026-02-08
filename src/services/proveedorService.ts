import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';
import { validarRNC } from '../utils/validators.js';

/**
 * Servicio para gestión de Proveedores
 */
class ProveedorService {
  // ==========================================================
  // PROVEEDORES - CRUD
  // ==========================================================

  /**
   * Obtener todos los proveedores con paginación
   */
  async getProveedores(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { rncproveedor: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        include: {
          ciudad: { include: { provincia: true } },
          donaciones_donaciones_proveedorToproveedor: {
            take: 5,
            orderBy: { fecha_recibida: 'desc' },
          },
        },
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      prisma.proveedor.count({ where }),
    ]);

    return {
      data: proveedores,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un proveedor por su RNC
   */
  async getProveedorById(rncproveedor: string) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { rncproveedor },
      include: {
        ciudad: { include: { provincia: true } },
        donaciones_donaciones_proveedorToproveedor: {
          include: {
            donacion_medicamento: {
              include: {
                lote: { include: { medicamento: true } },
                almacen: true,
              },
            },
          },
          orderBy: { fecha_recibida: 'desc' },
        },
      },
    });

    if (!proveedor) {
      const error: AppError = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return proveedor;
  }

  /**
   * Crear un nuevo proveedor
   */
  async createProveedor(data: {
    rncproveedor: string;
    nombre: string;
    telefono?: string;
    correo?: string;
    codigociudad?: string;
    direccion?: string;
  }) {
    // Validar RNC
    if (!validarRNC(data.rncproveedor)) {
      const error: AppError = new Error('El RNC debe tener 9 dígitos o la cédula debe tener 11 dígitos');
      error.statusCode = 400;
      throw error;
    }

    // Verificar si ya existe un proveedor con ese RNC
    const existente = await prisma.proveedor.findUnique({
      where: { rncproveedor: data.rncproveedor },
    });

    if (existente) {
      const error: AppError = new Error('Ya existe un proveedor con este RNC');
      error.statusCode = 409;
      throw error;
    }

    // Validar que la ciudad existe si se proporciona
    if (data.codigociudad) {
      const ciudad = await prisma.ciudad.findUnique({
        where: { codigociudad: data.codigociudad },
      });
      if (!ciudad) {
        const error: AppError = new Error('La ciudad especificada no existe');
        error.statusCode = 400;
        throw error;
      }
    }

    return await prisma.proveedor.create({
      data: {
        ...data,
        creado_en: new Date(),
      },
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  /**
   * Actualizar un proveedor existente
   */
  async updateProveedor(
    rncproveedor: string,
    data: {
      nombre?: string;
      telefono?: string;
      correo?: string;
      codigociudad?: string;
      direccion?: string;
    }
  ) {
    // Verificar que el proveedor existe
    const existente = await prisma.proveedor.findUnique({
      where: { rncproveedor },
    });

    if (!existente) {
      const error: AppError = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Validar que la ciudad existe si se proporciona
    if (data.codigociudad) {
      const ciudad = await prisma.ciudad.findUnique({
        where: { codigociudad: data.codigociudad },
      });
      if (!ciudad) {
        const error: AppError = new Error('La ciudad especificada no existe');
        error.statusCode = 400;
        throw error;
      }
    }

    return await prisma.proveedor.update({
      where: { rncproveedor },
      data: {
        ...data,
        actualizado_en: new Date(),
      },
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  /**
   * Eliminar un proveedor
   */
  async deleteProveedor(rncproveedor: string) {
    // Verificar que el proveedor existe
    const existente = await prisma.proveedor.findUnique({
      where: { rncproveedor },
      include: { donaciones_donaciones_proveedorToproveedor: true },
    });

    if (!existente) {
      const error: AppError = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar si tiene donaciones asociadas
    if (existente.donaciones_donaciones_proveedorToproveedor.length > 0) {
      const error: AppError = new Error('No se puede eliminar el proveedor porque tiene donaciones asociadas');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.proveedor.delete({
      where: { rncproveedor },
    });
  }

  /**
   * Obtener estadísticas de un proveedor
   */
  async getProveedorStats(rncproveedor: string) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { rncproveedor },
      include: {
        donaciones_donaciones_proveedorToproveedor: {
          include: {
            donacion_medicamento: true,
          },
        },
      },
    });

    if (!proveedor) {
      const error: AppError = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const totalDonaciones = proveedor.donaciones_donaciones_proveedorToproveedor.length;
    const totalMedicamentos = proveedor.donaciones_donaciones_proveedorToproveedor.reduce(
      (sum, donacion) => sum + donacion.donacion_medicamento.length,
      0
    );

    return {
      proveedor: {
        rncproveedor: proveedor.rncproveedor,
        nombre: proveedor.nombre,
      },
      estadisticas: {
        totalDonaciones,
        totalMedicamentosDonados: totalMedicamentos,
      },
    };
  }
}

export default new ProveedorService();
