let ffmpegClientPromise = null;

const CORE_CDN_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js";

/**
 * Lazily loads a singleton FFmpeg instance for browser-side media conversions.
 * The heavy WASM core is only fetched when the user triggers a conversion.
 */
export const loadFfmpegClient = async () => {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg can only be initialized in the browser environment.");
  }

  if (!ffmpegClientPromise) {
    ffmpegClientPromise = (async () => {
      const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = createFFmpeg({
        log: true,
        corePath: CORE_CDN_URL,
      });
      await ffmpeg.load();
      return { ffmpeg, fetchFile };
    })();
  }

  return ffmpegClientPromise;
};

export const resetFfmpegClient = () => {
  ffmpegClientPromise = null;
};
