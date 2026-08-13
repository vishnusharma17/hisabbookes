import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "BillFlow — Create professional invoices in seconds",
  description: "India-first invoice SaaS for freelancers and small businesses."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
