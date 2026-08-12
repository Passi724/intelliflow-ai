"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError, ChatAnswer, DocumentSummary, SearchResult } from "@/lib/api";

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
    <div className="w-full max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold">Search</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Search across your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {results !== null && (
        results.length === 0 ? (
          <p className="text-sm text-gray-500">No matches found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
            {results.map((result, i) => (
              <li key={`${result.documentId}-${result.chunkIndex}-${i}`} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{result.filename}</p>
                  <span className="text-gray-500">{result.score.toFixed(3)}</span>
                </div>
                <p className="mt-1 text-gray-600">{result.text}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
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
    <div className="w-full max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold">Ask your documents</h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={asking}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {asking ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {answer && (
        <div className="space-y-3 rounded-md border border-gray-200 px-4 py-3 text-sm">
          <p className="whitespace-pre-wrap">{answer.answer}</p>

          {answer.sources.length > 0 && (
            <div className="border-t border-gray-100 pt-2">
              <p className="text-xs font-medium text-gray-500">Sources</p>
              <ul className="mt-1 space-y-1">
                {answer.sources.map((source, i) => (
                  <li
                    key={`${source.documentId}-${source.chunkIndex}-${i}`}
                    className="flex items-center justify-between text-xs text-gray-500"
                  >
                    <span>{source.filename}</span>
                    <span>{source.score.toFixed(3)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
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
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <label className="cursor-pointer rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload document"}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loadingDocuments ? (
        <p className="text-sm text-gray-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{doc.filename}</p>
                <p className="text-gray-500">
                  {doc.uploadedByEmail} &middot; {new Date(doc.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="text-gray-500">{formatSize(doc.sizeBytes)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
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
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-4 py-10">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {user.fullName}</h1>
          <p className="text-sm text-gray-500">
            {user.email} &middot; {user.role}
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Log out
        </button>
      </div>

      <DocumentsPanel />
      <SearchPanel />
      <ChatPanel />
    </div>
  );
}
