import { TEXT } from "@/constants/colors";
import { cn } from "@/lib/utils";

/**
 * Stand-in for routes that exist so navigation (and its transition) works.
 * TODO: replace each with the real page.
 */
export function PlaceholderPage({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col justify-center px-4 py-24",
        "lg:px-[4.6667vw]",
      )}
    >
      <h1
        className={cn(
          "text-[40px] leading-none tracking-[-0.01em]",
          "lg:text-[5.5556vw]",
          TEXT.ink,
        )}
      >
        {title}
      </h1>
      <p className={cn("mt-6 max-w-[65ch] text-[13px] leading-[1.4]", TEXT.ink)}>
        {note}
      </p>
    </div>
  );
}
