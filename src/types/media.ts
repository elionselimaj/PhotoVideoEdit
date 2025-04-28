export type MediaType = 'image' | 'video' | null;

export interface MediaFile {
  uri: string;
  type: MediaType;
  name?: string;
  size?: number;
  thumbnailUri?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
}

export interface CapturedMedia {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number; // For videos
  size?: number;
  codec?: string; // For videos
}

export interface ProcessingStats {
  originalSize: string;
  newSize: string;
  percentageReduction: string;
}

export interface CropDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessingOptions {
  compressionQuality: number;
  cropDimensions?: CropDimensions;
  enableCrop: boolean;
  targetFormat?: 'jpg' | 'png' | 'mp4' | 'mov' | 'webm';
}

export interface ProcessedMedia {
  originalUri: string;
  processedUri: string;
  stats: ProcessingStats;
  type: MediaType;
}
