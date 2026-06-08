import { Canvas } from "@/components/Canvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PharmNode Studio - Virtual Formulation Canvas",
  description: "Advanced node-based canvas for drug formulation, tableting press simulation, and compliance verification.",
};

export default function ConfiguratorPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Canvas />
    </div>
  );
}
