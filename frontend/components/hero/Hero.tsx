"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import SplitText from "../ui/SplitText"
import BlurText from "../ui/BlurText"
import "./hero.css"

type HeroMetric = {
    value: string
    label: string
}

type HeroContent = {
    kicker: string
    title: string
    subtitle: string
    track: string
    pillars: [string, string, string]
    metrics: [HeroMetric, HeroMetric, HeroMetric, HeroMetric]
}

export default function Hero() {
    const pathname = usePathname()

    const getHeroContent = (): HeroContent => {
        switch (pathname) {
            case "/":
                return {
                    kicker: "Campus UNIMEX",
                    title: "Experiencia Académica de Alto Nivel",
                    subtitle: "Conecta con eventos formativos, talleres y experiencias que impulsan tu perfil universitario.",
                    track: "Una plataforma institucional para aprender, participar y destacar.",
                    pillars: ["Excelencia académica", "Innovación aplicada", "Vinculación profesional"],
                    metrics: [
                        { value: "+120", label: "Eventos por ciclo" },
                        { value: "95%", label: "Satisfacción estudiantil" },
                        { value: "+30", label: "Áreas de formación" },
                        { value: "24/7", label: "Gestión digital" },
                    ],
                }
            case "/privacidad":
                return {
                    kicker: "Cumplimiento institucional",
                    title: "Privacidad y Protección de Datos",
                    subtitle: "Gestionamos tu información con criterios de seguridad, transparencia y responsabilidad universitaria.",
                    track: "Tus datos personales se tratan con enfoque normativo y trazabilidad.",
                    pillars: ["Confidencialidad", "Consentimiento informado", "Control de acceso"],
                    metrics: [
                        { value: "100%", label: "Procesos auditables" },
                        { value: "0", label: "Uso comercial de datos" },
                        { value: "TLS", label: "Canales cifrados" },
                        { value: "ISO", label: "Buenas prácticas" },
                    ],
                }
            case "/admin":
                return {
                    kicker: "Gestión estratégica",
                    title: "Panel Administrativo",
                    subtitle: "Coordina la agenda institucional y opera la cartelera de eventos con precisión.",
                    track: "Control centralizado para creación, edición y seguimiento académico.",
                    pillars: ["Operación eficiente", "Control institucional", "Datos accionables"],
                    metrics: [
                        { value: "1", label: "Panel unificado" },
                        { value: "CSV", label: "Reportes exportables" },
                        { value: "Live", label: "Datos actualizados" },
                        { value: "100%", label: "Control de roles" },
                    ],
                }
            case "/dashboard":
                return {
                    kicker: "Analítica institucional",
                    title: "Dashboard de Rendimiento",
                    subtitle: "Visualiza registros, actividad estudiantil y desempeño de eventos en tiempo real.",
                    track: "Indicadores clave para decisiones académicas basadas en evidencia.",
                    pillars: ["Métricas claras", "Seguimiento continuo", "Visión ejecutiva"],
                    metrics: [
                        { value: "+1K", label: "Interacciones mensuales" },
                        { value: "Top 5", label: "Eventos destacados" },
                        { value: "Real-time", label: "Monitoreo activo" },
                        { value: "360°", label: "Visibilidad operativa" },
                    ],
                }
            case "/mis-eventos":
                return {
                    kicker: "Trayectoria personal",
                    title: "Tus Eventos Registrados",
                    subtitle: "Mantén control de tus actividades, horarios y participación académica desde un solo lugar.",
                    track: "Tu historial de participación refleja tu crecimiento universitario.",
                    pillars: ["Seguimiento puntual", "Organización académica", "Participación activa"],
                    metrics: [
                        { value: "100%", label: "Acceso inmediato" },
                        { value: "24h", label: "Gestión continua" },
                        { value: "Past/Active", label: "Estado de eventos" },
                        { value: "1 click", label: "Consulta rápida" },
                    ],
                }
            default:
                if (pathname?.startsWith("/eventos")) {
                    return {
                        kicker: "Agenda UNIMEX",
                        title: "Cartelera Académica",
                        subtitle: "Descubre actividades formativas diseñadas para fortalecer competencias profesionales.",
                        track: "Eventos con enfoque práctico y visión de futuro.",
                        pillars: ["Formación integral", "Networking académico", "Experiencia aplicada"],
                        metrics: [
                            { value: "Activos", label: "Eventos vigentes" },
                            { value: "Pasados", label: "Historial consultable" },
                            { value: "5★", label: "Sistema de valoración" },
                            { value: "Smart", label: "Filtros avanzados" },
                        ],
                    }
                }
                if (pathname?.startsWith("/admin")) {
                    return {
                        kicker: "Gestión interna",
                        title: "Administración",
                        subtitle: "Herramientas para mantener la agenda académica institucional siempre actualizada.",
                        track: "Eficiencia operativa con control completo de publicaciones.",
                        pillars: ["Control de contenido", "Coordinación central", "Flujo eficiente"],
                        metrics: [
                            { value: "1", label: "Sistema central" },
                            { value: "Roles", label: "Acceso segmentado" },
                            { value: "Cloud", label: "Operación en línea" },
                            { value: "Secure", label: "Entorno protegido" },
                        ],
                    }
                }
                return {
                    kicker: "Plataforma oficial",
                    title: "Ecosistema Académico UNIMEX",
                    subtitle: "Una experiencia digital moderna para impulsar aprendizaje, participación y proyección profesional.",
                    track: "Diseñado para una comunidad universitaria dinámica y conectada.",
                    pillars: ["Visión institucional", "Experiencia premium", "Crecimiento continuo"],
                    metrics: [
                        { value: "+120", label: "Eventos anuales" },
                        { value: "360°", label: "Experiencia digital" },
                        { value: "Live", label: "Actualización continua" },
                        { value: "UNIMEX", label: "Sello académico" },
                    ],
                }
        }
    }

    const content = getHeroContent()
    const imageSrc = "/hero-campus-optimized.jpg"
    const shouldPrioritizeImage = pathname === "/"


    return (
        <div className="hero-container">
            <div className="hero-background">
                <Image
                    src={imageSrc}
                    alt="Campus UNIMEX"
                    fill
                    className="hero-image"
                    priority={shouldPrioritizeImage}
                    quality={68}
                    sizes="100vw"
                />
            </div>

            <div className="hero-grid" />
            <div className="hero-glow hero-glow-a" />
            <div className="hero-glow hero-glow-b" />

            <div className="hero-overlay">
                <div className="hero-content-shell">
                    <section className="hero-main">
                    <p className="hero-kicker">{content.kicker}</p>
                    <SplitText
                        key={content.title}
                        text={content.title}
                        className="hero-title"
                        tag="h1"
                        delay={32}
                        duration={0.84}
                        splitType="chars"
                        from={{ opacity: 0, filter: "blur(6px)", y: 22 }}
                        to={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        threshold={0.04}
                        rootMargin="-6%"
                        textAlign="left"
                    />
                    <BlurText
                        key={content.subtitle}
                        text={content.subtitle}
                        className="hero-subtitle"
                        animateBy="words"
                        direction="bottom"
                        delay={26}
                        threshold={0.12}
                        rootMargin="-10% 0px"
                        stepDuration={0.28}
                    />

                    <p className="hero-track">{content.track}</p>

                    <ul className="hero-pillars">
                        {content.pillars.map((pillar) => (
                            <li key={pillar} className="hero-pillar">
                                <span className="hero-pillar-dot" />
                                <span>{pillar}</span>
                            </li>
                        ))}
                    </ul>
                    </section>

                    <aside className="hero-panel">
                        <p className="hero-panel-kicker">Indicadores Académicos</p>
                        <h2 className="hero-panel-title">Impacto Institucional</h2>

                        <div className="hero-metrics">
                            {content.metrics.map((metric, index) => (
                                <article
                                    key={`${metric.label}-${index}`}
                                    className="hero-metric-card"
                                    style={{ animationDelay: `${0.08 * index + 0.16}s` }}
                                >
                                    <p className="hero-metric-value">{metric.value}</p>
                                    <p className="hero-metric-label">{metric.label}</p>
                                </article>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
