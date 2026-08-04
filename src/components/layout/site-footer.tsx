import Image from "next/image";
import Link from "next/link";

import {
  BRAND_LINE,
  BUSINESS_FIELDS,
  CONTACT_FIELDS,
  FOOTER_COLUMNS,
  LEGAL_ENTITY,
  LEGAL_ITEMS,
  type BusinessField,
} from "@/constants/business";
import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { BODY, LABEL, LABEL_KO, MONO_DATA } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 푸터.
 *
 * 레퍼런스는 푸터에서 **처음으로 면색을 바꾼다**. 페이지 전체가 흰
 * 바탕인데 여기서만 짙은 초록이 깔려, 스크롤이 끝났다는 신호가 된다.
 * (이 페이지에서 명도가 뒤집히는 유일한 자리다. 섹션마다 뒤집으면 다른
 * 사이트로 넘어온 것처럼 읽힌다.)
 *
 * 짙은 면 위에서는 accent(#c1242f)의 대비가 1.2:1 까지 무너지므로 쓰지 않는다.
 * 글자는 chalk(7.5:1) / moss(4.8:1) 두 단만 쓴다.
 *
 * `#view` 안, `<main>` 밖에 산다:
 * - `#view` **안** — 밖에 두면 라우트가 바뀌는 순간 문서 높이가 먼저 바뀌어
 *   푸터가 튄다. 안에 두면 본문과 함께 0.3초 페이드된다.
 * - `<main>` **밖** — main 안의 footer 는 페이지 푸터가 아니라 섹션 푸터로
 *   취급돼 `contentinfo` 랜드마크가 사라진다.
 */

const FOOTER_LINK = cn(
  BODY,
  "transition-colors duration-150",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  TEXT.chalk,
  TEXT.chalkHover,
  OUTLINE.chalk,
);

/**
 * dt/dd 한 쌍. `display: contents`로 래퍼를 지워 바깥 dl의 2열 격자에
 * 용어와 값이 직접 놓이게 한다(div로 감싸는 것은 dl에서 유효한 마크업이다).
 */
function Field({ term, detail, href }: BusinessField) {
  return (
    <div className="contents">
      <dt className={TEXT.moss}>{term}</dt>
      <dd className={TEXT.chalk}>
        {href ? (
          <a href={href} className={cn(TEXT.chalkHover, OUTLINE.chalk)}>
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
 * 용어 열을 104px로 고정한다. 가장 긴 용어인 "사업자등록번호"가 들어가는
 * 최소 폭이라, 두 dl의 값 열이 같은 축에서 시작한다.
 */
const FIELD_LIST = cn(MONO_DATA, "grid grid-cols-[6.5rem_1fr] gap-y-1.5");

export function SiteFooter() {
  return (
    <footer className={cn(BODY, BG.forest, TEXT.chalk)}>
      {/* 1단: 링크 칼럼들 + 브랜드 문장. */}
      <div
        className={cn(
          "grid gap-10 px-4 pt-14 pb-10",
          "lg:grid-cols-12 lg:gap-6 lg:px-6 lg:pt-20 lg:pb-14",
        )}
      >
        {FOOTER_COLUMNS.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className="lg:col-span-2"
          >
            <h2 className={cn(LABEL_KO, "mb-4", TEXT.moss)}>{column.title}</h2>
            <ul className="flex flex-col gap-2">
              {column.items.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("http") ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={FOOTER_LINK}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={FOOTER_LINK}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <p className={cn("max-w-[40ch]", "lg:col-span-4 lg:col-start-9")}>
          {BRAND_LINE}
        </p>
      </div>

      {/* 2단: 사업자 정보. 국내 통신판매는 표기 의무가 있어 접지 않고 편다. */}
      <div
        className={cn(
          "border-t px-4 py-10",
          "lg:px-6 lg:py-12",
          BORDER.moss,
        )}
      >
        <h2 className={cn(LABEL_KO, "mb-5", TEXT.moss)}>사업자 정보</h2>
        <div className={cn("grid gap-x-12 gap-y-5", "lg:grid-cols-2 lg:gap-x-6")}>
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

      {/* 3단: 로고 + 저작권 + 법적 고지. */}
      <div
        className={cn(
          "flex flex-col gap-6 border-t px-4 py-8",
          "lg:flex-row lg:items-end lg:justify-between lg:px-6",
          BORDER.moss,
        )}
      >
        <div>
          <Link
            href="/"
            aria-label="gwana tea house, 홈"
            className={cn(
              "inline-flex",
              "focus-visible:outline-2 focus-visible:outline-offset-4",
              OUTLINE.chalk,
            )}
          >
            {/* 로고 원본이 검정 획이라 짙은 면 위에서는 반전해 쓴다. */}
            <Image
              src="/gwana-logo.png"
              alt="gwana tea house"
              width={1726}
              height={676}
              sizes="82px"
              className="h-8 w-auto invert"
            />
          </Link>
          <p className={cn(LABEL, "mt-5", TEXT.moss)}>
            © {new Date().getFullYear()} {LEGAL_ENTITY}
          </p>
        </div>

        <ul className={cn("flex flex-wrap gap-x-6 gap-y-2")}>
          {LEGAL_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={FOOTER_LINK}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
