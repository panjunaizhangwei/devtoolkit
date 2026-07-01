"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const format = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setError("Please enter some JSON");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setError("Please enter some JSON");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const loadSample = () => {
    const sample = JSON.stringify(
      {
        name: "DevToolkit",
        version: "1.0.0",
        tools: [
          { id: 1, name: "JSON Formatter", active: true },
          { id: 2, name: "Password Generator", active: true },
        ],
        config: { theme: "light", language: "en" },
      },
      null,
      2
    );
    setInput(sample);
    setError("");
    setOutput("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          ← Back to tools
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">JSON Formatter</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste your JSON to format, validate, or minify it. All processing happens in your browser.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={format}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          Format
        </button>
        <button
          onClick={minify}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Minify
        </button>
        <button
          onClick={clear}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={loadSample}
          className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          Load Sample
        </button>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <label htmlFor="indent">Indent:</label>
          <select
            id="indent"
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
            <option value={1}>1 space</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            <span className="font-medium">Parse Error: </span>
            {error}
          </p>
        </div>
      )}

      {/* Editor Panes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Input</label>
            <span className="text-xs text-gray-400">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            placeholder='Paste JSON here, e.g. {"key": "value"}'
            className="h-[400px] w-full resize-y rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Output</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{output.length} chars</span>
              {output && (
                <button
                  onClick={copyOutput}
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="h-[400px] w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">💡 Tips</h3>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• <strong>Format</strong> — parses and pretty-prints JSON with your chosen indentation</li>
          <li>• <strong>Minify</strong> — removes all whitespace for the smallest possible output</li>
          <li>• Invalid JSON will show a parse error with details</li>
          <li>• Your data stays in your browser — nothing is sent to any server</li>
        </ul>
      </div>
    </div>
  );
}
