'use client';

import { useRef } from 'react';
import Image from 'next/image';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { OPENING_HOURS, STORE_ADDRESS } from '@/constants/business';
import { BG, BORDER, OUTLINE, TEXT } from '@/constants/colors';
import { HEADER_LABEL } from '@/constants/nav-items';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/*
 * 이 섹션의 스티커는 limon.no(§6.3)의 것을 옮긴 것이다.
 * 원본은 GSAP을 전혀 쓰지 않는다. 두 개의 연속된 행에 같은 PNG를 깔고
 *
 *   background-position: 100% 100%;
 *   background-attachment: fixed;
 *
 * 로 끝낸다. `fixed` 배경은 뷰포트 기준으로 자리를 잡되 **그 요소의 박스 안에서만**
 * 그려지므로, 스크롤해도 화면 우측 하단에 붙어 있고 행의 위/아래 경계에서
 * 잘려 나간다. 그게 "따라오다가 아래 경계에서 사라진다"의 정체다.
 *
 * 우리는 이 CSS를 그대로 쓸 수 없다. `#smooth-content`에 transform이 걸려 있어
 * `background-attachment: fixed`가 뷰포트가 아니라 그 조상을 기준으로 잡는다
 * (`position: fixed`가 깨지는 것과 같은 이유, §4). 그래서 GSAP으로 옮겼다.
 * 잘라내는 쪽은 원본과 같다. 블록마다 `overflow-hidden`이다.
 */
const STICKER = 'visit-sticker';

const SOCIAL_LINKS = [
  {
    label: '인스타그램',
    href: 'https://www.instagram.com/gwana_tea_house/',
    icon: '/instagram.svg',
    background: BG.instagram,
  },
  {
    label: '네이버 스마트스토어',
    href: 'https://smartstore.naver.com/gwana',
    icon: '/naver.svg',
    background: BG.naver,
  },
] as const;

/**
 * 스티커를 뷰포트 하단에 붙여두는 y 값의 유도.
 *
 * 블록의 문서상 위치를 top, 높이를 H, 스크롤을 s, 뷰포트 높이를 vh라 하면
 * 스티커의 아래끝을 화면 아래끝에 두려면 `y = (s + vh) - (top + H)` 여야 한다.
 * ScrollTrigger 구간을 `top bottom` → `bottom top`으로 잡으면
 * s는 `top - vh`에서 `top + H`까지 움직이므로, 같은 식에 넣으면 y는
 * **-H에서 +vh까지 선형**이다. 즉 아래 fromTo가 위 식과 정확히 같다.
 * (그래서 ease는 반드시 none이어야 한다. 이징을 주면 배경이 미끄러진다.)
 */
const STICKER_FROM = (block: HTMLElement) => -block.offsetHeight;
const STICKER_TO = () => window.innerHeight;

/**
 * 스티커가 앉는 오른쪽 아래 모서리는 본문이 비워둔다. 원본도 본문을
 * `.container-fixed`로 묶어 이 모서리를 열어두기 때문에 겹치지 않는다.
 * 비워야 하는 폭은 스티커의 우측 여백(6vw) + 폭(13vw, 160~208px로 클램프)이고,
 * 24vw면 1024px에서도 25px 남는다. 좁아지면 여기부터 겹친다.
 *
 * 가로 패딩을 `px`가 아니라 좌/우로 나눠 적는 이유는, 같은 lg 레이어에서
 * `px`와 `pr`이 겹칠 때 어느 쪽이 이기는지가 생성 순서에 달려 있기 때문이다.
 */
const BLOCK_PAD = cn('px-4', 'lg:pr-[24vw] lg:pl-[4.6667vw]');

/**
 * 사용자가 제공한 FRESH TEA 가방 이미지. 원본에 기울기가 있으므로 별도로
 * 회전하지 않는다. 바깥 래퍼는 기존 스크롤 위치와 경계 클리핑을 유지한다.
 */
function Sticker() {
  return (
    <div
      aria-hidden
      className={cn(
        // 모바일에서는 원본도 끈다(원본은 1199px 이하에서 background-image: none).
        STICKER,
        'pointer-events-none absolute right-[12vw] bottom-15 hidden',
        'lg:block',
        'motion-reduce:lg:hidden'
      )}
    >
      <Image
        src="/fresh-tea-bag2.webp"
        alt=""
        width={1268}
        height={1240}
        priority
        sizes="(min-width: 1600px) 208px, (min-width: 1231px) 13vw, 160px"
        className={cn('h-auto w-[20vw] max-w-100 min-w-40')}
      />
    </div>
  );
}

