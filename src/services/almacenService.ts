import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio para gestión de Almacenes, Proveedores y Centros Médicos
 */
class AlmacenService {
  // ==========================================================
  // ALMACENES
  // ==========================================================

  async getAlmacenes() {
    return await prisma.almacen.findMany({
      include: { ciudad: { include: { provincia: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async getAlmacenById(idalmacen: number) {
    const almacen = await prisma.almacen.findUnique({
      where: { idalmacen },
      include: {
        ciudad: { include: { provincia: true } },
        almacen_medicamento: {
          include: {
            medicamento: true,
            lote: true,
          },
        },
      },
    });

    if (!almacen) {
      const error: AppError = new Error('Almacén no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return almacen;
  }

  async createAlmacen(data: {
    nombre: string;
    codigociudad?: string;
    direccion?: string;
    telefono: string;
    correo: string;
  }) {
    return await prisma.almacen.create({
      data: {
        ...data,
        creado_en: new Date(),
        actualizado_en: new Date(),
      },
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async updateAlmacen(
    idalmacen: number,
    data: {
      nombre?: string;
      codigociudad?: string;
      direccion?: string;
      telefono?: string;
      correo?: string;
      estado?: 'ACTIVO' | 'INACTIVO';
    }
  ) {
    return await prisma.almacen.update({
      where: { idalmacen },
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async deleteAlmacen(idalmacen: number) {
    return await prisma.almacen.delete({
      where: { idalmacen },
    });
  }

  // ==========================================================
  // PROVEEDORES
  // ==========================================================

  async getProveedores() {
    return await prisma.proveedor.findMany({
      include: { ciudad: { include: { provincia: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async getProveedorById(rncproveedor: string) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { rncproveedor },
      include: {
        ciudad: { include: { provincia: true } },
        donaciones_donaciones_proveedorToproveedor: true,
      },
    });

    if (!proveedor) {
      const error: AppError = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return proveedor;
  }

  async createProveedor(data: {
    rncproveedor: string;
    nombre: string;
    telefono?: string;
    correo?: string;
    codigociudad?: string;
    direccion?: string;
  }) {
    return await prisma.proveedor.create({
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

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
    return await prisma.proveedor.update({
      where: { rncproveedor },
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async deleteProveedor(rncproveedor: string) {
    return await prisma.proveedor.delete({
      where: { rncproveedor },
    });
  }

  // ==========================================================
  // CENTROS MÉDICOS
  // ==========================================================

  async getCentrosMedicos() {
    return await prisma.centro_medico.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getCentroMedicoById(idcentro: number) {
    const centro = await prisma.centro_medico.findUnique({
      where: { idcentro },
      include: { 
        solicitud: {
          select: {
            numerosolicitud: true,
            estado: true,
            patologia: true,
          },
        },
      },
    });

    if (!centro) {
      const error: AppError = new Error('Centro médico no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return centro;
  }

  async createCentroMedico(data: { nombre: string; direccion?: string }) {
    return await prisma.centro_medico.create({ data });
  }

  async updateCentroMedico(
    idcentro: number,
    data: { nombre?: string; direccion?: string; estado?: 'ACTIVO' | 'INACTIVO' }
  ) {
    return await prisma.centro_medico.update({
      where: { idcentro },
      data,
    });
  }

  async deleteCentroMedico(idcentro: number) {
    return await prisma.centro_medico.delete({
      where: { idcentro },
    });
  }
}

export default new AlmacenService();
