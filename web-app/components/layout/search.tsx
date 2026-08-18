import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import data from "../sidenav-details";

type MenuChild = {
  title: string;
  href: string;
  requiredPermissions: string[];
  isActive?: boolean;
};

type MenuItem = {
  title: string;
  href?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  requiredPermissions?: string[];
  children?: MenuChild[];
  isActive?: boolean;
};

export default function Search() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const storedModulesRaw = localStorage.getItem("modulesAccess");
    try {
      const storedModules: string[] = JSON.parse(storedModulesRaw || "[]");

      // filter navMain based on module access
      const available = data.navMain
        .map((item) => {
          if (item.children) {
            const filteredChildren = item.children.filter((child) =>
              child.requiredPermissions?.some((perm) =>
                storedModules.includes(perm)
              )
            );
            return filteredChildren.length
              ? { ...item, children: filteredChildren }
              : null;
          }
          if (
            item.requiredPermissions?.some((perm) =>
              storedModules.includes(perm)
            )
          ) {
            return item;
          }
          return null;
        })
        .filter(Boolean) as MenuItem[];

      setFilteredItems(available);
    } catch (error) {
      console.error("Error parsing stored modules:", error);
    }
  }, []);

  return (
    <>
      <div className="w-80 space-y-2">
        <button className="relative w-full" onClick={() => setOpen(true)}>
          <Input
            className="peer w-full pl-9 pr-9"
            placeholder="Search for anything..."
            type="search"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/80">
            <SearchIcon
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              role="presentation"
            />
          </div>
          <span className="absolute inset-y-px right-px flex h-full w-9 items-center justify-center rounded-r-lg text-muted-foreground/80 ring-offset-background transition-shadow hover:text-foreground">
            <DropdownMenuShortcut className="mr-4 bg-muted px-2 py-1 rounded-md border">
              ⌘S
            </DropdownMenuShortcut>
          </span>
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredItems.map((item) => (
            <CommandGroup key={item.title} heading={item.title}>
              {item.children ? (
                item.children.map((child) => {
                  const isActive = location.pathname === child.href;
                  return (
                    <CommandItem
                      key={child.href}
                      className="hover:cursor-pointer"
                      onSelect={() => {
                        router.push(child.href);
                        setOpen(false);
                      }}
                    >
                      {item.icon && (
                        <item.icon
                          size={16}
                          strokeWidth={2}
                          className="mr-2 text-muted-foreground"
                        />
                      )}
                      <span>{child.title}</span>
                      {isActive && (
                        <CommandShortcut className="text-xs uppercase">
                          Active
                        </CommandShortcut>
                      )}
                    </CommandItem>
                  );
                })
              ) : (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    if (item.href) {
                      router.push(item.href);
                      setOpen(false);
                    }
                  }}
                >
                  {item.icon && (
                    <item.icon
                      size={16}
                      strokeWidth={2}
                      className="mr-2 text-muted-foreground"
                    />
                  )}
                  <span>{item.title}</span>
                </CommandItem>
              )}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
