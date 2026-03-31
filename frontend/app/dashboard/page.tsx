"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  downloadAdminReportCsv,
  fetchAdminSummary,
  type AdminReportType,
  type AdminSummary,
} from "../../lib/api";
import "./dashboard.css";

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState<AdminReportType | null>(null);
  const pageRef = useRef<HTMLElement | null>(null);

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

  useGSAP(
    () => {
      if (!pageRef.current || loading || error || !summary) return;

      gsap.fromTo(
        ".dashboard-kpi-card",
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.08,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        ".dashboard-bar-track span",
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: "power2.out",
        },
      );
    },
    { scope: pageRef, dependencies: [loading, error, summary] },
  );

  const handleDownloadReport = async (reportType: AdminReportType) => {
    if (!accessToken) return;

    setDownloadError("");
    setDownloadingReport(reportType);
    try {
      await downloadAdminReportCsv(accessToken, reportType);
    } catch (downloadReportError) {
      setDownloadError(
        downloadReportError instanceof Error
          ? downloadReportError.message
          : "No se pudo descargar el reporte",
      );
    } finally {
      setDownloadingReport(null);
    }
  };

  const topEvents = summary?.top_events ?? [];
  const maxRegistrations = Math.max(1, ...topEvents.map((item) => item.total_registrations));

  return (
    <main className="dashboard-page" ref={pageRef}>
      <section className="dashboard-shell">
        <motion.header
          className="dashboard-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1>Dashboard administrativo</h1>
            <p>Resumen de usuarios, demanda de eventos y ocupación actual.</p>
          </div>
          <div className="dashboard-header-actions">
            <button
              type="button"
              onClick={() => void handleDownloadReport("registrations")}
              disabled={!accessToken || downloadingReport !== null}
            >
              <Download size={15} />
              {downloadingReport === "registrations"
                ? "Descargando..."
                : "CSV de registros"}
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadReport("events")}
              disabled={!accessToken || downloadingReport !== null}
            >
              <Download size={15} />
              {downloadingReport === "events" ? "Descargando..." : "CSV de eventos"}
            </button>
          </div>
        </motion.header>

        {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}
        {downloadError && <div className="dashboard-alert dashboard-alert-error">{downloadError}</div>}
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

            <section className="dashboard-charts-grid">
              <article className="dashboard-chart-card">
                <h2>Registros por evento</h2>
                <p>Eventos con mayor número de estudiantes registrados.</p>
                {topEvents.length === 0 ? (
                  <p className="dashboard-chart-empty">Aún no hay datos para graficar.</p>
                ) : (
                  <div className="dashboard-bars">
                    {topEvents.map((item) => {
                      const height = Math.max(
                        12,
                        Math.round((item.total_registrations / maxRegistrations) * 100),
                      );
                      return (
                        <article className="dashboard-bar-item" key={item.event_id}>
                          <div className="dashboard-bar-track">
                            <span style={{ height: `${height}%` }} />
                          </div>
                          <strong>{item.total_registrations}</strong>
                          <p title={item.event_name}>{item.event_name}</p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </article>

              <article className="dashboard-chart-card">
                <h2>Ocupación por evento</h2>
                <p>Relación entre registros y cupos disponibles.</p>
                {topEvents.length === 0 ? (
                  <p className="dashboard-chart-empty">Aún no hay datos para graficar.</p>
                ) : (
                  <ul className="dashboard-occupancy-list">
                    {topEvents.map((item) => {
                      const total = item.total_registrations + item.available_spots;
                      const occupiedPercent =
                        total <= 0
                          ? 0
                          : Math.round((item.total_registrations / total) * 100);
                      return (
                        <li key={item.event_id}>
                          <div className="dashboard-occupancy-meta">
                            <p title={item.event_name}>{item.event_name}</p>
                            <strong>{occupiedPercent}%</strong>
                          </div>
                          <div className="dashboard-occupancy-track" aria-hidden>
                            <span style={{ width: `${occupiedPercent}%` }} />
                          </div>
                          <small>
                            {item.total_registrations} registrados / {item.available_spots} cupos
                          </small>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            </section>

            <section className="dashboard-table-wrap">
              <h2>Eventos con más registros</h2>
              {topEvents.length === 0 ? (
                <p>Aún no hay registros en eventos.</p>
              ) : (
                <div className="dashboard-table-content">
                  <ul className="dashboard-mobile-event-cards">
                    {topEvents.map((item) => (
                      <li key={`mobile-${item.event_id}`}>
                        <p>{item.event_name}</p>
                        <span>{item.total_registrations} registros</span>
                        <span>{item.available_spots} cupos disponibles</span>
                      </li>
                    ))}
                  </ul>
                  <div className="dashboard-table-scroll">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Evento</th>
                          <th>Registros</th>
                          <th>Cupos disponibles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topEvents.map((item) => (
                          <tr key={item.event_id}>
                            <td data-label="Evento">{item.event_name}</td>
                            <td data-label="Registros">{item.total_registrations}</td>
                            <td data-label="Cupos disponibles">{item.available_spots}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
