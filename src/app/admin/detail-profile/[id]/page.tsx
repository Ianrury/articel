"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, UserProfile } from "@/lib/user-api";

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  const getuser = async () => {
    try {
      const data = await getUser();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  useEffect(() => {
    getuser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">User Profile</h2>

        {/* Avatar */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">{user?.username?.[0]?.toUpperCase() || "?"}</div>
        </div>

        {/* Info */}
        <div className="space-y-4 text-left text-sm text-gray-700">
          <div className="flex justify-between bg-gray-100 px-4 py-2 rounded-md">
            <span className="font-semibold">Username</span>
            <span>: {user?.username || "-"}</span>
          </div>
          <div className="flex justify-between bg-gray-100 px-4 py-2 rounded-md">
            <span className="font-semibold">Role</span>
            <span>: {user?.role || "-"}</span>
          </div>
        </div>

        {/* Button */}
        <button onClick={() => router.push("/")} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition">
          Back to home
        </button>
      </div>
    </div>
  );
}
