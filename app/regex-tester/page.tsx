"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";

const FLAG_OPTIONS = [
  { key: "g", label: "Global", desc: "Find all matches" },
  { key: "i", label: "Case Insensitive", desc: "Ignore case" },
  { key: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { key: "s", label: "Dot All", desc: ". matches newlines" },
  { key: "u", label: "Unicode", desc: "Unicode mode" },
];

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
}

function highlightMatches(text: string, matches: MatchInfo[]): React.ReactNode {
  if (matches.length === 0) return text;
  const parts: React.ReactNode[] = [];
  let lastEnd = 0;
  matches.forEach((m, i) => {
    if (m.index > lastEnd) {
      parts.push(<span key={`t-${i}`}>{text.slice(lastEnd, m.index)}</span>);
    }
    parts.push(
      <mark key={`m-${i}`} className="rounded bg-yellow-200 px-0.5 text-yellow-900">
        {m.match || <span className="text-xs text-gray-400">(empty)</span>}
      </mark>
    );
    lastEnd = m.index + (m.match?.length || 0);
  });
  if (lastEnd < text.length) {
    parts.push(<span key="tail">{text.slice(lastEnd)}</span>);
  }
  return parts;
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({ g: true, i: false, m: false, s: false, u: false });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const flagStr = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("");

  const { matches, regex } = useMemo(() => {
    if (!pattern || !testString) return { matches: [] as MatchInfo[], regex: null as RegExp | null };
    try {
      const re = new RegExp(pattern, flagStr);
      setError("");
      const results: MatchInfo[] = [];

      if (flagStr.includes("g")) {
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testString)) !== null && safety < 1000) {
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m[0].length === 0) re.lastIndex++;
          safety++;
        }
      } else {
        const m = re.exec(testString);
        if (m) {
          results.push({ match: m[0], index: m.index, groups: m.slice(1) });
        }
      }
      return { matches: results, regex: re };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [] as MatchInfo[], regex: null };
    }
  }, [pattern, testString, flagStr]);

  const copyPattern = useCallback(async () => {
    const fullPattern = `/${pattern}/${flagStr}`;
    try {
      await navigator.clipboard.writeText(fullPattern);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fullPattern;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pattern, flagStr]);

  const toggleFlag = (key: string) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadSample = () => {
    setPattern("(\\w+)@(\\w+)\\.(\\w+)");
    setFlags((prev) => ({ ...prev, g: true, i: true }));
    setTestString("Contact us at hello@example.com or support@test.org for help.\nAlso try user@domain.co.uk");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">Regex Tester</h1>
        <p className="mt-1 text-sm text-gray-500">Test regular expressions with real-time matching and highlights.</p>
      </div>

      {/* Pattern Input */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Regular Expression</label>
          {pattern && (
            <button onClick={copyPattern} className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="flex items-center rounded-lg border border-gray-300 font-mono focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
          <span className="px-3 text-gray-400">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => { setPattern(e.target.value); setError(""); }}
            placeholder="Enter regex pattern..."
            className="flex-1 py-2.5 font-mono text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            spellCheck={false}
          />
          <span className="text-gray-400">/{flagStr}</span>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Flags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FLAG_OPTIONS.map((f) => (
          <button
            key={f.key}
            onClick={() => toggleFlag(f.key)}
            title={f.desc}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              flags[f.key]
                ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-medium"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className="font-mono font-bold">{f.key}</span>
            <span className="ml-1.5 text-xs">{f.label}</span>
          </button>
        ))}
        <button
          onClick={loadSample}
          className="ml-auto rounded-lg border border-dashed border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          Load Sample
        </button>
      </div>

      {/* Test String */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Test String</label>
          <span className="text-xs text-gray-400">
            {matches.length} match{matches.length !== 1 ? "es" : ""}
          </span>
        </div>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          className="h-32 w-full resize-y rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          spellCheck={false}
        />
      </div>

      {/* Matches Highlighted */}
      {testString && !error && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">Highlighted Matches</label>
          <div className="min-h-[80px] whitespace-pre-wrap break-all rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
            {highlightMatches(testString, matches)}
          </div>
        </div>
      )}

      {/* Match Details */}
      {matches.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">Match Details</label>
          <div className="space-y-2">
            {matches.map((m, i) => (
              <div key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-xs text-gray-400">#{i + 1}</span>
                  <code className="font-medium text-gray-900">&quot;{m.match}&quot;</code>
                  <span className="text-xs text-gray-400">at index {m.index}</span>
                </div>
                {m.groups.length > 0 && (
                  <div className="mt-1 ml-8 flex flex-wrap gap-2">
                    {m.groups.map((g, gi) => (
                      <span key={gi} className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">
                        Group {gi + 1}: &quot;{g}&quot;
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
