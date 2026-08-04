"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type NavItem } from "@/constants/nav-items";
import { LABEL } from "@/constants/typography";
import { cn } from "@/lib/utils";

export function useIsActive(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 헤더 메뉴 한 칸.
 *
 * 활성 표시는 밑줄이다. 예전 구현은 굵기를 바꿨는데, 굵어지면 글자 폭이 늘어
 * 옆 항목이 밀린다(그래서 보이지 않는 볼드 고스트를 겹쳐 폭을 고정해야 했다).
 * 밑줄은 폭을 건드리지 않으므로 그 장치가 통째로 필요 없다.
 *
 * 색은 헤더 껍데기가 정한다. 여기서는 `text-current` 만 쓰고, 호버는 색 대신
 * 투명도로 눌러 사진 위/바탕 위 양쪽에서 같게 읽히게 한다.
 */
export function HeaderNavLink({
  href,
  label,
  className,
}: NavItem & { className?: string }) {
  const isActive = useIsActive(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        LABEL,
        "py-2 text-current transition-opacity duration-150 hover:opacity-60",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        isActive && "underline decoration-1 underline-offset-[5px]",
        className,
      )}
    >
      {label}
    </Link>
  );
}
