import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DONAMED API',
      version: '1.0.0',
      description: 'API para el sistema de gestión de donaciones de medicamentos de alto costo en República Dominicana',
      contact: {
        name: 'Equipo DONAMED',
        email: 'contacto@donamed.do'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.donamed.do',
        description: 'Servidor de Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido al iniciar sesión'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Mensaje de error'
                }
              }
            }
          }
        },
        Perfil: {
          type: 'object',
          properties: {
            IDUsuario: {
              type: 'integer',
              example: 1
            },
            correo: {
              type: 'string',
              format: 'email',
              example: 'mariacon@ejemplo.com'
            },
            cedula_usuario: {
              type: 'string',
              example: '00112345678'
            },
            codigo_rol: {
              type: 'string',
              example: 'PACIENTE'
            },
            persona: {
              type: 'object',
              properties: {
                Cedula: {
                  type: 'string',
                  example: '00112345678'
                },
                nombre: {
                  type: 'string',
                  example: 'María'
                },
                apellidos: {
                  type: 'string',
                  example: 'Concepción'
                },
                sexo: {
                  type: 'string',
                  enum: ['M', 'F'],
                  example: 'F'
                },
                fecha_nacimiento: {
                  type: 'string',
                  format: 'date',
                  example: '1990-01-15'
                },
                telefono: {
                  type: 'string',
                  example: '809-693-8956'
                },
                direccion: {
                  type: 'string',
                  example: 'Calle Principal #123'
                },
                ciudad: {
                  type: 'object',
                  properties: {
                    CodigoCiudad: {
                      type: 'integer',
                      example: 1
                    },
                    nombre: {
                      type: 'string',
                      example: 'Santo Domingo'
                    },
                    provincia: {
                      type: 'object',
                      properties: {
                        CodigoProvincia: {
                          type: 'integer',
                          example: 1
                        },
                        nombre: {
                          type: 'string',
                          example: 'Distrito Nacional'
                        }
                      }
                    }
                  }
                }
              }
            },
            rol: {
              type: 'object',
              properties: {
                CodigoRol: {
                  type: 'string',
                  example: 'PACIENTE'
                },
                nombre: {
                  type: 'string',
                  example: 'Paciente'
                }
              }
            }
          }
        },
        ActualizarPerfil: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              example: 'María'
            },
            apellidos: {
              type: 'string',
              example: 'Concepción'
            },
            telefono: {
              type: 'string',
              example: '809-555-1234'
            },
            correo: {
              type: 'string',
              format: 'email',
              example: 'marianueva@ejemplo.com'
            },
            direccion: {
              type: 'string',
              example: 'Nueva dirección'
            },
            CodigoCiudad: {
              type: 'integer',
              example: 2
            }
          }
        },
        Solicitud: {
          type: 'object',
          properties: {
            NumeroSolicitud: {
              type: 'integer',
              example: 1
            },
            estado: {
              type: 'string',
              enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESPACHADA'],
              example: 'PENDIENTE'
            },
            creada_en: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-12T10:30:00Z'
            },
            patologia: {
              type: 'string',
              example: 'Diabetes Tipo 1'
            },
            CodigoTipoSolicitud: {
              type: 'string',
              example: 'MEDICAMENTO'
            },
            tipoSolicitud: {
              type: 'object',
              properties: {
                Descripcion: {
                  type: 'string',
                  example: 'Solicitud de Medicamento'
                }
              }
            },
            centroMedico: {
              type: 'object',
              properties: {
                nombre: {
                  type: 'string',
                  example: 'Hospital General'
                }
              }
            },
            detalles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  Cantidad: {
                    type: 'integer',
                    example: 10
                  },
                  lote: {
                    type: 'object',
                    properties: {
                      medicamento: {
                        type: 'object',
                        properties: {
                          nombre: {
                            type: 'string',
                            example: 'Insulina Glargina'
                          },
                          CodigoMedicamento: {
                            type: 'string',
                            example: 'MED001'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
