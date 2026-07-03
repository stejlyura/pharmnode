import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & B2B CDMO Focus",
  description: "Discover the mission behind PharmNode virtual formulation studio: replacing laboratory trials with physical simulations and deterministic rules. Наша команда и миссия проекта.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
