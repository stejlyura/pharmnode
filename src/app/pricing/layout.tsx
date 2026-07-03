import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans & Tier Matrix",
  description: "Choose the right plan for your formulation needs. Check our Hobby and Professional tiers for ingredient limits, compatibility checks, and GMP PDF reports. Сравнение тарифов Hobby и Professional.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
