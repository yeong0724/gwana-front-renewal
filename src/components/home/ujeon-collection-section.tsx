'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { BG, BORDER, OUTLINE, TEXT } from '@/constants/colors';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

export type TeaVariant = {
  productVariantId: number;
  productId: number;
  optionLabel: string;
  price: number;
  status: string;
  sortOrder: number;
  thumbnailUrl: string | null;
};

export type FeaturedTea = {
  productName: string;
  category: string;
  variants: TeaVariant[];
};

// 조회 API 연결 전의 제공 데이터. 조회 결과를 product prop에 전달한다.
const UJEON: FeaturedTea = {
  productName: '우전',
  category: '녹차',
  variants: [
    {
      productVariantId: 1,
      productId: 1,
      optionLabel: '80g',
      price: 120000,
      status: 'ON_SALE',
      sortOrder: 0,
      thumbnailUrl: '/woojean_1.png',
    },
    {
      productVariantId: 2,
      productId: 1,
      optionLabel: '40g',
      price: 65000,
      status: 'ON_SALE',
      sortOrder: 1,
      thumbnailUrl: '/woojean_2.png',
    },
  ],
};

const FALLBACK_IMAGE = '/woojean_box.png';

function TeaImage({ src, alt, sizes }: { src: string | null; alt: string; sizes: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed || !src ? FALLBACK_IMAGE : src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={Boolean(src)}
      onError={() => setFailed(true)}
      className={cn('object-contain')}
    />
  );
}

