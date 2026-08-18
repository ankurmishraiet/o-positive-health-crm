"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

type MenuChild = {
  title: string;
  href: string;
  requiredPermissions: string[];
  isActive?: boolean;
};

type MenuItem = {
  title: string;
  href?: string;
  icon: any;
  requiredPermissions?: string[];
  children?: MenuChild[];
  isActive?: boolean;
};

function filterNavItems(items: MenuItem[], role: string): MenuItem[] {
  return items
    .filter((item) =>
      item.requiredPermissions ? item.requiredPermissions.includes(role) : true
    )
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          child.requiredPermissions.includes(role)
        );
        return { ...item, children: filteredChildren };
      }
      return item;
    })

    .filter((item) => !(item.children && item.children.length === 0));
}

export function NavMain({ items, role }: { items: MenuItem[]; role: string }) {
  const pathname = usePathname();
  const filteredItems = filterNavItems(items, role);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Modules</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const isParentActive =
            item.children?.some((child) => pathname.startsWith(child.href)) ||
            (item.href && pathname.startsWith(item.href));

          return (
            <Collapsible key={item.title} defaultOpen={!!isParentActive}>
              <SidebarMenuItem>
                {item.children?.length ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`w-full group ${
                        isParentActive
                          ? "bg-accent border-2 border-l-4 border-l-blue-500 text-accent-foreground"
                          : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <Link href={item.href ?? "#!"} className="w-full">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`w-full ${
                        pathname === item.href
                          ? "bg-accent border-2 border-l-4 border-l-blue-500 text-accent-foreground"
                          : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}

                {/* Submenu */}
                {item.children?.length ? (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <Link href={subItem.href} className="w-full">
                              <SidebarMenuSubButton
                                className={`w-full ${
                                  isSubActive
                                    ? "bg-accent border-2 border-e-2 border-l-blue-500 text-accent-foreground"
                                    : ""
                                }`}
                              >
                                <span>{subItem.title}</span>
                              </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
