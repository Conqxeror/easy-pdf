"use client";

import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const commonTimezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function TimezoneConverterClient() {
  return (
    <ToolPageLayout
      title="Timezone Converter"
      subtitle="Convert time between different timezones."
      toolName="Timezone Converter"
      toolDescription="Easily convert date and time across global timezones. Useful for scheduling meetings and travel planning."
      currentTool="timezone-converter"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Timezone Converter", href: "/timezone-converter" }
      ]}
    >
      <ConverterLogic />
    </ToolPageLayout>
  );
}

function ConverterLogic() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [toZone, setToZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [result, setResult] = useState("");

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  useEffect(() => {
    if (!date || !time) return;

    try {
      const d = new Date(`${date}T${time}`);

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: toZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });

      setResult(formatter.format(d));

    } catch {
      setResult("Invalid Date/Time");
    }
  }, [date, time, toZone]);

  return (
    <div className="max-w-xl mx-auto bg-card p-8 border shadow-sm space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Time (Local)</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Convert To</Label>
        <Select value={toZone} onValueChange={setToZone}>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {commonTimezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-muted text-center">
        <p className="text-sm text-muted-foreground mb-1">Result in {toZone}</p>
        <p className="text-xl font-medium">{result}</p>
      </div>
    </div>
  );
}
