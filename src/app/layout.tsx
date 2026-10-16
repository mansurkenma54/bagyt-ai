import type { Metadata } from "next";
import "./globals.css";
import "./pixel-theme.css";
import "./warm-theme.css";
import "./clarity-theme.css";
import "./companion-theme.css";
import "./belgi-theme.css";
import "./belgi-advisor.css";
import "./business-hub.css";
import "./business-studio.css";
import "./business-simple.css";
import "./bagyt-system.css";
import "./bagyt-operations-theme.css";
import "./agent-character.css";
import "./agent-advisor.css";
import "./bagyt-landing.css";
import "./landing-story.css";
import "./bagyt-app-polish.css";
import "./brand-mark.css";
import "./inbox-v2.css";
import "./operations-v2.css";
import "./workspace-v2.css";
import { ThemeProvider } from "@/components/theme-toggle";
export const metadata: Metadata = {
  icons: { icon: "/brand-mark.svg", apple: "/brand-mark.svg" },
  title: "Bagyt — Bizneske anyq baǵyt",
  description:
    "Bagyt — бизнесіңізге айқын бағыт. Клиенттер, қаржы және қойма бір жерде. Belgi, Sana және Qor — сіздің AI командаңыз.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('bagyt-theme')==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}",
          }}
        />
      </head>
      <body>
        <ThemeProvider />
        {children}
      </body>
    </html>
  );
}
