import Image from "next/image";
import Link from "next/link";

import {
  BRAND_LINE,
  BUSINESS_FIELDS,
  CONTACT_FIELDS,
  LEGAL_ENTITY,
  LEGAL_ITEMS,
  type BusinessField,
} from "@/constants/business";
import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { HEADER_LABEL } from "@/constants/nav-items";
import { cn } from "@/lib/utils";

/**
 * 헤더의 LOG IN / BAG 셀을 그대로 뒤집은 것. 폭(140px)과 좌측 괘선이 같아야
 * 위아래 바가 한 격자에서 나온 것으로 읽힌다. 모바일은 2칸 그리드라 폭을 풀고
 * 높이만 맞춘다.
 */
const LEGAL_CELL = cn(
  HEADER_LABEL,
  "flex h-11 items-center justify-center px-4",
  "lg:h-12 lg:w-35 lg:shrink-0",
  TEXT.ink,
  TEXT.inkHover,
  "transition-colors duration-150",
  "focus-visible:outline-2 focus-visible:-outline-offset-2",
  OUTLINE.ring,
);

/** 값에 링크가 붙어도 줄 높이가 흔들리지 않도록 앵커는 inline으로 둔다. */
const FIELD_LINK = cn(
  TEXT.inkHover,
  "transition-colors duration-150",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  OUTLINE.ring,
);

/**
 * dt/dd 한 쌍. `display: contents`로 래퍼를 지워 바깥 dl의 2열 격자에
 * 용어와 값이 직접 놓이게 한다(div로 감싸는 것은 dl에서 유효한 마크업이다).
 */
function Field({ term, detail, href }: BusinessField) {
  return (
    <div className="contents">
      <dt className={TEXT.muted}>{term}</dt>
      <dd className={TEXT.ink}>
        {href ? (
          <a href={href} className={FIELD_LINK}>
            {detail}
          </a>
        ) : (
          detail
        )}
      </dd>
    </div>
  );
}

/**
 * 용어 열을 104px로 고정한다. 가장 긴 용어인 "사업자등록번호"(13px × 7자)가
 * 들어가는 최소 폭이라, 두 dl의 값 열이 같은 축에서 시작한다.
 */
const FIELD_LIST = "grid grid-cols-[6.5rem_1fr] gap-y-2";

/**
 * 모든 라우트 하단에 붙는 공통 푸터. `#view` 안에 있으므로 페이지 전환 때
 * 본문과 함께 페이드된다(밖에 두면 문서 높이가 바뀌는 순간 튄다).
 */
export function SiteFooter() {
  return (
    <footer
      className={cn(
        "border-t text-[13px] leading-normal",
        BG.page,
        BORDER.line,
        TEXT.ink,
      )}
    >
      {/* 브랜드 칼럼은 헤더와 같은 4/12 = 33.33%. 오른쪽은 괘선으로 나눈다. */}
      <div className={cn("lg:flex lg:items-stretch")}>
        <div
          className={cn("px-4 py-8", "lg:w-1/3 lg:shrink-0 lg:px-5 lg:py-12")}
        >
          <Link
            href="/"
            aria-label="gwana tea house, home"
            className={cn(
              "inline-flex",
              "focus-visible:outline-2 focus-visible:outline-offset-4",
              OUTLINE.ring,
            )}
          >
            <Image
              src="/gwana-logo.png"
              alt="gwana tea house"
              width={1726}
              height={676}
              /* 로고 비율 2.553 × 렌더 높이 36px. 헤더 데스크톱과 같은 크기. */
              sizes="92px"
              className="h-9 w-auto"
            />
          </Link>
          <p className={cn("mt-5 max-w-[36ch]", TEXT.muted)}>{BRAND_LINE}</p>
        </div>

        <div
          className={cn(
            "border-t px-4 py-8",
            "lg:flex-1 lg:border-t-0 lg:border-l lg:px-8 lg:py-12",
            BORDER.line,
          )}
        >
          {/* 두 묶음(사업자 / 연락처)을 열로 갈라, 행마다 괘선을 긋지 않는다. */}
          <div className={cn("grid gap-x-12 gap-y-6", "lg:grid-cols-2")}>
            <dl className={FIELD_LIST}>
              {BUSINESS_FIELDS.map((field) => (
                <Field key={field.term} {...field} />
              ))}
            </dl>
            <dl className={FIELD_LIST}>
              {CONTACT_FIELDS.map((field) => (
                <Field key={field.term} {...field} />
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* 하단 바. 데스크톱에서 헤더와 같은 48px 높이로 맞춰 대칭을 만든다. */}
      <div
        className={cn(
          "flex flex-col border-t",
          "lg:flex-row-reverse lg:items-stretch",
          BORDER.line,
        )}
      >
        <div
          className={cn(
            "grid grid-cols-2 border-b",
            "lg:flex lg:border-b-0",
            BORDER.line,
          )}
        >
          {LEGAL_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                LEGAL_CELL,
                // 모바일은 두 칸 사이에만 선이 있고, 데스크톱은 둘 다 왼쪽에 선을 갖는다.
                index === 0 ? "lg:border-l" : "border-l",
                BORDER.line,
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <p
          className={cn(
            "flex h-11 items-center px-4 uppercase",
            "lg:h-12 lg:flex-1 lg:px-5",
            TEXT.muted,
          )}
        >
          © {new Date().getFullYear()} {LEGAL_ENTITY}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
