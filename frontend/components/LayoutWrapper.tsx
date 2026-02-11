"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Hero from "./hero/Hero";
import { Footer } from "./footer/Footer";
import { Facebook, Twitter, Instagram } from "lucide-react";

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
                logo={<img src="/logo-unimex.png" alt="Unimex Logo" style={{ height: '32px', width: 'auto' }} />}
                brandName="UNIMEX"
                socialLinks={[
                    { icon: <Facebook size={20} />, href: "#", label: "Facebook" },
                    { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
                    { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
                ]}
                mainLinks={[
                    { href: "/", label: "Inicio" },
                    { href: "/contacto", label: "Contacto" },
                    { href: "/admin", label: "Admin" },
                    { href: "/dashboard", label: "Dashboard" },
                ]}
                legalLinks={[
                    { href: "/privacidad", label: "Privacidad" },
                    { href: "/terminos", label: "Términos y Condiciones" },
                ]}
                copyright={{
                    text: "© 2024 UNIMEX Inc. Todos los derechos reservados."
                }}
            />
        </>
    );
}
