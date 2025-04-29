import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

/**
 * Formats file size for display
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.24 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * File information interface
 */
export interface FileInfo {
  exists: boolean;
  uri?: string;
  size?: number;
  isDirectory?: boolean;
  modificationTime?: number;
}

/**
 * Gets file information including size
 * @param uri - File URI
 * @returns File info with size or undefined if error
 */
export const getFileInfo = async (
  uri: string,
): Promise<FileInfo | undefined> => {
  try {
    const fileInfo = await RNFS.stat(uri);
    return {
      exists: true,
      uri: uri,
      size: parseInt(fileInfo.size.toString()),
      isDirectory: fileInfo.isDirectory(),
      modificationTime: fileInfo.mtime
        ? new Date(fileInfo.mtime).getTime()
        : undefined,
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return undefined;
  }
};

const convertMediaType = (mediaType: string): 'photo' | 'video' | 'auto' => {
  if (mediaType) {
    return mediaType === 'Photos' ? 'photo' : 'video';
  }
  return 'auto';
};

/**
 * Save a file to the device's media library
 * @param fileUri - URI of the file to save
 * @param mediaType - Type of media ("photo" or "video")
 * @param album - Optional album name to save to
 * @returns True if saved successfully, false otherwise
 */
export const saveToGallery = async (
  fileUri: string,
  mediaType: 'Photos' | 'Videos' = 'Photos',
): Promise<boolean> => {
  try {
    const newMediaType = convertMediaType(mediaType);
    await CameraRoll.save(fileUri, {
      type: newMediaType,
    });
  } catch (albumError) {
    console.error('Error adding to album:', albumError);
  }

  return true;
};

/**
 * Calculate size reduction percentage
 * @param originalSize - Original size in bytes
 * @param newSize - New size in bytes
 * @returns Percentage as string with two decimal places
 */
export const calculateReduction = (
  originalSize: number,
  newSize: number,
): string => {
  if (originalSize === 0) return '0.00%';
  const percentage = (((originalSize - newSize) / originalSize) * 100).toFixed(
    2,
  );
  return `${percentage}%`;
};
