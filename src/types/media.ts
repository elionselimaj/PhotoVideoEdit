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
