import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Pong Game",
  description: "Classic Pong game built with Next.js + Tailwind",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center h-screen">{children}</body>
    </html>
  );
}