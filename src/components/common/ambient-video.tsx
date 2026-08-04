"use client";

import { useRef } from "react";

import { BG } from "@/constants/colors";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";

/**
 * 소리 없이 도는 배경 영상.
 *
 * 세 가지를 직접 처리한다.
 *
 * 1. **`muted` 를 ref 로 다시 건다.** React 가 `muted` 를 속성으로 렌더하면
 *    첫 렌더에서 프로퍼티로 반영되지 않는 경우가 있고, 그러면 브라우저가
 *    자동재생을 막는다. 마운트 직후 프로퍼티로 한 번 더 세팅한다.
 *
 * 2. **화면 밖이면 멈춘다.** IntersectionObserver 로 껐다 켠다. 11MB 짜리
 *    영상이 푸터 뒤에서 계속 디코딩되면 모바일 배터리만 깎는다.
 *
 * 3. **`prefers-reduced-motion` 이면 아예 재생하지 않는다.** 이 경우 첫
 *    프레임이라도 보여야 하는데 포스터 이미지가 없으므로, `src` 뒤에
 *    `#t=0.1` 미디어 프래그먼트를 붙여 브라우저가 그 지점을 그리게 한다.
 *    설정을 도중에 바꿔도 따라가도록 `change` 를 듣는다.
 */
export function AmbientVideo({
  src,
  label,
  className,
}: {
  src: string;
  /** 스크린리더용 설명. 영상이 전하는 내용을 한 줄로. */
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useIsomorphicLayoutEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;

    const apply = () => {
      observer?.disconnect();
      observer = undefined;

      if (reduce.matches) {
        video.pause();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // 자동재생이 거부돼도 조용히 넘어간다. 정지 화면으로 남을 뿐이다.
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(video);
    };

    apply();
    reduce.addEventListener("change", apply);

    return () => {
      observer?.disconnect();
      reduce.removeEventListener("change", apply);
    };
  }, []);

  return (
    <video
      ref={ref}
      // 첫 프레임을 그리게 하는 미디어 프래그먼트. 포스터 대용이다.
      src={`${src}#t=0.1`}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      className={cn("h-full w-full object-cover", BG.tile, className)}
    />
  );
}
