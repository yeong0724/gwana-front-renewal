"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { OUTLINE } from "@/constants/colors";
import { cn } from "@/lib/utils";
import { BAR_LABEL, type NavItem } from "../../constants/nav-items";

export function useIsActive(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavLink({
  href,
  label,
  className,
}: NavItem & { className?: string }) {
  const isActive = useIsActive(href);

  /*
   * 활성 표시가 볼드가 아니라 밑줄이다. 볼드는 글자 폭을 넓혀 nav를 흔들기
   * 때문에 예전 구현은 `invisible font-bold` 고스트를 겹쳐 폭을 고정해야 했다.
   * 밑줄은 폭을 건드리지 않으므로 그 장치가 통째로 필요 없다.
   *
   * 색도 쓰지 않는다. 바가 사진 위에서는 흰 글자, 스크롤 뒤에는 먹 글자라
   * 양쪽에서 같이 통하는 것은 `text-current` + 투명도뿐이다.
   */
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        BAR_LABEL,
        "py-2 text-current transition-opacity duration-150 hover:opacity-60",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        OUTLINE.ring,
        isActive && "underline decoration-1 underline-offset-[5px]",
        className,
      )}
    >
      {label}
    </Link>
  );
}
