import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muguet",
  description: "The marketing platform for solo creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="w-full h-full">
        {children}
      </body>
    </html>
  );
}
