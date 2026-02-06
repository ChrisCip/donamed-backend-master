import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio para gestión de Medicamentos, Lotes e Inventario
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
    }
  ) {
    return await prisma.medicamento.update({
      where: { codigomedicamento },
      data,
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
  // LOTES
  // ==========================================================

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

  async createLote(data: {
    codigolote: string;
    codigomedicamento: string;
    fechavencimiento: Date;
    fechafabricacion?: Date;
  }) {
    return await prisma.lote.create({
      data,
      include: { medicamento: true },
    });
  }

  async deleteLote(codigolote: string) {
    return await prisma.lote.delete({
      where: { codigolote },
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
    const result = await this.getLotes({ vencidos: false });
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const expiringBatches = result.data.filter((lote: any) => {
      const vencimiento = new Date(lote.fechavencimiento);
      return vencimiento >= today && vencimiento <= futureDate;
    });

    return {
      data: expiringBatches,
      count: expiringBatches.length,
      days
    };
  }
}

export default new MedicamentoService();
