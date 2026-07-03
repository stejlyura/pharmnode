import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Computational Algorithms & Technical Stack",
  description: "Understand the mathematical algorithms (Carr index, Hausner ratio, porosity models) and technologies powering the PharmNode platform. Встроенные формулы и математический аппарат.",
};

export default function TechnologiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
