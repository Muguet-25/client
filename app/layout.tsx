import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "@/components/common/ToastContainer";

export const metadata: Metadata = {
  title: "Muguet",
  description: "The marketing platform for solo creators",
  icons: {
    icon: '/img/logo_v2.svg',
  },
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
        <ToastContainer />
      </body>
    </html>
  );
}