import Image from "next/image";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-24">
      <Image
        src="/images/empty-state.png"
        alt="No notes yet"
        width={500}
        height={499}
        className="w-[297px] h-auto"
      />
      <p className="font-sans text-[24px] text-center text-accent-dark">
        I&apos;m just here waiting for your charming notes...
      </p>
    </div>
  );
}
