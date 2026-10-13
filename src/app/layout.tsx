import type { Metadata } from "next";
import "./globals.css";
import "./pixel-theme.css";
import "./warm-theme.css";
import "./story-theme.css";
export const metadata: Metadata = {
  icons: { icon: "/brand-mark.svg", apple: "/brand-mark.svg" },
  title: "BAGYT AI — AQYL рядом с вашим делом",
  description:
    "AQYL: проверенные данные, понятные решения и измеримый рост бизнеса.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
