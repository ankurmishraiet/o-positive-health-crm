"use client";

import * as React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import data from "@/components/sidenav-details";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useAuth();
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="border bg-muted">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/favicon.ico"
                    alt="O Positive Healthcare"
                    width={32}
                    height={32}
                    className="size-6 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    O Positive Healthcare
                  </span>
                  <span className="truncate text-xs uppercase font-semibold text-gray-600">
                    {session?.user?.role}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {session?.user && (
          <NavMain items={data.navMain} role={session?.user?.role} />
        )}
      </SidebarContent>
      <SidebarFooter>
        {session?.user && <NavUser user={session?.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
