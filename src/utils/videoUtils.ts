import { Video } from 'react-native-compressor';
import { formatFileSize, getFileInfo, calculateReduction } from './fileUtils';
import { createThumbnail } from 'react-native-create-thumbnail';

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
    // Get original file info
    const originalInfo = await getFileInfo(videoUri);
    if (!originalInfo) {
      throw new Error('Could not get original video info');
    }

    // Get file extension
    const pathParts = videoUri.split('.');
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
      videoUri,
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
 * Gets video metadata using the video URI
 * Note: This is a simple implementation that focuses on getting duration
 * @param videoUri URI of the video
 * @returns Promise with video duration in seconds
 */
export const getVideoMetadata = async (videoUri: string) => {
  try {
    // Use react-native-create-thumbnail to get metadata
    const result = await createThumbnail({
      url: videoUri,
      timeStamp: 0,
    });

    return {
      duration: result?.timeStamp || 0,
      width: result.width || 0,
      height: result.height || 0,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    // Return a default value with 0 duration if we can't get metadata
    return { duration: 0, width: 0, height: 0 };
  }
};
