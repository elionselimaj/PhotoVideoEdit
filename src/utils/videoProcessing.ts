import RNFS from 'react-native-fs';
import { createThumbnail } from 'react-native-create-thumbnail';
import { Video } from 'react-native-compressor';
import {
  formatFileSize,
  calculateReduction,
  generateTempFilePath,
} from './fileUtils';
import { CropDimensions, ProcessingOptions, ProcessingStats } from '@/types';
import { processCropVideo } from './processors';

/**
 * Process video with compression and optional cropping
 * @param uri - Original video URI
 * @param options - Processing options
 * @returns Processed video URI and statistics
 */
export const processVideo = async (
  uri: string,
  options: ProcessingOptions,
): Promise<{ processedUri: string; stats: ProcessingStats }> => {
  try {
    // Get original file info
    const fileInfo = await RNFS.stat(uri);
    const originalSize = parseInt(fileInfo.size.toString()) || 0;

    // First, use Video.compress for basic compression
    // This is more efficient than doing everything with Vision Camera
    // const compressionQualityStr = options.compressionQuality.toString();
    const compressedUri = await Video.compress(uri, {
      compressionMethod: 'auto',
      minimumFileSizeForCompress: 0, // Always compress
      // quality: compressionQualityStr,
    });

    // For cropping/additional processing, we'll use Vision Camera
    let finalUri = compressedUri;

    // Only use Vision Camera processor if cropping is enabled
    if (
      options.enableCrop &&
      options.cropDimensions &&
      options.cropDimensions.width > 0 &&
      options.cropDimensions.height > 0
    ) {
      finalUri = await cropWithVisionCamera(
        compressedUri,
        options.cropDimensions,
      );

      // Clean up intermediate file if different
      if (compressedUri !== uri && compressedUri !== finalUri) {
        await RNFS.unlink(compressedUri)
          .then(() => console.log('Temporary file deleted'))
          .catch(error => console.log('Error deleting file:', error));
      }
    }

    // Convert format if needed and if not already in target format
    if (
      options.targetFormat &&
      !finalUri.toLowerCase().endsWith(`.${options.targetFormat}`)
    ) {
      const convertedUri = await convertVideoFormat(
        finalUri,
        options.targetFormat,
      );

      // Clean up intermediate file if different
      if (finalUri !== uri && finalUri !== convertedUri) {
        await RNFS.unlink(finalUri)
          .then(() => console.log('Temporary file deleted'))
          .catch(error => console.log('Error deleting file:', error));
      }

      finalUri = convertedUri;
    }

    // Get processed file info
    const processedFileInfo = await RNFS.stat(finalUri);
    const newSize = parseInt(processedFileInfo.size.toString()) || 0;

    // Calculate stats
    const stats: ProcessingStats = {
      originalSize: formatFileSize(originalSize),
      newSize: formatFileSize(newSize),
      percentageReduction: calculateReduction(originalSize, newSize),
    };

    return {
      processedUri: finalUri,
      stats,
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw new Error('Failed to process video');
  }
};

/**
 * Crop video using Vision Camera
 * @param uri - Video URI
 * @param dimensions - Crop dimensions
 * @returns Cropped video URI
 */
const cropWithVisionCamera = async (
  uri: string,
  dimensions: CropDimensions,
): Promise<string> => {
  try {
    // Check if permissions are granted
    // const cameraPermission = await Camera.getCameraPermissionStatus();
    // const microphonePermission = await Camera.getMicrophonePermissionStatus();

    // if (cameraPermission !== 'granted' || microphonePermission !== 'granted') {
    //   throw new Error('Camera or microphone permission not granted');
    // }

    // Create output file path
    const outputUri = generateTempFilePath('mp4');

    // Use Vision Camera's video processor for cropping
    // This utilizes the Frame Processor API which needs to be set up separately
    // const processor = await import('./processors/videoCropProcessor');

    // Process the video with the crop processor
    // This is a simplified example - the actual implementation would depend on how you set up the Frame Processor
    const result = await processCropVideo(uri, {
      x: dimensions.x,
      y: dimensions.y,
      width: dimensions.width,
      height: dimensions.height,
      outputPath: outputUri,
    });

    return result.outputUri;
  } catch (error) {
    console.error('Error cropping with Vision Camera:', error);
    throw new Error('Failed to crop video with Vision Camera');
  }
};

/**
 * Convert video format using Media Converter
 * @param uri - Input video URI
 * @param format - Target format (mp4, mov, webm)
 * @returns Converted video URI
 */
const convertVideoFormat = async (
  uri: string,
  format: 'mp4' | 'mov' | 'webm' = 'mp4',
): Promise<string> => {
  try {
    // For format conversion, we'll use react-native-compressor or other approaches
    // since Vision Camera doesn't directly handle format conversion
    // This is a simplified implementation

    const outputUri = generateTempFilePath(format);

    // For demonstration purposes, we're using a placeholder
    // In a real application, you would use a format converter or media transcoder
    // React Native lacks a good maintained library for this specific purpose

    // For now, we'll just copy the file and rename it
    // This isn't actually converting the format, just changing the extension
    await RNFS.copyFile(uri, outputUri);

    return outputUri;
  } catch (error) {
    console.error('Error converting video format:', error);
    throw new Error('Failed to convert video format');
  }
};

/**
 * Generate a thumbnail from a video
 * @param videoUri - Video URI
 * @param timeMs - Time in milliseconds to capture thumbnail
 * @returns Thumbnail URI
 */
export const generateVideoThumbnail = async (
  videoUri: string,
  timeMs: number = 1000,
): Promise<string> => {
  try {
    const { path } = await createThumbnail({
      url: videoUri,
      timeStamp: timeMs,
      cacheName: Date.now().toString(),
    });
    return path;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    throw new Error('Failed to generate video thumbnail');
  }
};

/**
 * Compress video with custom settings
 * @param uri - Video URI
 * @param quality - Compression quality (0-1)
 * @returns Compressed video URI
 */
export const compressVideo = async (
  uri: string,
  quality: number = 0.7,
): Promise<string> => {
  try {
    const compressedUri = await Video.compress(uri, {
      compressionMethod: 'auto',
      minimumFileSizeForCompress: 0,
      quality: quality.toString(),
    });
    return compressedUri;
  } catch (error) {
    console.error('Error compressing video:', error);
    throw new Error('Failed to compress video');
  }
};

/**
 * Helper function for generating temporary file paths
 * This should be updated if not present in fileUtils.ts
 */
export const generateTempFilePathFallback = (extension: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const filename = `temp_${timestamp}_${random}.${extension}`;
  return `${RNFS.CachesDirectoryPath}/${filename}`;
};
