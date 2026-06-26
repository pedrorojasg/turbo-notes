"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  LoginSchema,
  SignupSchema,
  type LoginFormState,
  type SignupFormState,
} from "./schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

async function setTokenCookies(access: string, refresh: string) {
  const jar = await cookies();
  jar.set("access_token", access, {
    ...COOKIE_OPTS,
    maxAge: 60 * 30, // 30 minutes
  });
  jar.set("refresh_token", refresh, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const raw = { email: formData.get("email"), password: formData.get("password") };
  const parsed = LoginSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    return { errors: { general: ["Invalid email or password."] } };
  }

  const { access, refresh } = await res.json();
  await setTokenCookies(access, refresh);
  redirect("/notes");
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const parsed = SignupSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as SignupFormState["errors"] };
  }

  const res = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: parsed.data.email,
      password: parsed.data.password,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      errors: {
        email: data.email,
        password: data.password,
        general: data.non_field_errors ?? (data.detail ? [data.detail] : undefined),
      },
    };
  }

  const { access, refresh } = await res.json();
  await setTokenCookies(access, refresh);
  redirect("/notes");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete("access_token");
  jar.delete("refresh_token");
  redirect("/login");
}
