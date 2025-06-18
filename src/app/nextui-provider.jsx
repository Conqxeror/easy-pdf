"use client";
import { NextUIProvider } from "@nextui-org/react";

export default function NextUIClientProvider({ children }) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
