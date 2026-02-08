import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio para gestión de Medicamentos e Inventario
 */
class MedicamentoService {
  // ==========================================================
  // MEDICAMENTOS
  // ==========================================================

  async getMedicamentos(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { nombre: { contains: query.search, mode: 'insensitive' as const } },
            { codigomedicamento: { contains: query.search, mode: 'insensitive' as const } },
            { compuesto_principal: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [medicamentos, total] = await Promise.all([
      prisma.medicamento.findMany({
        where,
        include: {
          via_administracion: true,
          forma_farmaceutica: true,
          categoria_medicamento: { include: { categoria: true } },
          enfermedad_medicamento: { include: { enfermedad: true } },
        },
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      prisma.medicamento.count({ where }),
    ]);

    return {
      data: medicamentos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMedicamentoById(codigomedicamento: string) {
    const medicamento = await prisma.medicamento.findUnique({
      where: { codigomedicamento },
      include: {
        via_administracion: true,
        forma_farmaceutica: true,
        categoria_medicamento: { include: { categoria: true } },
        enfermedad_medicamento: { include: { enfermedad: true } },
        lote: {
          include: {
            almacen_medicamento: { include: { almacen: true } },
          },
          orderBy: { fechavencimiento: 'asc' },
        },
      },
    });

    if (!medicamento) {
      const error: AppError = new Error('Medicamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return medicamento;
  }

  async createMedicamento(data: {
    codigomedicamento: string;
    nombre: string;
    descripcion?: string;
    compuesto_principal?: string;
    idvia_administracion?: number;
    idforma_farmaceutica?: number;
    categorias?: number[];
    enfermedades?: number[];
  }) {
    const { categorias, enfermedades, ...medicamentoData } = data;

    return await prisma.medicamento.create({
      data: {
        ...medicamentoData,
        actualizado_en: new Date(),
        categoria_medicamento: categorias?.length
          ? {
              create: categorias.map((idcategoria) => ({ idcategoria })),
            }
          : undefined,
        enfermedad_medicamento: enfermedades?.length
          ? {
              create: enfermedades.map((idenfermedad) => ({ idenfermedad })),
            }
          : undefined,
      },
      include: {
        via_administracion: true,
        forma_farmaceutica: true,
        categoria_medicamento: { include: { categoria: true } },
        enfermedad_medicamento: { include: { enfermedad: true } },
      },
    });
  }

  async updateMedicamento(
    codigomedicamento: string,
    data: {
      nombre?: string;
      descripcion?: string;
      compuesto_principal?: string;
      idvia_administracion?: number;
      idforma_farmaceutica?: number;
      estado?: 'ACTIVO' | 'INACTIVO';
      categorias?: number[];
      enfermedades?: number[];
    }
  ) {
    const { categorias, enfermedades, ...updateData } = data;

    // Si hay categorías, actualizar las relaciones
    if (categorias !== undefined) {
      await prisma.categoria_medicamento.deleteMany({ where: { codigomedicamento } });
      if (categorias.length > 0) {
        await prisma.categoria_medicamento.createMany({
          data: categorias.map(idcategoria => ({ codigomedicamento, idcategoria })),
        });
      }
    }

    // Si hay enfermedades, actualizar las relaciones
    if (enfermedades !== undefined) {
      await prisma.enfermedad_medicamento.deleteMany({ where: { codigomedicamento } });
      if (enfermedades.length > 0) {
        await prisma.enfermedad_medicamento.createMany({
          data: enfermedades.map(idenfermedad => ({ codigomedicamento, idenfermedad })),
        });
      }
    }

    return await prisma.medicamento.update({
      where: { codigomedicamento },
      data: updateData,
      include: {
        via_administracion: true,
        forma_farmaceutica: true,
        categoria_medicamento: { include: { categoria: true } },
        enfermedad_medicamento: { include: { enfermedad: true } },
      },
    });
  }

  async deleteMedicamento(codigomedicamento: string) {
    // Eliminar relaciones primero
    await prisma.categoria_medicamento.deleteMany({ where: { codigomedicamento } });
    await prisma.enfermedad_medicamento.deleteMany({ where: { codigomedicamento } });

    return await prisma.medicamento.delete({
      where: { codigomedicamento },
    });
  }

  // ==========================================================
  // INVENTARIO
  // ==========================================================

  async getInventario(query: { idalmacen?: number; codigomedicamento?: string }) {
    const where: Record<string, unknown> = {};
    if (query.idalmacen) where.idalmacen = query.idalmacen;
    if (query.codigomedicamento) where.codigomedicamento = query.codigomedicamento;

    return await prisma.almacen_medicamento.findMany({
      where,
      include: {
        almacen: true,
        medicamento: true,
        lote: true,
      },
    });
  }

  async ajustarInventario(data: {
    idalmacen: number;
    codigolote: string;
    codigomedicamento: string;
    cantidad: number;
  }) {
    return await prisma.almacen_medicamento.upsert({
      where: {
        idalmacen_codigomedicamento_codigolote: {
          idalmacen: data.idalmacen,
          codigomedicamento: data.codigomedicamento,
          codigolote: data.codigolote,
        },
      },
      update: { cantidad: data.cantidad },
      create: data,
      include: {
        almacen: true,
        medicamento: true,
        lote: true,
      },
    });
  }

  // ==========================================================
  // STOCK CONSOLIDADO
  // ==========================================================

  async getConsolidatedStock() {
    const inventario = await this.getInventario({});
    const stockByMedicamento: Record<string, { nombre: string; total: number; almacenes: any[] }> = {};
    
    inventario.forEach((item: any) => {
      const codigo = item.codigomedicamento;
      if (!stockByMedicamento[codigo]) {
        stockByMedicamento[codigo] = {
          nombre: item.medicamento?.nombre || codigo,
          total: 0,
          almacenes: []
        };
      }
      stockByMedicamento[codigo].total += item.cantidad;
      stockByMedicamento[codigo].almacenes.push({
        almacen: item.almacen?.nombre,
        lote: item.codigolote,
        cantidad: item.cantidad
      });
    });

    return Object.values(stockByMedicamento);
  }

  // ==========================================================
  // LOTES POR VENCER
  // ==========================================================

  async getExpiringBatches(days: number = 30) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const expiringBatches = await prisma.lote.findMany({
      where: {
        fechavencimiento: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        medicamento: true,
        almacen_medicamento: { include: { almacen: true } },
      },
      orderBy: { fechavencimiento: 'asc' },
    });

    return {
      data: expiringBatches,
      count: expiringBatches.length,
      days
    };
  }
}

export default new MedicamentoService();
