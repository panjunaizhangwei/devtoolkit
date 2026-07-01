"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState("https://devtoolkit.dev");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const downloadSVG = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadPNG = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "qrcode.png";
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [size]);

  const copyToClipboard = useCallback(async () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      try {
        canvas.toBlob(async (pngBlob) => {
          if (!pngBlob) return;
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": pngBlob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }, "image/png");
      } catch {
        // clipboard image write not supported
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [size]);

  const ERROR_LEVELS: { label: string; value: "L" | "M" | "Q" | "H"; desc: string }[] = [
    { label: "L", value: "L", desc: "7% recovery" },
    { label: "M", value: "M", desc: "15%" },
    { label: "Q", value: "Q", desc: "25%" },
    { label: "H", value: "H", desc: "30%" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="mt-1 text-sm text-gray-500">Generate QR codes from text or URLs. Download as SVG or PNG.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Settings */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="h-24 w-full resize-y rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-400">{text.length} characters</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Settings</h3>

            {/* Size */}
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-gray-600">Size</span>
                <span className="font-mono text-indigo-600">{size}px</span>
              </div>
              <input
                type="range" min={128} max={512} step={8} value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
              />
            </div>

            {/* Error Level */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm text-gray-600">Error Correction</label>
              <div className="flex gap-2">
                {ERROR_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-center text-sm transition-colors ${
                      level === l.value
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-medium"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-bold">{l.label}</span>
                    <span className="ml-1 text-xs">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Foreground</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded border-0" />
                  <input
                    type="text" value={fgColor}
                    onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setFgColor(e.target.value); }}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded border-0" />
                  <input
                    type="text" value={bgColor}
                    onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBgColor(e.target.value); }}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Download */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Preview</h3>
            <div ref={containerRef} className="flex items-center justify-center rounded-lg bg-gray-50 p-6" style={{ minHeight: 300 }}>
              {text.trim() ? (
                <QRCodeSVG
                  value={text}
                  size={Math.min(size, 280)}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  includeMargin={false}
                />
              ) : (
                <p className="text-sm text-gray-400">Enter text to generate QR code</p>
              )}
            </div>

            {/* Download Buttons */}
            {text.trim() && (
              <div className="mt-4 flex gap-2">
                <button onClick={downloadPNG} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                  Download PNG
                </button>
                <button onClick={downloadSVG} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Download SVG
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    copied ? "bg-green-100 text-green-700" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
