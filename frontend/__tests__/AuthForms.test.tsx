import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Server actions are not invoked here — form-submission + error display is
// covered by the Playwright E2E, where React form actions actually run.
// These tests assert the forms render the correct structure.
vi.mock("@/lib/auth-actions", () => ({
  loginAction: vi.fn(),
  signupAction: vi.fn(),
}));

// next/link needs App Router context it can't get in jsdom — stub to an anchor
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { LoginForm } from "@/app/login/LoginForm";
import { SignupForm } from "@/app/signup/SignupForm";

describe("LoginForm", () => {
  it("renders the email + password fields and submit button", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("Email address")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Login/ })).toBeTruthy();
  });

  it("links to the signup page", () => {
    render(<LoginForm />);
    const link = screen.getByText(/never been here before/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/signup");
  });
});

describe("SignupForm", () => {
  it("renders email, password, confirm-password fields and submit button", () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText("Email address")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Confirm password")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign Up/ })).toBeTruthy();
  });

  it("links back to the login page", () => {
    render(<SignupForm />);
    const link = screen.getByText(/already friends/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/login");
  });
});
