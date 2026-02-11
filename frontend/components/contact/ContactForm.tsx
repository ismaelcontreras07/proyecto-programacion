"use client";
import React, { useState } from "react";
import "./contact-form.css";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted:", formData);
        alert("¡Mensaje enviado con éxito!");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section className="contact-section">
            <div className="contact-header">
                <h2 className="contact-title">Contáctanos</h2>
                <p className="contact-subtitle">
                    Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
                </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Tu nombre"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="tu@correo.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subject" className="form-label">Asunto</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Asunto del mensaje"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message" className="form-label">Mensaje</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Escribe tu mensaje aquí..."
                        required
                    ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                    Enviar Mensaje
                </button>
            </form>
        </section>
    );
}
