import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Alert } from 'react-native';

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

/**
 * Save a file to the device's media library
 * @param fileUri - URI of the file to save
 * @param mediaType - Type of media ("photo" or "video")
 * @param album - Optional album name to save to
 * @returns True if saved successfully, false otherwise
 */
export const saveToGallery = async (
  fileUri: string,
  mediaType: 'photo' | 'video' = 'photo',
  album?: string,
): Promise<boolean> => {
  try {
    // Save file to media library
    const savedUri = await CameraRoll.save(fileUri, { type: mediaType });

    // If album name is provided, try to add to album
    // Note: @react-native-camera-roll/camera-roll supports albums on both iOS and Android
    if (album && savedUri) {
      try {
        // Get the latest saved asset
        const fetchParams = { first: 1, assetType: mediaType };
        const assets = await CameraRoll.getPhotos(fetchParams);

        if (assets.edges.length > 0) {
          // const assetId = assets.edges[0].node.image.uri;

          // Create the album if it doesn't exist and add the asset
          await CameraRoll.save(fileUri, {
            type: mediaType,
            album: album,
          });
        }
      } catch (albumError) {
        console.error('Error adding to album:', albumError);
        // Continue even if album creation fails - media is still saved
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving to gallery:', error);
    Alert.alert('Error', 'Failed to save media to gallery');
    return false;
  }
};

/**
 * Generate a temporary file path in cache directory
 * @param extension - File extension (e.g., "jpg", "mp4")
 * @returns Full path for a temporary file
 */
export const generateTempFilePath = (extension: string): string => {
  const timestamp = Date.now();
  return `${RNFS.CachesDirectoryPath}/temp_${timestamp}.${extension}`;
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

/**
 * Delete a temporary file
 * @param uri - URI of file to delete
 */
export const deleteTempFile = async (uri: string): Promise<void> => {
  try {
    if (await RNFS.exists(uri)) {
      await RNFS.unlink(uri);
    }
  } catch (error) {
    console.error('Error deleting temp file:', error);
  }
};
