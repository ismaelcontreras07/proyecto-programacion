import "./privacy.css";
import { CalendarDays, Database, LockKeyhole, Mail, ShieldCheck, FileText } from "lucide-react";

// cambio celic

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
                <header className="privacy-header-card">
                    <p className="privacy-kicker">
                        <FileText size={15} />
                        Documento legal
                    </p>
                    <h1 className="privacy-title">Política de Privacidad</h1>
                    <p className="privacy-lead">
                        En este documento explicamos de forma clara qué datos tratamos en la plataforma de eventos UNIMEX,
                        por qué se usan y cómo los protegemos.
                    </p>
                    <div className="privacy-meta">
                        <span>
                            <CalendarDays size={14} />
                            Última actualización: 11 de febrero de 2026
                        </span>
                        <span>
                            <ShieldCheck size={14} />
                            Aplicable a UNIMEX Eventos
                        </span>
                    </div>
                </header>

                <div className="privacy-layout">
                    <aside className="privacy-toc" aria-label="Índice de privacidad">
                        <p className="privacy-toc-title">Contenido</p>
                        <nav className="privacy-toc-links">
                            {sections.map((section) => (
                                <a key={section.id} href={`#${section.id}`} className="privacy-toc-link">
                                    {section.label}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    <article className="privacy-content">
                        <section id="introduccion" className="privacy-section">
                            <h2 className="privacy-section-title">1. Introducción</h2>
                            <p className="privacy-text">
                                En UNIMEX valoramos su privacidad y estamos comprometidos con la protección de sus datos personales.
                                Esta Política de Privacidad describe cómo recopilamos, utilizamos y resguardamos su información
                                cuando usa nuestros servicios.
                            </p>
                        </section>

                        <section id="informacion" className="privacy-section">
                            <h2 className="privacy-section-title">
                                <Database size={17} />
                                2. Información que recopilamos
                            </h2>
                            <p className="privacy-text">Podemos recopilar la siguiente información:</p>
                            <ul className="privacy-list">
                                <li>Datos de cuenta y registro: nombre completo, matrícula, carrera y cuatrimestre.</li>
                                <li>Datos de uso y navegación dentro de la plataforma.</li>
                                <li>Información técnica, como dirección IP, navegador y dispositivo.</li>
                            </ul>
                        </section>

                        <section id="uso" className="privacy-section">
                            <h2 className="privacy-section-title">3. Uso de la información</h2>
                            <p className="privacy-text">Utilizamos su información para:</p>
                            <ul className="privacy-list">
                                <li>Operar y mantener la plataforma de eventos.</li>
                                <li>Gestionar su autenticación y sus registros a eventos.</li>
                                <li>Notificar cambios relevantes en servicios o actividades.</li>
                                <li>Atender soporte y resolver consultas.</li>
                            </ul>
                        </section>

                        <section id="proteccion" className="privacy-section">
                            <h2 className="privacy-section-title">
                                <LockKeyhole size={17} />
                                4. Protección de datos
                            </h2>
                            <p className="privacy-text">
                                Implementamos controles de seguridad para prevenir acceso no autorizado y uso indebido de su
                                información. Aun así, ninguna transmisión por Internet puede garantizar seguridad total al 100%.
                            </p>
                        </section>

                        <section id="derechos" className="privacy-section">
                            <h2 className="privacy-section-title">5. Conservación y derechos</h2>
                            <p className="privacy-text">
                                Conservamos la información solo por el tiempo necesario para cumplir las finalidades del servicio
                                y obligaciones aplicables. Puede solicitar orientación sobre el tratamiento de sus datos personales.
                            </p>
                        </section>

                        <section id="contacto" className="privacy-section">
                            <h2 className="privacy-section-title">
                                <Mail size={17} />
                                6. Contacto
                            </h2>
                            <p className="privacy-text">
                                Si tiene preguntas sobre esta Política de Privacidad, puede escribir a{" "}
                                <a className="privacy-contact-link" href="mailto:privacidad@unimex.com">
                                    privacidad@unimex.com
                                </a>
                                .
                            </p>
                        </section>
                    </article>
                </div>
            </div>
        </main>
    );
}
