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
import { registerSchema, type RegisterFormData } from "@/schema/auth.schema";
import api from "@/lib/api";
import type { RegisterResponse } from "@/types/user";
import { toast } from "sonner";
import Link from "next/link";

export function RegisterForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roleInput, setRoleInput] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      role: "User", // Default role
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const requestData = {
        username: data.username,
        password: data.password,
        role: data.role,
      };

      console.log("Registration data:", requestData);
      const response = await api.post<RegisterResponse>("/auth/register", requestData);

      if (response.status === 201) {
        toast.success("Registrasi berhasil!", {
          description: "Anda akan diarahkan ke halaman login...",
        });

        reset();
        setRoleInput("");

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error("Registrasi gagal");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);

      const errorMessage = "Terjadi kesalahan saat registrasi";

      toast.error("Gagal registrasi", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Fungsi untuk kapitalisasi huruf pertama
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Handle role input change dengan kapitalisasi
  const handleRoleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = capitalizeFirstLetter(value);
    setRoleInput(capitalizedValue);

    // Set value di form jika sesuai dengan enum
    if (capitalizedValue === "User" || capitalizedValue === "Admin") {
      setValue("role", capitalizedValue as "User" | "Admin", { shouldValidate: true });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Enter your information below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-6">
              {/* Username Field */}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="Enter your username" className={errors.username ? "border-red-500" : ""} {...register("username")} />
                {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
              </div>

              {/* Password Field */}
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} className={errors.password ? "border-red-500 pr-10" : "pr-10"} {...register("password")} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Ulangi Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"} {...register("confirmPassword")} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              {/* Role Field - Opsi 1: Input dengan kapitalisasi otomatis */}
              <div className="grid gap-3">
                <Label htmlFor="roleInput">Role (Input Manual)</Label>
                <Input id="roleInput" type="text" placeholder="User atau Admin" value={roleInput} onChange={handleRoleInputChange} className={errors.role ? "border-red-500" : ""} />
                {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
              </div>
              {/* Submit Button */}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
