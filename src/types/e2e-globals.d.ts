/* eslint-disable no-unused-vars */
declare global {
  interface Window {
    __E2E_EXPOSE?: {
      previewDocx?: (_index?: number) => Promise<any>;
      setLastSnappedTime?: (_time: number) => void;
      loadThumbs?: (_thumbs: Array<{ time: number; data: string }>) => void;
    };
    __E2E_FAKE_THUMBS?: Array<{ time: number; data: string }>;
  }
}

export { };