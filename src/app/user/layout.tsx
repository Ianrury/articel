// app/(user)/layout.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { getUser, UserProfile } from "@/lib/user-api";
import Link from "next/link";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  const getuser = async () => {
    try {
      const data = await getUser();
      setUser(data);
      console.log("User:", data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  React.useEffect(() => {
    getuser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");

    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "authRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-xl font-bold text-gray-800">User Portal</h1>
          </Link>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
              <Avatar className="h-8 w-8 bg-gray-400">
                <AvatarFallback className="text-gray-400 text-sm font-medium">{user?.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <span className="text-gray-700  border-b border-gray-400">{user?.username || "Loading..."}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg" align="end">
              <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <User className="h-4 w-4 text-gray-500" />
                <span>My Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600 hover:text-red-700" onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg">Logipsum</span>
            </div>

            {/* Copyright Text */}
            <div className="text-sm text-white/90">© 2025 Blog portal. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login kembali untuk mengakses akun Anda.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
