-- ==========================================================
-- SCRIPT DE BASE DE DATOS: SISTEMA DONACIÓN ALTO COSTO (RD)
-- MOTOR: POSTGRESQL
-- VERSIÓN: FINAL (CON AJUSTE VARCHAR(50) EN MEDICAMENTO)
-- ==========================================================

-- 0. CREACIÓN DE TIPOS ENUM
-- ==========================================================

DROP TYPE IF EXISTS tipo_sexo CASCADE;
CREATE TYPE tipo_sexo AS ENUM ('M', 'F');

DROP TYPE IF EXISTS tipo_estado_general CASCADE;
CREATE TYPE tipo_estado_general AS ENUM ('ACTIVO', 'INACTIVO');

DROP TYPE IF EXISTS tipo_estado_solicitud CASCADE;
CREATE TYPE tipo_estado_solicitud AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESPACHADA');


-- ==========================================================
-- 1. CATALOGOS GENERALES Y GEOGRAFIA
-- ==========================================================

CREATE TABLE Provincia (
    CodigoProvincia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Ciudad (
    CodigoCiudad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    CodigoProvincia INT NOT NULL,
    FOREIGN KEY (CodigoProvincia) REFERENCES Provincia(CodigoProvincia)
);

CREATE TABLE Rol (
    CodigoRol VARCHAR(20) PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Tipo_Solicitud (
    CodigoTipoSolicitud VARCHAR(20) PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE Centro_Medico (
    IDCentro SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL, 
    direccion VARCHAR(255),
    estado tipo_estado_general DEFAULT 'ACTIVO'
);

-- ==========================================================
-- 2. CATALOGO MEDICO (PRODUCTOS)
-- ==========================================================

CREATE TABLE Categoria (
    IDCategoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Enfermedad (
    IDEnfermedad SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL
);

CREATE TABLE Via_Administracion (
    IDVia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Forma_Farmaceutica (
    IDFormaFarmaceutica SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Medicamento (
    -- AJUSTE: VARCHAR(50) para códigos largos (GTIN/Fabricante)
    CodigoMedicamento VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    compuesto_principal VARCHAR(150),
    IDVia INT,
    IDForma_Farmaceutica INT,
    Cantidad_disponible_global INT DEFAULT 0,
    estado tipo_estado_general DEFAULT 'ACTIVO',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IDVia) REFERENCES Via_Administracion(IDVia),
    FOREIGN KEY (IDForma_Farmaceutica) REFERENCES Forma_Farmaceutica(IDFormaFarmaceutica)
);

CREATE TABLE Categoria_Medicamento (
    IDCategoria INT,
    CodigoMedicamento VARCHAR(50), -- Ajustado a 50
    PRIMARY KEY (IDCategoria, CodigoMedicamento),
    FOREIGN KEY (IDCategoria) REFERENCES Categoria(IDCategoria),
    FOREIGN KEY (CodigoMedicamento) REFERENCES Medicamento(CodigoMedicamento)
);

CREATE TABLE Enfermedad_Medicamento (
    IDEnfermedad INT,
    CodigoMedicamento VARCHAR(50), -- Ajustado a 50
    PRIMARY KEY (IDEnfermedad, CodigoMedicamento),
    FOREIGN KEY (IDEnfermedad) REFERENCES Enfermedad(IDEnfermedad),
    FOREIGN KEY (CodigoMedicamento) REFERENCES Medicamento(CodigoMedicamento)
);

-- ==========================================================
-- 3. GESTION DE LOTES
-- ==========================================================

CREATE TABLE Lote (
    CodigoLote SERIAL PRIMARY KEY,
    CodigoMedicamento VARCHAR(50) NOT NULL, -- Ajustado a 50
    NumeroLoteFabricante VARCHAR(50) NOT NULL,
    FechaVencimiento DATE NOT NULL,
    FechaFabricacion DATE,
    FOREIGN KEY (CodigoMedicamento) REFERENCES Medicamento(CodigoMedicamento)
);

CREATE INDEX idx_lote_vencimiento ON Lote(FechaVencimiento);
CREATE INDEX idx_lote_medicamento ON Lote(CodigoMedicamento);

-- ==========================================================
-- 4. ACTORES (PERSONAS Y UBICACIONES)
-- ==========================================================

CREATE TABLE Almacen (
    IDAlmacen SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    CodigoCiudad INT,
    direccion TEXT,
    estado tipo_estado_general DEFAULT 'ACTIVO',
    FOREIGN KEY (CodigoCiudad) REFERENCES Ciudad(CodigoCiudad)
);

CREATE TABLE Proveedor (
    RNCProveedor VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    CodigoCiudad INT,
    direccion TEXT,
    FOREIGN KEY (CodigoCiudad) REFERENCES Ciudad(CodigoCiudad)
);

CREATE TABLE Persona (
    Cedula VARCHAR(15) PRIMARY KEY, 
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    sexo tipo_sexo,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    CodigoCiudad INT,
    direccion TEXT,
    FOREIGN KEY (CodigoCiudad) REFERENCES Ciudad(CodigoCiudad)
);

CREATE TABLE Usuario (
    IDUsuario SERIAL PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    cedula_usuario VARCHAR(15),
    codigo_rol VARCHAR(20),
    FOREIGN KEY (cedula_usuario) REFERENCES Persona(Cedula),
    FOREIGN KEY (codigo_rol) REFERENCES Rol(CodigoRol)
);

-- ==========================================================
-- 5. FLUJO DE ENTRADA (DONACIONES)
-- ==========================================================

CREATE TABLE Donaciones (
    NumeroDonacion SERIAL PRIMARY KEY,
    Proveedor VARCHAR(20),
    fecha_recibida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    FOREIGN KEY (Proveedor) REFERENCES Proveedor(RNCProveedor)
);

CREATE TABLE Donacion_Medicamento (
    NumeroDonacion INT,
    IDAlmacen INT,
    CodigoLote INT,
    Cantidad INT NOT NULL,
    PRIMARY KEY (NumeroDonacion, IDAlmacen, CodigoLote),
    FOREIGN KEY (NumeroDonacion) REFERENCES Donaciones(NumeroDonacion),
    FOREIGN KEY (IDAlmacen) REFERENCES Almacen(IDAlmacen),
    FOREIGN KEY (CodigoLote) REFERENCES Lote(CodigoLote)
);

-- ==========================================================
-- 6. INVENTARIO (STOCK FISICO)
-- ==========================================================

CREATE TABLE Almacen_Medicamento (
    IDAlmacen INT,
    CodigoLote INT, 
    CodigoMedicamento VARCHAR(50), -- Ajustado a 50
    Cantidad INT NOT NULL,
    PRIMARY KEY (IDAlmacen, CodigoMedicamento, CodigoLote),
    FOREIGN KEY (IDAlmacen) REFERENCES Almacen(IDAlmacen),
    FOREIGN KEY (CodigoLote) REFERENCES Lote(CodigoLote),
    FOREIGN KEY (CodigoMedicamento) REFERENCES Medicamento(CodigoMedicamento)
);

-- ==========================================================
-- 7. FLUJO DE SALIDA (SOLICITUD Y DESPACHO)
-- ==========================================================

CREATE TABLE Solicitud (
    NumeroSolicitud SERIAL PRIMARY KEY,
    IdUsuario INT, 
    CedulaRepresentante VARCHAR(15), 
    
    CodigoTipoSolicitud VARCHAR(20), 
    NumeroAfiliado VARCHAR(50), 
    IDCentro INT,
    
    patologia VARCHAR(150),
    documentos JSONB,
    estado tipo_estado_solicitud DEFAULT 'PENDIENTE',
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IDUsuario),
    FOREIGN KEY (CedulaRepresentante) REFERENCES Persona(Cedula),
    FOREIGN KEY (CodigoTipoSolicitud) REFERENCES Tipo_Solicitud(CodigoTipoSolicitud),
    FOREIGN KEY (IDCentro) REFERENCES Centro_Medico(IDCentro)
);

CREATE TABLE Detalle_Solicitud (
    NumeroSolicitud INT,
    IDAlmacen INT,
    CodigoLote INT,
    Cantidad INT NOT NULL,
    Dosis_Indicada VARCHAR(100),
    Tiempo_Tratamiento VARCHAR(100),
    
    PRIMARY KEY (NumeroSolicitud, IDAlmacen, CodigoLote),
    FOREIGN KEY (NumeroSolicitud) REFERENCES Solicitud(NumeroSolicitud),
    FOREIGN KEY (IDAlmacen) REFERENCES Almacen(IDAlmacen),
    FOREIGN KEY (CodigoLote) REFERENCES Lote(CodigoLote)
);

CREATE TABLE Despacho (
    NumeroDespacho SERIAL PRIMARY KEY,
    Solicitud INT UNIQUE, 
    fecha_despacho TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    Cedula_Recibe VARCHAR(15), 
    
    FOREIGN KEY (Solicitud) REFERENCES Solicitud(NumeroSolicitud),
    FOREIGN KEY (Cedula_Recibe) REFERENCES Persona(Cedula)
);