"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(
  length: number,
  options: Record<string, boolean>
): string {
  let charset = "";
  const required: string[] = [];

  for (const [key, enabled] of Object.entries(options)) {
    if (enabled && CHARSETS[key as keyof typeof CHARSETS]) {
      const set = CHARSETS[key as keyof typeof CHARSETS];
      charset += set;
      // pick at least one char from each enabled set
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      required.push(set[arr[0] % set.length]);
    }
  }

  if (!charset) return "";

  const remaining = length - required.length;
  const arr = new Uint32Array(Math.max(0, remaining));
  crypto.getRandomValues(arr);

  let result = required.join("");
  for (let i = 0; i < remaining; i++) {
    result += charset[arr[i] % charset.length];
  }

  // shuffle
  const shuffleArr = new Uint32Array(result.length);
  crypto.getRandomValues(shuffleArr);
  const chars = result.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleArr[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function getStrength(
  length: number,
  options: Record<string, boolean>
): { label: string; color: string; width: string; score: number } {
  const poolSize = Object.entries(options).filter(([, v]) => v).length;
  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  score += poolSize;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/4", score };
  if (score <= 4) return { label: "Fair", color: "bg-yellow-500", width: "w-2/4", score };
  if (score <= 6) return { label: "Strong", color: "bg-blue-500", width: "w-3/4", score };
  return { label: "Very Strong", color: "bg-green-500", width: "w-full", score };
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword(length, options);
    if (pwd) {
      setPassword(pwd);
      setCopied(false);
      setHistory((prev) => [pwd, ...prev].slice(0, 5));
    }
  }, [length, options]);

  // generate on mount
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPassword = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [password]);

  const strength = getStrength(length, options);

  const toggleOption = (key: string) => {
    // prevent unchecking all
    const enabledCount = Object.values(options).filter(Boolean).length;
    if (enabledCount <= 1 && options[key as keyof typeof options]) return;
    setOptions((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          ← Back to tools
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Password Generator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate cryptographically secure random passwords using your browser&apos;s built-in crypto API.
        </p>
      </div>

      {/* Password Display */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={password}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-4 pl-4 pr-24 font-mono text-xl text-gray-900 focus:outline-none"
            style={{ letterSpacing: "0.05em" }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={copyPassword}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              onClick={handleGenerate}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              title="Regenerate"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Strength Indicator */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-500">Strength</span>
            <span
              className={`font-medium ${
                strength.score <= 2
                  ? "text-red-600"
                  : strength.score <= 4
                  ? "text-yellow-600"
                  : strength.score <= 6
                  ? "text-blue-600"
                  : "text-green-600"
              }`}
            >
              {strength.label}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`}
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Settings</h3>

        {/* Length Slider */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm text-gray-600">Password Length</label>
            <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-sm font-semibold text-indigo-700">
              {length}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        {/* Character Types */}
        <div>
          <p className="mb-3 text-sm text-gray-600">Character Types</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(options).map(([key, value]) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                  value
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleOption(key)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 accent-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                  <span className="ml-1 text-xs text-gray-400">
                    {key === "uppercase"
                      ? "A-Z"
                      : key === "lowercase"
                      ? "a-z"
                      : key === "numbers"
                      ? "0-9"
                      : "!@#$"}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent</h3>
          <div className="space-y-2">
            {history.slice(1).map((pwd, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="truncate font-mono text-sm text-gray-600">{pwd}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pwd);
                  }}
                  className="ml-2 shrink-0 text-xs text-gray-400 hover:text-indigo-600"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
