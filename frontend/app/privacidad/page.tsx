"use client";

import { motion } from "motion/react";
import "./privacy.css";
import { CalendarDays, Database, LockKeyhole, Mail, ShieldCheck, FileText } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    { id: "introduccion", label: "1. Introducción" },
    { id: "informacion", label: "2. Información que recopilamos" },
    { id: "uso", label: "3. Uso de la información" },
    { id: "proteccion", label: "4. Protección de datos" },
    { id: "derechos", label: "5. Conservación y derechos" },
    { id: "contacto", label: "6. Contacto" },
  ];

  return (
    <main className="privacy-page">
      <div className="privacy-shell">
        <motion.header
          className="privacy-header-card"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="privacy-kicker">
            <FileText size={15} />
            Privacidad UNIMEX
          </p>
          <h1 className="privacy-title">Política de Privacidad</h1>
          <p className="privacy-lead">
            Documento oficial de tratamiento de datos para la plataforma de eventos UNIMEX. Aquí explicamos qué
            información se recopila, cómo se utiliza y qué medidas aplicamos para su protección.
          </p>
          <div className="privacy-meta">
            <span>
              <CalendarDays size={14} />
              Actualización: 31 de marzo de 2026
            </span>
            <span>
              <ShieldCheck size={14} />
              Aplicable a cuentas de estudiantes
            </span>
          </div>
        </motion.header>

        <div className="privacy-layout">
          <motion.aside
            className="privacy-toc"
            aria-label="Índice de privacidad"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4 }}
          >
            <p className="privacy-toc-title">Contenido</p>
            <nav className="privacy-toc-links">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="privacy-toc-link">
                  {section.label}
                </a>
              ))}
            </nav>
          </motion.aside>

          <article className="privacy-content">
            {[
              {
                id: "introduccion",
                title: "1. Introducción",
                body: (
                  <p className="privacy-text">
                    En UNIMEX protegemos la privacidad de la comunidad estudiantil. Esta política describe de forma
                    transparente el tratamiento de datos personales dentro de la plataforma.
                  </p>
                ),
              },
              {
                id: "informacion",
                title: (
                  <>
                    <Database size={17} /> 2. Información que recopilamos
                  </>
                ),
                body: (
                  <>
                    <p className="privacy-text">Recopilamos únicamente información necesaria para operar el servicio:</p>
                    <ul className="privacy-list">
                      <li>Datos de cuenta: nombre, apellido, matrícula, carrera y cuatrimestre.</li>
                      <li>Datos de uso: registros a eventos, reseñas y actividad funcional dentro de la app.</li>
                      <li>Datos técnicos básicos: navegador, dispositivo e IP para seguridad y operación.</li>
                    </ul>
                  </>
                ),
              },
              {
                id: "uso",
                title: "3. Uso de la información",
                body: (
                  <>
                    <p className="privacy-text">El tratamiento de datos se realiza para:</p>
                    <ul className="privacy-list">
                      <li>Gestionar autenticación y acceso por rol.</li>
                      <li>Permitir registro, cancelación y seguimiento de asistencia a eventos.</li>
                      <li>Habilitar reseñas y calificaciones cuando un evento haya terminado.</li>
                      <li>Mejorar funcionamiento y soporte del sistema institucional.</li>
                    </ul>
                  </>
                ),
              },
              {
                id: "proteccion",
                title: (
                  <>
                    <LockKeyhole size={17} /> 4. Protección de datos
                  </>
                ),
                body: (
                  <p className="privacy-text">
                    Aplicamos medidas técnicas y organizativas para prevenir accesos no autorizados y uso indebido de
                    información. Aunque existen controles activos, ningún sistema en Internet puede garantizar riesgo
                    cero.
                  </p>
                ),
              },
              {
                id: "derechos",
                title: "5. Conservación y derechos",
                body: (
                  <p className="privacy-text">
                    Los datos se conservan durante el tiempo necesario para la operación académica y cumplimiento
                    institucional. Puedes solicitar orientación sobre tus derechos de acceso, actualización o revisión
                    de información personal.
                  </p>
                ),
              },
              {
                id: "contacto",
                title: (
                  <>
                    <Mail size={17} /> 6. Contacto
                  </>
                ),
                body: (
                  <p className="privacy-text">
                    Para dudas sobre esta política puedes escribir a{" "}
                    <a className="privacy-contact-link" href="mailto:privacidad@unimex.com">
                      privacidad@unimex.com
                    </a>
                    .
                  </p>
                ),
              },
            ].map((item, index) => (
              <motion.section
                id={item.id}
                className="privacy-section"
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.36, delay: index * 0.04 }}
              >
                <h2 className="privacy-section-title">{item.title}</h2>
                {item.body}
              </motion.section>
            ))}
          </article>
        </div>
      </div>
    </main>
  );
}
