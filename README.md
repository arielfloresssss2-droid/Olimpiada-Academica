# Plataforma Ciudadana de Gestión de Incidentes Urbanos — Municipalidad de Morón

Sistema integral web para el registro, georreferenciación, seguimiento y resolución de incidencias en la vía pública (baches, alumbrado, arbolado/poda, semáforos, residuos y cloacas) del Municipio de Morón.

Proyecto desarrollado para la competencia de **6° Año — Desarrollo Web Full-Stack, Arquitectura de APIs REST y Control de Versiones**.

---

## 🏛️ Características Principales

1. **Frontend Interactivo:**
   - Construido en **React 19**, **TypeScript** y **Vite**.
   - Mapa interactivo georreferenciado con **Leaflet + OpenStreetMap** para marcar la ubicación exacta del incidente.
   - Subida de fotografías y evidencias con previsualización.
   - Verificación visual anti-spam y protección de API con **Captcha**.
   - Panel de estadísticas en tiempo real con **Recharts** (distribución por barrio, categoría y tiempos promedio).
   - Exportación de informes en formatos **CSV** y **PDF**.

2. **Moderación Inteligente con IA (Google Gemini):**
   - Análisis geoespacial con fórmula de Haversine: detección automática de incidentes en un radio de **$\le$ 50 metros**.
   - Evaluación semántica con **Gemini AI**: compara el nuevo reporte contra incidencias cercanas y pregunta amigablemente al vecino si se trata del mismo hecho.
   - Opción para sumarse al reclamo existente o forzar la creación si se trata de un problema diferente.

3. **Contador de Apoyos y Escalado Dinámico de Prioridad:**
   - Botón ciudadano *"Esto también me afecta"*, con prevención de votos duplicados por usuario autenticado.
   - Escalado automático:
     - **$\ge$ 5 apoyos:** La prioridad asciende automáticamente a **Media**.
     - **$\ge$ 10 apoyos:** La prioridad asciende automáticamente a **Alta**.

4. **Notificaciones por Email:**
   - Notificación automática por correo electrónico al ciudadano autor cuando el estado de su reporte cambia (`Pendiente` $\rightarrow$ `En revisión` $\rightarrow$ `En proceso` $\rightarrow$ `Resuelto`).
   - Implementado con **MailKit** y plantilla HTML personalizada del Municipio. Tolerancia a fallos con log detallado en consola si no hay servidor SMTP configurado.

5. **Backend y Arquitectura API REST Segura:**
   - Desarrollado en **C# .NET 10 Web API** con **Entity Framework Core** y **PostgreSQL**.
   - Autenticación y autorización basada en **JWT (JSON Web Tokens)** con roles diferenciados (`Alumno`/`Ciudadano` y `Admin`/`Empleado Municipal`).
   - Trazabilidad y auditoría inmutable en `HistorialEstado` de cada cambio de estado.
   - Documentación OpenAPI / Swagger interactiva accesible en `/swagger` o `/scalar/v1`.

---

## 🚀 Despliegue y Ejecución Local

### Opción 1: Con Docker Compose (Requisito de Contenedores)

Requisitos: Docker Desktop instalado.

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd Olimpiada-Academica

# Levantar base de datos PostgreSQL y Backend .NET en contenedores
docker-compose up -d --build
```

- **Backend API:** `http://localhost:5006`
- **Documentación Swagger / Scalar:** `http://localhost:5006/swagger`
- **PostgreSQL:** puerto `5432`

---

### Opción 2: Ejecución Local Manual

#### 1. Backend (.NET 10)
```bash
cd Backend
dotnet restore
dotnet run
```
La API iniciará en `http://localhost:5006`.

#### 2. Frontend (React + Vite)
```bash
cd Frontend
npm install
npm run dev
```
La aplicación web iniciará en `http://localhost:5173`.

---

## 📋 Credenciales de Prueba por Defecto

- **Usuario Ciudadano:** Registro libre desde la interfaz con validación de Captcha.
