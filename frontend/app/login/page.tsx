"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import "./login.css"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useAuth()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (username === "admin" && password === "admin") {
            login(username, "admin")
        } else if (username === "user" && password === "user") {
            login(username, "user")
        } else {
            setError("Invalid credentials")
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Login</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin or user"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">
                        Sign In
                    </button>
                </form>
                <div className="login-help">
                    <p>
                        Credits: <br />
                        Admin: admin / admin <br />
                        User: user / user
                    </p>
                </div>
            </div>
        </div>
    )
}
