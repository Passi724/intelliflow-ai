"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileSearch, MessagesSquare, Sparkles, UploadCloud } from "lucide-react";
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
      <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        Enterprise knowledge assistant
      </div>

      <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        Ask your company&apos;s knowledge{" "}
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          anything
        </span>
      </h1>

      <p className="mt-4 max-w-md text-base text-zinc-400">
        Upload, search, and chat with your documents — powered by semantic search and
        grounded answers.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset] transition-colors hover:bg-indigo-400"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.07]"
        >
          Log in
        </Link>
      </div>

      <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="p-5 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15">
              <Icon className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">{title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
