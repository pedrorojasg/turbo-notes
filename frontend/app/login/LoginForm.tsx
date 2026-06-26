"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";
import { AuthInput } from "@/components/AuthInput";
import { PasswordInput } from "@/components/PasswordInput";
import type { LoginFormState } from "@/lib/schemas";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 w-[384px]">
      {state.errors?.general && (
        <p className="text-red-500 text-[12px] text-center">
          {state.errors.general[0]}
        </p>
      )}

      <AuthInput
        name="email"
        type="email"
        placeholder="Email address"
        autoComplete="email"
        required
        error={state.errors?.email?.[0]}
      />

      <PasswordInput
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.errors?.password?.[0]}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full h-[43px] border border-accent rounded-full text-accent font-bold text-[16px] font-sans hover:bg-accent hover:text-cream transition-colors disabled:opacity-60 cursor-pointer mt-1"
      >
        {pending ? "Logging in…" : "Login"}
      </button>

      <Link
        href="/signup"
        className="text-accent text-[12px] text-center underline decoration-solid"
      >
        Oops! I&apos;ve never been here before
      </Link>
    </form>
  );
}
