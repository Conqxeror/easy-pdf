import React from 'react';
import AudioSpeedChangerClient from './components/AudioSpeedChangerClient';

export const metadata = {
  title: 'Audio Speed Changer | Easy PDF',
  description: 'Change the playback speed of audio files (MP3, WAV, M4A, FLAC) online. Speed up or slow down audio without changing pitch.',
};

export default function AudioSpeedChangerPage() {
  return <AudioSpeedChangerClient />;
}