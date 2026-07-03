import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer REST API Reference & Integration",
  description: "Documentation for the PharmNode B2B REST API. Access formulation algorithms, ingredient schemas, and density calculations programmatically. Документация для интеграции с внешними системами.",
};

export default function ApiReferenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
