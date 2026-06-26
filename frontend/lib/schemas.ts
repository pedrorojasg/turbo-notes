import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Password is required."),
});

export const SignupSchema = z
  .object({
    email: z.string().email("Enter a valid email address.").trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormState = {
  errors?: { email?: string[]; password?: string[]; general?: string[] };
  success?: boolean;
};

export type SignupFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
  success?: boolean;
};
