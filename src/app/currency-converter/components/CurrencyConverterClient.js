"use client";

import React, { useState } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Approximate rates relative to USD (Base)
// Last updated: 2024-05-20
const rates = {
  USD: { rate: 1, label: "US Dollar ($)", symbol: "$" },
  EUR: { rate: 0.92, label: "Euro (€)", symbol: "€" },
  GBP: { rate: 0.79, label: "British Pound (£)", symbol: "£" },
  JPY: { rate: 155.80, label: "Japanese Yen (¥)", symbol: "¥" },
  CAD: { rate: 1.36, label: "Canadian Dollar (C$)", symbol: "C$" },
  AUD: { rate: 1.50, label: "Australian Dollar (A$)", symbol: "A$" },
  CHF: { rate: 0.91, label: "Swiss Franc (Fr)", symbol: "Fr" },
  CNY: { rate: 7.23, label: "Chinese Yuan (¥)", symbol: "¥" },
  INR: { rate: 83.30, label: "Indian Rupee (₹)", symbol: "₹" },
  BRL: { rate: 5.10, label: "Brazilian Real (R$)", symbol: "R$" },
  RUB: { rate: 5.15, label: "Russian Ruble (₽)", symbol: "₽" },
  KRW: { rate: 1355.00, label: "South Korean Won (₩)", symbol: "₩" },
};

export default function CurrencyConverterClient() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  const result = (() => {
    if (!amount || isNaN(amount)) return "";
    const val = parseFloat(amount);
    const fromRate = rates[from].rate;
    const toRate = rates[to].rate;
    const inUsd = val / fromRate;
    const converted = inUsd * toRate;
    return converted.toFixed(2);
  })();

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <ToolPageLayout
      title="Currency Converter"
      subtitle="Convert between major world currencies."
      toolName="Currency Converter"
      toolDescription="Simple currency converter with approximate exchange rates. Useful for quick estimations."
      currentTool="currency-converter"
      steps={[
        "Enter the amount.",
        "Select the source currency.",
        "Select the target currency."
      ]}
      faqs={[
        {
          question: "Are the rates real-time?",
          answer: "No, this tool uses offline approximate rates updated periodically. Do not use for financial trading."
        }
      ]}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Currency Converter", href: "/currency-converter" }
      ]}
    >
      <div className="max-w-xl mx-auto bg-card p-8 rounded-none border shadow-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                {rates[from].symbol}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rates).map(([code, { label }]) => (
                    <SelectItem key={code} value={code}>{code} - {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="icon" onClick={swap} className="mb-0.5">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rates).map(([code, { label }]) => (
                    <SelectItem key={code} value={code}>{code} - {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 text-center">
            <div className="text-sm text-muted-foreground mb-1">
              {amount} {rates[from].label} =
            </div>
            <div className="text-4xl font-bold text-primary-foreground">
              {rates[to].symbol}{result} <span className="text-xl font-normal text-muted-foreground">{to}</span>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
