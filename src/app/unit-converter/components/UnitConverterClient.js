"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = {
  length: {
    label: "Length",
    units: {
      m: { label: "Meter (m)", factor: 1 },
      km: { label: "Kilometer (km)", factor: 1000 },
      cm: { label: "Centimeter (cm)", factor: 0.01 },
      mm: { label: "Millimeter (mm)", factor: 0.001 },
      mi: { label: "Mile (mi)", factor: 1609.34 },
      yd: { label: "Yard (yd)", factor: 0.9144 },
      ft: { label: "Foot (ft)", factor: 0.3048 },
      in: { label: "Inch (in)", factor: 0.0254 },
    }
  },
  weight: {
    label: "Weight",
    units: {
      kg: { label: "Kilogram (kg)", factor: 1 },
      g: { label: "Gram (g)", factor: 0.001 },
      mg: { label: "Milligram (mg)", factor: 0.000001 },
      lb: { label: "Pound (lb)", factor: 0.453592 },
      oz: { label: "Ounce (oz)", factor: 0.0283495 },
      t: { label: "Metric Ton (t)", factor: 1000 },
    }
  },
  volume: {
    label: "Volume",
    units: {
      l: { label: "Liter (l)", factor: 1 },
      ml: { label: "Milliliter (ml)", factor: 0.001 },
      gal: { label: "Gallon (US)", factor: 3.78541 },
      qt: { label: "Quart (US)", factor: 0.946353 },
      pt: { label: "Pint (US)", factor: 0.473176 },
      cup: { label: "Cup (US)", factor: 0.236588 },
      fl_oz: { label: "Fluid Ounce (US)", factor: 0.0295735 },
    }
  },
  temperature: {
    label: "Temperature",
    units: {
      c: { label: "Celsius (°C)" },
      f: { label: "Fahrenheit (°F)" },
      k: { label: "Kelvin (K)" },
    }
  },
  area: {
    label: "Area",
    units: {
      sq_m: { label: "Square Meter (m²)", factor: 1 },
      sq_km: { label: "Square Kilometer (km²)", factor: 1000000 },
      sq_ft: { label: "Square Foot (ft²)", factor: 0.092903 },
      sq_in: { label: "Square Inch (in²)", factor: 0.00064516 },
      ha: { label: "Hectare (ha)", factor: 10000 },
      ac: { label: "Acre (ac)", factor: 4046.86 },
    }
  },
  speed: {
    label: "Speed",
    units: {
      mps: { label: "Meter per second (m/s)", factor: 1 },
      kph: { label: "Kilometer per hour (km/h)", factor: 0.277778 },
      mph: { label: "Mile per hour (mph)", factor: 0.44704 },
      kn: { label: "Knot (kn)", factor: 0.514444 },
    }
  },
  time: {
    label: "Time",
    units: {
      s: { label: "Second (s)", factor: 1 },
      ms: { label: "Millisecond (ms)", factor: 0.001 },
      min: { label: "Minute (min)", factor: 60 },
      h: { label: "Hour (h)", factor: 3600 },
      d: { label: "Day (d)", factor: 86400 },
      wk: { label: "Week (wk)", factor: 604800 },
      mo: { label: "Month (30d)", factor: 2592000 },
      y: { label: "Year (365d)", factor: 31536000 },
    }
  },
  digital: {
    label: "Digital Storage",
    units: {
      b: { label: "Byte (B)", factor: 1 },
      kb: { label: "Kilobyte (KB)", factor: 1024 },
      mb: { label: "Megabyte (MB)", factor: 1048576 },
      gb: { label: "Gigabyte (GB)", factor: 1073741824 },
      tb: { label: "Terabyte (TB)", factor: 1099511627776 },
      pb: { label: "Petabyte (PB)", factor: 1125899906842624 },
    }
  }
};

export default function UnitConverterClient() {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [fromValue, setFromValue] = useState("1");

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const units = Object.keys(categories[newCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  };

  // Calculate toValue (derived state)
  let toValue = "";
  if (fromValue !== "" && !isNaN(fromValue)) {
    const val = parseFloat(fromValue);
    let result;
    const cat = category;
    const from = fromUnit;
    const to = toUnit;

    // Ensure units belong to category (fallback if state update hasn't propagated yet, though handleCategoryChange handles it)
    // But during render after category change, fromUnit might still be old if we didn't batch updates?
    // React batches updates, so it should be fine.
    // But let's be safe.
    if (categories[cat].units[from] && categories[cat].units[to]) {
        if (cat === "temperature") {
          if (from === to) result = val;
          else if (from === "c" && to === "f") result = (val * 9 / 5) + 32;
          else if (from === "c" && to === "k") result = val + 273.15;
          else if (from === "f" && to === "c") result = (val - 32) * 5 / 9;
          else if (from === "f" && to === "k") result = (val - 32) * 5 / 9 + 273.15;
          else if (from === "k" && to === "c") result = val - 273.15;
          else if (from === "k" && to === "f") result = (val - 273.15) * 9 / 5 + 32;
        } else {
          const fromFactor = categories[cat].units[from].factor;
          const toFactor = categories[cat].units[to].factor;
          result = (val * fromFactor) / toFactor;
        }
        toValue = parseFloat(result.toPrecision(10)).toString();
    }
  }

  return (
    <ToolPageLayout
      title="Unit Converter"
      subtitle="Convert between different units of measurement."
      toolName="Unit Converter"
      toolDescription="A comprehensive unit converter for length, weight, volume, temperature, area, speed, time, and digital storage."
      currentTool="unit-converter"
      steps={[
        "Select the category (e.g., Length, Weight).",
        "Choose the source and target units.",
        "Enter the value to convert."
      ]}
      faqs={[
        {
          question: "How accurate are the conversions?",
          answer: "We use standard conversion factors. For most practical purposes, they are highly accurate."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit-converter" }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-center mb-6">
            {Object.entries(categories).map(([key, { label }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-center bg-card p-6 border shadow-sm">
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="number"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className="text-lg"
              />
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories[category].units).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-2xl font-bold text-muted-foreground text-center pt-6">=</div>

            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="number"
                value={toValue}
                readOnly
                className="text-lg bg-muted"
              />
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories[category].units).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Tabs>
      </div>
    </ToolPageLayout>
  );
}
