import type { CanvasRatio } from "@/types";

export const CANVAS_RATIO_OPTIONS: { id: CanvasRatio; label: string }[] = [
  { id: "1:1", label: "1:1（默认）" },
  { id: "4:3", label: "4:3" },
  { id: "16:9", label: "16:9" },
  { id: "3:4", label: "3:4" },
  { id: "9:16", label: "9:16" },
  { id: "fill", label: "自适应" },
];

export const CANVAS_RATIO_VALUE: Record<CanvasRatio, number | null> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
  fill: null,
};
