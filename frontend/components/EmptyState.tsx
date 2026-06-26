import Image from "next/image";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-24">
      <Image
        src="/images/cactus.png"
        alt="No notes yet"
        width={145}
        height={173}
        className="w-[95px] h-auto"
      />
      <p className="font-sans text-[20px] text-center text-black/60 max-w-sm">
        I&apos;m just here waiting for your charming notes...
      </p>
    </div>
  );
}
