"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/schema/auth.schema";
import api from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/user";
import { toast } from "sonner";
import Link from "next/link";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const requestData: LoginRequest = {
        username: data.username,
        password: data.password,
      };

      const response = await api.post<LoginResponse>("/auth/login", requestData);

      if (response.data.token && response.data.role) {
        // ✅ Simpan juga ke localStorage (optional untuk client-side logic)
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("authRole", response.data.role);

        // ✅ Simpan ke cookie agar bisa diakses middleware
        document.cookie = `authToken=${response.data.token}; path=/`;
        document.cookie = `authRole=${response.data.role}; path=/`;

        toast.success("Login berhasil!", {
          description: "Selamat datang kembali",
        });

        reset();

        setTimeout(() => {
          if (response.data.role === "Admin") {
            window.location.href = "/admin/articles";
          } else {
            window.location.href = "/user/content";
          }
        }, 1000);
      }
    } catch {
      toast.error("Username atau password salah", {
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your details below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter your username" type="text" autoCapitalize="none" autoComplete="username" autoCorrect="off" disabled={isLoading} {...register("username")} />
                {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" placeholder="Enter your password" type={showPassword ? "text" : "password"} autoComplete="current-password" disabled={isLoading} className="pr-10" {...register("password")} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={togglePasswordVisibility} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            Don t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
