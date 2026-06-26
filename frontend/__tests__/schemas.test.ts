import { describe, it, expect } from "vitest";
import { LoginSchema, SignupSchema } from "@/lib/schemas";

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "password",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten().fieldErrors)).toContain("email");
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten().fieldErrors)).toContain("password");
  });
});

describe("SignupSchema", () => {
  const valid = {
    email: "new@example.com",
    password: "Str0ng-Pass!",
    confirmPassword: "Str0ng-Pass!",
  };

  it("accepts valid data", () => {
    expect(SignupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short password", () => {
    const result = SignupSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten())).toContain("8 characters");
  });

  it("rejects password without a number", () => {
    const result = SignupSchema.safeParse({
      ...valid,
      password: "NoNumbersHere!",
      confirmPassword: "NoNumbersHere!",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten())).toContain("number");
  });

  it("rejects password without a letter", () => {
    const result = SignupSchema.safeParse({
      ...valid,
      password: "12345678!",
      confirmPassword: "12345678!",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten())).toContain("letter");
  });

  it("rejects mismatched passwords", () => {
    const result = SignupSchema.safeParse({
      ...valid,
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten())).toContain("match");
  });

  it("rejects invalid email", () => {
    const result = SignupSchema.safeParse({ ...valid, email: "bad" });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.flatten())).toContain("email");
  });
});
