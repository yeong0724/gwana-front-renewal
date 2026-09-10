"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/shadcn-ui/sheet";
import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_ITEM,
  HEADER_LABEL,
  LOGIN_ITEM,
  NAV_ITEMS,
} from "../../constants/nav-items";
import { useIsActive } from "./header-nav-link";

/**
 * 시트 하단 액션 두 칸의 공통 박스. 두 버튼이 정확히 같은 크기여야 하므로
 * 높이/테두리/타이포를 여기서 한 번만 정하고 면색만 각자 덧씌운다.
 */
const SHEET_ACTION = cn(
  HEADER_LABEL,
  "flex h-11 items-center justify-center border",
  BORDER.line,
  "transition-colors duration-150 active:translate-y-px",
  "focus-visible:outline-2 focus-visible:-outline-offset-2",
  OUTLINE.ring,
);

function MobileLink({
  href,
  label,
  onSelect,
}: {
  href: string;
  label: string;
  onSelect: () => void;
}) {
  const isActive = useIsActive(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onPointerDown={onSelect}
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
  );
}

export function HeaderMobileMenu({ className }: { className?: string }) {
  const pathname = usePathname();
  /*
   * 열려 있던 경로를 들고 있다가 렌더 중에 열림 여부를 계산한다. 라우트가 바뀌면
   * 시트는 저절로 닫히므로 pathname 감시용 이펙트가 필요 없다.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  /*
   * PageTransition이 document 캡처 단계에서 앵커 클릭을 stopPropagation 하므로
   * 링크의 onClick(=SheetClose)은 아예 호출되지 않는다. 그래서 탭 즉시 닫히도록
   * pointerdown으로 걸고, 키보드 Enter처럼 pointerdown이 없는 경로는 위의
   * 라우트 변경 규칙이 받아낸다.
   */
  const close = () => setOpenedAt(null);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => setOpenedAt(next ? pathname : null)}
    >
      {/*
       * 트리거만 새 바에 맞춰 갈아탔다(칸막이 셀 → 얹히는 아이콘 버튼).
       * 시트 안쪽은 손대지 않는다. `-ml-1.5`는 아이콘 박스(36px)의 안쪽 여백만큼
       * 되당겨 글리프 왼끝을 바의 좌측 패딩선(px-3)에 맞추는 값이다.
       */}
      <SheetTrigger
        className={cn(
          "-ml-1.5 flex size-9 items-center justify-center text-current transition-opacity duration-150 hover:opacity-60",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          OUTLINE.ring,
          className,
        )}
      >
        <MenuIcon className="size-5" strokeWidth={1.75} aria-hidden />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent
        side="left"
        aria-describedby={undefined}
        showCloseButton={false}
        // 바깥 배경 클릭으로는 닫히지 않는다. 닫기는 X 또는 메뉴 선택으로만.
        // Esc는 다이얼로그 접근성상 남겨 둔다.
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          "px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          BG.page,
        )}
      >
        {/* 제목과 닫기 버튼을 한 행에 두어 X가 MENU와 같은 축에 놓이게 한다. */}
        <div className="flex items-center justify-between gap-4">
          <SheetTitle
            className={cn(
              HEADER_LABEL,
              TEXT.muted,
              "font-bold",
              "text-[17px]",
              TEXT.ink,
            )}
          >
            MENU
          </SheetTitle>

          <SheetClose
            className={cn(
              // 아이콘 박스(36px) 안쪽 여백만큼 당겨 글리프 끝을 본문 우측선에 맞춘다.
              "-mr-2 flex size-9 shrink-0 items-center justify-center",
              TEXT.ink,
              TEXT.inkHover,
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:-outline-offset-2",
              OUTLINE.ring,
            )}
          >
            <XIcon className="size-5" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Close menu</span>
          </SheetClose>
        </div>

        <nav
          aria-label="Mobile"
          className={cn("flex flex-col border-t", BORDER.hairline)}
        >
          {NAV_ITEMS.map((item) => (
            <MobileLink key={item.href} {...item} onSelect={close} />
          ))}
        </nav>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={LOGIN_ITEM.href}
            onPointerDown={close}
            className={cn(SHEET_ACTION, BG.ink, BG.inkHover, TEXT.white)}
          >
            {LOGIN_ITEM.label}
          </Link>

          <Link
            href={ACCOUNT_ITEM.href}
            onPointerDown={close}
            className={cn(SHEET_ACTION, BG.page, BG.hairlineHover, TEXT.ink)}
          >
            {ACCOUNT_ITEM.label}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
