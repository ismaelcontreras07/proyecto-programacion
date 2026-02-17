"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, Eye, EyeOff, ShieldCheck } from "lucide-react";
import "./signin.css";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInPayload {
  studentId: string;
  password: string;
}

export interface SignUpPayload {
  fullName: string;
  studentId: string;
  password: string;
  career: string;
  semester: number;
}

const carreras = [
  "Sistemas Computacionales",
  "Comercio Internacional",
  "Administración",
  "Contabilidad",
  "Derecho",
  "Turismo",
  "Psicología",
  "Idiomas",
  "Mercadotecnia",
  "Comunicación"
];

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn: (payload: SignInPayload) => Promise<void>;
  onSignUp: (payload: SignUpPayload) => Promise<void>;
}

type AuthMode = "signin" | "signup";

const InputShell = ({ children }: { children: React.ReactNode }) => (
  <div className="signin-input-shell">{children}</div>
);

const formatStudentIdInput = (value: string): string => {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  if (compact.length <= 8) return compact;
  return `${compact.slice(0, 8)}-${compact.slice(8)}`;
};

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <div className="signin-testimonial-card" style={{ animationDelay: `${index * 0.14}s` }}>
    <Image
      src={testimonial.avatarSrc}
      className="signin-testimonial-avatar"
      alt={`${testimonial.name} avatar`}
      width={40}
      height={40}
    />
    <div className="signin-testimonial-content">
      <p className="signin-testimonial-name">{testimonial.name}</p>
      <p className="signin-testimonial-handle">{testimonial.handle}</p>
      <p className="signin-testimonial-text">{testimonial.text}</p>
    </div>
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span>Bienvenido a Unimex</span>,
  description = "Inicia sesión o crea tu cuenta para registrarte en eventos.",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onSignUp,
}) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [signInForm, setSignInForm] = useState<SignInPayload>({
    studentId: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState<SignUpPayload>({
    fullName: "",
    studentId: "",
    password: "",
    career: "",
    semester: 1,
  });

  const isSignInMode = mode === "signin";
  const isSignUpMode = mode === "signup";

  const modeTitle = useMemo(() => {
    if (isSignInMode) return "Iniciar sesión";
    return "Crear cuenta";
  }, [isSignInMode]);

  const submitSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await onSignIn(signInForm);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const submitSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await onSignUp(signUpForm);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <section className="signin-panel">
        <div className="signin-card">
          <Link href="/" className="signin-home-link">
            <ArrowLeftIcon size={16} />
            Volver a la página principal
          </Link>

          <h1 className="signin-title">{title}</h1>
          <p className="signin-description">{description}</p>

          <div className="signin-switch">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
                setInfoMessage("");
              }}
              className={`signin-switch-btn ${isSignInMode ? "is-active" : ""}`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setInfoMessage("");
              }}
              className={`signin-switch-btn ${isSignUpMode ? "is-active" : ""}`}
            >
              Registrarme
            </button>
          </div>

          <h2 className="signin-mode-title">{modeTitle}</h2>

          {errorMessage && <div className="signin-alert signin-alert-error">{errorMessage}</div>}
          {infoMessage && <div className="signin-alert signin-alert-info">{infoMessage}</div>}

          {isSignInMode && (
            <form className="signin-form-single" onSubmit={submitSignIn}>
              <div className="signin-field">
                <label>Matrícula</label>
                <InputShell>
                  <input
                    name="studentId"
                    type="text"
                    value={signInForm.studentId}
                    onChange={(event) =>
                      setSignInForm((prev) => ({ ...prev, studentId: formatStudentIdInput(event.target.value) }))
                    }
                    placeholder="Ej. ABCD1234-56"
                    pattern="[A-Za-z0-9]{8}-[A-Za-z0-9]{2}"
                    title="La matrícula debe tener formato XXXXXXXX-XX"
                    maxLength={11}
                    autoComplete="username"
                    spellCheck={false}
                    required
                  />
                </InputShell>
                <p className="signin-field-hint">Formato requerido: XXXXXXXX-XX</p>
              </div>

              <div className="signin-field">
                <label>Contraseña</label>
                <InputShell>
                  <div className="signin-password-wrap">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={signInForm.password}
                      onChange={(event) => setSignInForm((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="signin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </InputShell>
              </div>

              <button type="submit" disabled={isLoading} className="signin-submit-btn">
                {isLoading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          )}

          {isSignUpMode && (
            <form className="signin-form-grid" onSubmit={submitSignUp}>
              <div className="signin-field signin-field-full">
                <label>Nombre completo</label>
                <InputShell>
                  <input
                    type="text"
                    value={signUpForm.fullName}
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    placeholder="Ej. Ana Gómez Pérez"
                    autoComplete="name"
                    required
                  />
                </InputShell>
              </div>

              <div className="signin-field">
                <label>Matrícula</label>
                <InputShell>
                  <input
                    type="text"
                    value={signUpForm.studentId}
                    onChange={(event) =>
                      setSignUpForm((prev) => ({ ...prev, studentId: formatStudentIdInput(event.target.value) }))
                    }
                    placeholder="Ej. ABCD1234-56"
                    pattern="[A-Za-z0-9]{8}-[A-Za-z0-9]{2}"
                    title="La matrícula debe tener formato XXXXXXXX-XX"
                    maxLength={11}
                    autoComplete="username"
                    spellCheck={false}
                    required
                  />
                </InputShell>
                <p className="signin-field-hint">Formato requerido: XXXXXXXX-XX</p>
              </div>
              <div className="signin-field">
                <label>Contraseña</label>
                <InputShell>
                  <div className="signin-password-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signUpForm.password}
                      onChange={(event) => setSignUpForm((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder="Crea una contraseña"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="signin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </InputShell>
              </div>

              <div className="signin-field">
                <label>Carrera</label>
                <InputShell>
                  <select
                    value={signUpForm.career}
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, career: event.target.value }))}
                    required
                  >
                    <option value="" disabled>Selecciona una carrera</option>
                    {carreras.map((career) => (
                      <option key={career} value={career}>
                        {career}
                      </option>
                    ))}
                  </select>
                </InputShell>
              </div>

              <div className="signin-field">
                <label>Cuatrimestre</label>
                <InputShell>
                  <select
                    value={signUpForm.semester}
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, semester: Number(event.target.value) }))}
                    required
                  >
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>
                        {value}° cuatrimestre
                      </option>
                    ))}
                  </select>
                </InputShell>
              </div>

              <div className="signin-initial-password-note">
                Tu cuenta se crea de inmediato. Usa tu matrícula y contraseña para iniciar sesión.
              </div>

              <button type="submit" disabled={isLoading} className="signin-submit-btn signin-field-full">
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          )}

          <p className="signin-security-note">
            <ShieldCheck size={16} />
            Acceso protegido con matrícula y contraseña.
          </p>
        </div>
      </section>

      {heroImageSrc && (
        <section className="signin-hero">
          <div className="signin-hero-image" style={{ backgroundImage: `url(${heroImageSrc})` }} />
          {testimonials.length > 0 && (
            <div className="signin-testimonial-row">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.handle}-${index}`} testimonial={testimonial} index={index} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
