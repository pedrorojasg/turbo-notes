"use client";

import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function PasswordInput({ label = "Password", error, className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex items-center">
        <input
          {...props}
          type={visible ? "text" : "password"}
          placeholder={label}
          className={`w-full h-[39px] border border-accent rounded-[6px] px-[15px] py-[7px] text-[12px] font-sans bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent pr-10 ${error ? "border-red-400" : ""} ${className ?? ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 text-accent flex items-center justify-center cursor-pointer"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            // Open eye — password is shown
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="size-4"
              aria-hidden="true"
            >
              <path
                d="M1.5 8C3.4 4.7 12.6 4.7 14.5 8C12.6 11.3 3.4 11.3 1.5 8Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ) : (
            // Closed eye with lashes — password is hidden (matches Figma)
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="size-4"
              aria-hidden="true"
            >
              <path
                d="M3 7C5 9.5 11 9.5 13 7"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M4.4 9.1L3.8 10.4M6.3 10L6.1 11.3M8 10.3L8 11.6M9.7 10L9.9 11.3M11.6 9.1L12.2 10.4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  );
}
