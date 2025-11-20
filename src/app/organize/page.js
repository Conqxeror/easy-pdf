import React from 'react';
import { getToolMetadata } from "@/lib/toolSeoHelper";
import OrganizeClient from "./components/OrganizeClient";

export const metadata = getToolMetadata("/organize");

export default function OrganizePage() {
  return <OrganizeClient />;
}