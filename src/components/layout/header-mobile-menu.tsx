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
} from "@/components/ui/shadcn-ui/sheet";
import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { HEADER_LABEL, LOGIN_ITEM, NAV_ITEMS } from "../../constants/nav-items";
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
          "border-b py-5",
          BORDER.hairline,
          TEXT.ink,
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
          "flex w-14 items-center justify-center border-r",
          BORDER.line,
          TEXT.ink,
          TEXT.inkHover,
          "transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:-outline-offset-2",
          OUTLINE.ring,
          className,
        )}
      >
        <MenuIcon className="size-5" strokeWidth={1.5} aria-hidden />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        aria-describedby={undefined}
        className={cn("px-6 pt-6", BG.page)}
      >
        <SheetTitle
          className={cn(HEADER_LABEL, TEXT.muted, "font-bold", "text-[17px]")}
        >
          MENU
        </SheetTitle>

        <nav
          aria-label="Mobile"
          className={cn("flex flex-col border-t", BORDER.hairline)}
        >
          {NAV_ITEMS.map((item) => (
            <MobileLink key={item.href} {...item} />
          ))}
          <MobileLink {...LOGIN_ITEM} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
