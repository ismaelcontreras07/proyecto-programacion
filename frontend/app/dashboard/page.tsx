"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminSummary, type AdminSummary } from "../../lib/api";
import "./dashboard.css";

export default function DashboardPage() {
    const { accessToken } = useAuth();
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!accessToken) return;
        const controller = new AbortController();

        const loadSummary = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetchAdminSummary(accessToken, controller.signal);
                setSummary(response);
            } catch (loadError) {
                if (controller.signal.aborted) return;
                setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el dashboard");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void loadSummary();
        return () => controller.abort();
    }, [accessToken]);

    return (
        <main className="dashboard-page">
            <section className="dashboard-shell">
                <header className="dashboard-header">
                    <h1>Dashboard administrativo</h1>
                    <p>Resumen general de usuarios, eventos y registros.</p>
                </header>

                {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}
                {loading && <div className="dashboard-alert">Cargando métricas...</div>}

                {!loading && !error && summary && (
                    <>
                        <section className="dashboard-kpis">
                            <article className="dashboard-kpi-card">
                                <span>Total usuarios</span>
                                <strong>{summary.total_users}</strong>
                            </article>
                            <article className="dashboard-kpi-card">
                                <span>Total eventos</span>
                                <strong>{summary.total_events}</strong>
                            </article>
                            <article className="dashboard-kpi-card">
                                <span>Registros totales</span>
                                <strong>{summary.total_registrations}</strong>
                            </article>
                            <article className="dashboard-kpi-card">
                                <span>Registros últimas 24h</span>
                                <strong>{summary.registrations_today}</strong>
                            </article>
                        </section>

                        <section className="dashboard-table-wrap">
                            <h2>Eventos con más registros</h2>
                            {summary.top_events.length === 0 ? (
                                <p>Aún no hay registros en eventos.</p>
                            ) : (
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Evento</th>
                                            <th>Registros</th>
                                            <th>Cupos disponibles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.top_events.map((item) => (
                                            <tr key={item.event_id}>
                                                <td>{item.event_name}</td>
                                                <td>{item.total_registrations}</td>
                                                <td>{item.available_spots}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}
