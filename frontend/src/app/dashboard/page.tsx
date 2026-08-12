"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api, ApiError, DocumentSummary } from "@/lib/api";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    </div>
  );
}
