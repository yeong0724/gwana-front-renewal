"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HEADER_LABEL, LOGIN_ITEM, NAV_ITEMS } from "./nav-items";
import { useIsActive } from "./header-nav-link";

function MobileLink({ href, label }: { href: string; label: string }) {
  const isActive = useIsActive(href);

  return (
    <SheetClose asChild>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          HEADER_LABEL,
          "border-b border-border py-5 text-foreground",
          isActive ? "font-bold" : "font-normal",
        )}
      >
        {label}
      </Link>
    </SheetClose>
  );
}

export function HeaderMobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "flex w-14 items-center justify-center border-r border-header-line",
          "text-foreground transition-colors duration-150 hover:text-foreground/55",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        <MenuIcon className="size-5" strokeWidth={1.5} aria-hidden />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="bg-background px-6 pt-6"
      >
        <SheetTitle className={cn(HEADER_LABEL, "text-muted-foreground")}>
          MENU
        </SheetTitle>

        <nav aria-label="Mobile" className="flex flex-col border-t border-border">
          {NAV_ITEMS.map((item) => (
            <MobileLink key={item.href} {...item} />
          ))}
          <MobileLink {...LOGIN_ITEM} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
