import { HeroSection } from "@/components/home/hero-section";
import { ProductScrollSection } from "@/components/home/product-scroll-section";
import { VisitSection } from "@/components/home/visit-section";
import { HEADER_PULL } from "@/constants/nav-items";

export default function Home() {
  return (
    /* 사진이 화면 맨 위까지 닿도록 바 높이만큼 되끌어 올린다. 바가 사진을
       가리는 게 아니라 투명한 채로 그 위에 얹힌다. */
    <div className={HEADER_PULL}>
      <HeroSection />
      <ProductScrollSection />
      <VisitSection />
    </div>
  );
}
