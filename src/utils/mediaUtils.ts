import ImageResizer from 'react-native-image-resizer';
import { formatFileSize, getFileInfo, calculateReduction } from './fileUtils';

/**
 * Get file extension from URI
 */
const getFileExtension = (uri: string): string => {
  const parts = uri.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Process an image with compression and optional cropping
 * @param imageUri URI of the image to process
 * @param quality Compression quality (0.1 to 1.0)
 * @param cropData Optional cropping parameters
 * @returns Object with processed URI and stats
 */
export const processMediaImage = async (
  imageUri: string,
  quality: number = 0.7,
  cropData?: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  },
) => {
  try {
    // Get original file info
    const originalInfo = await getFileInfo(imageUri);
    if (!originalInfo) {
      throw new Error('Could not get original image info');
    }

    const originalFormat = getFileExtension(imageUri);
    const originalSize = formatFileSize(originalInfo.size || 0);

    // Get image info for dimensions
    const imageInfo = await ImageResizer.createResizedImage(
      imageUri,
      2000, // Just to get info
      2000, // Just to get info
      'JPEG',
      100,
      0,
    );

    // Prepare crop options if provided
    let cropOptions = {};
    if (cropData && cropData.width > 0 && cropData.height > 0) {
      cropOptions = {
        cropOffsetX: cropData.offsetX,
        cropOffsetY: cropData.offsetY,
        cropWidth: cropData.width,
        cropHeight: cropData.height,
      };
    }

    // Process the image - convert to JPG as required
    const result = await ImageResizer.createResizedImage(
      imageUri,
      imageInfo.width, // Keep original size if not resizing
      imageInfo.height, // Keep original size if not resizing
      'JPEG', // Always convert to JPG
      Math.round(quality * 100), // Scale 0-1 to 0-100
      0, // No rotation
      undefined,
      false,
      { mode: 'contain', ...cropOptions },
    );

    // Get processed file info
    const processedInfo = await getFileInfo(result.uri);
    if (!processedInfo) {
      throw new Error('Could not get processed image info');
    }

    const newSize = formatFileSize(processedInfo.size || 0);
    const percentageReduction = calculateReduction(
      originalInfo.size || 0,
      processedInfo.size || 0,
    );

    return {
      processedUri: result.uri,
      stats: {
        originalSize,
        newSize,
        percentageReduction,
        originalFormat,
        newFormat: 'jpg',
        originalDimensions: {
          width: imageInfo.width,
          height: imageInfo.height,
        },
        newDimensions: {
          width: result.width,
          height: result.height,
        },
      },
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};
