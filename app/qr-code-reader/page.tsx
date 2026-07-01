"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";

export default function QrCodeReaderPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const decodeImage = useCallback((file: File) => {
    setLoading(true);
    setError("");
    setResult(null);

    const url = URL.createObjectURL(file);
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setResult(code.data);
      } else {
        setError("No QR code found in this image. Try a clearer image or a different angle.");
      }
      setLoading(false);
    };
    img.onerror = () => {
      setError("Failed to load image");
      setLoading(false);
    };
    img.src = url;
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      decodeImage(file);
    },
    [decodeImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        decodeImage(file);
      }
    },
    [decodeImage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            decodeImage(file);
            break;
          }
        }
      }
    },
    [decodeImage]
  );

  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Reader</h1>
        <p className="mt-1 text-sm text-gray-500">Upload an image to decode QR codes. You can also paste from clipboard (Ctrl+V).</p>
      </div>

      {/* Upload Area */}
      <div
        className="mb-6 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-indigo-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        {preview ? (
          <img src={preview} alt="Uploaded" className="mx-auto max-h-64 rounded-lg object-contain" />
        ) : (
          <div>
            <div className="mb-2 text-4xl">📷</div>
            <p className="text-sm font-medium text-gray-700">Click, drag, or paste (Ctrl+V) to upload</p>
            <p className="mt-1 text-xs text-gray-400">Supports PNG, JPG, WebP, GIF</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="mb-4 text-center text-sm text-gray-500">Decoding...</div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result !== null && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Decoded Result</h3>

          {/* Check if it's a URL */}
          {result.startsWith("http://") || result.startsWith("https://") ? (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 block break-all rounded-lg bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              🔗 {result}
            </a>
          ) : (
            <div className="mb-3 break-all rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-800">
              {result}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={copyResult}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                copied ? "bg-green-100 text-green-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              onClick={reset}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">💡 Tips</h3>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Paste directly from clipboard with Ctrl+V (or Cmd+V on Mac)</li>
          <li>• Drag and drop images from your desktop</li>
          <li>• For best results, use clear, well-lit images</li>
          <li>• Supports standard QR codes (URL, text, email, phone, WiFi)</li>
        </ul>
      </div>
    </div>
  );
}
