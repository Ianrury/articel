"use client";

import * as React from "react";
import { Home, Book, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { AlertDialog,  AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

import { VersionSwitcher } from "./version-switcher";

const iconMap: Record<string, React.ElementType> = {
  "lucide:home": Home,
  "lucide:book": Book,
  "lucide:log-out": LogOut,
};

const data = {
  versions: [],
  navMain: [
    {
      items: [
        {
          icon: "lucide:home",
          title: "Articles",
          url: "/admin/articles",
          key: "articles",
        },
        {
          icon: "lucide:book",
          title: "Categories",
          url: "/admin/category",
          key: "categories",
        },
        {
          icon: "lucide:log-out",
          title: "Logout",
          url: "#",
          key: "logout",
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: string;
}

export function AppSidebar({ activeSection, ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const handleNavigation = (item: (typeof data.navMain)[0]["items"][0]) => {
    if (item.key === "logout") {
      setShowLogoutDialog(true); // tampilkan dialog
    } else {
      router.push(item.url);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");

    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "authRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    router.push("/login");
  };

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader >
          <VersionSwitcher  />
        </SidebarHeader>

        <SidebarContent >
          {data.navMain.map((group, idx) => (
            <SidebarGroup key={idx}>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive = pathname === item.url || activeSection === item.key;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton isActive={isActive} onClick={() => handleNavigation(item)} className="cursor-pointer hover:bg-blue-200 py-5">
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            {item.title}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      {/* Konfirmasi Logout */}
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
    </>
  );
}
