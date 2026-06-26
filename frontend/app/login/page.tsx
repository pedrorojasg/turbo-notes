import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-8">
      <Image
        src="/images/cactus.png"
        alt="Friendly cactus"
        width={145}
        height={173}
        className="w-[95px] h-auto"
        priority
      />

      <h1 className="font-serif font-bold text-[48px] text-accent-dark leading-[normal]">
        Yay, You&apos;re Back!
      </h1>

      <LoginForm />
    </main>
  );
}
