"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";

export default function MarkdownEditorPage() {
  const [value, setValue] = useState(
    `# Welcome to Markdown Editor

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks with syntax highlighting
- Lists and tables

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, DevToolkit!");
}
\`\`\`

### Table

| Tool | Status |
|------|--------|
| JSON Formatter | ✅ |
| Password Generator | ✅ |
| SQL Beautifier | ✅ |

> All processing happens in your browser.

---

*Start editing to see the live preview!*
`
  );
  const [copied, setCopied] = useState(false);

  const copyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [value]);

  const wordCount = useMemo(() => {
    const text = value.replace(/[#*_`~\[\]()>-]/g, "").trim();
    const words = text.split(/\s+/).filter(Boolean);
    return words.length;
  }, [value]);

  const charCount = value.length;
  const lineCount = value.split("\n").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Markdown Editor</h1>
            <p className="mt-1 text-sm text-gray-500">Write Markdown with live preview. All rendering in your browser.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyMarkdown}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                copied ? "bg-green-100 text-green-700" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {copied ? "✓ Copied" : "Copy MD"}
            </button>
            <button
              onClick={downloadMarkdown}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Download .md
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 flex gap-4 text-xs text-gray-400">
        <span>{charCount} characters</span>
        <span>{wordCount} words</span>
        <span>{lineCount} lines</span>
      </div>

      {/* Editor */}
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(val) => setValue(val || "")}
          height={500}
          preview="live"
        />
      </div>
    </div>
  );
}
