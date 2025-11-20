import React from 'react';
import AudioCompressorClient from './components/AudioCompressorClient';

export const metadata = {
  title: 'Audio Compressor | Easy PDF',
  description: 'Compress audio files (MP3, WAV, M4A, FLAC) online. Reduce file size while maintaining quality with adjustable compression levels.',
};

export default function AudioCompressorPage() {
  return <AudioCompressorClient />;
}