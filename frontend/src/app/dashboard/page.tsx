"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileText, LogOut, MessageSquare, Search, Send, UploadCloud } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError, ChatAnswer, DocumentSummary, SearchResult } from "@/lib/api";
import { Button, Card, Input, ScorePill, Spinner } from "@/components/ui";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setSearching(true);

    try {
      setResults(await api.searchDocuments(query));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Search</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search across your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" loading={searching}>
          {searching ? "" : "Search"}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

      {results !== null && (
        <div className="mt-4">
          {results.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No matches found.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
              {results.map((result, i) => (
                <li key={`${result.documentId}-${result.chunkIndex}-${i}`} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {result.filename}
                    </p>
                    <ScorePill score={result.score} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{result.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

function ChatPanel() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<ChatAnswer | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setAsking(true);
    setAnswer(null);

    try {
      setAnswer(await api.chat(query));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Chat failed");
    } finally {
      setAsking(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Ask your documents</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask a question about your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" loading={asking}>
          {asking ? "" : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

      {asking && !answer && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
          <Spinner /> Thinking...
        </div>
      )}

      {answer && (
        <div className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] p-4">
          <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{answer.answer}</p>

          {answer.sources.length > 0 && (
            <div className="border-t border-[var(--border)] pt-3">
              <p className="text-xs font-medium text-[var(--muted)]">Sources</p>
              <ul className="mt-1.5 space-y-1.5">
                {answer.sources.map((source, i) => (
                  <li
                    key={`${source.documentId}-${source.chunkIndex}-${i}`}
                    className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]"
                  >
                    <span className="truncate">{source.filename}</span>
                    <ScorePill score={source.score} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function DocumentsPanel() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      setDocuments(await api.listDocuments());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load documents");
    } finally {
      setLoadingDocuments(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      await api.uploadDocument(file);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Documents</h2>
        </div>
        <label>
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
            {uploading ? <Spinner /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>}

      {loadingDocuments ? (
        <div className="flex items-center gap-2 py-6 text-sm text-[var(--muted)]">
          <Spinner /> Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <FileText className="h-6 w-6 text-[var(--border-strong)]" />
          <p className="text-sm text-[var(--muted)]">No documents uploaded yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-hover)]">
                <FileText className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {doc.filename}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {doc.uploadedByEmail} &middot; {new Date(doc.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="shrink-0 text-xs text-[var(--muted)] tabular-nums">
                {formatSize(doc.sizeBytes)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-5 w-5 text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-2xl font-medium text-[var(--foreground)]"
          >
            Welcome, {user.fullName}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {user.email} &middot; {user.role}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:row-span-2">
          <DocumentsPanel />
        </div>
        <SearchPanel />
        <ChatPanel />
      </div>
    </div>
  );
}
