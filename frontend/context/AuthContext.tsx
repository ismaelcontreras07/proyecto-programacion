"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Role = "admin" | "user" | null

interface User {
    username: string
    role: Role
}

interface AuthContextType {
    user: User | null
    login: (username: string, role: Role) => void
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = (username: string, role: Role) => {
        const newUser = { username, role }
        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        router.push("/")
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("user")
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
