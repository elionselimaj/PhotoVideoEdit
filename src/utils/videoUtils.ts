import { Video } from 'react-native-compressor';
import { formatFileSize, getFileInfo, calculateReduction } from './fileUtils';
import { createThumbnail } from 'react-native-create-thumbnail';
import { showEditor } from 'react-native-video-trim';

/**
 * Process a video with compression
 * @param videoUri URI of the video to process
 * @param options Quality options
 * @param onProgress Progress callback function
 * @returns Object with processed URI and stats
 */
export const processMediaVideo = async (
  videoUri: string,
  options: {
    quality: number; // 0.0 to 1.0
  },
  onProgress?: (progress: number) => void,
) => {
  try {
    // Decode URI to handle URL-encoded characters
    const decodedUri = decodeURI(videoUri);

    // Get original file info
    const originalInfo = await getFileInfo(decodedUri);
    if (!originalInfo) {
      throw new Error('Could not get original video info');
    }

    // Get file extension
    const pathParts = decodedUri.split('.');
    const originalFormat =
      pathParts.length > 1 ? pathParts.pop()?.toLowerCase() || 'mp4' : 'mp4';

    // Format original size
    const originalSize = formatFileSize(originalInfo.size || 0);

    // Determine compression level based on quality
    let compressionMethod: 'medium' | 'low' | 'high';
    if (options.quality < 0.4) compressionMethod = 'low';
    else if (options.quality < 0.7) compressionMethod = 'medium';
    else compressionMethod = 'high';

    // Process the video using react-native-compressor
    const processedUri = await Video.compress(
      decodedUri,
      {
        compressionMethod,
        maxSize: Math.round(options.quality * 1000), // Scale with quality (in MB)
        minimumFileSizeForCompress: 0, // Always compress
      },
      progress => {
        if (onProgress) {
          onProgress(progress);
        }
      },
    );

    // Get processed file info
    const processedInfo = await getFileInfo(processedUri);
    if (!processedInfo) {
      throw new Error('Could not get processed video info');
    }

    // Format processed size
    const newSize = formatFileSize(processedInfo.size || 0);

    // Calculate reduction percentage
    const percentageReduction = calculateReduction(
      originalInfo.size || 0,
      processedInfo.size || 0,
    );

    return {
      processedUri,
      stats: {
        originalSize,
        newSize,
        percentageReduction,
        originalFormat,
        newFormat: 'mp4', // react-native-compressor outputs mp4
      },
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};

/**
 * Gets video metadata using createThumbnail
 * @param videoUri URI of the video
 * @returns Promise with video duration and dimensions
 */
export const getVideoMetadata = async (videoUri: string) => {
  try {
    // Decode URI to handle URL-encoded characters
    const decodedUri = decodeURI(videoUri);

    // Use react-native-create-thumbnail to get metadata
    try {
      const result = await createThumbnail({
        url: decodedUri,
        timeStamp: 0,
      });

      return {
        duration: result?.timeStamp || 0,
        width: result.width || 0,
        height: result.height || 0,
      };
    } catch (thumbnailError) {
      console.warn(
        'Error generating thumbnail, continuing with default values:',
        thumbnailError,
      );
      return { duration: 0, width: 0, height: 0 };
    }
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return { duration: 0, width: 0, height: 0 };
  }
};

/**
 * Trim a video using react-native-video-trim
 * This opens a native UI for video trimming
 *
 * @param videoUri URI of the video to trim
 * @param options Trimming options
 * @returns Promise that resolves when trimming is complete
 */
export const trimVideoUsingEditor = (
  videoUri: string,
  options?: {
    maxDuration?: number;
    minDuration?: number;
    cancelButtonText?: string;
    saveButtonText?: string;
    enableCancelDialog?: boolean;
  },
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Listen for trim events
    const { NativeEventEmitter, NativeModules } = require('react-native');
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);

    // Set up event listener for when trimming finishes
    const subscription = eventEmitter.addListener('VideoTrim', event => {
      if (event.name === 'onFinishTrimming') {
        // Get the output path from the event
        const outputPath = event.outputPath;

        // Clean up listener
        subscription.remove();

        // Resolve with the output path
        resolve(outputPath);
      } else if (
        event.name === 'onCancelTrimming' ||
        event.name === 'onCancel'
      ) {
        // Clean up listener
        subscription.remove();

        // Reject if user cancels
        reject(new Error('Video trimming was canceled'));
      }
    });

    // Show the editor
    showEditor(videoUri, options);
  });
};

/**
 * Trim and then compress a video
 * This will first open the trimming UI, then compress the result
 */
export const trimAndCompressVideo = async (
  videoUri: string,
  options: {
    trimOptions?: {
      maxDuration?: number;
      minDuration?: number;
    };
    quality: number;
  },
  onProgress?: (progress: number) => void,
): Promise<{
  processedUri: string;
  stats: any;
}> => {
  try {
    // First show the trimming editor
    if (onProgress) onProgress(0.1);

    // Wait for user to finish trimming
    const trimmedVideoUri = await trimVideoUsingEditor(
      videoUri,
      options.trimOptions,
    );

    if (onProgress) onProgress(0.5);

    // Then compress the trimmed video
    const compressResult = await processMediaVideo(
      trimmedVideoUri,
      {
        quality: options.quality,
      },
      compressProgress => {
        // Map compress progress to 50-95%
        if (onProgress) onProgress(0.5 + compressProgress * 0.45);
      },
    );

    // Report 100% progress
    if (onProgress) onProgress(1.0);

    return {
      processedUri: compressResult.processedUri,
      stats: {
        ...compressResult.stats,
        trimApplied: true,
      },
    };
  } catch (error) {
    console.error('Error trimming and compressing video:', error);
    throw error;
  }
};
