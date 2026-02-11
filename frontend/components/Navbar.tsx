"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, LogIn, LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"
import Link from "next/link"
import Button from "./ui/Button"

const Navbar1 = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()

    const toggleMenu = () => setIsOpen(!isOpen)

    const baseLinks = [
        { name: "Inicio", href: "/" },
        { name: "Contacto", href: "/contacto" },
        { name: "Privacidad", href: "/privacidad" },
    ]

    const adminLinks = [
        { name: "Admin", href: "/admin" },
        { name: "Dashboard", href: "/dashboard" },
    ]

    const links = user?.role === "admin" ? [...baseLinks, ...adminLinks] : baseLinks

    return (
        <div className="navbar-container">
            <div className="navbar-pill">
                <div className="logo-container">
                    <Link href="/">
                        <motion.div
                            className="logo-icon"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            whileHover={{ rotate: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img src="/logo-unimex.png" alt="Unimex Logo" className="logo-image" />
                        </motion.div>
                    </Link>
                </div>

                {/* Desktop Navigation - Links only */}
                <nav className="desktop-nav">
                    {links.map((item) => (
                        <motion.div
                            key={item.name}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link href={item.href} className="nav-link">
                                {item.name}
                            </Link>
                        </motion.div>
                    ))}
                </nav>

                {/* Desktop Auth Button */}
                <div className="desktop-auth">
                    {isAuthenticated ? (
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Button
                                onClick={logout}
                                variant="ghost"
                                className="text-red"
                            >
                                <LogOut size={18} />
                                <span>Salir</span>
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div whileHover={{ scale: 1.05 }}>
                            <Button href="/login" variant="primary">
                                <LogIn size={18} />
                                <span>Ingresar</span>
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button className="mobile-menu-btn" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
                    <Menu className="menu-icon" />
                </motion.button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mobile-overlay"
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <motion.button
                            className="close-btn"
                            onClick={toggleMenu}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <X className="menu-icon" />
                        </motion.button>
                        <div className="mobile-links">
                            {links.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 + 0.1 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Link href={item.href} className="mobile-link" onClick={toggleMenu}>
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                            {isAuthenticated ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: links.length * 0.1 + 0.1 }}
                                >
                                    <Button
                                        onClick={() => {
                                            logout();
                                            toggleMenu();
                                        }}
                                        variant="ghost"
                                        className="text-red w-full justify-start"
                                    >
                                        <LogOut size={20} />
                                        <span>Cerrar Sesión</span>
                                    </Button>
                                </motion.div>
                            ) : (
                                <Button
                                    href="/login"
                                    variant="primary"
                                    className="w-full justify-center"
                                    onClick={toggleMenu}
                                >
                                    <LogIn size={20} />
                                    <span>Iniciar Sesión</span>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Navbar1