import { HeroSection } from "@/components/home/hero-section";
import { ProductScrollSection } from "@/components/home/product-scroll-section";

export default function Home() {
  return (
    /* Pulled back under the fixed bar so the hero photo runs to the top edge. */
    <div className="-mt-14 lg:-mt-15">
      <HeroSection />
      <ProductScrollSection />
    </div>
  );
}
