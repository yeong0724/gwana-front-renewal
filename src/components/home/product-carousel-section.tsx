'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import gsap from 'gsap';

import { BG, BORDER, OUTLINE, TEXT } from '@/constants/colors';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

// 임시 상품과 Acme 레퍼런스 사진. 실제 관아 상품 정보·사진으로 교체할 자리다.
const PRODUCTS = [
  { name: '버드 머그', image: '/products/sample-cup-1.jpg', type: 'MUG', price: 25000 },
  {
    name: '클래식 컵 라지',
    image: '/products/sample-cup-2.jpg',
    type: 'CUP & SAUCER',
    price: 18000,
  },
  { name: '유니온 머그', image: '/products/sample-cup-3.jpg', type: 'MUG', price: 22000 },
  { name: '머그 세트', image: '/products/sample-cup-4.jpg', type: 'SET OF 4', price: 80000 },
  {
    name: '클래식 컵 미니',
    image: '/products/sample-cup-5.jpg',
    type: 'CUP & SAUCER',
    price: 15000,
  },
  {
    name: '클래식 컵 스몰',
    image: '/products/sample-cup-6.jpg',
    type: 'CUP & SAUCER',
    price: 12000,
  },
];

export function ProductCarouselSection() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('[data-product-slide]'));
    const proxy = document.createElement('div');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = slides[0].getBoundingClientRect().width;
    let dragged = false;
    let pressX = 0;
    const setters = slides.map((slide) => gsap.quickSetter(slide, 'x', 'px'));

    // 6개의 실제 카드를 재배치한다. 복제 링크 없이 양방향으로 끝없이 이어진다.
    const render = () => {
      const x = Number(gsap.getProperty(proxy, 'x'));
      const wrap = gsap.utils.wrap(-width, width * (slides.length - 1));
      setters.forEach((set, i) => set(wrap(i * width + x) - i * width));
    };
    const snapTo = (x: number) => {
      gsap.killTweensOf(proxy);
      gsap.to(proxy, {
        x,
        duration: reduce.matches ? 0 : 0.35,
        ease: 'power2.out',
        onUpdate: render,
        onComplete: () => {
          // 누적 이동값을 한 바퀴 안으로 정규화해 장시간 드래그에도 정밀도를 유지한다.
          gsap.set(proxy, { x: gsap.utils.wrap(-width * slides.length, 0, x) });
          render();
        },
      });
    };
    // マウス・タッチ・ペンを同じPointer Eventsで扱う。縦方向はブラウザに任せる。
    let pointer: { id: number; x: number; y: number; horizontal: boolean } | null = null;
    const pointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      gsap.killTweensOf(proxy);
      pressX = Number(gsap.getProperty(proxy, 'x'));
      dragged = false;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    };
    const pointerMove = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!pointer.horizontal) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          pointer = null;
          return;
        }
        pointer.horizontal = true;
        viewport.setPointerCapture(event.pointerId);
      }
      dragged = true;
      if (event.cancelable) event.preventDefault();
      gsap.set(proxy, { x: pressX + dx });
      render();
    };
    const pointerUp = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const horizontal = pointer.horizontal;
      pointer = null;
      if (viewport.hasPointerCapture(event.pointerId))
        viewport.releasePointerCapture(event.pointerId);
      if (!horizontal) return;
      const x = Number(gsap.getProperty(proxy, 'x'));
      const delta = x - pressX;
      const step = Math.abs(delta) > width * 0.15 ? Math.sign(delta) : 0;
      snapTo(
        Math.abs(delta) < width / 2
          ? (Math.round(pressX / width) + step) * width
          : Math.round(x / width) * width
      );
    };

    // PageTransitionのdocument captureより前に、ドラッグ後の誤クリックを止める。
    const preventDragClick = (event: MouseEvent) => {
      if (!dragged || !(event.target instanceof Node) || !viewport.contains(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dragged = false;
    };
    const keydown = (event: KeyboardEvent) => {
      dragged = false;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const current = Math.round(Number(gsap.getProperty(proxy, 'x')) / width);
      snapTo((current + (event.key === 'ArrowLeft' ? 1 : -1)) * width);
    };
    const focus = (event: FocusEvent) => {
      const index = slides.findIndex((slide) => slide.contains(event.target as Node));
      if (index < 0) return;
      const rect = slides[index].getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) snapTo(-index * width);
      viewport.scrollLeft = 0;
    };
    const resize = new ResizeObserver(() => {
      const nextWidth = slides[0].getBoundingClientRect().width;
      if (Math.abs(nextWidth - width) < 0.1) return;
      const index = Math.round(Number(gsap.getProperty(proxy, 'x')) / width);
      gsap.killTweensOf(proxy);
      width = nextWidth;
      gsap.set(proxy, { x: index * width });
      render();
    });
    resize.observe(viewport);
    viewport.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove, { passive: false });
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('pointercancel', pointerUp);
    window.addEventListener('click', preventDragClick, true);
    viewport.addEventListener('keydown', keydown);
    viewport.addEventListener('focusin', focus);
    render();
    return () => {
      resize.disconnect();
      window.removeEventListener('click', preventDragClick, true);
      viewport.removeEventListener('keydown', keydown);
      viewport.removeEventListener('focusin', focus);
      viewport.removeEventListener('pointerdown', pointerDown);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
      window.removeEventListener('pointercancel', pointerUp);
      gsap.killTweensOf(proxy);
      gsap.set(slides, { clearProps: 'transform' });
    };
  }, []);

  return (
    <section
      aria-labelledby="product-carousel-title"
      className={cn('relative py-15', 'lg:py-35', BG.page, TEXT.ink)}
    >
      <div className={cn('mb-8 flex items-end justify-between gap-4 px-4', 'lg:mb-12 lg:px-7')}>
        <h2
          id="product-carousel-title"
          className={cn('text-[28px] leading-none font-bold tracking-tight', 'lg:text-[40px]')}
        >
          관아수제차
        </h2>
        <p className={cn('shrink-0 font-mono text-[15px]', TEXT.muted)}>TEA COLLECTION</p>
      </div>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="상품 6개. 좌우로 드래그하거나 방향키로 탐색하세요."
        tabIndex={0}
        className={cn(
          'cursor-grab touch-pan-y overflow-hidden border-y active:cursor-grabbing',
          BORDER.hairline,
          OUTLINE.ring,
          'focus-visible:outline-2 focus-visible:-outline-offset-2'
        )}
      >
        <div className={cn('flex select-none')}>
          {PRODUCTS.map((product, index) => (
            <article
              key={product.image}
              data-product-slide={index}
              aria-label={`${index + 1} / ${PRODUCTS.length}`}
              aria-roledescription="slide"
              className={cn(
                'flex min-w-0 shrink-0 basis-1/2 flex-col border-r p-3',
                'lg:basis-1/4 lg:p-7',
                BG.page,
                BORDER.hairline,
                OUTLINE.line,
                // 보더를 굵히면 레이아웃이 밀리므로, 안쪽에 그리는 아웃라인으로 대신한다.
                'transition-[outline-width] duration-150 hover:outline-2 hover:-outline-offset-2',
                'lg:hover:outline-1 lg:hover:-outline-offset-1'
              )}
            >
              <h3 className={cn('text-[15px] leading-tight font-bold', 'lg:text-[20px]')}>
                {product.name}
              </h3>
              <p className={cn('mt-2 font-mono text-[12px] leading-snug', TEXT.muted)}>
                {product.type}
              </p>
              <div className={cn('relative my-3 aspect-square', 'lg:my-2')}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  draggable={false}
                  className={cn('pointer-events-none object-contain')}
                />
              </div>
              <Link
                href="/shop"
                draggable={false}
                aria-label={`${product.name} — GO TO SHOP`}
                className={cn(
                  'mt-auto flex min-h-10 items-center justify-between border px-3 font-mono text-[13px] font-bold',
                  'lg:min-h-9 lg:text-[14px]',
                  BORDER.ring,
                  OUTLINE.ring,
                  // 호버 시 검정 면으로 반전된다. 가격 스팬은 색을 따로 두지 않고 물려받는다.
                  BG.blackHover,
                  TEXT.whiteHover,
                  'transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2'
                )}
              >
                GO TO SHOP{' '}
                {product.price && (
                  <span className={cn('ml-2 font-bold')}>
                    {product.price.toLocaleString()}원
                  </span>
                )}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
