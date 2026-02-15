import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InItUser from "@/InItUser";



export const metadata: Metadata = {
  title: "SnapCart",
  description: "10 minutes grocery delivery app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-green-100 to-white">
        <Provider>
        <StoreProvider>
        <InItUser/>
        {children}
        </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
