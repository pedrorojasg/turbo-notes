import Image from "next/image";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6">
      <Image
        src="/images/cactus.png"
        alt="Friendly cactus"
        width={145}
        height={173}
        className="w-[95px] h-auto"
        priority
      />

      <h1 className="font-serif font-bold text-[48px] text-accent-dark leading-tight">
        Yay, New Friend!
      </h1>

      <SignupForm />
    </main>
  );
}
