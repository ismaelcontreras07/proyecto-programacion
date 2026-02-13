# Proyecto UNIMEX (Next.js + FastAPI)

Plataforma web de eventos con:
- Frontend en Next.js (catálogo, detalle de evento, registro y auth UI).
- Backend en FastAPI (auth, registro de cuenta con SMS simulado, eventos y registros), listo para conectar DB real.

## Prerrequisitos
- Node.js 20+
- Python 3.10+

## Cómo correr

### Backend
```bash
cd /Users/chazanet/Documents/proyecto-programacion/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd /Users/chazanet/Documents/proyecto-programacion/frontend
npm install
npm run dev
```

## Mapa de archivos (descripción rápida)

### Raíz

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/.gitignore` | Reglas de exclusión global del repo. |
| `/Users/chazanet/Documents/proyecto-programacion/README.md` | Este documento con setup y mapa del proyecto. |

### Backend (FastAPI)

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/backend/main.py` | Punto de entrada FastAPI, CORS y registro de routers. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/README.md` | Guía técnica del backend y endpoints. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/schema.sql` | Esquema SQL completo para producción (usuarios, eventos, agenda, requisitos, registros, verificación SMS). |
| `/Users/chazanet/Documents/proyecto-programacion/backend/requirements.txt` | Dependencias Python del backend. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/__init__.py` | Marca `app/` como paquete Python. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/models.py` | Modelos Pydantic y contratos de request/response. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/security.py` | Hash de contraseñas y tokens de acceso firmados. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/seed_data.py` | Datos semilla de usuarios y eventos para desarrollo. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/repositories.py` | Repositorio temporal en memoria (replaceable por SQL). |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/services.py` | Lógica de negocio (auth, registro SMS, eventos, registros, admin). |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/dependencies.py` | Inyección de dependencias y guardas de autenticación/rol. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/routers/__init__.py` | Exporta routers del API. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/routers/health.py` | Salud del backend y endpoint compat `/api/data`. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/routers/auth.py` | Login, registro, verificación SMS y perfil autenticado. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/routers/events.py` | Listado/detalle de eventos y registros por evento (admin). |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/routers/registrations.py` | Alta de registros de alumnos a eventos. |
| `/Users/chazanet/Documents/proyecto-programacion/backend/app/routers/admin.py` | Métricas resumidas para panel administrativo. |

### Frontend (Next.js)

#### Configuración y tooling

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/.gitignore` | Exclusiones del subproyecto frontend. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/README.md` | README original generado para frontend. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/package.json` | Scripts y dependencias del frontend. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/package-lock.json` | Lockfile de npm. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/next.config.ts` | Configuración Next (`output: export`, imágenes sin optimizador de servidor). |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/eslint.config.mjs` | Configuración ESLint del frontend. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/postcss.config.mjs` | Configuración PostCSS/Tailwind. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/tsconfig.json` | Configuración TypeScript. |

#### App router

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/layout.tsx` | Layout global, fuentes y providers. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/globals.css` | Estilos globales y ajustes de Lenis. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/page.tsx` | Home, renderiza sección de eventos. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/favicon.ico` | Favicon de la app. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/login/page.tsx` | Pantalla de acceso/registro conectada al backend. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/login/login.css` | Estilos legacy del login anterior. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/contacto/page.tsx` | Página de contacto. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/privacidad/page.tsx` | Página de privacidad. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/privacidad/privacy.css` | Estilos de la página de privacidad. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/admin/layout.tsx` | Guardia de acceso admin para rutas administrativas. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/admin/page.tsx` | Página principal del módulo admin. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/dashboard/layout.tsx` | Guardia de acceso admin para dashboard. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/dashboard/page.tsx` | Página dashboard. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/eventos/[id]/page.tsx` | Detalle dinámico de evento con información completa y registro. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/app/eventos/[id]/event-detail.css` | Estilos de la vista de detalle de evento. |

#### Contexto y librerías

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/context/AuthContext.tsx` | Estado de sesión en cliente (`accessToken` + usuario). |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/lib/utils.ts` | Utilidades generales del frontend. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/lib/events.ts` | Catálogo local de eventos usado por vistas del frontend. |

#### Componentes UI/base

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/LayoutWrapper.tsx` | Envoltorio común con Navbar/Hero/Footer según ruta. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/Navbar.tsx` | Barra de navegación principal con estado auth. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/Navbar.css` | Estilos de Navbar. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/LenisProvider.tsx` | Inicializa scroll suave Lenis en desktop y evita conflictos en móvil. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/ui/Button.tsx` | Botón reutilizable (button/link). |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/ui/button.css` | Estilos de `Button`. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/ui/SplitText.tsx` | Componente de texto animado con GSAP. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/signin/sign-in.tsx` | Componente principal de auth (login, registro y verificación SMS). |

#### Componentes de hero/footer/contacto

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/hero/Hero.tsx` | Hero principal con texto dinámico por ruta. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/hero/hero.css` | Estilos del Hero. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/hero/reveal-wave-image.tsx` | Animación de revelado de imagen para hero. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/footer/Footer.tsx` | Componente footer reutilizable. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/footer/footer.css` | Estilos del footer. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/contact/ContactForm.tsx` | Formulario de contacto. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/contact/contact-form.css` | Estilos del formulario de contacto. |

#### Componentes de eventos

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/events/EventSection.tsx` | Sección con filtros y grid de cards de eventos. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/events/event-section.css` | Estilos de la sección de eventos. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/events/EventCard.tsx` | Card moderna de evento con CTA a detalle. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/events/event-card.css` | Estilos de la card de evento. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/components/events/EventRegistrationAction.tsx` | Acción de registro directo a evento usando sesión activa. |

#### Assets públicos

| Archivo | Descripción |
|---|---|
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/file.svg` | Ícono SVG de archivo (asset base). |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/globe.svg` | Ícono SVG de globo. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/window.svg` | Ícono SVG de ventana. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/next.svg` | Logo Next.js. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/vercel.svg` | Logo Vercel. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/logo-unimex.png` | Logo UNIMEX vertical. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/logo-unimex-horizontal.png` | Logo UNIMEX horizontal. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/upscalemedia-transformed.jpeg` | Imagen base del hero principal. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo1.jpg` | Foto de evento 1. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo2.jpg` | Foto de evento 2. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo3.jpg` | Foto de evento 3. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo4.jpg` | Foto de evento 4. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo5.jpg` | Foto de evento 5. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo6.jpg` | Foto de evento 6. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo7.jpg` | Foto de evento 7. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo8.jpg` | Foto de evento 8. |
| `/Users/chazanet/Documents/proyecto-programacion/frontend/public/Photos/photo9.jpg` | Foto de evento 9. |

## Endpoints backend clave
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-sms`
- `GET /api/auth/me`
- `GET /api/events`
- `GET /api/events/{event_id}`
- `POST /api/registrations`
- `GET /api/events/{event_id}/registrations` (admin)
- `GET /api/admin/summary` (admin)
- `GET /api/health`

Nota de auth: en registro se solicitan los mismos datos del registro a evento; después de validar SMS, la contraseña inicial es la matrícula (`student_id`).
