import { BG, BORDER, TEXT } from "@/constants/colors";
import { BODY, DISPLAY_SECTION, LABEL_KO } from "@/constants/typography";
import { cn } from "@/lib/utils";

/**
 * 아직 내용이 없는 라우트의 자리표시.
 *
 * 라우트가 존재해야 내비게이션과 페이지 전환이 도니까 껍데기만 세워 둔다.
 * 홈과 같은 타입 스케일·여백을 쓰므로, 실제 페이지로 바꿀 때 이 파일을
 * 지우고 섹션을 넣으면 화면 리듬이 그대로 이어진다.
 *
 * 지어낸 본문을 채우지 않는다. 무엇이 들어올 자리인지 한 줄만 적는다.
 */
export function PlaceholderPage({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    /*
     * 최소 높이가 **뷰포트에서 헤더를 뺀 만큼**이어야 한다.
     *
     * 이보다 짧으면 첫 화면 아래쪽에 푸터가 올라온다. 스크롤은 맨 위에
     * 있는데도 짙은 초록 푸터가 보이니 "위로 안 갔다"로 읽힌다(실제로 그렇게
     * 보고됐다). 부모 `<main>` 이 `pt-13` 을 갖고 있으므로 여기서 그만큼
     * 빼면 합이 정확히 100svh 가 되어 푸터가 접힘선 바로 아래에서 시작한다.
     *
     * 3.25rem = `h-13` = 52px = `HEADER_HEIGHT`. 바 높이를 바꾸면 여기도 고친다.
     */
    <div
      className={cn(
        "flex min-h-[calc(100svh-3.25rem)] flex-col justify-center px-4 py-24",
        "lg:px-6 lg:py-32",
        BG.surface,
      )}
    >
      <h1 className={cn(DISPLAY_SECTION, "lg:text-[4.4vw]", TEXT.ink)}>
        {title}
      </h1>

      <p className={cn("mt-6 max-w-[58ch]", BODY, TEXT.ink)}>{note}</p>

      <p
        className={cn(
          "mt-10 w-fit border px-3 py-2",
          LABEL_KO,
          BORDER.hairline,
          TEXT.muted,
        )}
      >
        준비 중인 페이지
      </p>
    </div>
  );
}
