import { ovenMarkPaths } from "@/components/brand/logo";
import { VIEW_BOX } from "@/components/brand/logo-art";

const WALNUT = "#37241a";
const TAN = "#d6a463";

/** App icon: tan oven mark on walnut, padded for maskable crops. Used by ImageResponse routes. */
export function IconArt({ size }: { size: number }) {
  const [, , vw, vh] = VIEW_BOX.mark.split(" ").map(Number);
  const width = size * 0.64;
  const height = (width * vh) / vw;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: WALNUT,
      }}
    >
      <svg width={width} height={height} viewBox={VIEW_BOX.mark}>
        {ovenMarkPaths(TAN)}
      </svg>
    </div>
  );
}
