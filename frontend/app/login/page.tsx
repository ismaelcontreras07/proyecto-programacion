"use client";

import { SignInPage, SignInPayload, SignUpPayload, SignUpStartResult, VerifySmsPayload } from "../../components/signin/sign-in";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type LoginApiResponse = {
  access_token: string;
  token_type: "bearer";
  user: {
    id: string;
    username: string;
    full_name: string;
    email: string;
    role: "admin" | "user";
    student_id?: string | null;
    career?: string | null;
    semester?: number | null;
    phone?: string | null;
    phone_verified?: boolean;
  };
};

type SignUpApiResponse = {
  verification_id: string;
  expires_in_seconds: number;
  sms_destination: string;
  dev_sms_code?: string | null;
  message: string;
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
        identifier: payload.identifier,
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

  const handleSignUp = async (payload: SignUpPayload): Promise<SignUpStartResult> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: payload.fullName,
        student_id: payload.studentId,
        email: payload.email,
        career: payload.career,
        semester: payload.semester,
        phone: payload.phone,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    const data = (await response.json()) as SignUpApiResponse;
    return {
      verificationId: data.verification_id,
      smsDestination: data.sms_destination,
      devSmsCode: data.dev_sms_code ?? null,
      message: data.message,
    };
  };

  const handleVerifySms = async (payload: VerifySmsPayload) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        verification_id: payload.verificationId,
        code: payload.code,
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
      title="UNIMEX Access"
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
          text: "Con el SMS de verificación me sentí más seguro al crear mi cuenta.",
        },
      ]}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onVerifySms={handleVerifySms}
    />
  );
}
