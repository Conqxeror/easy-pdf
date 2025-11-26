import React from 'react';
import { getToolMetadata } from "@/lib/toolSeoHelper";
import PageNumbersClient from "./components/PageNumbersClient";

export const metadata = getToolMetadata("/page-numbers").metadata;

export default function PageNumbersPage() {
  return <PageNumbersClient />;
}