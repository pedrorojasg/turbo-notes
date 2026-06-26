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
          className={`w-full border border-accent rounded-[6px] px-[15px] py-[7px] text-[12px] font-sans bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent pr-10 ${error ? "border-red-400" : ""} ${className ?? ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 text-accent text-xs font-medium select-none"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  );
}
