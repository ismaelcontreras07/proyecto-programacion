"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Hero from "./hero/Hero";
import { Footer } from "./footer/Footer";
import { Facebook, Instagram } from "lucide-react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <Hero />
            {children}
            <Footer
                logo={<img src="/logo-unimex-horizontal.png" alt="Unimex Logo" style={{ height: '70px', width: 'auto' }} />}
                socialLinks={[
                    { icon: <Facebook size={20} />, href: "https://www.facebook.com/unimex", label: "Facebook" },
                    { icon: <Instagram size={20} />, href: "https://www.instagram.com/unimexicana", label: "Instagram" },
                ]}
                mainLinks={[
                    { href: "/", label: "Inicio" },
                    { href: "/contacto", label: "Contacto" },
                ]}
                legalLinks={[
                    { href: "/privacidad", label: "Privacidad" },
                ]}
                copyright={{
                    text: "© 2026 UNIMEX. Todos los derechos reservados."
                }}
            />
        </>
    );
}
