import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chemical Compatibility Matrix & Conflict Rules",
  description: "A deep dive into the chemical compatibility rules of PharmNode. Prevent browning and cross-allergen conflicts across 35 chemical classes. Описание матриц совместимости ингредиентов.",
};

export default function CompatibilityMatrixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
