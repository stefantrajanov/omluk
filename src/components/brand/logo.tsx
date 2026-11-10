import { PATHS, VIEW_BOX } from "./logo-art";

export const BRAND_NAME = "Фурна Омлук Коцеви";
export const EMBER = "#d4461c";
export const GLOW = "#f2b632";

type Variant = keyof typeof VIEW_BOX;

/**
 * Oven emblem paths; `color` drives the bricks, the flame keeps ember colours.
 * Plain function returning intrinsic elements so `next/og` can render it inside <svg>.
 */
export function ovenMarkPaths(color = "currentColor") {
  return [
    <path
      key="bricks"
      fill={color}
      stroke={color}
      strokeWidth={4.4}
      strokeLinejoin="round"
      d={PATHS.bricks}
    />,
    <path key="mouth" fill="none" stroke={color} strokeWidth={2.2} d={PATHS.mouth} />,
    <path key="flame" fill={EMBER} d={PATHS.flameOuter} />,
    <path key="glow" fill={GLOW} d={PATHS.flameInner} />,
  ];
}

export function Logo({
  variant = "horizontal",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEW_BOX[variant]}
      role="img"
      aria-label={BRAND_NAME}
      className={className}
    >
      {variant === "full" && (
        <>
          <path fill="none" stroke="currentColor" strokeWidth={1.8} d={PATHS.arcs} />
          <path fill="currentColor" d={PATHS.diamonds + PATHS.furna} />
        </>
      )}
      {ovenMarkPaths()}
      {variant === "full" && <path fill="currentColor" d={PATHS.wordFull} />}
      {variant === "horizontal" && <path fill="currentColor" d={PATHS.wordHorizontal} />}
    </svg>
  );
}
