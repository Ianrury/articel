// src/components/app-sidebar.tsx
"use client";

import * as React from "react";
import { Home, Book } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { SearchForm } from "@/components/search-form";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { VersionSwitcher } from "./version-switcher";

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
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
      ],
    },
  ],
};

const iconMap: Record<string, React.ElementType> = {
  "lucide:home": Home,
  "lucide:book": Book,
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: string;
}

export function AppSidebar({ activeSection, ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname === item.url || activeSection === item.key;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={isActive} onClick={() => handleNavigation(item.url)} className="cursor-pointer">
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
  );
}
