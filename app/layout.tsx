import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevToolkit - Free Online Developer Tools",
  description:
    "Free online developer tools: JSON formatter, password generator, SQL beautifier, image converter, regex tester and more. No signup required.",
  keywords:
    "developer tools, JSON formatter, password generator, SQL beautifier, online tools, free tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              <span className="text-2xl">🛠️</span>
              <span>DevToolkit</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-500">
              <a href="#tools" className="hover:text-gray-900 transition-colors">Tools</a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-130px)]">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} DevToolkit. Free & open-source developer tools.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
