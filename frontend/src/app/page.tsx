"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileSearch, MessagesSquare, UploadCloud } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui";

const FEATURES = [
  {
    icon: UploadCloud,
    title: "Upload anything",
    description: "PDF, DOCX, and plain text — extracted and indexed automatically.",
  },
  {
    icon: FileSearch,
    title: "Semantic search",
    description: "Find what you mean, not just what you typed, across every document.",
  },
  {
    icon: MessagesSquare,
    title: "Ask questions",
    description: "Get answers grounded in your own knowledge base, with sources cited.",
  },
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
        For Passi employees only
      </div>

      <h1
        style={{ fontFamily: "var(--font-serif)" }}
        className="mt-6 max-w-2xl text-4xl font-medium tracking-tight text-[var(--foreground)] sm:text-5xl"
      >
        Ask your company&apos;s knowledge, <span className="italic text-[var(--accent)]">anything</span>
      </h1>

      <p className="mt-4 max-w-md text-base text-[var(--muted)]">
        Upload, search, and chat with your documents — powered by semantic search and
        grounded answers.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          Log in
        </Link>
      </div>

      <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="p-5 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <Icon className="h-4.5 w-4.5 text-[var(--accent)]" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
