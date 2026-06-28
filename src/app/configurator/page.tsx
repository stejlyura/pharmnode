import { Canvas } from "@/components/Canvas";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "PharmNode Studio - Virtual Formulation Canvas",
  description: "Advanced node-based canvas for drug formulation, tableting press simulation, and compliance verification.",
};

export default function ConfiguratorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-zinc-500">Loading Canvas...</div>}>
        <ErrorBoundary componentName="Canvas">
          <Canvas />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
