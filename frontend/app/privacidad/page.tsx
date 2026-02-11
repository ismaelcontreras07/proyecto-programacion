import "./privacy.css";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black">
            <div className="privacy-container">
                <div className="privacy-header">
                    <h1 className="privacy-title">Política de Privacidad</h1>
                    <p className="privacy-last-updated">Última actualización: 11 de Febrero, 2026</p>
                </div>

                <div className="privacy-content">
                    <section className="privacy-section">
                        <h2 className="privacy-section-title">1. Introducción</h2>
                        <p className="privacy-text">
                            En UNIMEX, valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos y divulgamos su información cuando utiliza nuestros servicios.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section-title">2. Información que Recopilamos</h2>
                        <p className="privacy-text">
                            Podemos recopilar la siguiente información:
                        </p>
                        <ul className="privacy-list">
                            <li>Información personal (nombre, correo electrónico, número de teléfono) que usted proporciona voluntariamente.</li>
                            <li>Datos de uso y navegación en nuestro sitio web.</li>
                            <li>Información técnica como su dirección IP y tipo de navegador.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section-title">3. Uso de la Información</h2>
                        <p className="privacy-text">
                            Utilizamos su información para:
                        </p>
                        <ul className="privacy-list">
                            <li>Proveer y mantener nuestros servicios.</li>
                            <li>Notificarle sobre cambios en nuestros servicios.</li>
                            <li>Permitirle participar en funciones interactivas cuando decida hacerlo.</li>
                            <li>Brindar soporte al cliente y responder a sus consultas.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section-title">4. Protección de Datos</h2>
                        <p className="privacy-text">
                            Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no autorizado y uso indebido. Sin embargo, tenga en cuenta que ninguna transmisión de datos por Internet es 100% segura.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2 className="privacy-section-title">5. Contacto</h2>
                        <p className="privacy-text">
                            Si tiene preguntas sobre esta Política de Privacidad, por favor contáctenos a través de nuestra página de contacto o enviando un correo a privacidad@unimex.com.
                        </p>
                    </section>
                </div>
            </div>
        </main>

    );
}
