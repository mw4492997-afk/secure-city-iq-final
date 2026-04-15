import type { Metadata } from "next";
import "./globals.css";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SECURE CITY INTELLIGENCE",
  description: "Advanced security intelligence platform for comprehensive threat monitoring and response coordination.",
  icons: {
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3lhbiI+PHBhdGggZD0iTTEyIDJsOCA0djZjMCA1LjU1LTMuODQgMTAuNzQtOSA5QzUuMTYtMS4yNi05LTYuNDUtOS0xMlY2bDgtNHoiLz48L3N2Zz4=",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
<ErrorReporter />
        {children}
      </body>
    </html>
  );
}
