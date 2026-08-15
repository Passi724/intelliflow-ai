import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] ${className}`}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150 px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<string, string> = {
    primary:
      "bg-indigo-500 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset] hover:bg-indigo-400 active:bg-indigo-600",
    secondary:
      "border border-white/12 bg-white/[0.03] text-zinc-100 hover:bg-white/[0.07] hover:border-white/20",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors duration-150 focus:border-indigo-400/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-indigo-500/25 ${className}`}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-300">
      {children}
    </label>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}

export function ScorePill({ score }: { score: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-zinc-400 tabular-nums">
      {pct}% match
    </span>
  );
}
