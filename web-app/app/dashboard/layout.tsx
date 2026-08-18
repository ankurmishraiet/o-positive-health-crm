import type React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidenav/app-sidebar";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { AuthProvider } from "@/hooks/use-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 z-10 fixed border-b px-4 bg-background m-0 rounded-t-lg w-full md:w-[calc(100vw-16.5rem)]">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 mt-16 overflow-y-auto bg-background h-[calc(98vh-5rem)] rounded-b-md p-5">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
