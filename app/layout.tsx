import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGEE Millwork PMA",
  description: "Project manager for the OGEE millwork shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
