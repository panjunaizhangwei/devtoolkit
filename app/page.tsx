import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevToolkit - Free Online Developer Tools",
  description:
    "Free online developer tools for everyday coding tasks. JSON formatter, password generator, SQL beautifier, image converter, regex tester, and more.",
};

const tools = [
  {
    name: "JSON Formatter",
    description: "Format, validate and minify JSON data",
    href: "/json-formatter",
    icon: "{ }",
  },
  {
    name: "Password Generator",
    description: "Generate secure random passwords",
    href: "/password-generator",
    icon: "🔑",
  },
  {
    name: "SQL Beautifier",
    description: "Format and beautify SQL queries",
    href: "/sql-beautifier",
    icon: "SQL",
  },
  {
    name: "Image Converter",
    description: "Convert and compress images (WebP, PNG, JPG)",
    href: "/image-converter",
    icon: "🖼️",
  },
  {
    name: "Unit Converter",
    description: "Convert between units of measurement",
    href: "/unit-converter",
    icon: "📐",
  },
  {
    name: "Color Picker",
    description: "Pick and convert colors (HEX, RGB, HSL)",
    href: "/color-picker",
    icon: "🎨",
  },
  {
    name: "Markdown Editor",
    description: "Live preview Markdown editor",
    href: "/markdown-editor",
    icon: "📝",
  },
  {
    name: "Regex Tester",
    description: "Test and debug regular expressions",
    href: "/regex-tester",
    icon: ".*",
  },
  {
    name: "QR Code Generator",
    description: "Generate QR codes from text or URLs",
    href: "/qr-code-generator",
    icon: "📱",
  },
  {
    name: "QR Code Reader",
    description: "Decode QR codes from images",
    href: "/qr-code-reader",
    icon: "📷",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Developer Tools
          <span className="text-indigo-600">. Simplified.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500">
          Free, fast, and privacy-friendly online tools for developers.
          All processing happens in your browser — your data never leaves your device.
        </p>
      </section>

      {/* Tools Grid */}
      <section id="tools">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <div className="group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600">
                    {tool.icon}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 text-center">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-2 text-2xl">⚡</div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Fast & Lightweight</h3>
            <p className="text-xs text-gray-500">Instant results, no loading screens</p>
          </div>
          <div>
            <div className="mb-2 text-2xl">🔒</div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Privacy First</h3>
            <p className="text-xs text-gray-500">All processing in your browser</p>
          </div>
          <div>
            <div className="mb-2 text-2xl">💯</div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">100% Free</h3>
            <p className="text-xs text-gray-500">No signup, no limits, no ads*</p>
          </div>
        </div>
      </section>
    </div>
  );
}