export function VisitSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        // 여집합을 반드시 적는다. 없으면 좁은 화면에서 콜백이 아예 안 돈다(§5).
        isMobile: '(max-width: 1023px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          isMobile: boolean;
          reduce: boolean;
        };

        // 둘 다 스티커가 CSS로 숨겨져 있는 상태다. 측정할 것이 없다.
        if (!isDesktop || reduce) return;

        const stickers = sectionRef.current?.querySelectorAll<HTMLElement>(`.${STICKER}`) ?? [];

        stickers.forEach((sticker) => {
          // 스티커를 잘라내는 블록 = 직계 부모. 둘을 따로 물려도 화면에서는
          // 하나로 이어져 보인다. 두 식이 같은 절대 좌표(화면 아래끝)를
          // 가리키기 때문이다. 경계에서 잘리는 것만 원본과 똑같이 남는다.
          const block = sticker.parentElement;
          if (!block) return;

          gsap.fromTo(
            sticker,
            { y: () => STICKER_FROM(block) },
            {
              y: STICKER_TO,
              ease: 'none',
              scrollTrigger: {
                trigger: block,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                // 창 크기가 바뀌면 H와 vh가 둘 다 바뀐다. 함수값을 다시 읽어야 한다.
                invalidateOnRefresh: true,
              },
            }
          );
        });
      },
      sectionRef
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className={cn(BG.page, TEXT.ink, BORDER.line, 'border-t')}>
      {/* 영업시간. 푸터와 같은 1/3 격자를 써서 같은 자에서 나온 것으로 읽힌다. */}
      <div className={cn('relative overflow-hidden py-20', 'lg:py-32', BLOCK_PAD)}>
        <Sticker />

        <div className={cn('relative', 'lg:flex lg:items-start')}>
          <h2
            className={cn(
              'text-[32px] leading-none tracking-[-0.01em]',
              'lg:w-1/3 lg:shrink-0 lg:text-[3.2vw]'
            )}
          >
            영업시간
          </h2>

          <div className={cn('mt-10', 'lg:mt-0 lg:flex-1')}>
            <p className={cn(HEADER_LABEL, 'uppercase')}>하동 화개 · 관아수제차</p>
            <p className={cn('mt-3 text-[13px]', TEXT.muted)}>{STORE_ADDRESS}</p>

            {/* 요일 열은 7rem. 가장 긴 "월 - 금"이 들어가고 값 열이 한 축에서 시작한다. */}
            <dl
              className={cn(
                'mt-8 grid max-w-125 grid-cols-[7rem_1fr] gap-y-3 border-t pt-6 text-[15px]',
                BORDER.line
              )}
            >
              {OPENING_HOURS.map(({ term, detail }) => (
                <div key={term} className="contents">
                  <dt className={TEXT.muted}>{term}</dt>
                  <dd className={TEXT.ink}>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* 두 번째 블록. 스티커는 이 경계선에서 한 번 잘렸다가 이어진다. */}
      <div
        className={cn(
          'relative overflow-hidden border-t py-16',
          'lg:py-24',
          BLOCK_PAD,
          BORDER.line
        )}
      >
        <Sticker />

        <div className={cn('relative')}>
          <div>
            <h2 className={cn('text-[28px] leading-[1.15] tracking-[-0.01em]', 'lg:text-[2.6vw]')}>
              관아를 더 알고
              <br />
              싶으신가요?
            </h2>
            <p className={cn('mt-4 max-w-[42ch] text-[15px]', TEXT.muted)}>
              그해 차의 상태와 남은 수량은 그때그때 다릅니다. 궁금한 점은{' '}
              <span className={cn('whitespace-nowrap')}>편하게 연락 주세요.</span>
            </p>
          </div>

          {/* 브랜드 소식과 구매 페이지로 이어지는 공식 채널. */}
          <ul className={cn('mt-8 flex w-fit gap-4')}>
            {SOCIAL_LINKS.map(({ label, href, icon, background }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (새 탭에서 열림)`}
                  title={label}
                  className={cn(
                    'flex size-14 items-center justify-center rounded-2xl',
                    'lg:size-16 lg:rounded-[20px]',
                    background,
                    OUTLINE.ring,
                    'transition-[scale,filter] duration-200 hover:brightness-110 active:brightness-95',
                    'motion-safe:hover:scale-105 motion-safe:active:scale-95 motion-reduce:transition-none',
                    'focus-visible:outline-2 focus-visible:outline-offset-4'
                  )}
                >
                  <Image
                    src={icon}
                    alt=""
                    width={28}
                    height={28}
                    className={cn('size-6 brightness-0 invert', 'lg:size-7')}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
