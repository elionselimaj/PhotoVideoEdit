// Media types and interfaces for the application

// Type of media (now focusing only on images)
export type MediaType = 'image' | 'video';

// Media file information
export interface MediaFile {
  uri: string;
  type: MediaType;
  name: string;
  size?: number;
  thumbnailUri?: string;
}

export interface ProcessingStats {
  originalSize: string;
  newSize: string;
  percentageReduction: string;
  originalFormat: string;
  newFormat: string;
  originalDimensions?: {
    width: number;
    height: number;
  };
  newDimensions?: {
    width: number;
    height: number;
  };
}

// Processed media result
export interface ProcessedMedia {
  originalUri: string;
  processedUri: string;
  stats: ProcessingStats;
  type: MediaType;
}

// Captured media from camera
export interface CapturedMedia {
  uri: string;
  type: MediaType;
  size?: number;
}

export interface CropDimensions {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

// Processing options
export interface ProcessingOptions {
  compressionQuality: number;
  enableCrop: boolean;
  cropDimensions: CropDimensions;
}
