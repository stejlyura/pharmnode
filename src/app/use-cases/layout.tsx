import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compounding Use Cases & CDMO Success Stories",
  description: "Read how formulation technologists use PharmNode to solve poor powder flowability, capping, and chemical incompatibility in real-world scenarios. Примеры практического внедрения.",
};

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
