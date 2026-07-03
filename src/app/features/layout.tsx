import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features & Formulation Capabilities",
  description: "Explore the advanced capabilities of PharmNode formulation studio: Node-Based UI editor, physical powder calculations, and chemical compatibility checks. Узнайте больше о возможностях интерактивного холста и расчета параметров смесей.",
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
