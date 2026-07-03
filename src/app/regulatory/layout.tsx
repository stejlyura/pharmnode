import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FDA Title 21 CFR & eCTD Compliance Standards",
  description: "Learn how PharmNode supports regulatory compliance: FDA Title 21 CFR Part 11 electronic records, FALCPA allergen declarations, and eCTD module readiness. Соответствие международным фарм-стандартам.",
};

export default function RegulatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
