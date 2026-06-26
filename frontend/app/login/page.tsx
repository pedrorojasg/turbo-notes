import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6">
      <Image
        src="/images/cactus.png"
        alt="Friendly cactus"
        width={95}
        height={114}
        priority
      />

      <h1 className="font-serif font-bold text-[48px] text-accent-dark leading-tight">
        Yay, You&apos;re Back!
      </h1>

      <LoginForm />
    </main>
  );
}
