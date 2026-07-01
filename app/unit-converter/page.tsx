"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Category = "length" | "weight" | "temperature" | "area" | "volume" | "speed" | "time" | "data";

interface UnitDef {
  name: string;
  factor: number; // relative to base unit
}

const CATEGORIES: Record<Category, { label: string; units: UnitDef[] }> = {
  length: {
    label: "Length",
    units: [
      { name: "Kilometer", factor: 1000 },
      { name: "Meter", factor: 1 },
      { name: "Centimeter", factor: 0.01 },
      { name: "Millimeter", factor: 0.001 },
      { name: "Mile", factor: 1609.344 },
      { name: "Yard", factor: 0.9144 },
      { name: "Foot", factor: 0.3048 },
      { name: "Inch", factor: 0.0254 },
    ],
  },
  weight: {
    label: "Weight",
    units: [
      { name: "Metric Ton", factor: 1000 },
      { name: "Kilogram", factor: 1 },
      { name: "Gram", factor: 0.001 },
      { name: "Milligram", factor: 0.000001 },
      { name: "Pound", factor: 0.45359237 },
      { name: "Ounce", factor: 0.028349523 },
    ],
  },
  area: {
    label: "Area",
    units: [
      { name: "km²", factor: 1000000 },
      { name: "m²", factor: 1 },
      { name: "cm²", factor: 0.0001 },
      { name: "Hectare", factor: 10000 },
      { name: "Acre", factor: 4046.8564224 },
      { name: "ft²", factor: 0.09290304 },
    ],
  },
  volume: {
    label: "Volume",
    units: [
      { name: "m³", factor: 1000 },
      { name: "Liter", factor: 1 },
      { name: "Milliliter", factor: 0.001 },
      { name: "US Gallon", factor: 3.785411784 },
      { name: "US Quart", factor: 0.946352946 },
      { name: "US Pint", factor: 0.473176473 },
      { name: "US Cup", factor: 0.2365882365 },
      { name: "US fl oz", factor: 0.029573529 },
    ],
  },
  speed: {
    label: "Speed",
    units: [
      { name: "m/s", factor: 1 },
      { name: "km/h", factor: 0.277778 },
      { name: "mph", factor: 0.44704 },
      { name: "knot", factor: 0.514444 },
      { name: "ft/s", factor: 0.3048 },
    ],
  },
  time: {
    label: "Time",
    units: [
      { name: "Day", factor: 86400 },
      { name: "Hour", factor: 3600 },
      { name: "Minute", factor: 60 },
      { name: "Second", factor: 1 },
      { name: "Millisecond", factor: 0.001 },
    ],
  },
  data: {
    label: "Data",
    units: [
      { name: "TB", factor: 1099511627776 },
      { name: "GB", factor: 1073741824 },
      { name: "MB", factor: 1048576 },
      { name: "KB", factor: 1024 },
      { name: "Byte", factor: 1 },
      { name: "Bit", factor: 0.125 },
    ],
  },
  temperature: {
    label: "Temperature",
    units: [
      { name: "Celsius", factor: 0 },
      { name: "Fahrenheit", factor: 0 },
      { name: "Kelvin", factor: 0 },
    ],
  },
};

function convert(value: number, fromIdx: number, toIdx: number, category: Category): number {
  const units = CATEGORIES[category].units;
  if (category === "temperature") {
    // Convert to Celsius first
    let celsius: number;
    const fromName = units[fromIdx].name;
    if (fromName === "Celsius") celsius = value;
    else if (fromName === "Fahrenheit") celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15; // Kelvin

    // Convert from Celsius to target
    const toName = units[toIdx].name;
    if (toName === "Celsius") return celsius;
    if (toName === "Fahrenheit") return celsius * 9 / 5 + 32;
    return celsius + 273.15; // Kelvin
  }

  const baseValue = value * units[fromIdx].factor;
  return baseValue / units[toIdx].factor;
}

function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
    return n.toExponential(6);
  }
  // Use up to 10 decimal places, trim trailing zeros
  return parseFloat(n.toPrecision(12)).toString();
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>("length");
  const [fromIdx, setFromIdx] = useState(1);
  const [toIdx, setToIdx] = useState(0);
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const [activeField, setActiveField] = useState<"from" | "to">("from");

  const units = CATEGORIES[category].units;

  const doConvert = useCallback(
    (val: string, direction: "from" | "to") => {
      const num = parseFloat(val);
      if (isNaN(num)) {
        if (direction === "from") setToValue("");
        else setFromValue("");
        return;
      }
      if (direction === "from") {
        const result = convert(num, fromIdx, toIdx, category);
        setToValue(formatNumber(result));
      } else {
        const result = convert(num, toIdx, fromIdx, category);
        setFromValue(formatNumber(result));
      }
    },
    [category, fromIdx, toIdx]
  );

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setFromIdx(0);
    setToIdx(cat === "temperature" ? 1 : 0);
    setFromValue("1");
    setActiveField("from");
  };

  // Auto convert when inputs change
  const handleFromChange = (val: string) => {
    setFromValue(val);
    setActiveField("from");
    doConvert(val, "from");
  };

  const handleToChange = (val: string) => {
    setToValue(val);
    setActiveField("to");
    doConvert(val, "to");
  };

  const swap = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  // Recalculate on unit change
  const handleFromUnitChange = (idx: number) => {
    setFromIdx(idx);
    if (fromValue) doConvert(fromValue, "from");
  };

  const handleToUnitChange = (idx: number) => {
    setToIdx(idx);
    if (activeField === "from" && fromValue) doConvert(fromValue, "from");
    else if (toValue) doConvert(toValue, "to");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/" className="mb-3 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">← Back to tools</Link>
        <h1 className="text-2xl font-bold text-gray-900">Unit Converter</h1>
        <p className="mt-1 text-sm text-gray-500">Convert between units of length, weight, temperature, area, volume, speed, time, and data.</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              category === key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* From */}
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-gray-600">From</label>
            <input
              type="text"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              className="mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter value"
            />
            <select
              value={fromIdx}
              onChange={(e) => handleFromUnitChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {units.map((u, i) => (
                <option key={i} value={i}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <button
            onClick={swap}
            className="mx-auto rounded-full border border-gray-200 bg-white p-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors sm:mb-8"
            title="Swap units"
          >
            ⇄
          </button>

          {/* To */}
          <div className="flex-1">
            <label className="mb-1.5 block text-sm text-gray-600">To</label>
            <input
              type="text"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              className="mb-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Result"
            />
            <select
              value={toIdx}
              onChange={(e) => handleToUnitChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {units.map((u, i) => (
                <option key={i} value={i}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula display */}
        {fromValue && toValue && (
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
            {fromValue} {units[fromIdx].name} = {toValue} {units[toIdx].name}
          </div>
        )}
      </div>
    </div>
  );
}
