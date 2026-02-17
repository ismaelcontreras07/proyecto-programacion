"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import SplitText from "../ui/SplitText"
import "./hero.css"

type HeroContent = {
    kicker: string
    title: string
    subtitle: string
}

export default function Hero() {
    const pathname = usePathname()

    const getHeroContent = (): HeroContent => {
        switch (pathname) {
            case "/":
                return {
                    kicker: "Comunidad UNIMEX",
                    title: "UNIMEX",
                    subtitle: "Explora eventos académicos y profesionales diseñados para impulsar tu perfil.",
                }
            case "/privacidad":
                return {
                    kicker: "Legal y cumplimiento",
                    title: "Privacidad",
                    subtitle: "Consulta de forma clara cómo protegemos y tratamos tus datos dentro de la plataforma.",
                }
            case "/admin":
                return {
                    kicker: "Gestión interna",
                    title: "Admin",
                    subtitle: "Configura la cartelera institucional y administra eventos con control total.",
                }
            case "/dashboard":
                return {
                    kicker: "Métricas en vivo",
                    title: "Dashboard",
                    subtitle: "Visualiza usuarios, registros y desempeño de eventos en un panel unificado.",
                }
            case "/mis-eventos":
                return {
                    kicker: "Tu actividad",
                    title: "Mis eventos",
                    subtitle: "Consulta tus registros y mantén seguimiento puntual de cada actividad inscrita.",
                }
            default:
                if (pathname?.startsWith("/eventos")) {
                    return {
                        kicker: "Agenda UNIMEX",
                        title: "Eventos",
                        subtitle: "Conoce cada detalle y aparta tu lugar en experiencias formativas de alto valor.",
                    }
                }
                if (pathname?.startsWith("/admin")) {
                    return {
                        kicker: "Gestión interna",
                        title: "Admin",
                        subtitle: "Herramientas administrativas para crear y mantener eventos actualizados.",
                    }
                }
                return {
                    kicker: "Plataforma oficial",
                    title: "UNIMEX",
                    subtitle: "Un espacio elegante para descubrir oportunidades, registrarte y crecer profesionalmente.",
                }
        }
    }

    const content = getHeroContent()
    const imageSrc = "/upscalemedia-transformed.jpeg"


    return (
        <div className="hero-container">
            <div className="hero-background">
                <Image
                    src={imageSrc}
                    alt="Campus UNIMEX"
                    fill
                    className="hero-image"
                    priority
                    sizes="100vw"
                />
            </div>
            <div className="hero-overlay">
                <div className="hero-content">
                    <p className="hero-kicker">{content.kicker}</p>
                    <SplitText
                        key={content.title}
                        text={content.title}
                        className="hero-title"
                        tag="h1"
                        delay={40}
                        duration={0.95}
                        splitType="chars"
                        from={{ opacity: 0, filter: "blur(5px)", y: 24 }}
                        to={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        threshold={0.00}
                    />
                    <p className="hero-subtitle">{content.subtitle}</p>
                </div>
            </div>
        </div>
    )
}
