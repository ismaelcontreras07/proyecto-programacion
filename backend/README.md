# Backend UNIMEX

Este backend ya usa SQLite por defecto y crea automáticamente la base local en `unimex.db` a partir de `schema.sql`. También puede ejecutarse en memoria para pruebas rápidas.

## Qué incluye

- Autenticación: `POST /api/auth/login`, `GET /api/auth/me`
- Alta de cuenta directa: `POST /api/auth/register`
- Eventos:
  - `GET /api/events`, `GET /api/events/{id}`
  - `POST /api/events/upload-image` (admin, multipart/form-data)
  - `POST /api/events` (admin)
  - `PUT /api/events/{id}` (admin)
  - `DELETE /api/events/{id}` (admin)
- Registros de alumnos:
  - `POST /api/registrations`
  - `GET /api/registrations/me`
- Administración:
  - `GET /api/events/{id}/registrations` (admin)
  - `GET /api/admin/summary` (admin)
- Salud y compatibilidad:
  - `GET /api/health`
  - `GET /api/data` (compat con frontend actual)

## Schema de base de datos

El esquema completo está en:

- `/Users/chazanet/Documents/proyecto-programacion/backend/schema.sql`

Tablas principales:

- `users`
- `events`
- `event_agenda_items`
- `event_requirements`
- `event_registrations`

## Ejecutar local

```bash
cd /Users/chazanet/Documents/proyecto-programacion/backend
uvicorn main:app --reload
```

Configurar entorno (recomendado):

```bash
cd /Users/chazanet/Documents/proyecto-programacion/backend
cp .env.example .env
```

Inicializar DB manualmente (opcional):

```bash
cd /Users/chazanet/Documents/proyecto-programacion/backend
python init_db.py
```

Al iniciar por primera vez:

- Se crea `/Users/chazanet/Documents/proyecto-programacion/backend/unimex.db`
- Se inicializa el schema desde `schema.sql`
- Se insertan usuarios y eventos seed si la DB está vacía

Docs OpenAPI:

- `http://localhost:8000/docs`

## Credenciales seed (demo)

- Admin: matrícula `ADM00001-00`, contraseña `admin`
- User: matrícula `ALU00001-01`, contraseña `user`

## Registro de usuarios (sin SMS)

El backend ya permite flujo de alta:

1. `POST /api/auth/register`

El registro solicita: nombre, matrícula, contraseña, carrera y cuatrimestre.
La matrícula debe cumplir formato `XXXXXXXX-XX`.

Notas de registro a evento:
- `POST /api/registrations` requiere token Bearer y toma datos del perfil autenticado; solo recibe `event_id`.
- `GET /api/registrations/me` devuelve los eventos donde el alumno autenticado ya está registrado.

## Variables opcionales

- `CORS_ORIGINS` (por defecto: `http://localhost:3000,http://localhost:3001`)
- `APP_SECRET_KEY`
- `APP_PASSWORD_SALT`
- `APP_ACCESS_TOKEN_TTL_SECONDS`
- `APP_STORE_BACKEND` (`sqlite` por defecto, usar `memory` para volver al store en memoria)
- `APP_DB_PATH` (ruta personalizada para el archivo SQLite)

## Notas de persistencia

1. `services.py` y `routers/` mantienen el mismo contrato.
2. `dependencies.py` selecciona el repositorio (`sqlite` o `memory`) por variable de entorno.
3. `schema.sql` se adapta automáticamente a SQLite solo para la sintaxis `IDENTITY`.
