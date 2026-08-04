"use client";

import { Children, useCallback, useId, useRef, useState } from "react";
import Link from "next/link";

import { BG, OUTLINE, TEXT } from "@/constants/colors";
import { LABEL, LABEL_KO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 레퍼런스의 가로 레일. 제품 레일과 카테고리 레일이 같은 뼈대를 쓴다.
 *
 * 머리 행은 왼쪽에 `라벨 + 전체보기`, 오른쪽에 `Prev / Next` 를 놓는다.
 * 타일은 화면 폭을 정확히 n 등분하고 그 사이를 `RAIL_GAP` 만큼 벌려, 바탕색이
 * 이음매로 드러난다(레퍼런스가 타일에 테두리를 두르지 않고 만드는 격자).
 *
 * **스크롤 하이재킹을 하지 않는다.** 레퍼런스도 네이티브 가로 스크롤이고,
 * 그래야 트랙패드·터치·키보드가 전부 그대로 동작한다. 버튼은 한 타일씩
 * `scrollBy` 를 부를 뿐이다.
 */

/**
 * 타일 사이 간격.
 *
 * **폭 계산에 같은 값이 들어간다.** 화면을 n 등분한 뒤 간격 (n-1)개를 빼야
 * 하므로, 여기만 키우고 폭은 그대로 두면 합이 넘쳐 마지막 칸이 잘린다.
 * 그래서 숫자를 두 곳에 적지 않고 CSS 변수로 한 번만 정한다.
 *
 * `0px` 이면 레퍼런스처럼 타일이 맞붙고, 값을 주면 그만큼 바탕색이 드러난다.
 * 여기만 바꾸면 폭·Prev/Next 이동거리가 전부 따라온다.
 */
const RAIL_GAP = "8px";

/**
 * n 등분 폭. 간격 (n-1)개를 뺀 나머지를 n 으로 나눈다.
 *
 * 변수는 레일 컨테이너에 걸고 자식이 상속받으므로, perView 마다 다른 클래스를
 * 만들 필요가 없다(Tailwind 스캐너가 찾을 수 있는 완성된 문자열 하나면 된다).
 */
const ITEM_WIDTH =
  "lg:w-[calc((100%-(var(--rail-per)-1)*var(--rail-gap))/var(--rail-per))]";

const STEP_BUTTON = cn(
  LABEL,
  "px-1.5 py-1 transition-opacity duration-150",
  "disabled:pointer-events-none disabled:opacity-35",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  TEXT.ink,
  OUTLINE.ring,
);

export function MediaRail({
  label,
  linkHref,
  linkLabel,
  perView,
  leadIn = false,
  children,
}: {
  label: string;
  linkHref: string;
  linkLabel: string;
  perView: 5 | 6;
  /** 히어로 바로 다음에 오는 레일이면 true. 위 여백을 혼자 부담한다. */
  leadIn?: boolean;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const railId = useId();

  /*
   * 스크롤 이벤트는 초당 수십 번 오지만 불리언 두 개는 양 끝에서만 바뀐다.
   * 값이 실제로 달라질 때만 setState 를 불러 리렌더를 두 번으로 묶는다.
   */
  const syncEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const start = rail.scrollLeft <= 1;
    const end = rail.scrollLeft >= max - 1;
    setAtStart((prev) => (prev === start ? prev : start));
    setAtEnd((prev) => (prev === end ? prev : end));
  }, []);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const first = rail?.firstElementChild;
    if (!rail || !first) return;
    /*
     * 타일 하나 + 이음매. 한 번에 한 칸씩만 움직여야 위치를 잃지 않는다.
     * 간격은 렌더된 값을 읽으므로 RAIL_GAP 을 바꿔도 따라온다.
     */
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const distance = first.getBoundingClientRect().width + gap;
    rail.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  return (
    /*
     * 레일 위아래 여백. 레퍼런스 실측(1440 기준)은 이렇다.
     *
     *   히어로 끝 ─── 180px ─── 라벨 행 ─── 17px ─── 타일 ─── 172px ─── 다음 섹션
     *
     * 레일이 화면 폭을 꽉 채우기 때문에 이 여백이 없으면 타일이 위아래
     * 섹션에 그대로 붙어 페이지가 한 덩어리로 읽힌다(그렇게 만들었다가 고쳤다).
     *
     * `leadIn` 은 **히어로 바로 다음에 오는 레일**을 위한 것이다. 히어로는
     * 전면 사진이라 아래 여백이 0 이므로, 그 뒤의 180px 을 레일이 혼자
     * 부담해야 한다. 다른 자리에서는 앞 섹션의 `py` 와 합쳐지므로 같은 값을
     * 쓰면 두 배가 된다.
     */
    <section
      aria-labelledby={railId}
      className={cn("py-20", "lg:py-32", leadIn && "lg:pt-45", BG.surface)}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 pb-[17px]",
          "lg:px-6",
        )}
      >
        <h2 id={railId} className="flex items-baseline gap-3">
          <span className={cn(LABEL_KO, TEXT.ink)}>{label}</span>
          <Link
            href={linkHref}
            className={cn(
              LABEL_KO,
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
              TEXT.muted,
              TEXT.inkHover,
              OUTLINE.ring,
            )}
          >
            {linkLabel}
          </Link>
        </h2>

        {/* 레일은 키보드·터치로도 움직이므로 이 버튼들은 보조 수단이다. */}
        <div className={cn("hidden items-center gap-1", "lg:flex")}>
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            className={STEP_BUTTON}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            className={STEP_BUTTON}
          >
            Next
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={syncEdges}
        tabIndex={0}
        role="group"
        aria-label={`${label} 가로 목록`}
        style={
          {
            "--rail-gap": RAIL_GAP,
            "--rail-per": String(perView),
          } as React.CSSProperties
        }
        className={cn(
          "rail-scroll flex snap-x snap-mandatory gap-[var(--rail-gap)] overflow-x-auto overscroll-x-contain",
          "focus-visible:outline-2 focus-visible:-outline-offset-2",
          OUTLINE.ring,
        )}
      >
        {/*
         * 자식은 전부 같은 폭으로 눌러야 이음매가 일정하다. 모바일은 다음 타일이
         * 살짝 보이도록 76vw 로 둔다(가로로 더 있다는 신호).
         */}
        {Children.map(children, (child) => (
          <div
            className={cn(
              "w-[76vw] shrink-0 snap-start",
              "md:w-[38vw]",
              ITEM_WIDTH,
              "border border-gray-400",
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
