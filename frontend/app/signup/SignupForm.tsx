"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/lib/auth-actions";
import { AuthInput } from "@/components/AuthInput";
import { PasswordInput } from "@/components/PasswordInput";
import type { SignupFormState } from "@/lib/schemas";

const initialState: SignupFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

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
        autoComplete="new-password"
        required
        error={state.errors?.password?.[0]}
      />

      <PasswordInput
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        required
        error={state.errors?.confirmPassword?.[0]}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full h-[43px] border border-accent rounded-[46px] text-accent font-bold text-[16px] font-sans hover:bg-accent/20 transition-colors disabled:opacity-60 cursor-pointer mt-[31px]"
      >
        {pending ? "Creating account…" : "Sign Up"}
      </button>

      <Link
        href="/login"
        className="text-accent text-[12px] text-center underline decoration-solid"
      >
        We&apos;re already friends!
      </Link>
    </form>
  );
}
