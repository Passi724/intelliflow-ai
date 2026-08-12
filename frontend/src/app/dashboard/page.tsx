"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Welcome, {user.fullName}</h1>
      <dl className="text-sm text-gray-600">
        <div className="flex gap-2">
          <dt className="font-medium">Email:</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">Role:</dt>
          <dd>{user.role}</dd>
        </div>
      </dl>
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
  );
}
