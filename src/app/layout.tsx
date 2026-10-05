import type { Metadata } from "next";
import "./globals.css";
import "./redesign.css";
import { Providers } from "@/components/providers";
import { Geist } from "next/font/google";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Project Finance Manager",
    template: "%s · Project Finance Manager",
  },
  description:
    "Collaborative project finances with clear payer history and accountable settlement.",
  appleWebApp: { capable: true, statusBarStyle: "default" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
