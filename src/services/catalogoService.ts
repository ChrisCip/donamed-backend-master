import prisma from '../config/prisma.js';

/**
 * Servicio para gestión de catálogos del sistema
 * (Roles, Categorías, Enfermedades, Vías de Administración, Formas Farmacéuticas, Tipos de Solicitud)
 */
class CatalogoService {
  // ==========================================================
  // ROLES
  // ==========================================================

  async getRoles() {
    return await prisma.rol.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createRol(data: { nombre: string }) {
    return await prisma.rol.create({ data });
  }

  async updateRol(codigorol: number, data: { nombre: string }) {
    return await prisma.rol.update({
      where: { codigorol },
      data,
    });
  }

  async deleteRol(codigorol: number) {
    return await prisma.rol.delete({
      where: { codigorol },
    });
  }

  // ==========================================================
  // CATEGORÍAS
  // ==========================================================

  async getCategorias() {
    return await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createCategoria(data: { nombre: string }) {
    return await prisma.categoria.create({ data });
  }

  async updateCategoria(idcategoria: number, data: { nombre: string }) {
    return await prisma.categoria.update({
      where: { idcategoria },
      data,
    });
  }

  async deleteCategoria(idcategoria: number) {
    return await prisma.categoria.delete({
      where: { idcategoria },
    });
  }

  // ==========================================================
  // ENFERMEDADES
  // ==========================================================

  async getEnfermedades() {
    return await prisma.enfermedad.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createEnfermedad(data: { nombre: string }) {
    return await prisma.enfermedad.create({ data });
  }

  async updateEnfermedad(idenfermedad: number, data: { nombre: string }) {
    return await prisma.enfermedad.update({
      where: { idenfermedad },
      data,
    });
  }

  async deleteEnfermedad(idenfermedad: number) {
    return await prisma.enfermedad.delete({
      where: { idenfermedad },
    });
  }

  // ==========================================================
  // VÍAS DE ADMINISTRACIÓN
  // ==========================================================

  async getViasAdministracion() {
    return await prisma.via_administracion.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createViaAdministracion(data: { nombre: string }) {
    return await prisma.via_administracion.create({ data });
  }

  async updateViaAdministracion(idvia: number, data: { nombre: string }) {
    return await prisma.via_administracion.update({
      where: { idvia },
      data,
    });
  }

  async deleteViaAdministracion(idvia: number) {
    return await prisma.via_administracion.delete({
      where: { idvia },
    });
  }

  // ==========================================================
  // FORMAS FARMACÉUTICAS
  // ==========================================================

  async getFormasFarmaceuticas() {
    return await prisma.forma_farmaceutica.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createFormaFarmaceutica(data: { nombre: string }) {
    return await prisma.forma_farmaceutica.create({ data });
  }

  async updateFormaFarmaceutica(idformafarmaceutica: number, data: { nombre: string }) {
    return await prisma.forma_farmaceutica.update({
      where: { idformafarmaceutica },
      data,
    });
  }

  async deleteFormaFarmaceutica(idformafarmaceutica: number) {
    return await prisma.forma_farmaceutica.delete({
      where: { idformafarmaceutica },
    });
  }

  // ==========================================================
  // TIPOS DE SOLICITUD
  // ==========================================================

  async getTiposSolicitud() {
    return await prisma.tipo_solicitud.findMany({
      orderBy: { descripcion: 'asc' },
    });
  }

  async createTipoSolicitud(data: { codigotiposolicitud: string; descripcion: string }) {
    return await prisma.tipo_solicitud.create({ data });
  }

  async updateTipoSolicitud(codigotiposolicitud: string, data: { descripcion: string }) {
    return await prisma.tipo_solicitud.update({
      where: { codigotiposolicitud },
      data,
    });
  }

  async deleteTipoSolicitud(codigotiposolicitud: string) {
    return await prisma.tipo_solicitud.delete({
      where: { codigotiposolicitud },
    });
  }
}

export default new CatalogoService();
