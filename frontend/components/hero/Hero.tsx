"use client"

import { usePathname } from "next/navigation"
import { RevealWaveImage } from "./reveal-wave-image"
import SplitText from "../ui/SplitText"
import "./hero.css"

export default function Hero() {
    const pathname = usePathname()

    const getHeroText = () => {
        switch (pathname) {
            case "/":
                return "Unimex"
            case "/contacto":
                return "Contacto"
            case "/privacidad":
                return "Privacidad"
            case "/admin":
                return "ADMIN"
            case "/dashboard":
                return "DASHBOARD"
            case "/login":
                return "LOGIN"
            default:
                if (pathname?.startsWith("/eventos")) return "Unimex"
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
                <SplitText
                    key={text}
                    text={text}
                    className="hero-text-content"
                    tag="h1"
                    delay={50}
                    duration={1}
                    splitType="chars"
                    from={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                    to={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    threshold={0.1}
                />
            </div>
        </div>
    )
}
