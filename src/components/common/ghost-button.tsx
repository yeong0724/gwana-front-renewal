import Link from "next/link";

import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { LABEL_KO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 레퍼런스의 유일한 버튼 형태: 1px 테두리, 면 없음, 모노 소문자 라벨, 각진 모서리.
 * 채워진 버튼은 뉴스레터 제출 하나뿐이라 여기서는 다루지 않는다.
 *
 * 두 변형의 차이는 **어떤 면 위에 놓이는가** 하나다.
 *
 * - `light` — surface/tile 위. 잉크색 테두리, 호버 시 면이 채워진다.
 * - `onImage` — 사진 위. 부모가 정한 글자색(=흰색)을 테두리까지 그대로 쓴다.
 *   사진은 밝기를 예측할 수 없으므로 면을 채우지 않고 테두리만 두껍게 읽히게 둔다.
 */
type GhostVariant = "light" | "onImage";

const BASE = cn(
  LABEL_KO,
  // 실측: 세로 10px / 가로 14px. 라벨 한 줄을 넘기지 않는다.
  "inline-flex h-9 shrink-0 items-center justify-center border px-3.5 whitespace-nowrap",
  "transition-colors duration-200 active:translate-y-px",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
);

const VARIANT: Record<GhostVariant, string> = {
  light: cn(
    BORDER.ink,
    TEXT.ink,
    BG.transparent,
    "hover:bg-[#262626] hover:text-[#ffffff]",
    OUTLINE.ring,
  ),
  onImage: cn(
    BORDER.current,
    BG.transparent,
    "hover:bg-[#ffffff] hover:text-[#262626]",
    OUTLINE.chalk,
  ),
};

export function GhostButton({
  href,
  children,
  variant = "light",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: GhostVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(BASE, VARIANT[variant], className)}>
      {children}
    </Link>
  );
}
