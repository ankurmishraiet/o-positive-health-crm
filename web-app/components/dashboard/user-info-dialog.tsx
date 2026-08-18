"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UserType } from "@/types/user";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { UserCircle2Icon } from "lucide-react";

function LabeledRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-3 items-start py-3 border-b last:border-b-0",
        className
      )}
    >
      <dt className="col-span-1 text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm break-words">{children}</dd>
    </div>
  );
}

export function UserInfoDialog({
  user,
  triggerLabel = "My Profile",
}: {
  user: UserType;
  triggerLabel?: string;
}) {
  const created = new Date(user.createdAt);
  const updated = new Date(user.updatedAt);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <UserCircle2Icon />
          {triggerLabel}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {/* Avatar */}
            <span className="relative inline-block h-10 w-10 overflow-hidden rounded-full bg-muted">
              {user.image ? (
                // Use img to avoid next/image remote domain config needs
                <img
                  src={user.image || "/placeholder.svg"}
                  alt={`Avatar of ${user.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid h-full w-full place-items-center text-xs text-muted-foreground"
                >
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </span>
            <span className="text-pretty">{user.name}</span>
          </DialogTitle>
          <DialogDescription>User details overview</DialogDescription>
        </DialogHeader>

        <section className="mt-2">
          <dl className="divide-y px-2 rounded-md border">
            <LabeledRow label="Email">{user.email}</LabeledRow>
            <LabeledRow label="User ID">{user.userId}</LabeledRow>
            <LabeledRow label="Employee ID">{user.employeeId}</LabeledRow>
            <LabeledRow label="Phone">{user.phone}</LabeledRow>
            <LabeledRow label="Role">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {user.role.toUpperCase()}
              </span>
            </LabeledRow>
            <LabeledRow label="Verified">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  user.isVerified
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                )}
              >
                {user.isVerified ? "Yes" : "No"}
              </span>
            </LabeledRow>

            <LabeledRow label="Database _id">
              <code className="text-xs break-words">{user._id}</code>
            </LabeledRow>
            <LabeledRow label="Created At">
              {isNaN(created.getTime())
                ? String(user.createdAt)
                : created.toLocaleString()}
            </LabeledRow>
          </dl>
        </section>
      </DialogContent>
    </Dialog>
  );
}
