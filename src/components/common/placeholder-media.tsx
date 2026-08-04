import { BG, BORDER, TEXT } from "@/constants/colors";
import { LABEL, LABEL_KO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 아직 에셋이 없는 이미지 자리.
 *
 * 홈 최상단 히어로만 실제 사진(`/home/main_2.webp`)을 쓰고 나머지는 전부 이
 * 블록으로 둔다. 스톡 사진이나 picsum 링크로 채우지 않는 이유는, 채워 두면
 * "이미 끝난 화면"으로 읽혀 교체가 미뤄지기 때문이다. 대신 **무엇이 들어갈
 * 자리인지와 필요한 비율**을 면 위에 적어 둔다.
 *
 * 비율은 부모가 정한다(`aspect-*` 또는 높이). 이 컴포넌트는 면을 채우기만 한다.
 */
export function PlaceholderMedia({
  label,
  note,
  className,
}: {
  /** 이 자리에 들어갈 사진. 예: "차밭 전경". */
  label: string;
  /** 필요한 원본 규격. 예: "1080 × 1350". */
  note?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} 사진 자리 (준비 중)`}
      className={cn("relative h-full w-full overflow-hidden", BG.tile, className)}
    >
      {/* 파선 상자가 타일 전체를 채워야 "빈 자리"로 읽힌다. 안쪽 12px 만 띄운다. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-3 flex flex-col items-center justify-center gap-1.5 border border-dashed p-4 text-center",
          BORDER.hairline,
        )}
      >
        <span className={cn(LABEL_KO, TEXT.ink)}>{label}</span>
        {note ? (
          <span className={cn(LABEL, "opacity-75", TEXT.ink)}>{note}</span>
        ) : null}
      </div>
    </div>
  );
}
