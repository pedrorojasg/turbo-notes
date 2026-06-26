import Image from "next/image";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-8">
      <Image
        src="/images/signup-cat.png"
        alt="Sleeping cat"
        width={567}
        height={404}
        className="w-[188px] h-auto"
        priority
      />

      <h1 className="font-serif font-bold text-[48px] text-accent-dark leading-[normal]">
        Yay, New Friend!
      </h1>

      <SignupForm />
    </main>
  );
}
