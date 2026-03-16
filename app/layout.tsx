import type { Metadata } from "next";
import "../styles.css";

export const metadata: Metadata = {
  title: "League Master",
  description:
    "League Master - Organize and manage sports leagues with player standings, match results, and season tracking.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-900 text-gray-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
