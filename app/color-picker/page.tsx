"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import tinycolor from "tinycolor2";

const PRESETS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#06B6D4",
  "#3B82F6", "#6366F1", "#A855F7", "#EC4899", "#F43F5E",
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#FFFFFF",
];

interface ColorFormat {
  label: string;
  value: string;
}

export default function ColorPickerPage() {
  const [hex, setHex] = useState("#6366F1");
  const [copied, setCopied] = useState<string | null>(null);

  const color = tinycolor(hex);

  const formats: ColorFormat[] = [
    { label: "HEX", value: color.toHexString() },
    { label: "HEX8", value: color.toHex8String() },
    { label: "RGB", value: color.toRgbString() },
    { label: "HSL", value: color.toHslString() },
    { label: "HSV", value: color.toHsvString() },
  ];

  const complementary = tinycolor(color).complement().toHexString();
  const triadic1 = tinycolor(color).spin(120).toHexString();
  const triadic2 = tinycolor(color).spin(240).toHexString();
  const analogous1 = tinycolor(color).spin(-30).toHexString();
  const analogous2 = tinycolor(color).spin(30).toHexString();

  const copyValue = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  }, []);

  const handleHexInput = (val: string) => {
    let v = val.trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (tinycolor(v).isValid()) {
      setHex(v);
    }
  };

  const handlePreset = (c: string) => {
    setHex(c);
  };

  const isLight = color.isLight();
  const textColor = isLight ? "#000000" : "#FFFFFF";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">Color Picker</h1>
        <p className="mt-1 text-sm text-gray-500">Pick colors and convert between HEX, RGB, HSL formats.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Picker */}
        <div className="space-y-4">
          {/* Color Preview */}
          <div
            className="flex h-48 items-center justify-center rounded-xl border border-gray-200 shadow-sm transition-colors"
            style={{ backgroundColor: hex }}
          >
            <span className="font-mono text-lg font-bold" style={{ color: textColor }}>
              {hex.toUpperCase()}
            </span>
          </div>

          {/* Native Color Picker */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <input
              type="color"
              value={color.toHexString()}
              onChange={(e) => setHex(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-lg border-0"
            />
          </div>

          {/* HEX Input */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">HEX Value</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="#000000"
            />
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">Presets</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => handlePreset(c)}
                  className={`h-8 w-8 rounded-lg border transition-transform hover:scale-110 ${
                    hex.toLowerCase() === c.toLowerCase() ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Values & Harmonies */}
        <div className="space-y-4">
          {/* Color Values */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Color Values</h3>
            <div className="space-y-2">
              {formats.map((f) => (
                <div key={f.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs font-medium text-gray-500 w-12">{f.label}</span>
                  <code className="flex-1 truncate text-sm text-gray-700">{f.value}</code>
                  <button
                    onClick={() => copyValue(f.value, f.label)}
                    className={`ml-2 shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                      copied === f.label ? "bg-green-100 text-green-700" : "bg-white border border-gray-200 text-gray-500 hover:text-indigo-600"
                    }`}
                  >
                    {copied === f.label ? "✓" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400">Brightness</span>
                <p className="font-medium text-gray-700">{Math.round(color.getBrightness())}/255</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400">Luminance</span>
                <p className="font-medium text-gray-700">{Math.round(color.getLuminance() * 100)}%</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400">Temperature</span>
                <p className="font-medium text-gray-700">{(() => { const h = color.toHsl().h; return (h < 60 || h > 300) ? "Warm" : "Cool"; })()}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400">Monochrome</span>
                <p className="font-medium text-gray-700">{color.toHsl().s === 0 ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          {/* Harmonies */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Color Harmonies</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs text-gray-500">Complementary</p>
                <div className="flex gap-2">
                  {[hex, complementary].map((c) => (
                    <button key={c} onClick={() => setHex(c)} className="h-10 flex-1 rounded-lg border border-gray-200 transition-transform hover:scale-105" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-gray-500">Triadic</p>
                <div className="flex gap-2">
                  {[hex, triadic1, triadic2].map((c) => (
                    <button key={c} onClick={() => setHex(c)} className="h-10 flex-1 rounded-lg border border-gray-200 transition-transform hover:scale-105" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-gray-500">Analogous</p>
                <div className="flex gap-2">
                  {[analogous1, hex, analogous2].map((c) => (
                    <button key={c} onClick={() => setHex(c)} className="h-10 flex-1 rounded-lg border border-gray-200 transition-transform hover:scale-105" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
