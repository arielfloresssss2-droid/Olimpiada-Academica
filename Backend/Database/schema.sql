-- Script DDL para la creación de la base de datos en PostgreSQL
-- Generado a partir del diagrama entidad-relación del Sistema de Gestión de Incidentes (Municipio de Morón)

-- Eliminar tablas si ya existen (orden inverso a las dependencias)
DROP TABLE IF EXISTS apoyo_reporte CASCADE;
DROP TABLE IF EXISTS historial_estados CASCADE;
DROP TABLE IF EXISTS archivos_adjuntos CASCADE;
DROP TABLE IF EXISTS respuesta CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS direccion CASCADE;
DROP TABLE IF EXISTS fechas CASCADE;
DROP TABLE IF EXISTS incidente CASCADE;
DROP TABLE IF EXISTS estados CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS municipio CASCADE;

-- 1. Tabla: municipio
CREATE TABLE municipio (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion_oficina VARCHAR(255)
);

-- 2. Tabla: usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    id_mun INT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'Ciudadano',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_municipio FOREIGN KEY (id_mun) REFERENCES municipio(id) ON DELETE SET NULL
);

-- 3. Tabla: estados
CREATE TABLE estados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL
);

-- 4. Tabla: incidente
CREATE TABLE incidente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- 5. Tabla: fechas
CREATE TABLE fechas (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE,
    fecha_fin DATE
);

-- 6. Tabla: direccion
CREATE TABLE direccion (
    id SERIAL PRIMARY KEY,
    direccion VARCHAR(255) NOT NULL,
    longitud DECIMAL(9,6),
    latitud DECIMAL(9,6)
);

-- 7. Tabla: reportes
CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_estado INT NOT NULL,
    id_fecha INT,
    id_incidente INT NOT NULL,
    id_direccion INT,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    hora VARCHAR(10),
    prioridad VARCHAR(10),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reportes_usuario FOREIGN KEY (id_user) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_reportes_estado FOREIGN KEY (id_estado) REFERENCES estados(id),
    CONSTRAINT fk_reportes_fecha FOREIGN KEY (id_fecha) REFERENCES fechas(id) ON DELETE SET NULL,
    CONSTRAINT fk_reportes_incidente FOREIGN KEY (id_incidente) REFERENCES incidente(id),
    CONSTRAINT fk_reportes_direccion FOREIGN KEY (id_direccion) REFERENCES direccion(id) ON DELETE SET NULL
);

-- 8. Tabla: respuesta
CREATE TABLE respuesta (
    id SERIAL PRIMARY KEY,
    id_reporte INT NOT NULL,
    id_user INT NOT NULL,
    comentario VARCHAR(500) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_respuesta_reporte FOREIGN KEY (id_reporte) REFERENCES reportes(id) ON DELETE CASCADE,
    CONSTRAINT fk_respuesta_usuario FOREIGN KEY (id_user) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 9. Tabla: archivos_adjuntos
CREATE TABLE archivos_adjuntos (
    id SERIAL PRIMARY KEY,
    id_reporte INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    tipo VARCHAR(20),
    nombre_original VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_archivos_reporte FOREIGN KEY (id_reporte) REFERENCES reportes(id) ON DELETE CASCADE
);

-- 10. Tabla: historial_estados
CREATE TABLE historial_estados (
    id SERIAL PRIMARY KEY,
    id_reporte INT NOT NULL,
    id_user INT NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_reporte FOREIGN KEY (id_reporte) REFERENCES reportes(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (id_user) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 11. Tabla: apoyo_reporte (Votos de apoyo con clave compuesta unica)
CREATE TABLE apoyo_reporte (
    id_reporte INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reporte, id_usuario),
    CONSTRAINT fk_apoyo_reporte FOREIGN KEY (id_reporte) REFERENCES reportes(id) ON DELETE CASCADE,
    CONSTRAINT fk_apoyo_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ==========================================
-- 12. Datos Semilla (Seeds iniciales obligatorios)
-- ==========================================
INSERT INTO municipio (id, nombre, direccion_oficina) VALUES 
(1, 'Municipio de Morón', 'Brown 946, Morón, Provincia de Buenos Aires')
ON CONFLICT (id) DO NOTHING;

INSERT INTO estados (id, nombre) VALUES 
(1, 'Pendiente'),
(2, 'En Proceso'),
(3, 'Resuelto'),
(4, 'Cancelado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO incidente (id, nombre, descripcion) VALUES 
(1, 'Bacheo y Calzada', 'Pozos, baches o rotura de pavimento en la vía pública'),
(2, 'Luminarias y Alumbrado', 'Luminarias apagadas, postes caídos o fallas eléctricas en la calle'),
(3, 'Higiene Urbana y Basura', 'Acumulación de residuos, microbasurales o ramas'),
(4, 'Poda y Arbolado', 'Ramas caídas, árboles en riesgo o corte de visibilidad'),
(5, 'Agua y Cloacas', 'Pérdidas de agua potable o desbordes cloacales'),
(6, 'Semáforos y Señalización', 'Semáforos intermitentes, fuera de servicio o señalética caída')
ON CONFLICT (id) DO NOTHING;

-- Sincronizar secuencias para los próximos INSERTs automáticos
SELECT setval('municipio_id_seq', COALESCE((SELECT MAX(id) FROM municipio), 1));
SELECT setval('estados_id_seq', COALESCE((SELECT MAX(id) FROM estados), 1));
SELECT setval('incidente_id_seq', COALESCE((SELECT MAX(id) FROM incidente), 1));
