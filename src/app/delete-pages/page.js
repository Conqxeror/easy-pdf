import React from 'react';
import { getToolMetadata } from "@/lib/toolSeoHelper";
import DeletePagesClient from "./components/DeletePagesClient";

export const metadata = getToolMetadata("/delete-pages").metadata;

export default function DeletePagesPage() {
  return <DeletePagesClient />;
}
