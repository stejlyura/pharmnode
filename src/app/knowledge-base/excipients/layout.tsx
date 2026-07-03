import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excipient Directory & Raw Material Reference",
  description: "Search the comprehensive raw materials database. Detailed specifications of binders, diluents, and APIs for compounding. Справочник вспомогательных веществ.",
};

export default function ExcipientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
