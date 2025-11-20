import React from "react";
import AviMkvToMp4Client from "./components/AviMkvToMp4Client";

export const metadata = {
  title: "AVI/MKV to MP4 Converter | Easy PDF",
  description: "Convert AVI and MKV videos to MP4 format in the browser using FFmpeg.wasm. Your video never leaves your device during conversion.",
};

export default function AviMkvToMp4Page() {
  return <AviMkvToMp4Client />;
}
