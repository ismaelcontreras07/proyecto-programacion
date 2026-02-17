"use client";

import { SignInPage, SignInPayload, SignUpPayload } from "../../components/signin/sign-in";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type LoginApiResponse = {
  access_token: string;
  token_type: "bearer";
  user: {
    id: string;
    username: string;
    full_name: string;
    role: "admin" | "user";
    student_id?: string | null;
    career?: string | null;
    semester?: number | null;
  };
};

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "Unexpected error";
  } catch {
    return "Unexpected error";
  }
}

export default function LoginPage() {
  const { login } = useAuth();

  const handleSignIn = async (payload: SignInPayload) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: payload.studentId,
        password: payload.password,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as LoginApiResponse;
    login({
      accessToken: data.access_token,
      user: data.user,
    });
  };

  const handleSignUp = async (payload: SignUpPayload) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: payload.fullName,
        student_id: payload.studentId,
        password: payload.password,
        career: payload.career,
        semester: payload.semester,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as LoginApiResponse;
    login({
      accessToken: data.access_token,
      user: data.user,
    });
  };

  return (
    <SignInPage
      title="UNIMEX Eventos"
      description="Accede con tu cuenta o regístrate para participar en los eventos de Unimex."
      heroImageSrc="/upscalemedia-transformed.jpeg"
      testimonials={[
        {
          avatarSrc: "/Photos/photo1.jpg",
          name: "Diana Cruz",
          handle: "@alumna_unimex",
          text: "El proceso de registro fue rápido y pude apartar mi lugar al instante.",
        },
        {
          avatarSrc: "/Photos/photo3.jpg",
          name: "Carlos Vega",
          handle: "@cvega",
          text: "Con matrícula y contraseña pude crear mi cuenta en segundos.",
        },
      ]}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
}
