/**
 * 디스플레이 헤드라인의 줄을 블록으로 내보낸다.
 *
 * SplitText 는 텍스트를 다시 나누면서 `\n` 을 흘려버리므로, 카피가 정한
 * 줄바꿈을 지키려면 줄마다 블록 요소여야 한다. 그러면 SplitText 가 그
 * 경계를 그대로 한 줄로 잡고, 마스크 리빌도 의도한 줄 수로 돈다.
 *
 * 줄 수는 카피가 정한다. 좁은 화면에서 한 줄이 넘칠 때는 폰트 크기를
 * 줄이지 배열을 다시 나누지 않는다(줄 수가 화면 폭마다 달라지면 리빌의
 * stagger 도 달라져 같은 화면으로 읽히지 않는다).
 */
export function HeadlineLines({ lines }: { lines: readonly string[] }) {
  return lines.map((line) => (
    <span key={line} className="block">
      {line}
    </span>
  ));
}