export function UjeonCollectionSection({ product = UJEON }: { product?: FeaturedTea }) {
  const variants = [...product.variants].sort((a, b) => a.sortOrder - b.sortOrder);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected =
    variants.find((variant) => variant.productVariantId === selectedId) ??
    variants.find((variant) => variant.status === 'ON_SALE') ??
    variants[0];
  const videoRef = useRef<HTMLVideoElement>(null);

  useIsomorphicLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stopForReducedMotion = () => {
      if (reduce.matches) video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduce.matches) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    reduce.addEventListener('change', stopForReducedMotion);
    return () => {
      observer.disconnect();
      reduce.removeEventListener('change', stopForReducedMotion);
      video.pause();
    };
  }, []);

  return (
    <section
      id="ujeon-collection"
      aria-labelledby="ujeon-collection-title"
      className={cn('relative border-t pt-[68px]', 'lg:pt-[142px]', BG.page, TEXT.ink, BORDER.ring)}
    >
      <h2
        id="ujeon-collection-title"
        className={cn(
          'mx-4 mb-8 flex items-start gap-2 text-[36px] leading-none font-bold',
          'min-[1200px]:ml-[180px]',
          'lg:mx-7 lg:mb-[21px] lg:text-[48px]'
        )}
      >
        우전
      </h2>
      <div className={cn('grid grid-cols-1', 'lg:grid-cols-3 lg:border-t', BORDER.ring)}>
        <div
          className={cn(
            'mb-[49px] pr-14 pl-4',
            'min-[1200px]:pl-[180px]',
            'lg:mt-9 lg:mb-0 lg:pr-[42px] lg:pl-7'
          )}
        >
          <p
            className={cn(
              'mb-[33px] max-w-[390px] text-[14px] leading-5 break-keep',
              'lg:max-w-[257px]'
            )}
          >
            <span>
              우전차는 4월 곡우 전, 찻잎이 나기 시작할 무렵 어린 잎만을 모아낸 귀한 차입니다.
            </span>
            <br />
            <span>
              맑고 은은한 향, 입안 가득 머누는 고요한 단맛으로 봄난 찻자리의 품격을 더하세요
            </span>
          </p>
          <Link
            href="/shop"
            className={cn(
              'inline-flex min-h-9 items-center gap-[7px] rounded-[3px] border px-[10px] pt-[9px] pb-[7px] font-mono text-[12px] font-bold',
              BG.hairline,
              BORDER.hairline,
              OUTLINE.line,
              BG.blackHover,
              TEXT.whiteHover,
              'focus-visible:outline-2 focus-visible:outline-offset-4'
            )}
          >
            SHOP COLLECTION <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <article
          className={cn(
            'mx-4 mb-7 flex min-w-0 flex-col border p-[26px]',
            'lg:mx-0 lg:mb-0 lg:min-h-0 lg:border-y-0 lg:px-7 lg:pt-10 lg:pb-20',
            BORDER.ring
          )}
        >
          <h3 className={cn('text-[20px] leading-tight font-bold')}>{product.productName}</h3>
          <p className={cn('mt-2 text-[12px]')}>{product.category}</p>
          <div
            className={cn(
              'relative my-6 aspect-square w-full',
              'lg:my-4 lg:aspect-auto lg:min-h-0 lg:flex-1 lg:basis-0'
            )}
          >
            <div className={cn('absolute inset-0 m-auto h-[70%] max-h-[300px] w-[65%]')}>
              <TeaImage
                key={selected?.thumbnailUrl ?? FALLBACK_IMAGE}
                src={selected?.thumbnailUrl ?? null}
                alt={selected?.optionLabel ?? product.productName}
                sizes="(min-width: 1024px) 20vw, 65vw"
              />
            </div>
          </div>
          <div role="group" aria-label="우전 용량 선택" className={cn('mb-7 flex flex-wrap gap-3')}>
            {variants.map((variant) => (
              <button
                key={variant.productVariantId}
                type="button"
                aria-pressed={selected?.productVariantId === variant.productVariantId}
                onClick={() => setSelectedId(variant.productVariantId)}
                className={cn(
                  'flex w-20 cursor-pointer flex-col items-center gap-2 rounded-[2px] p-1 text-[11px]',
                  OUTLINE.line,
                  'focus-visible:outline-2 focus-visible:outline-offset-2'
                )}
              >
                <span
                  className={cn(
                    'relative block h-[52px] w-[52px] rounded-[2px]',
                    selected?.productVariantId === variant.productVariantId && 'outline outline-1'
                  )}
                >
                  <TeaImage
                    key={variant.thumbnailUrl ?? FALLBACK_IMAGE}
                    src={variant.thumbnailUrl}
                    alt=""
                    sizes="52px"
                  />
                </span>
                {variant.optionLabel}
              </button>
            ))}
          </div>
          {selected?.status === 'ON_SALE' ? (
            <Link
              href={`/shop?productId=${selected.productId}&productVariantId=${selected.productVariantId}`}
              className={cn(
                'flex min-h-9 items-center justify-between gap-2 border px-3 font-mono text-[12px] font-bold',
                BORDER.ring,
                OUTLINE.line,
                BG.blackHover,
                TEXT.whiteHover,
                'focus-visible:outline-2 focus-visible:outline-offset-2'
              )}
            >
              GO TO SHOP <span aria-live="polite">{selected.price.toLocaleString('ko-KR')}원</span>
            </Link>
          ) : (
            <p role="status" className={cn('border p-3 text-[12px]', BORDER.ring)}>
              {selected ? '현재 판매 중인 옵션이 아닙니다.' : '등록된 옵션이 없습니다.'}
            </p>
          )}
        </article>
        {/* Acme: 동일 너비 3열, 미디어 비율 0.813. 상품 이미지가 행 높이를 밀지 않도록 flex 영역 안에 둔다. */}
        <div className={cn('relative aspect-[0.81] overflow-hidden', 'lg:aspect-[0.813]')}>
          <video
            ref={videoRef}
            src="/gwana_main_video_1.mp4"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="관아수제차 우전 소개 영상"
            width={812}
            height={1444}
            className={cn('absolute inset-0 h-full w-full object-cover')}
          />
        </div>
      </div>
    </section>
  );
}
