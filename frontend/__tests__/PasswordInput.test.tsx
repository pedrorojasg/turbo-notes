import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordInput } from "@/components/PasswordInput";

describe("PasswordInput", () => {
  it("renders as a masked password field by default", () => {
    render(<PasswordInput name="password" />);
    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
    expect(screen.getByRole("button", { name: /show password/i })).toBeTruthy();
  });

  it("reveals the value when 'Show' is clicked", () => {
    render(<PasswordInput name="password" />);
    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeTruthy();
  });

  it("masks the value again when toggled back", () => {
    render(<PasswordInput name="password" />);
    const toggle = () =>
      screen.getByRole("button", { name: /(show|hide) password/i });
    fireEvent.click(toggle());
    fireEvent.click(toggle());
    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("uses a custom label as the placeholder", () => {
    render(<PasswordInput name="confirm" label="Confirm password" />);
    expect(screen.getByPlaceholderText("Confirm password")).toBeTruthy();
  });

  it("displays an error message when provided", () => {
    render(<PasswordInput name="password" error="Password is required." />);
    expect(screen.getByText("Password is required.")).toBeTruthy();
  });
});
