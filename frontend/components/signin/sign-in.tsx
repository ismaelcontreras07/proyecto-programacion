"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, MessageSquareMore, ShieldCheck } from "lucide-react";
import "./signin.css";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInPayload {
  identifier: string;
  password: string;
}

export interface SignUpPayload {
  fullName: string;
  studentId: string;
  email: string;
  career: string;
  semester: number;
  phone: string;
}

export interface SignUpStartResult {
  verificationId: string;
  smsDestination: string;
  devSmsCode?: string | null;
  message: string;
}

export interface VerifySmsPayload {
  verificationId: string;
  code: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn: (payload: SignInPayload) => Promise<void>;
  onSignUp: (payload: SignUpPayload) => Promise<SignUpStartResult>;
  onVerifySms: (payload: VerifySmsPayload) => Promise<void>;
}

type AuthMode = "signin" | "signup" | "verify";

const InputShell = ({ children }: { children: React.ReactNode }) => (
  <div className="signin-input-shell">{children}</div>
);

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
  onVerifySms,
}) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [signInForm, setSignInForm] = useState<SignInPayload>({
    identifier: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState<SignUpPayload>({
    fullName: "",
    studentId: "",
    email: "",
    career: "",
    semester: 1,
    phone: "",
  });

  const [pendingVerificationId, setPendingVerificationId] = useState("");
  const [smsDestination, setSmsDestination] = useState("");
  const [devSmsCode, setDevSmsCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const isSignInMode = mode === "signin";
  const isSignUpMode = mode === "signup";
  const isVerifyMode = mode === "verify";

  const modeTitle = useMemo(() => {
    if (isSignInMode) return "Iniciar sesión";
    if (isSignUpMode) return "Crear cuenta";
    return "Verificar SMS";
  }, [isSignInMode, isSignUpMode]);

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
      const response = await onSignUp(signUpForm);
      setPendingVerificationId(response.verificationId);
      setSmsDestination(response.smsDestination);
      setDevSmsCode(response.devSmsCode ?? null);
      setInfoMessage(response.message);
      setMode("verify");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const submitSmsVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await onVerifySms({
        verificationId: pendingVerificationId,
        code: verificationCode,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo verificar el código");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <section className="signin-panel">
        <div className="signin-card">
          <Link href="/" className="signin-home-link">
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
                <label>Correo o usuario</label>
                <InputShell>
                  <input
                    name="identifier"
                    type="text"
                    value={signInForm.identifier}
                    onChange={(event) => setSignInForm((prev) => ({ ...prev, identifier: event.target.value }))}
                    placeholder="tu.correo@alumno.unimex.edu.mx"
                    required
                  />
                </InputShell>
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
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, studentId: event.target.value }))}
                    placeholder="Ej. A01234567"
                    required
                  />
                </InputShell>
              </div>

              <div className="signin-field">
                <label>Correo institucional</label>
                <InputShell>
                  <input
                    type="email"
                    value={signUpForm.email}
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="tu.nombre@alumno.unimex.edu.mx"
                    required
                  />
                </InputShell>
              </div>

              <div className="signin-field">
                <label>Teléfono celular</label>
                <InputShell>
                  <input
                    type="tel"
                    value={signUpForm.phone}
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Ej. 5512345678"
                    required
                  />
                </InputShell>
              </div>

              <div className="signin-field">
                <label>Carrera</label>
                <InputShell>
                  <input
                    type="text"
                    value={signUpForm.career}
                    onChange={(event) => setSignUpForm((prev) => ({ ...prev, career: event.target.value }))}
                    placeholder="Ej. Ingeniería en Sistemas"
                    required
                  />
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
                Contraseña inicial: <strong>tu matrícula</strong>. Podrás iniciar sesión después de validar SMS.
              </div>

              <button type="submit" disabled={isLoading} className="signin-submit-btn signin-field-full">
                {isLoading ? "Enviando SMS..." : "Crear cuenta y enviar SMS"}
              </button>
            </form>
          )}

          {isVerifyMode && (
            <form className="signin-form-single" onSubmit={submitSmsVerification}>
              <div className="signin-sms-box">
                <p className="signin-sms-title">
                  <MessageSquareMore size={16} />
                  Verificación SMS
                </p>
                <p>
                  Enviamos un código a: <strong>{smsDestination}</strong>
                </p>
                {devSmsCode && (
                  <p className="signin-dev-code">
                    Código de prueba: <strong>{devSmsCode}</strong>
                  </p>
                )}
              </div>

              <div className="signin-field">
                <label>Código de verificación</label>
                <InputShell>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </InputShell>
              </div>

              <button type="submit" disabled={isLoading} className="signin-submit-btn">
                {isLoading ? "Verificando..." : "Verificar y entrar"}
              </button>

              <button
                type="button"
                className="signin-secondary-btn"
                onClick={() => {
                  setMode("signup");
                  setVerificationCode("");
                  setInfoMessage("");
                  setErrorMessage("");
                }}
              >
                Cambiar datos de registro
              </button>
            </form>
          )}

          <p className="signin-security-note">
            <ShieldCheck size={16} />
            Acceso protegido con validación de SMS.
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

