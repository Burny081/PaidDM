import type { Metadata } from "next";
import { MockStoreProvider } from "@/lib/mock-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaidDM",
  description: "Messages worth opening.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MockStoreProvider>{children}</MockStoreProvider>
      </body>
    </html>
  );
}
