# Backend UNIMEX (DB-ready)

Este backend ya queda funcional sin DB real usando un repositorio en memoria, con estructura lista para cambiar a SQL cuando la base esté disponible.

## Qué incluye

- Autenticación: `POST /api/auth/login`, `GET /api/auth/me`
- Alta de cuenta con SMS: `POST /api/auth/register`, `POST /api/auth/verify-sms`
- Eventos: `GET /api/events`, `GET /api/events/{id}`
- Registros de alumnos: `POST /api/registrations`
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

Docs OpenAPI:

- `http://localhost:8000/docs`

## Credenciales seed (demo)

- Admin: `admin / admin`
- User: `user / user`

## Registro de usuarios (sin DB todavía)

El backend ya permite flujo de alta:

1. `POST /api/auth/register`
2. `POST /api/auth/verify-sms`

El SMS se simula en memoria y devuelve `dev_sms_code` para pruebas locales.
La contraseña inicial del usuario se define como su `student_id` (matrícula).

Nota de registro a evento: `POST /api/registrations` ahora requiere token Bearer y toma datos del perfil autenticado; solo recibe `event_id`.

## Variables opcionales

- `CORS_ORIGINS` (por defecto: `http://localhost:3000,http://localhost:3001`)
- `APP_SECRET_KEY`
- `APP_PASSWORD_SALT`
- `APP_ACCESS_TOKEN_TTL_SECONDS`

## Swap a DB real (cuando esté lista)

1. Mantener `models.py`, `services.py` y `routers/`.
2. Reemplazar `InMemoryStore` (`repositories.py`) por implementación SQL usando `schema.sql`.
3. Inyectar el repositorio SQL desde `dependencies.py` sin cambiar controladores.
