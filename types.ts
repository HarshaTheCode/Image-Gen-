
export enum AppStep {
  UPLOAD,
  PROCESSING,
  RESULT,
}

export interface ImageState {
  file: File;
  previewUrl: string;
  base64: string;
}

export type AspectRatio = '1:1' | '3:4' | '4:3';
