"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || user?.role !== "admin") {
                router.push("/login")
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (!isAuthenticated || user?.role !== "admin") {
        return null
    }

    return <>{children}</>
}
