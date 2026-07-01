"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
// @ts-ignore - browser-image-compression types
import imageCompression from "browser-image-compression";

type OutputFormat = "webp" | "png" | "jpeg";

const FORMATS: { label: string; value: OutputFormat }[] = [
  { label: "WebP", value: "webp" },
  { label: "PNG", value: "png" },
  { label: "JPEG", value: "jpeg" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function ImageConverterPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [maxSize, setMaxSize] = useState(1);
  const [loading, setLoading] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [originalName, setOriginalName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setError("");
    setOriginalSize(file.size);
    setOriginalName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setResultSize(0);
  }, []);

  const handleConvert = useCallback(async () => {
    const fileInput = fileInputRef.current?.files?.[0];
    if (!fileInput) return;
    setLoading(true);
    setError("");
    try {
      const mimeType = `image/${format}`;
      const ext = format === "jpeg" ? "jpg" : format;
      const baseName = originalName.replace(/\.[^.]+$/, "");

      const compressed = await imageCompression(fileInput, {
        maxSizeMB: maxSize,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        fileType: mimeType,
        initialQuality: quality / 100,
      });

      // If we need a different format, re-draw via canvas
      let finalBlob: Blob;
      if (fileInput.type === mimeType) {
        finalBlob = compressed;
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = URL.createObjectURL(compressed);
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        finalBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))),
            mimeType,
            quality / 100
          );
        });
      }

      setResultSize(finalBlob.size);
      const url = URL.createObjectURL(finalBlob);
      setResult(url);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}.${ext}`;
      a.click();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [format, quality, maxSize, originalName]);

  const savings = originalSize > 0 && resultSize > 0
    ? Math.round((1 - resultSize / originalSize) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">Image Converter</h1>
        <p className="mt-1 text-sm text-gray-500">Convert and compress images between WebP, PNG, and JPG. All processing in your browser.</p>
      </div>

      {/* Upload Area */}
      <div
        className="mb-6 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-indigo-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg object-contain" />
        ) : (
          <div>
            <div className="mb-2 text-4xl">🖼️</div>
            <p className="text-sm font-medium text-gray-700">Click to upload an image</p>
            <p className="mt-1 text-xs text-gray-400">Supports PNG, JPG, WebP, GIF, BMP</p>
          </div>
        )}
        {originalSize > 0 && (
          <p className="mt-2 text-xs text-gray-400">{originalName} — {formatBytes(originalSize)}</p>
        )}
      </div>

      {/* Settings */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Settings</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Format */}
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">Output Format</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    format === f.value
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">Quality: {quality}%</label>
            <input
              type="range" min={10} max={100} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
            />
          </div>

          {/* Max Size */}
          <div>
            <label className="mb-1.5 block text-sm text-gray-600">Max Size: {maxSize} MB</label>
            <input
              type="range" min={0.1} max={10} step={0.1} value={maxSize}
              onChange={(e) => setMaxSize(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
            />
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={!preview || loading}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Converting..." : "Convert & Download"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Result</h3>
          <div className="flex items-center gap-6">
            <img src={result} alt="Result" className="max-h-48 rounded-lg object-contain" />
            <div className="text-sm text-gray-600">
              <p>Original: <strong>{formatBytes(originalSize)}</strong></p>
              <p>Converted: <strong>{formatBytes(resultSize)}</strong></p>
              <p className={savings > 0 ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                {savings > 0 ? `↓ ${savings}% smaller` : `↑ ${Math.abs(savings)}% larger`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
