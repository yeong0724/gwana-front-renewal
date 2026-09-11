import Image from "next/image";
import Link from "next/link";

import {
  BUSINESS_FIELDS,
  CONTACT_FIELDS,
  LEGAL_ENTITY,
  LEGAL_ITEMS,
  type BusinessField,
} from "@/constants/business";
import { BG, BORDER, OUTLINE, TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";

const FOOTER_LINK = cn(
  "transition-opacity duration-150",
  OUTLINE.ring,
  "hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4",
);

const LEGAL_BUTTON = cn(
  "inline-flex min-h-11 items-center justify-center border border-current px-4 py-2 whitespace-nowrap",
  FOOTER_LINK,
);

/** 두 정보 묶음 모두 값이 같은 104px 축에서 시작한다. */
const FIELD_LIST = cn("grid grid-cols-[104px_minmax(0,1fr)] gap-y-2");

function Field({ term, detail, href }: BusinessField) {
  const addressNoteStart = term === "주소" ? detail.indexOf(" (") : -1;

  return (
    <div className={cn("contents")}>
      <dt className={cn(TEXT.footerMuted)}>{term}</dt>
      <dd className={cn("min-w-0 break-words font-mono")}>
        {href ? (
          <a href={href} className={cn(FOOTER_LINK)}>
            {detail}
          </a>
        ) : addressNoteStart !== -1 ? (
          <>
            {detail.slice(0, addressNoteStart)}
            <span className={cn("block whitespace-nowrap", "lg:inline")}>
              {detail.slice(addressNoteStart)}
            </span>
          </>
        ) : (
          detail
        )}
      </dd>
    </div>
  );
}

/** 이전 버전의 두 단 푸터. 모바일에서는 정보와 하단 링크를 세로로 쌓는다. */
export function SiteFooter() {
  return (
    <footer
      className={cn(
        "border-t text-[12px] leading-[18px]",
        BG.footer,
        BORDER.footer,
        TEXT.footer,
      )}
    >
      <div className={cn("px-4 py-10", "lg:px-6 lg:py-12")}>
        <h2 className={cn("mb-4 font-normal", TEXT.footerMuted)}>
          사업자 정보
        </h2>
        <div className={cn("grid gap-x-6 gap-y-6", "lg:grid-cols-2")}>
          <dl className={cn(FIELD_LIST)}>
            {BUSINESS_FIELDS.map((field) => (
              <Field key={field.term} {...field} />
            ))}
          </dl>
          <dl className={cn(FIELD_LIST)}>
            {CONTACT_FIELDS.map((field) => (
              <Field key={field.term} {...field} />
            ))}
          </dl>
        </div>
      </div>

      <div
        className={cn(
          "border-t px-4 py-8",
          "lg:px-6",
          BORDER.footer,
        )}
      >
        <Link
          href="/"
          aria-label="gwana tea house, home"
          className={cn("inline-flex align-top", FOOTER_LINK)}
        >
          <Image
            src="/gwana-logo.png"
            alt="gwana tea house"
            width={2048}
            height={676}
            sizes="(min-width: 1024px) 144px, 120px"
            className={cn(
              "h-auto w-30 brightness-0 invert",
              "lg:w-36",
              "opacity-85",
            )}
          />
        </Link>
        <div
          className={cn(
            "mt-6 flex flex-col gap-6",
            "lg:flex-row lg:items-center lg:justify-between",
          )}
        >
          <p className={cn("font-mono text-[11px]", TEXT.footerMuted)}>
            © {new Date().getFullYear()} {LEGAL_ENTITY}
          </p>
          <nav aria-label="법적 고지" className={cn("flex flex-wrap gap-3")}>
            {LEGAL_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={cn(LEGAL_BUTTON)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
