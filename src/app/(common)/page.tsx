import { CategoryRailSection } from "@/components/home/category-rail-section";
import { EditorialBandSection } from "@/components/home/editorial-band-section";
import { FinderSection } from "@/components/home/finder-section";
import { HeroSection } from "@/components/home/hero-section";
import { ManifestoSection } from "@/components/home/manifesto-section";
import { PromiseSection } from "@/components/home/promise-section";
import { RecirculationSection } from "@/components/home/recirculation-section";
import { SeasonRailSection } from "@/components/home/season-rail-section";
import { cn } from "@/lib/utils";

/**
 * 홈.
 *
 * 섹션 순서는 레퍼런스(icebug.com)의 뼈대를 그대로 옮긴 것이고, 인접한
 * 두 섹션이 절대 같은 배치 계열을 쓰지 않도록 짜여 있다.
 *
 * | 순서 | 섹션            | 배치 계열                        |
 * | ---- | --------------- | -------------------------------- |
 * | 1    | Hero            | 전면 사진, 글 왼쪽 아래          |
 * | 2    | Season rail     | 가로 레일 (제품 타일)            |
 * | 3    | Manifesto       | 가운데 정렬 선언문, 사진 없음    |
 * | 4    | Category rail   | 가로 레일 (사진 안에 라벨)       |
 * | 5    | Editorial band  | 전면 사진, 글 왼쪽 아래          |
 * | 6    | Finder          | 어긋난 2단 사진 + 오른쪽 문단    |
 * | 7    | Promise         | 왼쪽 글 + 오른쪽 사진 두 장      |
 * | 8    | Recirculation   | 왼쪽 문장 + 오른쪽 세로 영상 기둥 |
 *
 * 8은 이 페이지에서 유일하게 **움직이는 미디어**를 쓴다. 세로 영상이라
 * 전면으로 깔지 않고 기둥으로 세웠다(§ recirculation-section.tsx).
 */
export default function Home() {
  return (
    /* 고정 바 밑으로 끌어올려 히어로 사진이 화면 맨 위까지 닿게 한다. */
    <div className={cn("-mt-13")}>
      <HeroSection />
      <SeasonRailSection />
      <ManifestoSection />
      <CategoryRailSection />
      <EditorialBandSection />
      <FinderSection />
      <PromiseSection />
      <RecirculationSection />
    </div>
  );
}
