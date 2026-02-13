from __future__ import annotations

from datetime import date, datetime

from .models import EventRecord, EventType, Role, UserRecord
from .security import hash_password


def _utcnow() -> datetime:
    return datetime.utcnow()


def build_seed_users() -> list[UserRecord]:
    now = _utcnow()
    return [
        UserRecord(
            id="usr_admin",
            username="admin",
            full_name="Administrador UNIMEX",
            email="admin@unimex.mx",
            role=Role.ADMIN,
            password_hash=hash_password("admin"),
            is_active=True,
            created_at=now,
        ),
        UserRecord(
            id="usr_user",
            username="user",
            full_name="Alumno Demo",
            email="user@alumno.unimex.mx",
            role=Role.USER,
            password_hash=hash_password("user"),
            is_active=True,
            student_id="A0001",
            career="Ingeniería en Sistemas",
            semester=4,
            phone="5511111111",
            phone_verified=True,
            created_at=now,
        ),
    ]


def build_seed_events() -> list[EventRecord]:
    now = _utcnow()
    return [
        EventRecord(
            id="1",
            image="/Photos/photo1.jpg",
            name="Taller exprés de liderazgo y trabajo en equipo",
            date=date(2026, 6, 5),
            time="9:00 a.m.-1:00 p.m.",
            place="Plaza Universidad",
            location="Universidad 1000, Col. Santa Cruz Atoyac, Benito Juárez, CDMX",
            spots=1500,
            type=EventType.ONSITE,
            summary=(
                "Sesión intensiva para fortalecer liderazgo, comunicación efectiva y coordinación "
                "entre equipos en escenarios universitarios."
            ),
            agenda=[
                "Dinámicas de liderazgo situacional",
                "Retos colaborativos por equipos",
                "Feedback en tiempo real con facilitadores",
            ],
            requirements=[
                "Credencial de alumno vigente",
                "Ropa cómoda para actividades en equipo",
                "Disposición para participar en dinámicas grupales",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="2",
            image="/Photos/photo2.jpg",
            name="Simulación de exportación/importanción de un producto",
            date=date(2026, 6, 5),
            time="10:00 a.m.-1:00 p.m.",
            place="Forum Buenavista",
            location="Av. Insurgentes Norte 259, Col. Buenavista, Cuauhtémoc, CDMX",
            spots=1500,
            type=EventType.ONLINE,
            summary=(
                "Actividad práctica para comprender procesos clave de comercio exterior desde la "
                "negociación hasta la entrega final."
            ),
            agenda=[
                "Diseño de estrategia de importación/exportación",
                "Revisión de costos, tiempos y cumplimiento normativo",
                "Simulación de cierre con análisis de resultados",
            ],
            requirements=[
                "Conexión estable a internet",
                "Laptop o tablet para la simulación",
                "Conocimientos básicos de negocios internacionales",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="3",
            image="/Photos/photo3.jpg",
            name="Cabina de radio o podcast en vivo",
            date=date(2026, 11, 4),
            time="4:00 p.m.-7:00 p.m.",
            place="Alameda Central",
            location="Av. Juárez s/n, Centro Histórico, Cuauhtémoc, CDMX",
            spots=1500,
            type=EventType.ONLINE,
            summary=(
                "Producción de contenido en vivo para practicar expresión oral, storytelling y "
                "manejo técnico básico de cabina."
            ),
            agenda=[
                "Planeación del formato y guion breve",
                "Grabación y salida en vivo por bloques",
                "Retroalimentación sobre dicción y narrativa",
            ],
            requirements=[
                "Micrófono con audífonos integrados",
                "Participación activa en ejercicios de locución",
                "Puntualidad para pruebas de audio",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="4",
            image="/Photos/photo4.jpg",
            name="Escena del crimen simulada para análisis",
            date=date(2026, 4, 13),
            time="10:00 a.m.-3:00 p.m",
            place="Explanada del Monumento a la Revolución",
            location="Plaza de la República s/n, Tabacalera, Cuauhtémoc, CDMX",
            spots=1500,
            type=EventType.ONSITE,
            summary=(
                "Experiencia inmersiva para aplicar observación, análisis forense y trabajo de campo "
                "con metodología estructurada."
            ),
            agenda=[
                "Levantamiento inicial de indicios",
                "Clasificación y registro de evidencia",
                "Presentación de hipótesis por equipos",
            ],
            requirements=[
                "Credencial universitaria",
                "Llevar libreta y bolígrafo",
                "Seguir lineamientos de seguridad del facilitador",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="5",
            image="/Photos/photo5.jpg",
            name="Demostración de apps o videojuegos",
            date=date(2026, 4, 22),
            time="3:00 p.m.-7:00 p.m",
            place="Plaza Antara",
            location="Av. Ejército Nacional 843-B, Col. Granada, Miguel Hidalgo, CDMX",
            spots=1500,
            type=EventType.ONSITE,
            summary=(
                "Muestra de prototipos digitales donde los alumnos presentan aplicaciones y "
                "videojuegos a usuarios reales."
            ),
            agenda=[
                "Pitch de producto por proyecto",
                "Prueba de usuario con retroalimentación guiada",
                "Revisión final de mejoras prioritarias",
            ],
            requirements=[
                "Proyecto funcional listo para demo",
                "Equipo con cargador",
                "Material de apoyo para presentación (slides o one-pager)",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="6",
            image="/Photos/photo6.jpg",
            name="Taller de inteligencia emocional",
            date=date(2026, 4, 19),
            time="9:00 a.m.-1:00 p.m",
            place="Parque Hundido",
            location="Av. Insurgentes Sur s/n, Col. Extremadura Insurgentes, Benito Juárez, CDMX",
            spots=1500,
            type=EventType.ONSITE,
            summary=(
                "Entrenamiento enfocado en autoconocimiento, regulación emocional y comunicación "
                "asertiva para contextos académicos y laborales."
            ),
            agenda=[
                "Diagnóstico de estilos emocionales",
                "Ejercicios de autorregulación en casos reales",
                "Diseño de plan personal de mejora",
            ],
            requirements=[
                "Asistencia completa al taller",
                "Participación en dinámicas de reflexión",
                "Respeto a normas de convivencia y escucha",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="7",
            image="/Photos/photo7.jpg",
            name="Atención al cliente en escenarios reales",
            date=date(2026, 4, 23),
            time="10:00 a.m.-4:00 p.m",
            place="Embarcadero Natitivas",
            location="Calle del Mercado 133, Col. Xochimilco, CDMX",
            spots=1500,
            type=EventType.ONSITE,
            summary=(
                "Simulaciones de servicio al cliente con enfoque en resolución de conflictos, empatía "
                "y seguimiento efectivo."
            ),
            agenda=[
                "Mapeo de momentos críticos en la atención",
                "Role play de casos con distintos perfiles de cliente",
                "Cierre con métricas de satisfacción",
            ],
            requirements=[
                "Puntualidad para asignación de equipos",
                "Disponibilidad para actividades de role play",
                "Tomar notas para plan de mejora individual",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="8",
            image="/Photos/photo8.jpg",
            name="Retos de pronunciación o vocabulario",
            date=date(2026, 10, 17),
            time="11:00 a.m.- 1:00 p.m.",
            place="Plaza Hidalgo, Coyoacán",
            location="Plaza Hidalgo s/n, Col. Centro, Coyoacán, CDMX",
            spots=1500,
            type=EventType.ONLINE,
            summary=(
                "Práctica intensiva de pronunciación y vocabulario con ejercicios guiados para mejorar "
                "fluidez en contextos reales."
            ),
            agenda=[
                "Warm-up fonético y detección de errores frecuentes",
                "Retos de vocabulario por nivel",
                "Evaluación de progreso y recomendaciones",
            ],
            requirements=[
                "Micrófono funcional",
                "Cuaderno o app para registro de vocabulario",
                "Participación activa en ejercicios de speaking",
            ],
            created_at=now,
            updated_at=now,
        ),
        EventRecord(
            id="9",
            image="/Photos/photo9.jpg",
            name="Retos de lógica y algoritmos",
            date=date(2026, 6, 5),
            time="3:00 p.m.-7:00 p.m.",
            place="Biblioteca Vasconcelos",
            location="Eje 1 Norte Mosqueta s/n, Col. Buenavista, Alcaldía Cuauhtémoc, CDMX",
            spots=1500,
            type=EventType.ONSITE,
            summary=(
                "Circuito de desafíos algorítmicos para reforzar pensamiento lógico, optimización y "
                "resolución estructurada de problemas."
            ),
            agenda=[
                "Problemas de complejidad creciente",
                "Estrategias de optimización y debugging",
                "Sesión final de revisión de soluciones",
            ],
            requirements=[
                "Laptop con editor de código instalado",
                "Conocimientos básicos de programación",
                "Trabajo en parejas durante retos avanzados",
            ],
            created_at=now,
            updated_at=now,
        ),
    ]
