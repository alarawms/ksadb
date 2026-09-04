import "./globals.css";
import Link from "next/link";

export const metadata = { title: "KSADB" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 p-4">
            <span className="text-lg font-bold">KSADB</span>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/search" className="hover:underline">Search</Link>
            <Link href="/pathogens" className="hover:underline">Pathogens</Link>
            <Link href="/genomes" className="hover:underline">Genomes</Link>
            <Link href="/human" className="hover:underline">Human</Link>
            <Link href="/compare" className="hover:underline">Compare</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
