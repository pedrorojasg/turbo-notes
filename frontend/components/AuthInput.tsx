type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function AuthInput({ error, className, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <input
        {...props}
        className={`w-full border border-accent rounded-[6px] px-[15px] py-[7px] text-[12px] font-sans bg-transparent placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent ${error ? "border-red-400" : ""} ${className ?? ""}`}
      />
      {error && <p className="text-red-500 text-[11px]">{error}</p>}
    </div>
  );
}
