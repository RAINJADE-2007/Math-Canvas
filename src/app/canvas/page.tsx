import type { Metadata } from "next";
import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";

export const metadata: Metadata = {
  title: "数学画布",
};

export default function CanvasPage() {
  return <CanvasWorkspace />;
}
