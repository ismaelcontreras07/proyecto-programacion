"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import "./event-registration-form.css";

interface EventRegistrationFormProps {
  eventName: string;
}

interface RegistrationFormState {
  fullName: string;
  studentId: string;
  email: string;
  career: string;
  semester: string;
  phone: string;
}

const INITIAL_STATE: RegistrationFormState = {
  fullName: "",
  studentId: "",
  email: "",
  career: "",
  semester: "",
  phone: "",
};

export default function EventRegistrationForm({ eventName }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormState>(INITIAL_STATE);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setFormData(INITIAL_STATE);
  };

  return (
    <div className="event-registration-card">
      <h3 className="event-registration-title">Registro de alumnos</h3>
      <p className="event-registration-subtitle">
        Completa tus datos para apartar lugar en <strong>{eventName}</strong>.
      </p>

      {isSubmitted && (
        <div className="event-registration-success">
          <CircleCheck className="event-registration-success-icon" />
          <p>Registro enviado con éxito. Recibirás confirmación por correo institucional.</p>
        </div>
      )}

      <form className="event-registration-form" onSubmit={handleSubmit}>
        <label className="event-registration-field">
          <span>Nombre completo</span>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Ej. Ana Gómez Pérez"
            required
          />
        </label>

        <label className="event-registration-field">
          <span>Matrícula</span>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Ej. A01234567"
            required
          />
        </label>

        <label className="event-registration-field">
          <span>Correo institucional</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu.nombre@alumno.unimex.edu.mx"
            required
          />
        </label>

        <label className="event-registration-field">
          <span>Teléfono</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ej. 5512345678"
            required
          />
        </label>

        <label className="event-registration-field">
          <span>Carrera</span>
          <input
            type="text"
            name="career"
            value={formData.career}
            onChange={handleChange}
            placeholder="Ej. Ingeniería en Sistemas"
            required
          />
        </label>

        <label className="event-registration-field">
          <span>Semestre</span>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecciona tu semestre
            </option>
            <option value="1">1° semestre</option>
            <option value="2">2° semestre</option>
            <option value="3">3° semestre</option>
            <option value="4">4° semestre</option>
            <option value="5">5° semestre</option>
            <option value="6">6° semestre</option>
            <option value="7">7° semestre</option>
            <option value="8">8° semestre</option>
            <option value="9">9° semestre</option>
            <option value="10">10° semestre</option>
          </select>
        </label>

        <button type="submit" className="event-registration-submit">
          Registrar al evento
        </button>
      </form>
    </div>
  );
}
