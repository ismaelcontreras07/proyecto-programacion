"use client"

import { usePathname } from "next/navigation"
import { RevealWaveImage } from "./reveal-wave-image"
import HeroText from "./hero-text"
import "./hero.css"

export default function Hero() {
    const pathname = usePathname()

    // Determine text based on current path
    const getHeroText = () => {
        switch (pathname) {
            case "/":
                return "INICIO"
            case "/contacto":
                return "CONTACTO"
            case "/privacidad":
                return "PRIVACIDAD"
            case "/admin":
                return "ADMIN"
            case "/dashboard":
                return "DASHBOARD"
            case "/login":
                return "LOGIN"
            default:
                // For other routes, maybe return the path segment or a default
                if (pathname?.startsWith("/admin")) return "ADMIN"
                return "LLEVAME"
        }
    }

    const text = getHeroText()
    const imageSrc = "/upscalemedia-transformed.jpeg"


    return (
        <div className="hero-container">
            <div className="hero-background">
                <RevealWaveImage
                    src={imageSrc}
                    className="hero-image"
                />
            </div>
            <div className="hero-overlay">
                {/* HeroText wrapper to position it */}
                <HeroText
                    text={text}
                    className="hero-text-content"
                />
            </div>
        </div>
    )
}
