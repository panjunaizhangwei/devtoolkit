"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { format, Dialect } from "sql-formatter";

const DIALECTS: { label: string; value: string }[] = [
  { label: "SQL", value: "sql" },
  { label: "MySQL", value: "mysql" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "Oracle", value: "oracle" },
  { label: "SQLite", value: "sqlite" },
  { label: "MariaDB", value: "mariadb" },
  { label: "BigQuery", value: "bigquery" },
  { label: "Snowflake", value: "snowflake" },
  { label: "Transact-SQL", value: "transactsql" },
];

export default function SqlBeautifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [dialect, setDialect] = useState("sql");
  const [tabWidth, setTabWidth] = useState(2);
  const [upperCase, setUpperCase] = useState(true);
  const [copied, setCopied] = useState(false);

  const beautify = useCallback(() => {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setError("Please enter some SQL");
      return;
    }
    try {
      const result = format(input, {
        language: dialect as Dialect,
        tabWidth,
        keywordCase: upperCase ? "upper" : "preserve",
        linesBetweenQueries: 2,
      });
      setOutput(result);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, dialect, tabWidth, upperCase]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const loadSample = () => {
    setInput(
      `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2024-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_spent DESC LIMIT 100;`
    );
    setError("");
    setOutput("");
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">SQL Beautifier</h1>
        <p className="mt-1 text-sm text-gray-500">Format and beautify SQL queries. Supports multiple SQL dialects.</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={beautify} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Beautify
        </button>
        <button onClick={clear} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Clear
        </button>
        <button onClick={loadSample} className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
          Load Sample
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <label>Dialect:</label>
            <select value={dialect} onChange={(e) => setDialect(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none">
              {DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label>Indent:</label>
            <select value={tabWidth} onChange={(e) => setTabWidth(Number(e.target.value))} className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={upperCase} onChange={(e) => setUpperCase(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-indigo-600" />
            <span className="text-sm">UPPERCASE keywords</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700"><span className="font-medium">Error: </span>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Input SQL</label>
            <span className="text-xs text-gray-400">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="Paste your SQL query here..."
            className="h-[400px] w-full resize-y rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Formatted</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{output.length} chars</span>
              {output && (
                <button onClick={copyOutput} className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted SQL will appear here..."
            className="h-[400px] w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
