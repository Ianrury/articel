// app/(user)/layout.tsx
import React from "react";
import Link from "next/link";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">User Portal</h1>
          <nav className="space-x-4">
            <Link href="/user/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/user/profile" className="hover:underline">
              Profile
            </Link>
            <Link href="/logout" className="hover:underline">
              Logout
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-4 bg-gray-50">{children}</main>
    </div>
  );
}
