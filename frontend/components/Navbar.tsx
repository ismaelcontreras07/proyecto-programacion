"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, LogIn, LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"
import Link from "next/link"

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
                    <motion.div
                        className="logo-icon"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <img src="/logo-unimex.png" alt="Unimex Logo" className="logo-image" />
                    </motion.div>
                </div>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    {links.map((item) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link href={item.href} className="nav-link">
                                {item.name}
                            </Link>
                        </motion.div>
                    ))}

                    {isAuthenticated ? (
                        <motion.button
                            onClick={logout}
                            className="nav-link flex items-center gap-2 text-red-500 hover:text-red-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LogOut size={18} />
                            <span>Salir</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link href="/login" className="nav-link flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                <LogIn size={18} />
                                <span>Ingresar</span>
                            </Link>
                        </motion.div>
                    )}
                </nav>
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
                                <motion.button
                                    onClick={() => {
                                        logout();
                                        toggleMenu();
                                    }}
                                    className="mobile-link flex items-center gap-2 text-red-500"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: links.length * 0.1 + 0.1 }}
                                >
                                    <LogOut size={20} />
                                    <span>Cerrar Sesión</span>
                                </motion.button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="mobile-link flex items-center gap-2 text-blue-600"
                                    onClick={toggleMenu}
                                >
                                    <LogIn size={20} />
                                    <span>Iniciar Sesión</span>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Navbar1