import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap | Hatch",
  description: "System evolution trajectory and development logs.",
};

export default function RoadmapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
