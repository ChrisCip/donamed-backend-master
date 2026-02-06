import prisma from '../config/prisma.js';

/**
 * Servicio para gestión de ubicaciones geográficas (Provincias y Ciudades)
 */
class UbicacionService {
  // ==========================================================
  // PROVINCIAS
  // ==========================================================

  async getProvincias() {
    return await prisma.provincia.findMany({
      include: { ciudad: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createProvincia(data: { codigoprovincia: string; nombre: string }) {
    return await prisma.provincia.create({ data });
  }

  async updateProvincia(codigoprovincia: string, data: { nombre: string }) {
    return await prisma.provincia.update({
      where: { codigoprovincia },
      data,
    });
  }

  async deleteProvincia(codigoprovincia: string) {
    return await prisma.provincia.delete({
      where: { codigoprovincia },
    });
  }

  // ==========================================================
  // CIUDADES
  // ==========================================================

  async getCiudades(codigoprovincia?: string) {
    return await prisma.ciudad.findMany({
      where: codigoprovincia ? { codigoprovincia } : undefined,
      include: { provincia: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createCiudad(data: { codigociudad: string; nombre: string; codigoprovincia: string }) {
    return await prisma.ciudad.create({
      data,
      include: { provincia: true },
    });
  }

  async updateCiudad(codigociudad: string, data: { nombre?: string; codigoprovincia?: string }) {
    return await prisma.ciudad.update({
      where: { codigociudad },
      data,
      include: { provincia: true },
    });
  }

  async deleteCiudad(codigociudad: string) {
    return await prisma.ciudad.delete({
      where: { codigociudad },
    });
  }
}

export default new UbicacionService();
