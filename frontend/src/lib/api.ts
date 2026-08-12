import { getToken } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? "Something went wrong");
  }

  return res.json();
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}

export interface MeResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface DocumentSummary {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedByEmail: string;
  createdAt: string;
}

export interface SearchResult {
  documentId: string;
  filename: string;
  chunkIndex: number;
  text: string;
  score: number;
}

export interface ChatSource {
  documentId: string;
  filename: string;
  chunkIndex: number;
  score: number;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
}

async function uploadDocument(file: File): Promise<DocumentSummary> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/documents`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? "Something went wrong");
  }

  return res.json();
}

export const api = {
  register: (data: RegisterRequest) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<MeResponse>("/api/auth/me"),

  listDocuments: () => request<DocumentSummary[]>("/api/documents"),

  uploadDocument,

  searchDocuments: (query: string) =>
    request<SearchResult[]>(`/api/documents/search?q=${encodeURIComponent(query)}`),

  chat: (query: string) => request<ChatAnswer>(`/api/chat?q=${encodeURIComponent(query)}`),
};
