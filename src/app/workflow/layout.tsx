import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compounding Workflow & GMP Reporting",
  description: "Learn the step-by-step digital pharmaceutical compounding process: raw materials selection, mixing simulation, and automated GMP-compliant PDF export. Пошаговый гид по процессу создания рецептуры.",
};

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
